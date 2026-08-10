import type { NextFunction, Request, Response } from "express";

/**
 * choi-media(Vercel)와만 통신하는 내부 서비스이므로 공유 시크릿 한 개로 인증한다.
 * VIBE_BACKEND_SECRET은 Render/Vercel 양쪽에 동일한 값으로 설정해야 한다.
 */
export function requireInternalSecret(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.VIBE_BACKEND_SECRET;
  if (!expected) {
    res.status(500).json({ error: "VIBE_BACKEND_SECRET이 설정되지 않았습니다." });
    return;
  }
  if (req.headers.authorization !== `Bearer ${expected}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
