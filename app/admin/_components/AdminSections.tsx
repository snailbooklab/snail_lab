"use client";

import { useState } from "react";
import { Chip, Eyebrow } from "../../_components/ui";
import { RecentPosts } from "./RecentPosts";
import { RecentLectures } from "./RecentLectures";
import { RecentResources } from "./RecentResources";
import { RecentVibeStudents } from "./RecentVibeStudents";

const TABS = [
  { key: "blog", label: "블로그", heading: "작성한 글" },
  { key: "lectures", label: "강의", heading: "등록한 강의" },
  { key: "resources", label: "자료실", heading: "올린 자료" },
  { key: "vibe", label: "바이브 코딩", heading: "수강생 등록 · 발급 현황" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** 관리자 홈 하단 현황 — 전부 스크롤로 훑는 대신 탭으로 골라 본다. */
export function AdminSections() {
  const [tab, setTab] = useState<TabKey>("blog");
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="mt-20">
      <Eyebrow>관리 현황</Eyebrow>
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}>
            <Chip active={tab === t.key}>{t.label}</Chip>
          </button>
        ))}
      </div>
      <h2 className="display mt-6 text-[28px] leading-[1.05] sm:text-[36px]">{active.heading}</h2>
      <div className="mt-8">
        {tab === "blog" && <RecentPosts />}
        {tab === "lectures" && <RecentLectures />}
        {tab === "resources" && <RecentResources />}
        {tab === "vibe" && <RecentVibeStudents />}
      </div>
    </div>
  );
}
