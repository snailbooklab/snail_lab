/**
 * OpenAI Admin API (Organization API) 클라이언트 — 수강생별 Project + Project 전용
 * Service Account(=API 키)를 발급하는 데 쓴다. Organization Owner가 발급한 Admin API 키가
 * 필요하다 (https://platform.openai.com/settings/organization/admin-keys).
 *
 * 원래 choi-media(Next.js/Vercel) 안의 app/_lib/openai-admin.ts에 있던 로직을 그대로
 * 옮겨온 것 — 이 조직 전체 권한 Admin 키를 퍼블릭 트래픽까지 받는 Vercel 프로젝트와
 * 분리 보관하기 위해 이 백엔드(Render)로 이전했다. 함수 하나하나가 Express 라우트로
 * 1:1 대응되며, choi-media 쪽 openai-admin.ts는 이제 이 서비스를 호출하는 HTTP 클라이언트다.
 */

const OPENAI_API_BASE = "https://api.openai.com/v1";

function adminKey(): string {
  const key = process.env.OPENAI_ADMIN_API_KEY;
  if (!key) throw new Error("OPENAI_ADMIN_API_KEY가 설정되지 않았습니다.");
  return key;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${OPENAI_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${adminKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI Admin API 오류 (${res.status}): ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * 지우기/archive 같은 멱등이어야 할 작업 전용 — 대상이 이미 없으면(404) 이미 목표 상태에
 * 도달한 것이므로 성공으로 취급한다.
 */
async function adminFetchIdempotent(path: string, init: RequestInit): Promise<void> {
  const res = await fetch(`${OPENAI_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${adminKey()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (res.ok || res.status === 404) return;
  const body = await res.text().catch(() => "");
  throw new Error(`OpenAI Admin API 오류 (${res.status}): ${body || res.statusText}`);
}

export type OpenAIProject = {
  id: string;
  object: "organization.project";
  name: string;
  created_at: number;
  archived_at: number | null;
  status: "active" | "archived";
};

export async function createOpenAIProject(name: string): Promise<OpenAIProject> {
  return adminFetch<OpenAIProject>("/organization/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

/** 이미 archive된(또는 존재하지 않는) 프로젝트를 다시 archive해도 에러가 아니다 — 멱등 처리. */
export async function archiveOpenAIProject(projectId: string): Promise<void> {
  await adminFetchIdempotent(`/organization/projects/${projectId}/archive`, { method: "POST" });
}

/**
 * Service Account를 지운다. Service Account 소속 API 키는 일반 API 키 삭제 엔드포인트로
 * 지울 수 없고(OpenAI가 에러로 거절함) 반드시 이 엔드포인트로 service account 자체를
 * 지워야 한다. 이미 지워진 service account를 또 지우려 해도 에러가 아니다(멱등 처리).
 */
export async function deleteProjectServiceAccount(projectId: string, serviceAccountId: string): Promise<void> {
  await adminFetchIdempotent(`/organization/projects/${projectId}/service_accounts/${serviceAccountId}`, {
    method: "DELETE",
  });
}

/**
 * 학생 키를 실제로 무효화한다 — 프로젝트를 archive하는 것만으론 부족하다. 순서가 중요하다:
 * ① service account를 먼저 지운다(실패하면 이 함수가 던진다 — 호출부는 "키가 아직 살아있을
 * 수 있다"고 경고해야 한다) ② 그다음 프로젝트를 archive한다(실패해도 조용히 무시 — 키 자체엔
 * 영향 없음).
 */
export async function revokeOpenAIAccess(projectId: string, serviceAccountId: string | null): Promise<void> {
  if (serviceAccountId) {
    await deleteProjectServiceAccount(projectId, serviceAccountId);
  }
  await archiveOpenAIProject(projectId).catch(() => {});
}

export type OpenAIServiceAccount = {
  id: string;
  object: string;
  name: string;
  role: string;
  created_at: number;
  api_key: {
    id: string;
    object: string;
    name: string;
    value: string;
    created_at: number;
  };
};

/** Service Account 생성 — 응답의 api_key.value가 실제 키 값이며, 이후 다시 조회할 수 없다. */
export async function createProjectServiceAccount(
  projectId: string,
  name: string,
): Promise<OpenAIServiceAccount> {
  return adminFetch<OpenAIServiceAccount>(`/organization/projects/${projectId}/service_accounts`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

type ProjectRateLimit = {
  id: string;
  model: string;
  max_requests_per_1_minute?: number;
  max_tokens_per_1_minute?: number;
};

/**
 * 프로젝트별 분당 요청/토큰 상한 적용 — 수강생 1인당 과금 폭주를 막는 안전장치.
 * OPENAI_PROJECT_RPM_LIMIT / OPENAI_PROJECT_TPM_LIMIT을 채워야 동작하고, 비워두면
 * 조직 기본값을 그대로 둔 채 아무것도 하지 않는다.
 */
export async function applyProjectRateLimits(projectId: string): Promise<void> {
  const rpm = process.env.OPENAI_PROJECT_RPM_LIMIT;
  const tpm = process.env.OPENAI_PROJECT_TPM_LIMIT;
  if (!rpm && !tpm) return;

  const { data } = await adminFetch<{ data: ProjectRateLimit[] }>(
    `/organization/projects/${projectId}/rate_limits?limit=100`,
  );

  await Promise.all(
    data.map((limit) =>
      adminFetch(`/organization/projects/${projectId}/rate_limits/${limit.id}`, {
        method: "POST",
        body: JSON.stringify({
          ...(rpm ? { max_requests_per_1_minute: Number(rpm) } : {}),
          ...(tpm ? { max_tokens_per_1_minute: Number(tpm) } : {}),
        }),
      }),
    ),
  );
}

/**
 * 프로젝트에서 쓸 수 있는 모델을 허용목록으로 제한 — 값비싼 모델을 실습용 키로 못 쓰게 막는다.
 * OPENAI_PROJECT_ALLOWED_MODELS(쉼표구분)를 채워야 동작한다. 계정/조직 등급에 따라 지원되지
 * 않을 수 있으므로 호출부(라우트)에서 best-effort로 다뤄야 한다.
 */
export async function applyProjectModelPermissions(projectId: string): Promise<void> {
  const allowed = process.env.OPENAI_PROJECT_ALLOWED_MODELS;
  if (!allowed) return;

  const modelIds = allowed
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  if (modelIds.length === 0) return;

  await adminFetch(`/organization/projects/${projectId}/model_permissions`, {
    method: "POST",
    body: JSON.stringify({ mode: "allow_list", model_ids: modelIds }),
  });
}

type CostsBucket = {
  results: { amount: { value: number; currency: string }; project_id: string | null }[];
};

/**
 * 프로젝트별 "금액" 한도는 API로 설정할 수 없어서(대시보드 전용), 대신 발급 이후의 누적 지출을
 * Costs API로 직접 집계해 choi-media 쪽 예산 감시 크론이 소비한다. project_ids 서버 필터는
 * 신뢰성 이슈 보고가 있어, 응답을 project_id로 다시 한번 클라이언트 사이드에서 걸러 합산한다.
 */
export async function getProjectCostUSD(projectId: string, sinceUnixSeconds: number): Promise<number> {
  const params = new URLSearchParams({
    start_time: String(sinceUnixSeconds),
    bucket_width: "1d",
    group_by: "project_id",
    limit: "31",
  });
  const { data: buckets } = await adminFetch<{ data: CostsBucket[] }>(
    `/organization/costs?${params.toString()}`,
  );

  let total = 0;
  for (const bucket of buckets) {
    for (const result of bucket.results) {
      if (result.project_id === projectId) total += result.amount.value;
    }
  }
  return total;
}
