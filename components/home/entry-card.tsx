import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import type { HomeEntry } from "@/types/content";

type EntryCardProps = {
  entry: HomeEntry;
};

export function EntryCard({ entry }: EntryCardProps) {
  const toneStyles = {
    amber:
      "from-amber-300/20 via-amber-100/8 to-transparent before:bg-amber-200/25",
    jade: "from-emerald-300/20 via-emerald-100/8 to-transparent before:bg-emerald-200/25",
    bronze:
      "from-orange-300/20 via-yellow-100/8 to-transparent before:bg-orange-200/25",
    crimson:
      "from-red-300/20 via-red-100/8 to-transparent before:bg-red-200/25",
    ink: "from-slate-200/10 via-slate-100/5 to-transparent before:bg-slate-200/20",
  } as const;

  return (
    <Panel className="p-5">
      <div className="space-y-5">
        <div
          className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br p-6 ${toneStyles[entry.tone]}`}
        >
          <div className="absolute left-6 top-6 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/12 to-transparent" />
          <div className="relative flex min-h-[220px] flex-col justify-end">
            <div className="space-y-3">
              <div className="font-display text-4xl leading-none text-stone-50 drop-shadow-[0_10px_28px_rgba(0,0,0,0.35)] md:text-5xl">
                {entry.eyebrow}
              </div>
              <p className="max-w-sm text-sm leading-7 text-stone-200/90">
                {entry.highlight}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
            {entry.eyebrow}
          </p>
          <h2 className="font-display text-2xl leading-tight text-stone-50">
            {entry.title}
          </h2>
          <p className="text-sm leading-7 text-stone-300">{entry.description}</p>
        </div>
        <Link
          href={entry.href}
          className="inline-flex items-center rounded-full border border-amber-200/25 bg-amber-100/10 px-4 py-2 text-sm text-amber-50 transition hover:border-amber-200/45 hover:bg-amber-100/15"
        >
          {entry.cta}
        </Link>
      </div>
    </Panel>
  );
}
