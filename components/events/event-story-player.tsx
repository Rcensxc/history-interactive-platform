"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  canContinueScene,
  createEventSceneMap,
  resolveSceneBackground,
  resolveSceneNextId,
  resolveSceneStandee,
  shouldShowSpeakerName,
} from "@/lib/event-story-runtime";
import {
  ImmersiveStageShell,
  StageProgressFooter,
} from "@/components/play/immersive-stage-shell";
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
  const sceneMap = useMemo(() => createEventSceneMap(scenes), [scenes]);
  const firstSceneId = playableContent.initialSceneId ?? scenes[0]?.sceneId ?? "";
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

  const currentChoice = choices[currentScene.sceneId];
  const nextSceneId = resolveSceneNextId(currentScene, currentChoice);
  const isFinished = !nextSceneId;
  const resolvedBackground = resolveSceneBackground(playableContent, currentScene);
  const resolvedStandee = resolveSceneStandee({
    scene: currentScene,
    selectedViewpoint,
    speakerVisuals: playableContent.speakerVisuals,
  });
  const activeVisual = resolvedStandee?.visual ?? {
    label: selectedViewpoint.portraitLabel,
    tone: selectedViewpoint.portraitTone,
    subtitle: selectedViewpoint.title,
    alignment: "center" as const,
  };
  const showSpeakerName = shouldShowSpeakerName(currentScene);
  const showStandee = !!resolvedStandee;

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

    const targetSceneId = resolveSceneNextId(currentScene, choice);
    if (targetSceneId) {
      setCurrentSceneId(targetSceneId);
    }
  };

  const continueStory = () => {
    if (isFinished) {
      return;
    }

    if (!canContinueScene(currentScene, currentChoice)) {
      return;
    }

    if (nextSceneId) {
      setCurrentSceneId(nextSceneId);
    }
  };

  return (
    <ImmersiveStageShell
      accent="amber"
      protocolVersion={playableContent.protocolVersion}
      backgroundLabel={resolvedBackground.label}
      sceneId={currentScene.sceneId}
      topActions={
        <>
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
        </>
      }
      standee={
        showStandee ? (
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
        ) : null
      }
      speakerBadge={
        showSpeakerName ? (
          <div className="inline-flex rounded-[16px] border border-amber-200/18 bg-amber-100/8 px-4 py-2">
            <p className="font-display text-lg text-amber-50 md:text-xl">
              {currentScene.speaker}
            </p>
          </div>
        ) : undefined
      }
      onContinue={continueStory}
      footer={
        currentScene.type === "decision" && !currentChoice ? (
          <div className="grid gap-3 pt-1">
            {currentScene.choices?.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleChoice(currentScene.sceneId, choice);
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
          <StageProgressFooter
            isFinished={isFinished}
            finishedText="这一轮事件体验已结束。"
          />
        )
      }
    >
      <p className="min-h-[110px] text-base leading-8 text-stone-100 md:min-h-[128px] md:text-lg">
        {currentScene.text}
      </p>

      {currentChoice ? (
        <div className="rounded-[22px] border border-amber-200/18 bg-amber-100/8 px-4 py-4 text-sm leading-7 text-amber-50/90">
          <p className="font-medium text-amber-50">{currentChoice.label}</p>
          <p className="mt-2">{currentChoice.outcome}</p>
        </div>
      ) : null}
    </ImmersiveStageShell>
  );
}
