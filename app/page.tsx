import Link from "next/link";
import { Arrow, Portrait, Section } from "./_components/ui";
import { Reveal } from "./_components/reveal";
import { BrandMark } from "./_components/brand-mark";
import { clients, fields, testimonials } from "./_data/content";
import { getPublishedPosts } from "./blog/_queries/posts";

export const revalidate = 60;

export default async function Home() {
    const posts = await getPublishedPosts(4);

    return (
        <div className="relative w-full">
            {/* ---------------------------------------------------------- */}
            {/*  HERO                                                       */}
            {/* ---------------------------------------------------------- */}
            <Section className="pt-32 sm:pt-40">
                <Reveal
                    stagger
                    className="grid items-center gap-14 lg:grid-cols-[1.25fr_0.75fr]"
                >
                    {/* Left — editorial copy */}
                    <div>
                        <span className="inline-flex items-center text-[13px] font-medium tracking-[0.02em] text-signal">
                            미디어 리터러시 · 그림책 · 아동심리 강사
                        </span>
                        <h1 className="display mt-6 max-w-[15ch] text-[40px] leading-[1.15] sm:text-[58px]">
                            <span className="text-signal">그림책</span>을 품다,
                            <br />
                            <span className="text-signal">미디어</span>로 잇다.
                        </h1>
                        <p className="mt-7 max-w-[46ch] text-[17px] leading-[1.65] text-slate">
                            아이의 순수한 시선부터 어르신의 삶의 지혜까지. 그림책으로 시작해
                            미디어로 완성되는 세대공감 플랫폼.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
                            <Link
                                href="/about"
                                className="group inline-flex items-center gap-1.5 text-[16px] font-medium tracking-[-0.01em] text-ink transition-colors"
                            >
                                강사 소개
                                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/lectures"
                                className="group inline-flex items-center gap-1.5 text-[16px] font-medium tracking-[-0.01em] text-signal transition-colors"
                            >
                                강의 살펴보기
                                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Right — signature circular portrait, now a rotating brand seal */}
                    <div className="relative flex justify-center lg:-translate-y-3 lg:justify-end">
                        <div className="relative">
                            {/* ghost watermark behind the portrait */}
                            <span
                                aria-hidden
                                className="display pointer-events-none absolute -top-8 left-1/2 -z-10 hidden -translate-x-1/2 select-none whitespace-nowrap text-[120px] leading-none text-ink/[0.055] lg:block"
                            >
                                그림책
                            </span>

                            <BrandMark
                                ringLabel="달팽이 그림책연구소 · 최미선 강사 · 그림책 · 미디어 리터러시 · 아동심리 · "
                                accent="var(--color-signal)"
                                size={430}
                            >
                                <Portrait
                                    href="/about"
                                    toneA="var(--color-signal-light)"
                                    toneB="var(--color-signal)"
                                    size={320}
                                    lift
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/profile.png"
                                        alt="최미선 강사"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 rounded-full"
                                        style={{ boxShadow: "inset 0 0 55px 18px var(--color-cream)" }}
                                    />
                                </Portrait>
                            </BrandMark>

                            <div className="mt-6 text-center">
                                <p className="display text-[19px] text-ink">최미선</p>
                                <p className="mt-1 text-[13px] text-slate">달팽이 그림책연구소 대표</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Section>

            {/* ---------------------------------------------------------- */}
            {/*  강의 분야 — asymmetric bento (photo / solid / paper cell)  */}
            {/* ---------------------------------------------------------- */}
            <Section className="pt-28 sm:pt-40">
                <Reveal>
                    <span className="inline-flex items-center text-[13px] font-medium tracking-[0.02em] text-signal">
                        강의 분야
                    </span>
                    <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.6] text-slate">
                        세 가지 축으로 아이와 미디어, 그리고 마음을 다룹니다. 카드를 눌러
                        커리큘럼을 확인하세요.
                    </p>
                </Reveal>

                <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Cell 1 — 그림책, real photograph, largest cell */}
                    <div className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[28px] md:col-span-7">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://picsum.photos/seed/somsnail-picturebook-readaloud/1000/900"
                            alt="그림책을 함께 읽는 순간"
                            className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(24,26,23,0) 40%, rgba(24,26,23,0.72) 100%)",
                            }}
                        />
                        {/* Stretched link — whole card navigates to the field */}
                        <Link
                            href={`/lectures?field=${encodeURIComponent(fields[0].title)}`}
                            className="absolute inset-0 z-0"
                            aria-label={fields[0].title}
                        />
                        <div className="pointer-events-none relative flex items-end justify-between gap-4 p-7 sm:p-8">
                            <div>
                                <h3 className="display text-[26px] leading-none text-white">
                                    {fields[0].title}
                                </h3>
                                <p className="mt-2 max-w-[26ch] text-[14px] leading-[1.5] text-white/80">
                                    {fields[0].desc}
                                </p>
                            </div>
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink">
                                <Arrow className="h-4 w-4" />
                            </span>
                        </div>
                        {"sub" in fields[0] && (
                            <Link
                                href={`/lectures?field=${encodeURIComponent(fields[0].sub.title)}`}
                                className="absolute left-7 top-7 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-[13px] font-medium text-ink backdrop-blur-sm transition-colors hover:bg-white sm:left-8 sm:top-8"
                            >
                                {fields[0].sub.title}
                                <Arrow className="h-3 w-3" />
                            </Link>
                        )}
                    </div>

                    {/* Cell 2 — 미디어 리터러시, solid accent block */}
                    <Link
                        href={`/lectures?field=${encodeURIComponent(fields[1].title)}`}
                        className="group flex min-h-[360px] flex-col justify-between rounded-[28px] bg-signal p-7 transition-transform duration-300 sm:p-8 md:col-span-5"
                    >
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            <Arrow className="h-4 w-4 -rotate-45" />
                        </span>
                        <div>
                            <h3 className="display text-[26px] leading-[1.1] text-white">
                                {fields[1].title}
                            </h3>
                            <p className="mt-3 max-w-[28ch] text-[14px] leading-[1.55] text-white/80">
                                {fields[1].desc}
                            </p>
                        </div>
                    </Link>

                    {/* Cell 3 — 마음 쉼터, paper card, full-width band */}
                    <Link
                        href={`/lectures?field=${encodeURIComponent(fields[2].title)}`}
                        className="group flex flex-col justify-between gap-6 rounded-[28px] border border-ink/[0.08] bg-lifted p-7 transition-colors sm:flex-row sm:items-center sm:p-8 md:col-span-12"
                    >
                        <div>
                            <h3 className="display text-[24px] leading-none text-ink">{fields[2].title}</h3>
                            <p className="mt-2 max-w-[42ch] text-[15px] leading-[1.55] text-slate">
                                {fields[2].desc}
                            </p>
                        </div>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal/10 text-signal transition-transform group-hover:translate-x-1">
                            <Arrow className="h-4 w-4" />
                        </span>
                    </Link>
                </Reveal>
            </Section>

            {/* ---------------------------------------------------------- */}
            {/*  출강 이력 — logo rolling band (page's one marquee)         */}
            {/* ---------------------------------------------------------- */}
            <section className="mt-28 overflow-hidden py-14 sm:mt-40">
                <Section>
                    <Reveal>
                        <p className="text-center text-[14px] text-slate">이런 곳에서 함께했습니다</p>
                    </Reveal>
                </Section>
                <div className="relative mt-8 flex overflow-hidden">
                    <div className="flex shrink-0 animate-[home-marquee_32s_linear_infinite] items-center gap-14 pr-14">
                        {[...clients, ...clients].map((c, i) => (
                            <span key={i} className="display whitespace-nowrap text-[25px] text-ink/30">
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------- */}
            {/*  후기 — one featured quote + two supporting quotes          */}
            {/* ---------------------------------------------------------- */}
            <Section className="pt-24 sm:pt-32">
                <Reveal className="max-w-[42ch]">
                    <h2 className="display text-[32px] leading-[1.1] text-ink sm:text-[42px]">
                        현장이 보내는 신뢰.
                    </h2>
                </Reveal>

                <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Featured quote */}
                    <figure className="flex flex-col justify-between rounded-[28px] bg-ink p-9 lg:col-span-7">
                        <div className="text-signal-light" aria-label={`별점 ${testimonials[0].rating}점`}>
                            {"★".repeat(testimonials[0].rating)}
                        </div>
                        <blockquote className="display mt-6 flex-1 text-[22px] leading-[1.5] text-white sm:text-[25px]">
                            {testimonials[0].content}
                        </blockquote>
                        <figcaption className="mt-8 flex items-center gap-3">
                            <span
                                className="grid h-11 w-11 place-items-center rounded-full text-[15px] font-bold text-white"
                                style={{
                                    background:
                                        "radial-gradient(circle at 35% 30%, var(--color-signal-light), var(--color-signal))",
                                }}
                            >
                                {testimonials[0].name.slice(0, 1)}
                            </span>
                            <span>
                                <span className="block text-[15px] font-medium text-white">
                                    {testimonials[0].name}
                                </span>
                                <span className="block text-[13px] text-white/55">
                                    {testimonials[0].affiliation}
                                </span>
                            </span>
                        </figcaption>
                    </figure>

                    {/* Supporting quotes */}
                    <div className="flex flex-col gap-6 lg:col-span-5">
                        {testimonials.slice(1).map((t) => (
                            <figure
                                key={t.name}
                                className="flex flex-1 flex-col justify-between rounded-[28px] border border-ink/[0.08] bg-lifted p-7"
                            >
                                <div className="text-signal" aria-label={`별점 ${t.rating}점`}>
                                    {"★".repeat(t.rating)}
                                </div>
                                <blockquote className="mt-4 flex-1 text-[15px] leading-[1.55] text-ink">
                                    {t.content}
                                </blockquote>
                                <figcaption className="mt-6 flex items-center gap-3">
                                    <span
                                        className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold text-white"
                                        style={{
                                            background:
                                                "radial-gradient(circle at 35% 30%, var(--color-signal-light), var(--color-signal))",
                                        }}
                                    >
                                        {t.name.slice(0, 1)}
                                    </span>
                                    <span>
                                        <span className="block text-[14px] font-medium text-ink">{t.name}</span>
                                        <span className="block text-[12px] text-slate">{t.affiliation}</span>
                                    </span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </Reveal>
            </Section>

            {/* ---------------------------------------------------------- */}
            {/*  최신 블로그                                                */}
            {/* ---------------------------------------------------------- */}
            {posts.length > 0 && (
                <Section className="pt-24 sm:pt-32">
                    <Reveal className="flex items-end justify-between gap-6">
                        <h2 className="display text-[32px] leading-[1.1] text-ink sm:text-[42px]">
                            현장의 기록.
                        </h2>
                        <Link
                            href="/blog"
                            className="hidden shrink-0 items-center gap-2 text-[16px] font-medium text-ink transition-colors sm:inline-flex"
                        >
                            전체 보기 <Arrow className="h-4 w-4" />
                        </Link>
                    </Reveal>

                    <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {posts.map((p) => (
                            <Link
                                key={p.slug}
                                href={`/blog/${p.slug}`}
                                className="group flex flex-col overflow-hidden rounded-[24px] bg-lifted shadow-card transition-transform hover:-translate-y-1"
                            >
                                {p.thumbnail ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={p.thumbnail}
                                        alt={p.title}
                                        className="aspect-[4/3] w-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="aspect-[4/3] w-full"
                                        style={{
                                            background:
                                                "radial-gradient(circle at 35% 30%, var(--color-signal-light), var(--color-signal))",
                                        }}
                                    />
                                )}
                                <div className="flex flex-1 flex-col p-6">
                                    <span className="text-[13px] font-medium text-signal">{p.category}</span>
                                    <h3 className="mt-4 flex-1 text-[17px] leading-[1.35] tracking-[-0.01em] text-ink">
                                        {p.title}
                                    </h3>
                                    <span className="mt-5 text-[13px] text-slate">{p.date}</span>
                                </div>
                            </Link>
                        ))}
                    </Reveal>
                </Section>
            )}

            {/* keyframes for the logo marquee — namespaced to this page */}
            <style>{`@keyframes home-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>
    );
}
