import Link from "next/link";
import { EntryCard } from "@/components/home/entry-card";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { getSiteHeroImage } from "@/data/site-asset-manifest";
import { homeEntries, homeHighlights } from "@/data/site-content";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel className="relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/35 to-transparent" />
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">
                History Interactive Demo
              </p>
              <h1 className="max-w-3xl font-display text-5xl leading-tight text-stone-50 md:text-7xl">
                亲身进入历史现场。
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
                我们希望通过沉浸式的互动体验，让历史不再遥远，而是生动、有趣、触手可及。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/events"
                className="rounded-full border border-amber-200/25 bg-amber-100/10 px-5 py-3 text-sm text-amber-50 transition hover:border-amber-200/40 hover:bg-amber-100/15"
              >
                进入历史事件馆
              </Link>
              <Link
                href="/figures"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-stone-200 transition hover:border-white/20 hover:text-stone-50"
              >
                进入历史人物馆
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {homeHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/10 bg-black/15 px-4 py-4 text-sm text-stone-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <PlaceholderArt
          label="百世浏芳"
          caption="【封面占位图】"
          tone="amber"
          className="min-h-[520px]"
          imageSrc={getSiteHeroImage()}
        />
      </section>

      <section className="mt-8 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
              Core Entry
            </p>
            <h2 className="mt-3 font-display text-3xl text-stone-50 md:text-4xl">
              三种历史体验方式
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-400">
            通过不同的入口，你可以选择自己喜欢的历史体验方式。
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {homeEntries.map((entry) => (
            <EntryCard key={entry.href} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
