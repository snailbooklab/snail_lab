import type { Metadata } from "next";
import { Gothic_A1, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Nav } from "./_components/nav";
import { Footer } from "./_components/footer";
import { Providers } from "./_lib/providers";
import { SITE_NAME } from "./_lib/seo";

/* Body — clean, legible everywhere (marketing pages AND admin dashboards). */
const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

/* Display — clean geometric sans, opted into via the `.display` class    */
/* for headlines. Slightly rounder/bolder than the body font for hierarchy. */
const gothicA1 = Gothic_A1({
  weight: ["700", "800"],
  variable: "--font-gothic-a1",
  display: "swap",
});

const SITE_DESC =
  "달팽이 마음 뜰. 미디어 리터러시 · 그림책 · 아동심리학으로 아이와 미디어 사이 건강한 거리를 만드는 학부모·교사·기관 대상 교육.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${SITE_NAME} — 미디어 리터러시 · 그림책 · 아동심리`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "달팽이 마음 뜰",
    "미디어 리터러시",
    "그림책",
    "아동심리",
    "부모 교육",
    "교사 연수",
    "미디어 효과",
  ],
  authors: [{ name: "최미선" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 미디어 리터러시 · 그림책 · 아동심리`,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${gothicA1.variable} h-full`}>
      <body className="min-h-full">
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
