"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getCharacterPortraitImage,
  getCharacterStandeeImage,
} from "@/data/character-asset-manifest";
import {
  figureDynastyGroups,
  figureRoleGroups,
  getFigureDynastyGroup,
  getFigureRoleGroup,
  figureRelatedExperiences,
  historicalFigures,
} from "@/data/history-registry";
import { CharacterAssetArt } from "@/components/characters/character-asset-art";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/cn";
import type { FigureExperienceOption } from "@/types/content";

type ExperienceGroupProps = {
  title: string;
  description: string;
  items: FigureExperienceOption[];
};

function ExperienceGroup({
  title,
  description,
  items,
}: ExperienceGroupProps) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <p className="text-base text-stone-100">{title}</p>
          <p className="mt-2 text-sm leading-7 text-stone-300">{description}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-400">
          {items.length} 条入口
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[28rem]">
                  <p className="text-base text-stone-100">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    {item.description}
                  </p>
                  {item.note ? (
                    <p className="mt-3 text-xs leading-6 text-amber-100/75">
                      {item.note}
                    </p>
                  ) : null}
                </div>

                {item.href ? (
                  <Link
                    href={item.href}
                    className="inline-flex rounded-full border border-amber-200/25 bg-amber-100/10 px-4 py-2 text-sm text-amber-50 transition hover:border-amber-200/40 hover:bg-amber-100/15"
                  >
                    {item.ctaLabel}
                  </Link>
                ) : (
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-400">
                    {item.ctaLabel}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-stone-400">
            当前没有可展示的相关体验。
          </div>
        )}
      </div>
    </div>
  );
}

export function FigureGallery() {
  const dynasties = useMemo(() => [...figureDynastyGroups], []);
  const roles = useMemo(() => [...figureRoleGroups], []);

  const [activeDynasty, setActiveDynasty] = useState("全部朝代");
  const [activeRole, setActiveRole] = useState("全部身份");
  const [selectedId, setSelectedId] = useState(historicalFigures[0]?.id ?? "");

  const filteredFigures = useMemo(() => {
    return historicalFigures.filter((figure) => {
      const dynastyMatch =
        activeDynasty === "全部朝代" ||
        getFigureDynastyGroup(figure.dynasty) === activeDynasty;
      const roleMatch =
        activeRole === "全部身份" || getFigureRoleGroup(figure) === activeRole;

      return dynastyMatch && roleMatch;
    });
  }, [activeDynasty, activeRole]);

  const effectiveSelectedId = filteredFigures.some(
    (figure) => figure.id === selectedId,
  )
    ? selectedId
    : filteredFigures[0]?.id ?? "";

  const selectedFigure =
    filteredFigures.find((figure) => figure.id === effectiveSelectedId) ?? null;

  const selectedExperiences = selectedFigure
    ? figureRelatedExperiences[selectedFigure.id] ?? []
    : [];
  const relatedEvents = selectedExperiences.filter(
    (item) => item.kind === "event",
  );
  const timeTheaterOptions = selectedExperiences.filter(
    (item) => item.kind === "time-theater",
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <div className="space-y-6">
        <Panel className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-400">筛选区域</p>
                <p className="mt-2 text-lg text-stone-100">
                  当前共找到 {filteredFigures.length} 位可浏览人物
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300">
                点击左侧人物即可查看详情与相关体验入口
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-3 text-sm text-stone-400">按朝代筛选</p>
                <div className="flex flex-wrap gap-3">
                  {dynasties.map((dynasty) => (
                    <button
                      key={dynasty}
                      type="button"
                      onClick={() => setActiveDynasty(dynasty)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        activeDynasty === dynasty
                          ? "border-amber-200/40 bg-amber-100/12 text-amber-50"
                          : "border-white/10 bg-white/5 text-stone-300 hover:text-stone-50",
                      )}
                    >
                      {dynasty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm text-stone-400">按身份筛选</p>
                <div className="flex flex-wrap gap-3">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setActiveRole(role)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        activeRole === role
                          ? "border-amber-200/40 bg-amber-100/12 text-amber-50"
                          : "border-white/10 bg-white/5 text-stone-300 hover:text-stone-50",
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {filteredFigures.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFigures.map((figure) => (
              <button
                key={figure.id}
                type="button"
                onClick={() => setSelectedId(figure.id)}
                className={cn(
                  "text-left",
                  effectiveSelectedId === figure.id
                    ? "translate-y-[-2px]"
                    : "transition-transform hover:translate-y-[-2px]",
                )}
              >
                <Panel
                  className={cn(
                    "h-full p-4",
                    effectiveSelectedId === figure.id &&
                      "border-amber-200/25 bg-amber-100/8",
                  )}
                >
                  <div className="space-y-4">
                    <CharacterAssetArt
                      imageSrc={getCharacterStandeeImage(figure.id)}
                      label={figure.portraitLabel}
                      caption={`${figure.dynasty} · ${figure.role}`}
                      tone={figure.portraitTone}
                      className="min-h-[180px]"
                      variant="standee"
                    />
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-display text-2xl text-stone-50">
                          {figure.name}
                        </h2>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
                          {figure.title}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-stone-300">
                        {figure.introduction}
                      </p>
                    </div>
                  </div>
                </Panel>
              </button>
            ))}
          </div>
        ) : (
          <Panel className="p-8 text-center text-stone-300">
            当前筛选条件下还没有人物资料，请切换朝代或身份标签再试。
          </Panel>
        )}
      </div>

      <Panel className="h-fit p-6 xl:sticky xl:top-28">
        {selectedFigure ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                  人物详情
                </p>
                <h2 className="mt-3 font-display text-3xl text-stone-50">
                  {selectedFigure.name}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-stone-300">
                {selectedFigure.dynasty}
              </span>
            </div>

            <CharacterAssetArt
              imageSrc={getCharacterPortraitImage(selectedFigure.id)}
              label={selectedFigure.portraitLabel}
              caption={`${selectedFigure.title} · ${selectedFigure.signatureEvent}`}
              tone={selectedFigure.portraitTone}
              className="min-h-[260px]"
              variant="portrait"
            />

            <div className="space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-black/15 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                  人物档案
                </p>
                <div className="mt-4 space-y-5 text-sm leading-7 text-stone-300">
                  <div>
                    <p className="text-stone-500">人物简介</p>
                    <p className="mt-2">{selectedFigure.introduction}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="text-stone-500">朝代</p>
                      <p className="mt-2 text-stone-100">{selectedFigure.dynasty}</p>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="text-stone-500">身份 / 职业</p>
                      <p className="mt-2 text-stone-100">{selectedFigure.role}</p>
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                    <p className="text-stone-500">代表事件</p>
                    <p className="mt-2 text-stone-100">
                      {selectedFigure.signatureEvent}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500">关键词</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedFigure.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-200/18 bg-amber-100/8 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                    相关体验
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-amber-50">
                    从这个人物继续进入体验
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                    先从相关历史事件进入这位人物所处的关键局面；跨时空互动则用于观察他在另一种玩法里的表达、判断与立场。
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <ExperienceGroup
                    title="相关历史事件"
                    description="从人物进入事件准备页，继续体验这位人物真正面对的局面与选择。"
                    items={relatedEvents}
                  />
                  <ExperienceGroup
                    title="跨时空互动"
                    description="把人物带入跨时代讨论，在另一种玩法里观察他会如何说话、如何回应问题。"
                    items={timeTheaterOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-stone-300">
            当前没有可展示的人物资料，请先调整筛选条件。
          </div>
        )}
      </Panel>
    </div>
  );
}
