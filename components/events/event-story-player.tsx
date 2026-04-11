"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type {
  EventChoice,
  EventPlayableContent,
  EventViewpoint,
  HistoricalEvent,
} from "@/types/content";

type EventStoryPlayerProps = {
  eventItem: HistoricalEvent;
  playableContent: EventPlayableContent;
  initialViewpointId?: string;
};

export function EventStoryPlayer({
  eventItem,
  playableContent,
  initialViewpointId,
}: EventStoryPlayerProps) {
  const viewpoints = playableContent.viewpoints;
  const scenes = playableContent.scenes;
  const sceneMap = useMemo(
    () => Object.fromEntries(scenes.map((scene) => [scene.id, scene])),
    [scenes],
  );
  const firstSceneId = playableContent.initialSceneId ?? scenes[0]?.id ?? "";
  const initialSelectedViewpointId = viewpoints.some(
    (viewpoint) => viewpoint.id === initialViewpointId,
  )
    ? initialViewpointId ?? ""
    : viewpoints[0]?.id ?? "";
  const [selectedViewpointId, setSelectedViewpointId] = useState(
    initialSelectedViewpointId,
  );
  const [currentSceneId, setCurrentSceneId] = useState(firstSceneId);
  const [choices, setChoices] = useState<Record<string, EventChoice>>({});

  const selectedViewpoint =
    viewpoints.find((viewpoint) => viewpoint.id === selectedViewpointId) ??
    viewpoints[0] ??
    null;
  const currentScene = sceneMap[currentSceneId] ?? scenes[0] ?? null;

  if (!selectedViewpoint || !currentScene) {
    return null;
  }

  const currentChoice = choices[currentScene.id];
  const nextSceneId =
    currentChoice?.nextSceneId ?? currentScene.nextSceneId ?? null;
  const isFinished = !nextSceneId;
  const activeVisual =
    playableContent.speakerVisuals[
      currentScene.visualKey ?? currentScene.speakerId ?? currentScene.speaker
    ] ?? {
      label: selectedViewpoint.portraitLabel,
      tone: selectedViewpoint.portraitTone,
      subtitle: selectedViewpoint.title,
      alignment: "center" as const,
    };
  const showSpeakerName =
    currentScene.type !== "narration" && currentScene.speaker !== "旁白";
  const showStandee =
    currentScene.type === "dialogue" &&
    (currentScene.speakerId ?? currentScene.speaker) !== selectedViewpoint.id &&
    currentScene.speaker !== "旁白";

  const resetStory = (viewpoint?: EventViewpoint) => {
    if (viewpoint) {
      setSelectedViewpointId(viewpoint.id);
    }

    setCurrentSceneId(firstSceneId);
    setChoices({});
  };

  const handleChoice = (sceneId: string, choice: EventChoice) => {
    setChoices((current) => ({
      ...current,
      [sceneId]: choice,
    }));

    const targetSceneId = choice.nextSceneId ?? currentScene.nextSceneId;
    if (targetSceneId) {
      setCurrentSceneId(targetSceneId);
    }
  };

  const continueStory = () => {
    if (isFinished) {
      return;
    }

    if (currentScene.type === "decision" && !currentChoice) {
      return;
    }

    if (nextSceneId) {
      setCurrentSceneId(nextSceneId);
    }
  };

  return (
    <div className="px-3 py-3 md:px-5 md:py-5">
      <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-[32px] border border-white/10 bg-[#090b0f] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,212,147,0.14),transparent_24%),radial-gradient(circle_at_15%_24%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(11,13,16,0.06)_0%,rgba(11,13,16,0.24)_42%,rgba(6,7,10,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.18),rgba(0,0,0,0.18)),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:auto,96px_96px,96px_96px]" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgba(7,8,12,0.18)_20%,rgba(7,8,12,0.94)_100%)]" />

        <div className="absolute right-0 top-0 z-20 flex items-center justify-end gap-2 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/events/${eventItem.id}?viewpoint=${selectedViewpoint.id}`}
              className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-stone-200 transition hover:border-white/20 hover:text-stone-50"
            >
              返回准备页
            </Link>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                resetStory();
              }}
              className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-stone-200 transition hover:border-white/20 hover:text-stone-50"
            >
              重开剧情
            </button>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={continueStory}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              continueStory();
            }
          }}
          className="relative flex min-h-[calc(100vh-8rem)] flex-col justify-end outline-none"
        >
          {showStandee ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-[11.5rem] z-10 px-4 md:px-8">
              <div className="mx-auto flex max-w-6xl justify-center">
                <div
                  className={cn(
                    "w-full max-w-[430px] translate-y-3 transition-all duration-300",
                    activeVisual.alignment === "left" && "lg:-translate-x-12",
                    activeVisual.alignment === "right" && "lg:translate-x-12",
                  )}
                >
                  <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] p-5 shadow-[0_35px_100px_rgba(0,0,0,0.32)]">
                    <div className="absolute inset-x-12 top-4 h-16 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex min-h-[420px] flex-col justify-end rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.3))] px-8 py-8">
                      <div className="space-y-3 text-center">
                        <div className="font-display text-[6.5rem] leading-none text-stone-50 md:text-[7.5rem]">
                          {activeVisual.label}
                        </div>
                        <p className="text-xs uppercase tracking-[0.4em] text-stone-300/70">
                          {activeVisual.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="relative z-20 mt-auto px-2 pb-2 md:px-3 md:pb-3">
            <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,13,18,0.88),rgba(7,9,13,0.98))] px-4 pb-4 pt-3 shadow-[0_-18px_55px_rgba(0,0,0,0.3)] backdrop-blur-md md:px-6 md:pb-5 md:pt-4">
              <div className="mb-4">
                {showSpeakerName ? (
                  <div className="inline-flex rounded-[16px] border border-amber-200/18 bg-amber-100/8 px-4 py-2">
                    <p className="font-display text-lg text-amber-50 md:text-xl">
                      {currentScene.speaker}
                    </p>
                  </div>
                ) : (
                  <div className="h-[44px]" />
                )}
              </div>

              <div className="space-y-4">
                <p className="min-h-[110px] text-base leading-8 text-stone-100 md:min-h-[128px] md:text-lg">
                  {currentScene.text}
                </p>

                {currentChoice ? (
                  <div className="rounded-[22px] border border-amber-200/18 bg-amber-100/8 px-4 py-4 text-sm leading-7 text-amber-50/90">
                    <p className="font-medium text-amber-50">{currentChoice.label}</p>
                    <p className="mt-2">{currentChoice.outcome}</p>
                  </div>
                ) : null}

                {currentScene.type === "decision" && !currentChoice ? (
                  <div className="grid gap-3 pt-1">
                    {currentScene.choices?.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleChoice(currentScene.id, choice);
                        }}
                        className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-4 text-left text-sm text-stone-100 transition hover:border-amber-200/28 hover:bg-[linear-gradient(180deg,rgba(255,240,210,0.08),rgba(255,255,255,0.03))]"
                      >
                        <div className="absolute inset-y-3 left-2 w-px bg-white/12 group-hover:bg-amber-200/35" />
                        <div className="flex items-center justify-between gap-3">
                          <span className="pr-4 leading-7">{choice.label}</span>
                          {choice.isHistorical ? (
                            <span className="rounded-full border border-amber-200/20 bg-amber-100/8 px-3 py-1 text-[11px] text-amber-50/90">
                              历史走向
                            </span>
                          ) : (
                            <span className="text-stone-500 transition group-hover:text-stone-300">
                              ›
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 text-sm text-stone-400">
                    <div>{isFinished ? "这一轮事件体验已结束。" : " "}</div>
                    {!isFinished ? (
                      <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-stone-400/70">
                        <span>继续</span>
                        <span className="animate-pulse text-sm text-stone-300/80">›</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
