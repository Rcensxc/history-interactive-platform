import Link from "next/link";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { Panel } from "@/components/ui/panel";
import type { HomeEntry } from "@/types/content";

type EntryCardProps = {
  entry: HomeEntry;
};

export function EntryCard({ entry }: EntryCardProps) {
  return (
    <Panel className="p-5">
      <div className="space-y-5">
        <PlaceholderArt
          label={entry.eyebrow}
          caption={entry.highlight}
          tone={entry.tone}
          className="min-h-[220px]"
        />
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
