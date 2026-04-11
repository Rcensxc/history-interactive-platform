import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
