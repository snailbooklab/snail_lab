import Link from "next/link";
import { Arrow, Eyebrow, Section } from "../_components/ui";
import { AdminSections } from "./_components/AdminSections";
import { SignOutButton } from "./_components/SignOutButton";
import {getCurrentUser} from "./_actions/auth";
import {supabaseServerAuth} from "@/app/_lib/supabase-server";
import {notFound} from "next/navigation";

const actions = [
  {
    href: "/admin/blog/new",
    label: "블로그 작성",
    desc: "미디어 리터러시 · 그림책 · 아동심리 글을 WYSIWYG 에디터로 작성합니다.",
    tone: { a: "#f2933f", b: "#cf4500" },
  },
  {
    href: "/admin/lectures/new",
    label: "강의 작성",
    desc: "분야 · 커리큘럼 · 진행 방식을 갖춘 강의를 폼으로 등록합니다.",
    tone: { a: "#f7b25a", b: "#b8420f" },
  },
  {
    href: "/admin/archive",
    label: "자료실",
    desc: "PPT·PDF·HWP 등 강의 자료를 올리고 관리합니다. 관리자만 열람·다운로드.",
    tone: { a: "#ef8a4c", b: "#9a3a0a" },
  },
  {
    href: "/admin/calendar",
    label: "일정",
    desc: "출강·연수·개인 일정을 달력으로 관리합니다. 관리자만 열람.",
    tone: { a: "#f4a15e", b: "#a83d1a" },
  },
  {
    href: "/admin/notifications",
    label: "알림함",
    desc: "휴대폰에 온 카톡·문자 중 강의 관련 메시지를 실시간으로 모아 봅니다.",
    tone: { a: "#f2b56a", b: "#8f3c12" },
  },
  {
    href: "/admin/vibe-coding",
    label: "바이브 코딩",
    desc: "수강생을 사전 등록하고, 본인인증 후 발급된 OpenAI API 키 상태를 관리합니다.",
    tone: { a: "#f6a55b", b: "#c04310" },
  },
  {
    href: "/admin/course-evaluation",
    label: "강의 설문지 작성",
    desc: "문항을 만들면 구글 폼이 자동 생성되고, 응답 링크가 강의평가 탭에 노출됩니다.",
    tone: { a: "#f0a05e", b: "#a13716" },
  },
];

export default async function AdminHome() {

  return (
    <Section className="pt-36 sm:pt-44">
      <div className="flex items-start justify-between gap-4">
        <Eyebrow>관리자</Eyebrow>
        <SignOutButton />
      </div>
      <h1 className="display mt-6 max-w-[20ch] text-[40px] leading-[1.02] sm:text-[60px]">
        무엇을 작성할까요?
      </h1>
      <p className="mt-6 max-w-[48ch] text-[18px] leading-[1.5] text-slate">
        작성할 콘텐츠 유형을 선택하세요.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-6  md:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex flex-col justify-between overflow-hidden rounded-stadium bg-lifted p-8 shadow-card transition-transform hover:-translate-y-1 sm:p-10"
          >

            <div className=" flex items-end justify-between gap-4">
              <div>
                <h2 className="display text-[28px] text-ink sm:text-[32px]">{a.label}</h2>
                <p className="mt-3 max-w-[30ch] text-[15px] leading-[1.5] text-slate">{a.desc}</p>
              </div>
              {/*<div className={'flex flex-col h-full justify-start'}>*/}
                <Arrow className="h-6 w-6" />
              {/*</div>*/}
            </div>
          </Link>
        ))}
      </div>

      <AdminSections />
    </Section>
  );
}
