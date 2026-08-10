import { Router } from "express";
import { z } from "zod";
import { revokeOpenAIAccess } from "../openai-admin";

/**
 * choi-media 관리자 액션(deleteVibeStudent/resetVibeStudent)과 예산 감시 크론이 공용으로 쓴다.
 * DB 조회/갱신은 호출부(Vercel, 이미 관리자 세션 또는 service-role 컨텍스트)가 계속 맡고,
 * 여기서는 순수하게 OpenAI 리소스만 무효화한다.
 */
const BodySchema = z.object({
  projectId: z.string().min(1),
  serviceAccountId: z.string().min(1).nullable(),
});

export const revokeRouter = Router();

revokeRouter.post("/revoke", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "projectId/serviceAccountId를 확인해 주세요." });
    return;
  }
  try {
    await revokeOpenAIAccess(parsed.data.projectId, parsed.data.serviceAccountId);
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});
