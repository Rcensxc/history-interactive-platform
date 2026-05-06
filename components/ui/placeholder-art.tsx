import { cn } from "@/lib/cn";
import type { Tone } from "@/types/content";

type PlaceholderArtProps = {
  label: string;
  caption?: string;
  tone?: Tone;
  className?: string;
  imageSrc?: string;
};

const toneStyles: Record<Tone, string> = {
  amber:
    "from-amber-300/25 via-amber-100/8 to-transparent before:bg-amber-200/25",
  jade: "from-emerald-300/25 via-emerald-100/8 to-transparent before:bg-emerald-200/25",
  ink: "from-slate-200/10 via-slate-100/5 to-transparent before:bg-slate-200/20",
  crimson:
    "from-red-300/25 via-red-100/10 to-transparent before:bg-red-200/25",
  bronze:
    "from-orange-300/25 via-yellow-100/10 to-transparent before:bg-orange-200/25",
};

export function PlaceholderArt({
  label,
  caption,
  tone = "ink",
  className,
  imageSrc,
}: PlaceholderArtProps) {
  const hasImage = !!imageSrc;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br p-6",
        toneStyles[tone],
        "before:absolute before:left-6 before:top-6 before:h-16 before:w-16 before:rounded-full before:blur-2xl",
        className,
      )}
    >
      {imageSrc ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${imageSrc}")` }}
        />
      ) : null}
      {hasImage ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/16 to-transparent" />
      ) : null}
      <div
        className={cn(
          "relative flex h-full min-h-[160px] flex-col justify-end",
          hasImage ? "p-0" : "rounded-[20px] px-1 py-1",
        )}
      >
        <div>
          <div className="font-display text-5xl text-stone-50">{label}</div>
          {caption ? (
            <p className="mt-3 max-w-sm text-sm leading-7 text-stone-300">
              {caption}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
