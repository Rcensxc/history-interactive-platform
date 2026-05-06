"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type FloatingBackToDetailButtonProps = {
  targetId?: string;
  label: string;
  showAfter?: number;
  className?: string;
};

export function FloatingBackToDetailButton({
  targetId,
  label,
  showAfter = 480,
  className,
}: FloatingBackToDetailButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > showAfter);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showAfter]);

  const scrollToTarget = () => {
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTarget}
      className={cn(
        "fixed bottom-24 right-4 z-40 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-sm text-stone-200 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-black/65 hover:text-stone-50 md:bottom-8 md:right-6",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
        className,
      )}
    >
      ↑ {label}
    </button>
  );
}
