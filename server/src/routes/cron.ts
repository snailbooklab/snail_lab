import { Router } from "express";
import { supabaseAdmin } from "../supabase-admin";
import { getProjectCostUSD, revokeOpenAIAccess } from "../openai-admin";

/**
 * 바이브 코딩 예산 감시 — 발급된 프로젝트별 누적 지출이 OPENAI_PROJECT_BUDGET_KRW를 넘으면
 * OpenAI 키(service account)를 지우고 프로젝트를 archive한 뒤 status를 BLOCKED로 바꾼다.
 *
 * choi-media(Vercel)의 app/api/cron/vibe-budget-guard/route.ts에 있던 로직을 그대로 이식했다.
 * OpenAI Admin API엔 프로젝트별 "금액" 한도를 설정하는 엔드포인트가 없어서(대시보드 전용),
 * 이 라우트를 Render Cron Job이 주기적으로 호출해 대신 강제한다.
 *
 * VIBE_BACKEND_SECRET이 아니라 별도의 CRON_SECRET으로 인증한다 — Vercel이 아니라 Render
 * Cron Job이 직접 호출하는 경로라 인증 주체가 다르다.
 */
export const cronRouter = Router();

cronRouter.get("/cron/budget-guard", async (req, res) => {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    res.status(500).json({ error: "CRON_SECRET 미설정" });
    return;
  }
  if (req.headers.authorization !== `Bearer ${expected}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const budgetKrw = Number(process.env.OPENAI_PROJECT_BUDGET_KRW);
  const krwPerUsd = Number(process.env.OPENAI_KRW_PER_USD);
  if (!budgetKrw || !krwPerUsd) {
    res.json({ ok: true, skipped: "OPENAI_PROJECT_BUDGET_KRW/OPENAI_KRW_PER_USD 미설정" });
    return;
  }
  const budgetUsd = budgetKrw / krwPerUsd;

  const supabase = supabaseAdmin();
  const { data: students, error } = await supabase
    .from("vibe_students")
    .select("id, name, openai_project_id, openai_service_account_id, issued_at")
    .eq("status", "ISSUED")
    .not("openai_project_id", "is", null);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const blocked: string[] = [];
  const passed: { name: string; costUsd: number }[] = [];
  const failed: { name: string; error: string }[] = [];

  for (const student of students ?? []) {
    // issued_at은 발급 시 status를 ISSUED로 바꾸는 순간 항상 같이 채우므로 null일 수 없다.
    const sinceUnixSeconds = Math.floor(new Date(student.issued_at!).getTime() / 1000);
    try {
      const costUsd = await getProjectCostUSD(student.openai_project_id!, sinceUnixSeconds);
      if (costUsd < budgetUsd) {
        passed.push({ name: student.name, costUsd });
        continue;
      }

      // 키 삭제가 실패하면 여기서 던져서 catch로 빠진다 — DB를 BLOCKED로 바꾸지 않고 ISSUED로
      // 남겨둬서 다음 주기에 다시 시도하게 한다.
      await revokeOpenAIAccess(student.openai_project_id!, student.openai_service_account_id);
      const { error: updateError } = await supabase
        .from("vibe_students")
        .update({
          status: "BLOCKED",
          budget_blocked_at: new Date().toISOString(),
          openai_project_id: null,
          openai_service_account_id: null,
          openai_api_key_id: null,
        })
        .eq("id", student.id)
        .eq("status", "ISSUED"); // 그 사이 관리자가 이미 재발급 허용했다면 덮어쓰지 않는다.
      if (updateError) throw new Error(updateError.message);
      blocked.push(student.name);
    } catch (err) {
      failed.push({ name: student.name, error: (err as Error).message });
    }
  }

  res.json({
    ok: true,
    checked: students?.length ?? 0,
    blocked,
    passed,
    failed,
  });
});
