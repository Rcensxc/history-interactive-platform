"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/data/site-content";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0d1117]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-100/10 font-display text-lg text-amber-100">
            🌔
          </div>
          <div>
            <div className="font-display text-lg text-stone-50">百世浏芳</div>
            <div className="text-xs tracking-[0.25em] text-stone-400">
              互动式历史交互平台
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {navigationItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-amber-200/40 bg-amber-100/12 text-amber-50"
                    : "border-white/10 bg-white/5 text-stone-300 hover:border-white/20 hover:text-stone-50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
