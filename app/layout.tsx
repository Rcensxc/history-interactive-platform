import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "百世浏芳",
    template: "%s | 百世浏芳",
  },
  description: "一个面向普通用户的历史互动小游戏网页试玩原型。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,220,160,0.12),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.06),_transparent_25%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_20%)]" />
          <SiteHeader />
          <main className="relative z-10">{children}</main>
          <footer className="relative z-10 border-t border-white/8 px-6 py-6 text-center text-sm text-stone-500 md:px-8">
            第一阶段试玩原型 · 当前使用假数据与占位视觉，不接真实 AI
          </footer>
        </div>
      </body>
    </html>
  );
}
