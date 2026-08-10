import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 수강생 본인인증 → OpenAI API 키 발급.
 *
 * 실제 검증(이름·전화번호·과정명 대조), 원자적 클레임, OpenAI 프로젝트/키 발급 로직은 전부
 * 별도 백엔드(server/, Render 배포)로 옮겼다 — 조직 전체 권한의 OpenAI Admin 키와 Supabase
 * service-role 키를 이 Vercel 프로젝트와 분리 보관하기 위함. 이 라우트는 그 백엔드로 그대로
 * 프록시만 한다(Render URL/내부 시크릿을 브라우저에 노출하지 않기 위해 프록시를 거친다).
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.VIBE_BACKEND_URL;
  const backendSecret = process.env.VIBE_BACKEND_SECRET;
  if (!backendUrl || !backendSecret) {
    return NextResponse.json({ error: "발급 백엔드가 설정되지 않았습니다." }, { status: 500 });
  }

  const body = await request.text();
  const res = await fetch(`${backendUrl}/issue`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${backendSecret}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const json = await res.json().catch(() => ({ error: "백엔드 응답을 처리하지 못했습니다." }));
  return NextResponse.json(json, { status: res.status });
}
