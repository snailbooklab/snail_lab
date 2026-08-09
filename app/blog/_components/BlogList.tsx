"use client";

import Link from "next/link";
import { useState } from "react";
import { Eyebrow, Section } from "../../_components/ui";
import { Reveal } from "../../_components/reveal";
import { categories } from "../../_data/content";
import type { PublicPostCard } from "../_queries/posts";
import { NewPostButton, PostAdminActions } from "./PostAdminActions";

export function BlogList({ posts }: { posts: PublicPostCard[] }) {
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");

  const visible = posts.filter((p) => {
    const inCat = cat === "전체" || p.category === cat;
    const inQ =
      q.trim() === "" ||
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(q.toLowerCase());
    return inCat && inQ;
  });

  return (
    <Section className="pt-36 sm:pt-44">
      <div className="flex items-start justify-between gap-4">
        <Eyebrow>블로그</Eyebrow>
        <NewPostButton />
      </div>
      <h1 className="display mt-6 max-w-[20ch] text-[40px] leading-[1.02] sm:text-[60px]">
        강의 현장 기록.
      </h1>

      {/* Search + filter row */}
      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-pill px-5 py-2 text-[15px] font-medium transition-all ${
                cat === c
                  ? "bg-ink text-cream shadow-[0_6px_16px_rgba(20,20,19,0.18)]"
                  : "bg-white text-slate shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full rounded-pill border border-ink/20 bg-white px-6 py-3 text-[15px] outline-none placeholder:text-dust focus:border-ink/50 sm:w-72"
        />
      </div>

      {posts.length === 0 ? (
        <p className="mt-20 rounded-stadium bg-lifted p-10 text-center text-[17px] text-dust">
          아직 발행된 글이 없습니다.
        </p>
      ) : (
        <>
          <Reveal stagger className="mt-6 flex flex-col">
            {visible.map((p, i) => (
              <div
                key={p.slug}
                className="group relative grid grid-cols-[auto_1fr] gap-5 border-b border-ink/10 py-8 sm:gap-8"
              >
                <PostAdminActions id={p.id} className="absolute right-0 top-8 z-10" />

                <span className="display pt-1 text-[22px] tabular-nums text-signal-light sm:text-[26px]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <Link href={`/blog/${p.slug}`} className="flex flex-col pr-16 sm:pr-24">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-slate">
                    <span>{p.category}</span>
                    <span className="h-1 w-1 rounded-full bg-dust" />
                    <span>{p.date}</span>
                  </div>
                  <h2 className="display mt-1.5 text-[24px] leading-[1.15] sm:text-[30px]">{p.title}</h2>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 max-w-[70ch] text-[15px] leading-[1.5] text-slate">
                      {p.excerpt}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </Reveal>

          {visible.length === 0 && (
            <p className="mt-20 text-center text-[17px] text-dust">검색 결과가 없습니다.</p>
          )}
        </>
      )}
    </Section>
  );
}
