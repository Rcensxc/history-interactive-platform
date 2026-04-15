"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { EventSpeakerVisual } from "@/types/content";

type StageStandeeCardProps = {
  visual: EventSpeakerVisual;
};

export function StageStandeeCard({ visual }: StageStandeeCardProps) {
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const showImage = !!visual.image && failedImageSrc !== visual.image;
  const alignmentShift = cn(
    visual.alignment === "left" && "lg:-translate-x-14",
    visual.alignment === "right" && "lg:translate-x-14",
  );

  if (showImage) {
    return (
      <div
        className={cn(
          "pointer-events-none w-full max-w-[560px] translate-y-8 transition-all duration-300 md:max-w-[620px] lg:max-w-[680px]",
          alignmentShift,
        )}
      >
        <div className="relative mx-auto w-full">
          <div className="absolute inset-x-[18%] bottom-7 h-16 rounded-full bg-black/40 blur-3xl md:bottom-8 md:h-20" />
          <div className="relative h-[500px] md:h-[620px] lg:h-[700px]">
            <Image
              src={visual.image!}
              alt={visual.label}
              fill
              sizes="(max-width: 768px) 70vw, (max-width: 1280px) 620px, 680px"
              className="object-contain object-bottom drop-shadow-[0_28px_80px_rgba(0,0,0,0.42)]"
              onError={() => setFailedImageSrc(visual.image ?? null)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-[430px] translate-y-3 transition-all duration-300",
        visual.alignment === "left" && "lg:-translate-x-12",
        visual.alignment === "right" && "lg:translate-x-12",
      )}
    >
      <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] p-5 shadow-[0_35px_100px_rgba(0,0,0,0.32)]">
        <div className="absolute inset-x-12 top-4 h-16 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.3))] px-8 py-8">
          <div className="space-y-3 text-center">
            <div className="font-display text-[6.5rem] leading-none text-stone-50 md:text-[7.5rem]">
              {visual.label}
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-300/70">
              {visual.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
