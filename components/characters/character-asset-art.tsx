//React 组件，用于显示角色的艺术资源（立绘或肖像）。如果提供了有效的图像 URL，则显示图像；否则显示一个占位符艺术组件。组件还支持不同的视觉风格和布局选项。
"use client";

import Image from "next/image";
import { useState } from "react";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { cn } from "@/lib/cn";
import type { Tone } from "@/types/content";

type CharacterAssetArtProps = {
  imageSrc?: string;
  label: string;
  caption?: string;
  tone?: Tone;
  className?: string;
  variant?: "standee" | "portrait";
};

export function CharacterAssetArt({
  imageSrc,
  label,
  caption,
  tone = "ink",
  className,
  variant = "portrait",
}: CharacterAssetArtProps) {
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const showImage = !!imageSrc && failedImageSrc !== imageSrc;

  if (!showImage) {
    return (
      <PlaceholderArt
        label={label}
        caption={caption}
        tone={tone}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/10 bg-black/15",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_55%)]" />
      <div
        className={cn(
          "relative h-full w-full",
          variant === "standee" ? "min-h-[180px]" : "min-h-[260px]",
        )}
      >
        <Image
          src={imageSrc!}
          alt={label}
          fill
          sizes={variant === "standee" ? "(max-width: 768px) 100vw, 320px" : "(max-width: 1280px) 100vw, 520px"}
          className={cn(
            variant === "standee"
              ? "object-contain object-bottom p-3"
              : "object-cover object-center",
          )}
          onError={() => setFailedImageSrc(imageSrc ?? null)}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(5,7,10,0)_0%,rgba(5,7,10,0.72)_78%,rgba(5,7,10,0.92)_100%)] px-4 pb-4 pt-12">
        {caption ? (
          <p className="text-sm leading-7 text-stone-200/85">{caption}</p>
        ) : null}
      </div>
    </div>
  );
}
