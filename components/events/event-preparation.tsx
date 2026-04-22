"use client";

import Link from "next/link";
import { useState } from "react";
import { CharacterAssetArt } from "@/components/characters/character-asset-art";
import { getCharacterStandeeImage } from "@/data/character-asset-manifest";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/cn";
import type { EventPreparationData, Tone } from "@/types/content";

type EventPreparationProps = {
  preparationData: EventPreparationData | null;
  initialViewpointId?: string;
  preferredFigureName?: string;
  preferredFigureSelectable?: boolean;
};

type ViewpointOptionCardProps = {
  active: boolean;
  figureId?: string;
  name: string;
  title: string;
  summary: string;
  pressure: string;
  portraitLabel: string;
  portraitTone: Tone;
  isRecommended?: boolean;
  onSelect: () => void;
};

const TEXT = {
  pageTitleSuffix: "\u00b7 \u4e8b\u4ef6\u51c6\u5907\u9875",
  pageDescription:
    "\u65e0\u8bba\u4f60\u662f\u4ece\u4eba\u7269\u9986\u8fd8\u662f\u5386\u53f2\u4e8b\u4ef6\u9986\u8fdb\u5165\uff0c\u90fd\u4f1a\u5148\u5728\u8fd9\u91cc\u5b8c\u6210\u4e8b\u4ef6\u4e86\u89e3\u4e0e\u7b2c\u4e00\u89c6\u89d2\u9009\u62e9\uff0c\u518d\u8fdb\u5165\u6b63\u5f0f\u5267\u60c5\u3002",
  sectionIntro: "\u4e8b\u4ef6\u7b80\u4ecb",
  currentStatus: "\u5f53\u524d\u72b6\u6001",
  eventTypePrefix: "\u7c7b\u578b\uff1a",
  viewpointCountPrefix: "\u53ef\u9009\u89c6\u89d2\uff1a",
  viewpointCountSuffix: "\u4f4d",
  stageReuse:
    "\u6b63\u5f0f\u5267\u60c5\u9875\u5c06\u7ee7\u7eed\u590d\u7528\u73b0\u6709 AVG \u6c89\u6d78\u5f0f\u821e\u53f0\u3002",
  stepOne: "\u7b2c\u4e00\u6b65",
  chooseViewpoint: "\u9009\u62e9\u7b2c\u4e00\u89c6\u89d2",
  fromFigurePrefix: "\u4ece\u4eba\u7269\u9986\u5e26\u5165\uff1a",
  preferredFigureUnavailablePrefix:
    "\u5f53\u524d\u7b2c\u4e00\u7248\u8fd8\u4e0d\u80fd\u76f4\u63a5\u4ee5 ",
  preferredFigureUnavailableSuffix:
    " \u4f5c\u4e3a\u8fd9\u4e2a\u4e8b\u4ef6\u7684\u89c6\u89d2\u8fdb\u5165\uff0c\u4e0b\u9762\u4f1a\u5c55\u793a\u672c\u4e8b\u4ef6\u76ee\u524d\u5df2\u5f00\u653e\u7684\u53ef\u9009\u4eba\u7269\u3002",
  noPlayableViewpoints:
    "\u8fd9\u4e2a\u4e8b\u4ef6\u7684\u7b2c\u4e00\u89c6\u89d2\u9009\u62e9\u5c1a\u672a\u5f00\u653e\uff0c\u5f53\u524d\u5148\u4fdd\u7559\u901a\u7528\u4e8b\u4ef6\u51c6\u5907\u9875\u7ed3\u6784\u3002",
  currentChoice: "\u5f53\u524d\u9009\u62e9",
  currentPressure: "\u5f53\u524d\u538b\u529b",
  unavailable: "\u6682\u672a\u5f00\u653e",
  viewpointFallback:
    "\u540e\u7eed\u5f00\u653e\u540e\uff0c\u53ef\u5728\u8fd9\u91cc\u9009\u62e9\u8be5\u4e8b\u4ef6\u7684\u7b2c\u4e00\u89c6\u89d2\u4eba\u7269\u3002",
  startExperience: "\u5f00\u59cb\u4f53\u9a8c",
  notPlayableYet: "\u5f53\u524d\u4e8b\u4ef6\u6682\u672a\u5f00\u653e\u6b63\u5f0f\u4f53\u9a8c",
  recommendedViewpoint: "\u63a8\u8350\u89c6\u89d2",
  standeeCaptionSeparator: "\u00b7",
} as const;

function ViewpointOptionCard({
  active,
  figureId,
  name,
  title,
  summary,
  pressure,
  portraitLabel,
  portraitTone,
  isRecommended = false,
  onSelect,
}: ViewpointOptionCardProps) {
  return (
    <button type="button" onClick={onSelect} className="w-full text-left">
      <Panel
        className={cn(
          "p-5 transition-colors",
          active ? "border-amber-200/25 bg-amber-100/8" : "hover:border-white/20",
        )}
      >
        <div className="grid gap-5 md:grid-cols-[11rem_minmax(0,1fr)]">
          <CharacterAssetArt
            imageSrc={getCharacterStandeeImage(figureId)}
            label={portraitLabel}
            caption={`${name} ${TEXT.standeeCaptionSeparator} ${title}`}
            tone={portraitTone}
            className="min-h-[220px]"
            variant="standee"
          />

          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-2xl text-stone-50">{name}</h3>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
                {title}
              </span>
              {isRecommended ? (
                <span className="rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1 text-xs text-amber-50">
                  {TEXT.recommendedViewpoint}
                </span>
              ) : null}
            </div>

            <p className="text-sm leading-7 text-stone-300">{summary}</p>

            <div className="rounded-[18px] border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                {TEXT.currentPressure}
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-400">{pressure}</p>
            </div>
          </div>
        </div>
      </Panel>
    </button>
  );
}

export function EventPreparation({
  preparationData,
  initialViewpointId,
  preferredFigureName,
  preferredFigureSelectable = false,
}: EventPreparationProps) {
  const eventItem = preparationData?.event ?? null;
  const viewpoints = preparationData?.viewpoints ?? [];
  const hasPlayableStory = preparationData?.hasPlayableStory ?? false;

  const defaultViewpointId = viewpoints.some(
    (viewpoint) => viewpoint.id === initialViewpointId,
  )
    ? (initialViewpointId ?? "")
    : (viewpoints[0]?.id ?? "");

  const [selectedViewpointId, setSelectedViewpointId] =
    useState(defaultViewpointId);

  if (!eventItem) {
    return null;
  }

  const selectedViewpoint =
    viewpoints.find((viewpoint) => viewpoint.id === selectedViewpointId) ??
    viewpoints[0] ??
    null;
  const isPlayable = hasPlayableStory && !!selectedViewpoint;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <section className="mb-8">
        <SectionTitle
          eyebrow="Event Preparation"
          title={`${eventItem.title} ${TEXT.pageTitleSuffix}`}
          description={TEXT.pageDescription}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Panel className="p-6 md:p-7">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                  {TEXT.sectionIntro}
                </p>
                <h2 className="mt-3 font-display text-3xl text-stone-50">
                  {eventItem.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  {eventItem.description}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <PlaceholderArt
                  label={eventItem.backdropLabel}
                  caption={eventItem.backdropDescription}
                  tone={eventItem.status === "playable" ? "crimson" : "ink"}
                  className="min-h-[260px]"
                />

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-stone-400">{TEXT.currentStatus}</p>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-stone-200">
                    <p>{eventItem.statusLabel}</p>
                    <p>
                      {TEXT.eventTypePrefix}
                      {eventItem.category}
                    </p>
                    <p>
                      {TEXT.viewpointCountPrefix}
                      {viewpoints.length}
                      {TEXT.viewpointCountSuffix}
                    </p>
                    <p>{TEXT.stageReuse}</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-6 md:p-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                    {TEXT.stepOne}
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-stone-50">
                    {TEXT.chooseViewpoint}
                  </h2>
                </div>

                {preferredFigureName ? (
                  <div className="rounded-full border border-amber-200/20 bg-amber-100/10 px-4 py-2 text-sm text-amber-50">
                    {TEXT.fromFigurePrefix}
                    {preferredFigureName}
                  </div>
                ) : null}
              </div>

              {preferredFigureName && !preferredFigureSelectable ? (
                <div className="rounded-[20px] border border-white/10 bg-black/15 p-4 text-sm leading-7 text-stone-300">
                  {TEXT.preferredFigureUnavailablePrefix}
                  {preferredFigureName}
                  {TEXT.preferredFigureUnavailableSuffix}
                </div>
              ) : null}

              {isPlayable ? (
                <div className="space-y-4">
                  {viewpoints.map((viewpoint) => {
                    const active = viewpoint.id === selectedViewpointId;

                    return (
                      <ViewpointOptionCard
                        key={viewpoint.id}
                        active={active}
                        figureId={viewpoint.figureId}
                        name={viewpoint.name}
                        title={viewpoint.title}
                        summary={viewpoint.summary}
                        pressure={viewpoint.pressure}
                        portraitLabel={viewpoint.portraitLabel}
                        portraitTone={viewpoint.portraitTone}
                        isRecommended={viewpoint.isRecommended}
                        onSelect={() => setSelectedViewpointId(viewpoint.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-black/15 p-5 text-sm leading-7 text-stone-300">
                  {TEXT.noPlayableViewpoints}
                </div>
              )}

              <div className="rounded-[24px] border border-amber-200/18 bg-amber-100/8 p-5">
                <p className="text-sm text-amber-50/80">{TEXT.currentChoice}</p>
                <p className="mt-2 font-display text-2xl text-amber-50">
                  {selectedViewpoint?.name ?? TEXT.unavailable}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  {selectedViewpoint?.perspective ?? TEXT.viewpointFallback}
                </p>

                <div className="mt-5">
                  {isPlayable && selectedViewpoint ? (
                    <Link
                      href={`/events/${eventItem.id}/play?viewpoint=${selectedViewpoint.id}`}
                      className="inline-flex rounded-full border border-amber-200/28 bg-amber-100/12 px-6 py-3 text-sm text-amber-50 transition hover:border-amber-200/45 hover:bg-amber-100/18"
                    >
                      {TEXT.startExperience}
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-stone-400">
                      {TEXT.notPlayableYet}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
