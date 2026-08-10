/**
 * OpenAI Admin API 연동은 별도 백엔드(server/, Render 배포)로 이전했다 — 조직 전체 권한의
 * Admin 키를 퍼블릭 트래픽까지 받는 이 Vercel 프로젝트와 분리 보관하기 위함. 이 파일은 그
 * 백엔드를 호출하는 얇은 클라이언트다. 실제 OpenAI 호출 로직은 server/src/openai-admin.ts 참고.
 */
import "server-only"; // 내부 인증 시크릿을 다루므로 클라이언트 번들에 섞이면 빌드 타임에 바로 에러가 나게 한다.

function backendUrl(): string {
  const url = process.env.VIBE_BACKEND_URL;
  if (!url) throw new Error("VIBE_BACKEND_URL이 설정되지 않았습니다.");
  return url;
}

function backendSecret(): string {
  const secret = process.env.VIBE_BACKEND_SECRET;
  if (!secret) throw new Error("VIBE_BACKEND_SECRET이 설정되지 않았습니다.");
  return secret;
}

/**
 * 관리자가 수강생을 삭제하거나(deleteVibeStudent) 재발급 허용을 위해 초기화할 때(resetVibeStudent)
 * 기존 OpenAI 키(service account)를 지우고 프로젝트를 archive한다. DB 조회/갱신은 호출부(관리자
 * 세션)가 계속 맡고, 여기서는 순수하게 OpenAI 리소스 무효화 요청만 백엔드로 위임한다.
 */
export async function revokeOpenAIAccess(projectId: string, serviceAccountId: string | null): Promise<void> {
  const res = await fetch(`${backendUrl()}/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${backendSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, serviceAccountId }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`백엔드 revoke 요청 실패 (${res.status}): ${body || res.statusText}`);
  }
}
