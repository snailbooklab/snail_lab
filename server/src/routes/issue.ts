import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase-admin";
import {
  applyProjectModelPermissions,
  applyProjectRateLimits,
  archiveOpenAIProject,
  createOpenAIProject,
  createProjectServiceAccount,
  revokeOpenAIAccess,
} from "../openai-admin";

/**
 * 수강생 본인인증 → OpenAI API 키 발급.
 *
 * choi-media의 app/api/vibe-coding/issue/route.ts에 있던 로직을 그대로 이식했다 — 대조와
 * 발급이 원자적으로 묶여야 해서(동시 요청 락) Vercel에서 이 백엔드로 그냥 프록시만 하고,
 * 검증부터 OpenAI 호출, 최종 DB 확정까지 전부 여기서 처리한다.
 *
 * 순서: ① 대조 ② 이미 발급됐거나 처리 중이면 거절 ③ status=PENDING → ISSUING 원자적 클레임
 *      (동시 요청 중 단 하나만 성공) ④ Project 생성 ⑤ 요청 속도 상한 + 모델 허용목록 적용
 *      (best-effort) ⑥ Service Account(=API 키) 생성 ⑦ status=ISSUED로 확정 ⑧ 키를
 *      응답으로 1회만 반환 — 이 값은 서버 어디에도 저장하지 않는다. ③~⑦ 사이 실패하면 항상
 *      status를 PENDING으로 되돌려 재시도 가능하게 한다.
 */

const BodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(9).max(20),
  courseId: z.string().trim().min(1).max(120),
});

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export const issueRouter = Router();

issueRouter.post("/issue", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해 주세요." });
    return;
  }
  const name = parsed.data.name.normalize("NFC");
  const phone = normalizePhone(parsed.data.phone);
  const courseId = parsed.data.courseId.normalize("NFC");

  const supabase = supabaseAdmin();
  const { data: student, error } = await supabase
    .from("vibe_students")
    .select("id, status")
    .eq("name", name)
    .eq("phone", phone)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!student) {
    res.status(404).json({
      error: "등록된 수강생 정보를 찾을 수 없습니다. 이름·전화번호·과정명을 다시 확인해 주세요.",
    });
    return;
  }
  if (student.status === "ISSUED") {
    res.status(409).json({
      error: "이미 API 키가 발급되었습니다. 키를 분실했다면 담당 강사에게 재발급을 요청해 주세요.",
    });
    return;
  }
  if (student.status === "BLOCKED") {
    res.status(403).json({
      error: "사용량 예산 초과로 이용이 제한되었습니다. 담당 강사에게 재발급을 요청해 주세요.",
    });
    return;
  }
  if (student.status === "ISSUING") {
    res.status(409).json({ error: "다른 요청으로 발급이 진행 중입니다. 잠시 후 다시 시도해 주세요." });
    return;
  }

  // 원자적 클레임: status=PENDING인 행만 ISSUING으로 바꾼다. 동시에 여러 요청이 들어와도
  // Postgres 행 잠금 덕분에 단 하나만 성공하고, 진 요청들은 0행 갱신을 받아 여기서 바로 끝난다.
  const { data: claimed, error: claimError } = await supabase
    .from("vibe_students")
    .update({ status: "ISSUING" })
    .eq("id", student.id)
    .eq("status", "PENDING")
    .select("id");

  if (claimError) {
    res.status(500).json({ error: claimError.message });
    return;
  }
  if (!claimed || claimed.length === 0) {
    res.status(409).json({ error: "다른 요청으로 발급이 진행 중입니다. 잠시 후 다시 시도해 주세요." });
    return;
  }

  // 이 지점부터는 이 요청이 유일한 소유자다. 실패하면 반드시 PENDING으로 되돌려 재시도를 허용한다.
  let project;
  try {
    project = await createOpenAIProject(`vibe-coding · ${name} · ${courseId}`.slice(0, 120));
  } catch (err) {
    await supabase.from("vibe_students").update({ status: "PENDING" }).eq("id", student.id);
    res.status(502).json({ error: `프로젝트 생성 실패: ${(err as Error).message}` });
    return;
  }

  try {
    await applyProjectRateLimits(project.id);
  } catch {
    // 사용량 상한 적용은 best-effort — 실패해도 키 발급 자체는 계속 진행한다.
  }
  try {
    await applyProjectModelPermissions(project.id);
  } catch {
    // 모델 제한도 best-effort — 조직 등급에 따라 미지원일 수 있어 실패해도 발급을 막지 않는다.
  }

  let serviceAccount;
  try {
    serviceAccount = await createProjectServiceAccount(project.id, "student");
  } catch (err) {
    await archiveOpenAIProject(project.id).catch(() => {});
    await supabase.from("vibe_students").update({ status: "PENDING" }).eq("id", student.id);
    res.status(502).json({ error: `API 키 생성 실패: ${(err as Error).message}` });
    return;
  }

  const { error: finalizeError } = await supabase
    .from("vibe_students")
    .update({
      status: "ISSUED",
      openai_project_id: project.id,
      openai_service_account_id: serviceAccount.id,
      openai_api_key_id: serviceAccount.api_key.id,
      issued_at: new Date().toISOString(),
    })
    .eq("id", student.id);

  if (finalizeError) {
    // 이미 살아있는 키가 만들어져 있었는데 DB 기록에 실패한 것이므로, service account 자체를
    // 지워서 그 키를 실제로 무효화한다.
    await revokeOpenAIAccess(project.id, serviceAccount.id).catch(() => {});
    res.status(500).json({ error: finalizeError.message });
    return;
  }

  res.json({
    apiKey: serviceAccount.api_key.value,
    projectId: project.id,
    projectName: project.name,
  });
});
