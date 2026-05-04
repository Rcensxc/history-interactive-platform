"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  eventCategories,
  eventStatuses,
  getEventCategoryGroup,
  historicalEvents,
} from "@/data/history-registry";
import { getEventCoverImage } from "@/data/site-asset-manifest";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";

const statusStyles: Record<string, string> = {
  已开放试玩: "border-emerald-200/25 bg-emerald-100/10 text-emerald-100",
  即将开放: "border-amber-200/25 bg-amber-100/10 text-amber-50",
  计划中: "border-white/10 bg-white/5 text-stone-300",
};

const allCategoryLabel = eventCategories[0] ?? "全部分类";
const allStatusLabel = eventStatuses[0] ?? "全部状态";

export function EventHall() {
  const [activeCategory, setActiveCategory] = useState(allCategoryLabel);
  const [activeStatus, setActiveStatus] = useState(allStatusLabel);
  const [selectedId, setSelectedId] = useState(historicalEvents[0]?.id ?? "");

  const filteredEvents = useMemo(() => {
    return historicalEvents.filter((eventItem) => {
      const categoryMatch =
        activeCategory === allCategoryLabel ||
        getEventCategoryGroup(eventItem.category) === activeCategory;
      const statusMatch =
        activeStatus === allStatusLabel || eventItem.statusLabel === activeStatus;

      return categoryMatch && statusMatch;
    });
  }, [activeCategory, activeStatus]);

  const effectiveSelectedId = filteredEvents.some(
    (eventItem) => eventItem.id === selectedId,
  )
    ? selectedId
    : filteredEvents[0]?.id ?? "";

  const selectedEvent =
    filteredEvents.find((eventItem) => eventItem.id === effectiveSelectedId) ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.22fr_0.98fr]">
      <div className="space-y-6">
        <Panel className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-400">事件筛选</p>
                <p className="mt-2 text-lg text-stone-100">
                  当前共找到 {filteredEvents.length} 个可浏览事件
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300">
                点击事件卡片即可查看详情
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-3 text-sm text-stone-400">按分类筛选</p>
                <div className="flex flex-wrap gap-3">
                  {eventCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        activeCategory === category
                          ? "border-amber-200/40 bg-amber-100/12 text-amber-50"
                          : "border-white/10 bg-white/5 text-stone-300 hover:text-stone-50",
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm text-stone-400">按开放状态筛选</p>
                <div className="flex flex-wrap gap-3">
                  {eventStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveStatus(status)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        activeStatus === status
                          ? "border-amber-200/40 bg-amber-100/12 text-amber-50"
                          : "border-white/10 bg-white/5 text-stone-300 hover:text-stone-50",
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {filteredEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((eventItem) => (
              <button
                key={eventItem.id}
                type="button"
                onClick={() => setSelectedId(eventItem.id)}
                className={cn(
                  "text-left",
                  effectiveSelectedId === eventItem.id
                    ? "translate-y-[-2px]"
                    : "transition-transform hover:translate-y-[-2px]",
                )}
              >
                <Panel
                  className={cn(
                    "h-full p-4",
                    effectiveSelectedId === eventItem.id &&
                      "border-amber-200/25 bg-amber-100/8",
                  )}
                >
                  <div className="space-y-4">
                    <PlaceholderArt
                      label={eventItem.backdropLabel}
                      caption={`${eventItem.era} · ${eventItem.category}`}
                      tone={eventItem.status === "playable" ? "crimson" : "ink"}
                      className="min-h-[190px]"
                      imageSrc={getEventCoverImage(eventItem.id)}
                    />
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-display text-2xl text-stone-50">
                          {eventItem.title}
                        </h2>
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            statusStyles[eventItem.statusLabel],
                          )}
                        >
                          {eventItem.statusLabel}
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-stone-300">
                        {eventItem.summary}
                      </p>
                    </div>
                  </div>
                </Panel>
              </button>
            ))}
          </div>
        ) : (
          <Panel className="p-8 text-center text-stone-300">
            当前筛选条件下还没有事件，请切换分类或开放状态再试。
          </Panel>
        )}
      </div>

      <Panel className="h-fit p-6 xl:sticky xl:top-28">
        {selectedEvent ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                  事件概览
                </p>
                <h2 className="mt-3 font-display text-3xl text-stone-50">
                  {selectedEvent.title}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-stone-300">
                {selectedEvent.era}
              </span>
            </div>

            <PlaceholderArt
              label={selectedEvent.backdropLabel}
              caption={selectedEvent.backdropDescription}
              tone={selectedEvent.status === "playable" ? "crimson" : "ink"}
              className="min-h-[260px]"
              imageSrc={getEventCoverImage(selectedEvent.id)}
            />

            <div className="space-y-4 text-sm leading-7 text-stone-300">
              <div>
                <p className="text-stone-500">事件简介</p>
                <p className="mt-2">{selectedEvent.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <p className="text-stone-500">分类</p>
                  <p className="mt-2 text-stone-100">{selectedEvent.category}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <p className="text-stone-500">开放状态</p>
                  <p className="mt-2 text-stone-100">{selectedEvent.statusLabel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-200/18 bg-amber-100/8 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                下一步
              </p>
              <h3 className="mt-3 font-display text-2xl text-amber-50">
                从事件进入体验
              </h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                先看事件，再去选择第一视角人物。
              </p>

              <div className="mt-5">
                {selectedEvent.status === "playable" ? (
                  <Link
                    href={`/events/${selectedEvent.id}`}
                    className="inline-flex rounded-full border border-amber-200/25 bg-amber-100/10 px-5 py-3 text-sm text-amber-50 transition hover:border-amber-200/40 hover:bg-amber-100/15"
                  >
                    进入事件准备页
                  </Link>
                ) : (
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-stone-400">
                    当前仅可浏览事件资料
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-stone-300">
            当前没有可展示的事件资料，请先调整筛选条件。
          </div>
        )}
      </Panel>
    </div>
  );
}
