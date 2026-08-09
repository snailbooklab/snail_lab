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
  const [featured, ...rest] = visible;

  return (
    <Section className="pt-32 sm:pt-40">
      <div className="flex items-start justify-between gap-4">
        <Eyebrow>블로그</Eyebrow>
        <NewPostButton />
      </div>
      <h1 className="display mt-6 max-w-[20ch] text-[40px] leading-[1.05] sm:text-[58px]">
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
                  ? "bg-ink text-cream shadow-[0_6px_16px_rgba(24,26,23,0.18)]"
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
        <p className="mt-20 rounded-[28px] bg-lifted p-10 text-center text-[17px] text-dust">
          아직 발행된 글이 없습니다.
        </p>
      ) : visible.length === 0 ? (
        <p className="mt-20 text-center text-[17px] text-dust">검색 결과가 없습니다.</p>
      ) : (
        <Reveal stagger className="mt-10 grid grid-cols-1 gap-6">
          {/* Featured — first result, full-width split card */}
          <PostCard post={featured} index={0} featured />

          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {rest.map((p, i) => (
                <PostCard key={p.slug} post={p} index={i + 1} />
              ))}
            </div>
          )}
        </Reveal>
      )}
    </Section>
  );
}

function PostCard({
  post: p,
  index,
  featured = false,
}: {
  post: PublicPostCard;
  index: number;
  featured?: boolean;
}) {
  return (
    <div
      className={`group relative flex overflow-hidden rounded-[28px] bg-lifted shadow-card ${
        featured ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <PostAdminActions id={p.id} className="absolute right-4 top-4 z-20" />

      <Link
        href={`/blog/${p.slug}`}
        className={`relative shrink-0 overflow-hidden ${
          featured ? "aspect-[16/9] sm:aspect-auto sm:w-[46%]" : "aspect-[4/3]"
        }`}
      >
        {p.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.thumbnail}
            alt={p.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 35% 30%, ${p.tone.a}, ${p.tone.b})` }}
          />
        )}
        <span className="display absolute bottom-4 left-5 text-[15px] tabular-nums text-white/90">
          {String(index + 1).padStart(2, "0")}
        </span>
      </Link>

      <Link href={`/blog/${p.slug}`} className="flex flex-1 flex-col p-7 sm:p-8">
        <div className="flex items-center gap-2 text-[12px] font-medium text-slate">
          <span>{p.category}</span>
          <span className="h-1 w-1 rounded-full bg-dust" />
          <span>{p.date}</span>
        </div>
        <h2
          className={`display mt-1.5 leading-[1.15] ${featured ? "text-[26px] sm:text-[30px]" : "text-[20px]"}`}
        >
          {p.title}
        </h2>
        {p.excerpt && (
          <p className="mt-2 line-clamp-2 max-w-[60ch] flex-1 text-[15px] leading-[1.5] text-slate">
            {p.excerpt}
          </p>
        )}
      </Link>
    </div>
  );
}
