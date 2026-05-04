import { EntryCard } from "@/components/home/entry-card";
import { getSiteHeroImage } from "@/data/site-asset-manifest";
import { homeEntries } from "@/data/site-content";

export default function Home() {
  const heroImage = getSiteHeroImage();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <section className="relative min-h-[72vh] overflow-hidden rounded-[36px] border border-white/10">
        {heroImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${heroImage}")` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,172,87,0.16),transparent_42%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/58 to-black/28" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/32 to-black/10" />

        <div className="relative flex min-h-[72vh] items-center px-8 py-14 md:px-12 lg:px-16">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">
              History Interactive Platform
            </p>
            <h1 className="font-display text-5xl leading-tight text-stone-50 md:text-7xl">
              亲身进入历史现场。
            </h1>
            <p className="max-w-2xl text-base leading-8 text-stone-200/90 md:text-lg">
              我们希望通过沉浸式的互动体验，让你体验到的历史不再遥远，而是生动的、有趣的、触手可及的。
            </p>
          </div>
        </div>
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
            通过不同的入口，你可以选择自己更喜欢的历史体验方式。
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
