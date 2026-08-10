import "dotenv/config";
import express from "express";
import { requireInternalSecret } from "./auth";
import { issueRouter } from "./routes/issue";
import { revokeRouter } from "./routes/revoke";
import { cronRouter } from "./routes/cron";

const app = express();
app.use(express.json());

// Render 헬스체크는 시크릿 없이 통과해야 하므로 인증 미들웨어보다 먼저 둔다.
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// 크론은 Vercel이 아니라 Render Cron Job이 직접 호출하므로 자체 CRON_SECRET으로 인증한다
// (아래 requireInternalSecret과는 별개 — 라우터 안에서 스스로 확인한다).
app.use(cronRouter);

// 나머지는 전부 choi-media(Vercel)가 호출하는 내부 API — 공유 시크릿으로 인증한다.
app.use(requireInternalSecret);
app.use(issueRouter);
app.use(revokeRouter);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`vibe-coding-backend listening on :${port}`);
});
