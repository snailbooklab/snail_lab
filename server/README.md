# vibe-coding-backend

choi-media(Vercel)의 바이브코딩 API 키 발급 기능에서 OpenAI Admin API + Supabase 접근 로직만
분리한 백엔드. 조직 전체 권한의 OpenAI Admin 키를 퍼블릭 트래픽까지 받는 Vercel 프로젝트와
분리 보관하기 위해 Render에 별도 배포한다.

## 로컬 개발

```bash
cd server
npm install
cp .env.example .env   # 값을 채운다 — choi-media 루트 .env / server/.env.example 주석 참고
npm run dev             # http://localhost:3001
```

루트 `.env`의 `VIBE_BACKEND_URL`을 `http://localhost:3001`로 맞추면 Next.js dev 서버(`npm run dev`,
루트에서)가 이 백엔드를 바로 호출한다.

## Render 배포

1. Render 대시보드 → New → Web Service → 이 저장소 연결.
2. **Root Directory**: `server`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Health Check Path**: `/healthz`
6. Environment 탭에서 `.env.example`에 나열된 값을 전부 등록 (`OPENAI_ADMIN_API_KEY`,
   `VIBE_BACKEND_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `OPENAI_PROJECT_*`). `PORT`는 Render가 자동 주입하므로 설정하지 않는다.
7. 콜드스타트 없이 항상 켜져 있어야 하므로 **Free가 아닌 유료(Starter 이상) 플랜**을 사용할 것 —
   Free 플랜은 15분 미사용 시 슬립되어 학생 발급 요청이 30~50초 이상 지연될 수 있다.
8. 배포 후 Render가 준 서비스 URL을 Vercel 프로젝트 환경변수 `VIBE_BACKEND_URL`에 등록하고,
   `VIBE_BACKEND_SECRET`을 이 서비스의 값과 동일하게 등록한다.
9. Vercel 환경변수에서 더 이상 쓰이지 않는 `OPENAI_ADMIN_API_KEY`, `OPENAI_PROJECT_RPM_LIMIT`,
   `OPENAI_PROJECT_TPM_LIMIT`, `OPENAI_PROJECT_ALLOWED_MODELS`, `OPENAI_PROJECT_BUDGET_KRW`,
   `OPENAI_KRW_PER_USD`, `CRON_SECRET`은 제거해도 된다(전부 이 서비스로 이전됨).

### 예산 감시 크론 (Render Cron Job)

기존에 등록해둔 Render Cron Job의 요청 대상을 이 서비스의 `/cron/budget-guard`로 바꾼다.
인증 헤더는 기존과 동일하게 `CRON_SECRET`을 재사용한다.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<이 서비스 URL>/cron/budget-guard
```

## 엔드포인트

모든 엔드포인트는(`/healthz`, `/cron/budget-guard` 제외) `Authorization: Bearer $VIBE_BACKEND_SECRET`
헤더가 필요하다 — choi-media(Vercel)만 호출하는 내부 API다.

| Method | Path                 | 설명                                                             | 호출부 |
| ------ | -------------------- | ------------------------------------------------------------------ | ------ |
| GET    | `/healthz`           | 헬스체크 (인증 불필요)                                              | Render |
| GET    | `/cron/budget-guard` | 예산 초과 프로젝트 감시 (자체 `CRON_SECRET` 인증)                 | Render Cron Job |
| POST   | `/issue`             | 수강생 대조 → 원자적 클레임 → OpenAI 발급 → 상태 확정                | `app/api/vibe-coding/issue/route.ts` |
| POST   | `/revoke`            | `{ projectId, serviceAccountId }` — OpenAI 리소스 무효화            | `app/admin/vibe-coding/_actions/students.ts` |
