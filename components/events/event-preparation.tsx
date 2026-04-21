"use client";

import Link from "next/link";
import { useState } from "react";
import { CharacterAssetArt } from "@/components/characters/character-asset-art";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { SectionTitle } from "@/components/ui/section-title";
import { getCharacterStandeeImage } from "@/data/character-asset-manifest";
import type { EventPreparationData } from "@/types/content";

type EventPreparationProps = {
  preparationData: EventPreparationData | null;
  initialViewpointId?: string;
  preferredFigureName?: string;
  preferredFigureSelectable?: boolean;
};

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
    ? initialViewpointId ?? ""
    : viewpoints[0]?.id ?? "";
  const [selectedViewpointId, setSelectedViewpointId] = useState(defaultViewpointId);

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
          title={`${eventItem.title} · 事件准备页`}
          description="无论你是从人物馆还是历史事件馆进入，都会先在这里完成事件了解与第一视角选择，再进入正式剧情。"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Panel className="p-6 md:p-7">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                  事件简介
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
                  <p className="text-sm text-stone-400">当前状态</p>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-stone-200">
                    <p>{eventItem.statusLabel}</p>
                    <p>类型：{eventItem.category}</p>
                    <p>可选视角：{viewpoints.length} 位</p>
                    <p>正式剧情页将继续复用现有 AVG 沉浸式舞台。</p>
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
                    第一步
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-stone-50">
                    选择第一视角
                  </h2>
                </div>
                {preferredFigureName ? (
                  <div className="rounded-full border border-amber-200/20 bg-amber-100/10 px-4 py-2 text-sm text-amber-50">
                    从人物馆带入：{preferredFigureName}
                  </div>
                ) : null}
              </div>

              {preferredFigureName && !preferredFigureSelectable ? (
                <div className="rounded-[20px] border border-white/10 bg-black/15 p-4 text-sm leading-7 text-stone-300">
                  当前第一版还不能直接以 {preferredFigureName} 作为这个事件的视角进入，下面会展示本事件目前已开放的可选人物。
                </div>
              ) : null}

              {isPlayable ? (
                <div className="space-y-4">
                  {viewpoints.map((viewpoint) => {
                    const active = viewpoint.id === selectedViewpointId;

                    return (
                      <button
                        key={viewpoint.id}
                        type="button"
                        onClick={() => setSelectedViewpointId(viewpoint.id)}
                        className="w-full text-left"
                      >
                        <Panel
                          className={cn(
                            "p-4 transition-colors",
                            active
                              ? "border-amber-200/25 bg-amber-100/8"
                              : "hover:border-white/20",
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <CharacterAssetArt
                              imageSrc={getCharacterStandeeImage(viewpoint.figureId)}
                              label={viewpoint.portraitLabel}
                              caption={`${viewpoint.name} · ${viewpoint.title}`}
                              tone={viewpoint.portraitTone}
                              className="w-28 shrink-0"
                              variant="standee"
                            />
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-display text-2xl text-stone-50">
                                  {viewpoint.name}
                                </h3>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
                                  {viewpoint.title}
                                </span>
                              </div>
                              <p className="text-sm leading-7 text-stone-300">
                                {viewpoint.summary}
                              </p>
                            </div>
                          </div>
                        </Panel>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-black/15 p-5 text-sm leading-7 text-stone-300">
                  这个事件的第一视角选择尚未开放，当前先保留通用事件准备页结构。
                </div>
              )}

              <div className="rounded-[24px] border border-amber-200/18 bg-amber-100/8 p-5">
                <p className="text-sm text-amber-50/80">当前选择</p>
                <p className="mt-2 font-display text-2xl text-amber-50">
                  {selectedViewpoint?.name ?? "暂未开放"}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  {selectedViewpoint?.perspective ??
                    "后续开放后，可在这里选择该事件的第一视角人物。"}
                </p>

                <div className="mt-5">
                  {isPlayable && selectedViewpoint ? (
                    <Link
                      href={`/events/${eventItem.id}/play?viewpoint=${selectedViewpoint.id}`}
                      className="inline-flex rounded-full border border-amber-200/28 bg-amber-100/12 px-6 py-3 text-sm text-amber-50 transition hover:border-amber-200/45 hover:bg-amber-100/18"
                    >
                      开始体验
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-stone-400">
                      当前事件暂未开放正式体验
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
