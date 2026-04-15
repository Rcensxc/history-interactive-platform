"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  canContinueScene,
  createEventSceneMap,
  resolveSceneBackground,
  resolveSceneNextId,
  resolveSceneStandee,
  shouldShowSpeakerName,
} from "@/lib/event-story-runtime";
import {
  enrichEventBackgroundAsset,
  enrichEventSpeakerVisual,
} from "@/data/event-asset-manifest";
import {
  ImmersiveStageShell,
  StageProgressFooter,
} from "@/components/play/immersive-stage-shell";
import { StageStandeeCard } from "@/components/play/stage-standee-card";
import type {
  EventChoice,
  EventPlayableContent,
  HongmenAiScriptPackage,
  HistoricalEvent,
} from "@/types/content";

type HongmenAiStoryPlayerProps = {
  eventItem: HistoricalEvent;
  playableContent: EventPlayableContent;
  initialViewpointId: string;
};

type HongmenAiStoryPackageApiResponse = {
  ok: boolean;
  scriptPackage?: HongmenAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: {
    requestId?: string;
    timings?: Record<string, number | undefined>;
    metrics?: Record<string, string | number | undefined>;
    upstreamStatus?: number;
    upstreamStatusText?: string;
  };
};

type ClientTriggerSource = "initial" | "reset";

type PendingPackageTrace = {
  requestId: string;
  triggerSource: ClientTriggerSource;
  startedAt: number;
  packageRequestCount: number;
};

export function HongmenAiStoryPlayer({
  eventItem,
  playableContent,
  initialViewpointId,
}: HongmenAiStoryPlayerProps) {
  const baseViewpoint =
    playableContent.viewpoints.find((viewpoint) => viewpoint.id === initialViewpointId) ??
    playableContent.viewpoints[0] ??
    null;
  const [scriptPackage, setScriptPackage] = useState<HongmenAiScriptPackage | null>(null);
  const [activePlayableContent, setActivePlayableContent] = useState<EventPlayableContent | null>(
    null,
  );
  const [currentSceneId, setCurrentSceneId] = useState("");
  const [choices, setChoices] = useState<Record<string, EventChoice>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const initialRequestStartedRef = useRef(false);
  const packageRequestInFlightRef = useRef(false);
  const packageRequestCountRef = useRef(0);
  const pendingPackageTraceRef = useRef<PendingPackageTrace | null>(null);

  useEffect(() => {
    if (initialRequestStartedRef.current) {
      return;
    }

    initialRequestStartedRef.current = true;
    void loadStoryPackage("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentSceneId || !pendingPackageTraceRef.current) {
      return;
    }

    const trace = pendingPackageTraceRef.current;
    requestAnimationFrame(() => {
      console.info("[hongmen-ai][client-render]", {
        requestId: trace.requestId,
        triggerSource: trace.triggerSource,
        packageRequestCount: trace.packageRequestCount,
        clientTotalMs: Number((performance.now() - trace.startedAt).toFixed(1)),
        sceneId: currentSceneId,
      });
      pendingPackageTraceRef.current = null;
    });
  }, [currentSceneId]);

  const content = activePlayableContent;
  const sceneMap = useMemo(
    () => (content ? createEventSceneMap(content.scenes) : {}),
    [content],
  );
  if (!baseViewpoint) {
    return null;
  }
  const selectedViewpoint =
    content?.viewpoints.find((viewpoint) => viewpoint.id === initialViewpointId) ??
    content?.viewpoints[0] ??
    baseViewpoint;
  const currentScene = content ? sceneMap[currentSceneId] ?? content.scenes[0] ?? null : null;
  const currentChoice = currentScene ? choices[currentScene.sceneId] : undefined;
  const isAwaitingChoice = currentScene?.type === "decision" && !currentChoice;
  const nextSceneId = currentScene ? resolveSceneNextId(currentScene, currentChoice) : null;
  const isFinished = !!currentScene && !isAwaitingChoice && !nextSceneId;
  const resolvedBackground = currentScene
    ? enrichEventBackgroundAsset({
        eventId: eventItem.id,
        sceneId: currentScene.sceneId,
        background: resolveSceneBackground(content ?? playableContent, currentScene),
      })
    : enrichEventBackgroundAsset({
        eventId: eventItem.id,
        sceneId: "arrival",
        background: playableContent.defaultBackdrop,
      });
  const resolvedStandee = currentScene
    ? resolveSceneStandee({
        scene: currentScene,
        selectedViewpoint,
        speakerVisuals: (content ?? playableContent).speakerVisuals,
      })
    : null;
  const activeVisual = enrichEventSpeakerVisual({
    eventId: eventItem.id,
    visualKey: resolvedStandee?.visualKey,
    visual: resolvedStandee?.visual ?? {
      label: selectedViewpoint.portraitLabel,
      tone: selectedViewpoint.portraitTone,
      subtitle: selectedViewpoint.title,
      alignment: "center" as const,
    },
  });
  const showSpeakerName = currentScene ? shouldShowSpeakerName(currentScene) : false;
  const showStandee = !!resolvedStandee;

  async function loadStoryPackage(triggerSource: ClientTriggerSource) {
    if (packageRequestInFlightRef.current) {
      console.info("[hongmen-ai][client-trigger]", {
        triggerSource,
        deduped: true,
      });
      return;
    }

    packageRequestInFlightRef.current = true;
    packageRequestCountRef.current += 1;

    const packageRequestCount = packageRequestCountRef.current;
    const clientRequestId = `hongmen-package-${Date.now()}-${packageRequestCount}`;
    const startedAt = performance.now();
    pendingPackageTraceRef.current = {
      requestId: clientRequestId,
      triggerSource,
      startedAt,
      packageRequestCount,
    };

    console.info("[hongmen-ai][client-trigger]", {
      requestId: clientRequestId,
      triggerSource,
      packageRequestCount,
      requestMode: "full-story-package",
    });

    setIsLoading(true);
    setStatusMessage("");
    setScriptPackage(null);
    setActivePlayableContent(null);
    setCurrentSceneId("");
    setChoices({});

    try {
      const response = await fetch("/api/events/hongmen-banquet/scene", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventItem.id,
          viewpointId: selectedViewpoint.id,
          clientRequestId,
          triggerSource,
          clientTriggeredAtMs: Date.now(),
          packageRequestCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Story package request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as HongmenAiStoryPackageApiResponse;
      console.info("[hongmen-ai][client-response]", {
        requestId: clientRequestId,
        triggerSource,
        networkMs: Number((performance.now() - startedAt).toFixed(1)),
        source: payload.source,
        packageBeatCount: payload.scriptPackage?.beats.length ?? 0,
        debug: payload.debug,
      });

      const nextPlayableContent = payload.playableContent ?? playableContent;
      const nextInitialSceneId =
        nextPlayableContent.initialSceneId ?? nextPlayableContent.scenes[0]?.sceneId ?? "";

      setScriptPackage(payload.scriptPackage ?? null);
      setActivePlayableContent(nextPlayableContent);
      setCurrentSceneId(nextInitialSceneId);
      setChoices({});

      if (payload.source === "fallback-local") {
        setStatusMessage(payload.warning ?? "AI 整包生成失败，已切回本地静态剧情。");
      } else if (payload.warning) {
        setStatusMessage(payload.warning);
      }
    } catch {
      console.warn("[hongmen-ai][client-response]", {
        requestId: clientRequestId,
        triggerSource,
        networkMs: Number((performance.now() - startedAt).toFixed(1)),
        source: "fetch-error",
      });

      setScriptPackage(null);
      setActivePlayableContent(playableContent);
      setCurrentSceneId(playableContent.initialSceneId ?? playableContent.scenes[0]?.sceneId ?? "");
      setChoices({});
      setStatusMessage("剧情包请求失败，已切回本地静态剧情。");
    } finally {
      packageRequestInFlightRef.current = false;
      setIsLoading(false);
    }
  }

  function resetStory() {
    void loadStoryPackage("reset");
  }

  function handleChoice(sceneId: string, choice: EventChoice) {
    setChoices((current) => ({
      ...current,
      [sceneId]: choice,
    }));

    const scene = content ? sceneMap[sceneId] ?? content.scenes[0] ?? null : null;
    const targetSceneId = scene ? resolveSceneNextId(scene, choice) : null;
    if (targetSceneId) {
      setCurrentSceneId(targetSceneId);
    }
  }

  function continueStory() {
    if (!currentScene || !content || isLoading || isFinished) {
      return;
    }

    if (!canContinueScene(currentScene, currentChoice)) {
      return;
    }

    if (nextSceneId) {
      setCurrentSceneId(nextSceneId);
    }
  }

  if (!content || !currentScene) {
    return (
      <ImmersiveStageShell
        accent="amber"
        protocolVersion={playableContent.protocolVersion}
        backgroundLabel={playableContent.defaultBackdrop.label}
        backgroundImage={resolvedBackground.image}
        sceneId="hongmen-package-loading"
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
        onContinue={() => {}}
        footer={
          <>
            {statusMessage ? (
              <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-stone-300/80">
                {statusMessage}
              </div>
            ) : null}
          <StageProgressFooter
            isFinished={false}
            finishedText=""
            continueLabel="生成中"
            showContinueHint={false}
          />
          </>
        }
      >
        <p className="min-h-[110px] text-base leading-8 text-stone-100 md:min-h-[128px] md:text-lg">
          正在生成整条剧情……
        </p>
      </ImmersiveStageShell>
    );
  }

  return (
    <ImmersiveStageShell
      accent="amber"
      protocolVersion={content.protocolVersion}
      backgroundLabel={resolvedBackground.label}
      backgroundImage={resolvedBackground.image}
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
        showStandee ? <StageStandeeCard visual={activeVisual} /> : null
      }
      speakerBadge={
        showSpeakerName ? (
          <div className="inline-flex rounded-[16px] border border-amber-200/18 bg-amber-100/8 px-4 py-2">
            <p className="font-display text-lg text-amber-50 md:text-xl">{currentScene.speaker}</p>
          </div>
        ) : undefined
      }
      onContinue={continueStory}
      footer={
        <>
          {currentScene.type === "decision" && !currentChoice ? (
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
          ) : null}

          {statusMessage ? (
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-stone-300/80">
              {statusMessage}
            </div>
          ) : null}

          <StageProgressFooter
            isFinished={isFinished}
            finishedText="这一轮事件体验已结束。"
            showContinueHint={!isAwaitingChoice && !isFinished}
          />
        </>
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

      {scriptPackage ? (
        <div
          className="hidden"
          data-package-id={scriptPackage.packageId}
          data-story-id={scriptPackage.storyId}
        />
      ) : null}
    </ImmersiveStageShell>
  );
}
