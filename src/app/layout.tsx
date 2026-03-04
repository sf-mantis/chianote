import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "치아노트 | 아이 치과 진료 & 구강 기록 앱",
  description: "우리아이 구강 건강을 위한 쉽고 직관적인 치과 진료 기록 관리 앱. 유치/영구치 치아 모델, 진료 달력, 양치 타이머를 지원합니다.",
  keywords: ["어린이", "치과", "구강기록", "치아관리", "양치타이머", "치아노트", "충치", "덴탈차트"],
  authors: [{ name: "Chianote Dev Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "치아노트",
  },
  openGraph: {
    title: "우리가족 치아노트 - 아이 치과 기록",
    description: "아이의 구강 건강 상태를 한눈에 볼 수 있는 우리 가족만의 치과 진료 기록장입니다.",
    url: "https://chianote.com",
    siteName: "치아노트",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "치아노트 | 아이 치과 진료 & 구강 기록 앱",
    description: "우리아이 구강 건강을 위한 쉽고 직관적인 치과 진료 기록 관리 앱.",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
