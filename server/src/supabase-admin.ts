import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase 클라이언트 — RLS를 우회한다. 로그인 세션이 없는 발급 폼(익명 방문자)이
 * vibe_students 테이블을 조회/갱신해야 해서 필요하다. choi-media(app/_lib/supabase-admin.ts)와
 * 동일한 패턴 — 절대 클라이언트로 노출하지 않는다.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
