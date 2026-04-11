"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  EventScene,
  HistoricalEvent,
} from "@/types/content";

const AI_INITIAL_SCENE_ID = "arrival-1";

type HongmenAiStoryPlayerProps = {
  eventItem: HistoricalEvent;
  playableContent: EventPlayableContent;
  initialViewpointId: string;
};

type SceneHistoryEntry = {
  sceneId: string;
  speaker: string;
  text: string;
  type: EventScene["type"];
  selectedChoiceId?: string;
  selectedChoiceLabel?: string;
};

type HongmenAiSceneApiResponse = {
  ok: boolean;
  scene: EventScene;
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

type ClientTriggerSource = "initial" | "continue" | "choice" | "reset";

type PendingClientTrace = {
  requestId: string;
  sceneId: string;
  triggerSource: ClientTriggerSource;
  startedAt: number;
  requestCountForScene: number;
};

export function HongmenAiStoryPlayer({
  eventItem,
  playableContent,
  initialViewpointId,
}: HongmenAiStoryPlayerProps) {
  const selectedViewpoint =
    playableContent.viewpoints.find((viewpoint) => viewpoint.id === initialViewpointId) ??
    playableContent.viewpoints[0] ??
    null;
  const fallbackSceneMap = useMemo(
    () => createEventSceneMap(playableContent.scenes),
    [playableContent.scenes],
  );
  const [generatedScenes, setGeneratedScenes] = useState<Record<string, EventScene>>({});
  const [sceneOrder, setSceneOrder] = useState<string[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState(AI_INITIAL_SCENE_ID);
  const [choices, setChoices] = useState<Record<string, EventChoice>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const initialRequestStartedRef = useRef(false);
  const inFlightSceneIdsRef = useRef(new Set<string>());
  const sceneRequestCountsRef = useRef<Record<string, number>>({});
  const requestSequenceRef = useRef(0);
  const pendingRenderTraceRef = useRef<Record<string, PendingClientTrace>>({});

  const currentScene = generatedScenes[currentSceneId] ?? null;

  const generatedSceneList = useMemo(
    () =>
      sceneOrder
        .map((sceneId) => generatedScenes[sceneId] ?? fallbackSceneMap[sceneId] ?? null)
        .filter((scene): scene is EventScene => !!scene),
    [fallbackSceneMap, generatedScenes, sceneOrder],
  );

  useEffect(() => {
    if (initialRequestStartedRef.current) {
      return;
    }

    initialRequestStartedRef.current = true;
    void requestScene(AI_INITIAL_SCENE_ID, "initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentScene) {
      return;
    }

    const trace = pendingRenderTraceRef.current[currentScene.sceneId];
    if (!trace) {
      return;
    }

    const requestId = trace.requestId;
    requestAnimationFrame(() => {
      const totalClientMs = Number((performance.now() - trace.startedAt).toFixed(1));
      console.info("[hongmen-ai][client-render]", {
        requestId,
        sceneId: currentScene.sceneId,
        triggerSource: trace.triggerSource,
        requestCountForScene: trace.requestCountForScene,
        clientTotalMs: totalClientMs,
      });
      delete pendingRenderTraceRef.current[currentScene.sceneId];
    });
  }, [currentScene]);

  if (!selectedViewpoint) {
    return null;
  }

  const currentChoice = currentScene ? choices[currentScene.sceneId] : undefined;
  const isAwaitingChoice = currentScene?.type === "decision" && !currentChoice;
  const nextSceneId = currentScene ? resolveSceneNextId(currentScene, currentChoice) : null;
  const isFinished = !!currentScene && !isLoading && !isAwaitingChoice && !nextSceneId;
  const resolvedBackground = currentScene
    ? resolveSceneBackground(playableContent, currentScene)
    : playableContent.defaultBackdrop;
  const resolvedStandee = currentScene
    ? resolveSceneStandee({
        scene: currentScene,
        selectedViewpoint,
        speakerVisuals: playableContent.speakerVisuals,
      })
    : null;
  const activeVisual = resolvedStandee?.visual ?? {
    label: selectedViewpoint.portraitLabel,
    tone: selectedViewpoint.portraitTone,
    subtitle: selectedViewpoint.title,
    alignment: "center" as const,
  };
  const showSpeakerName = currentScene ? shouldShowSpeakerName(currentScene) : false;
  const showStandee = !!resolvedStandee;
  const isInitialLoading = isLoading && !currentScene && sceneOrder.length === 0;

  function buildHistory(): SceneHistoryEntry[] {
    return generatedSceneList.map((scene) => {
      const selectedChoice = choices[scene.sceneId];

      return {
        sceneId: scene.sceneId,
        speaker: scene.speaker,
        text: scene.text,
        type: scene.type,
        selectedChoiceId: selectedChoice?.id,
        selectedChoiceLabel: selectedChoice?.label,
      };
    });
  }

  function getLocalFallbackScene(sceneId: string) {
    const fallbackSceneId = sceneId.replace(/-\d+$/, "");
    const fallbackScene =
      fallbackSceneMap[fallbackSceneId] ?? fallbackSceneMap[playableContent.initialSceneId];

    if (!fallbackScene) {
      return null;
    }

    return {
      ...fallbackScene,
      sceneId,
    };
  }

  async function requestScene(
    sceneId: string,
    triggerSource: ClientTriggerSource = "continue",
  ) {
    if (!sceneId) {
      return;
    }

    if (generatedScenes[sceneId]) {
      setCurrentSceneId(sceneId);
      return;
    }

    if (inFlightSceneIdsRef.current.has(sceneId)) {
      console.info("[hongmen-ai][client-trigger]", {
        sceneId,
        triggerSource,
        deduped: true,
      });
      return;
    }

    sceneRequestCountsRef.current[sceneId] =
      (sceneRequestCountsRef.current[sceneId] ?? 0) + 1;
    const requestCountForScene = sceneRequestCountsRef.current[sceneId];
    const clientRequestId = `${sceneId}-${Date.now()}-${++requestSequenceRef.current}`;
    const startedAt = performance.now();
    pendingRenderTraceRef.current[sceneId] = {
      requestId: clientRequestId,
      sceneId,
      triggerSource,
      startedAt,
      requestCountForScene,
    };

    console.info("[hongmen-ai][client-trigger]", {
      requestId: clientRequestId,
      sceneId,
      triggerSource,
      historyCount: buildHistory().length,
      requestCountForScene,
    });

    inFlightSceneIdsRef.current.add(sceneId);
    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/events/hongmen-banquet/scene", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventItem.id,
          viewpointId: selectedViewpoint.id,
          requestedSceneId: sceneId,
          history: buildHistory(),
          clientRequestId,
          triggerSource,
          clientTriggeredAtMs: Date.now(),
          clientRequestCountForScene: requestCountForScene,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scene request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as HongmenAiSceneApiResponse;
      console.info("[hongmen-ai][client-response]", {
        requestId: clientRequestId,
        sceneId,
        triggerSource,
        networkMs: Number((performance.now() - startedAt).toFixed(1)),
        source: payload.source,
        debug: payload.debug,
      });
      const nextScene = payload.scene ?? getLocalFallbackScene(sceneId);

      if (!nextScene) {
        throw new Error("AI response did not include a usable scene.");
      }

      setGeneratedScenes((current) => ({
        ...current,
        [sceneId]: nextScene,
      }));
      setSceneOrder((current) =>
        current.includes(sceneId) ? current : [...current, sceneId],
      );
      setCurrentSceneId(sceneId);

      if (payload.source === "fallback-local") {
        setStatusMessage(payload.warning ?? "AI 当前一幕生成失败，已切回本地剧情。");
      } else if (payload.warning) {
        setStatusMessage(payload.warning);
      }
    } catch {
      console.warn("[hongmen-ai][client-response]", {
        requestId: clientRequestId,
        sceneId,
        triggerSource,
        networkMs: Number((performance.now() - startedAt).toFixed(1)),
        source: "fetch-error",
      });
      const fallbackScene = getLocalFallbackScene(sceneId);
      if (!fallbackScene) {
        setStatusMessage("当前这一幕生成失败，请重开剧情后再试。");
        setIsLoading(false);
        inFlightSceneIdsRef.current.delete(sceneId);
        delete pendingRenderTraceRef.current[sceneId];
        return;
      }

      setGeneratedScenes((current) => ({
        ...current,
        [sceneId]: fallbackScene,
      }));
      setSceneOrder((current) =>
        current.includes(sceneId) ? current : [...current, sceneId],
      );
      setCurrentSceneId(sceneId);
      setStatusMessage("接口请求失败，已切回本地剧情。");
    } finally {
      inFlightSceneIdsRef.current.delete(sceneId);
      setIsLoading(false);
    }
  }

  function resetStory() {
    inFlightSceneIdsRef.current.clear();
    setGeneratedScenes({});
    setSceneOrder([]);
    setChoices({});
    setCurrentSceneId(AI_INITIAL_SCENE_ID);
    setStatusMessage("");
    void requestScene(AI_INITIAL_SCENE_ID, "reset");
  }

  function handleChoice(sceneId: string, choice: EventChoice) {
    setChoices((current) => ({
      ...current,
      [sceneId]: choice,
    }));

    const scene = generatedScenes[sceneId] ?? fallbackSceneMap[sceneId];
    const targetSceneId = scene ? resolveSceneNextId(scene, choice) : null;
    if (targetSceneId) {
      void requestScene(targetSceneId, "choice");
    }
  }

  function continueStory() {
    if (isLoading || isFinished) {
      return;
    }

    if (!currentScene || !canContinueScene(currentScene, currentChoice)) {
      return;
    }

    if (nextSceneId) {
      void requestScene(nextSceneId, "continue");
    }
  }

  return (
    <ImmersiveStageShell
      accent="amber"
      protocolVersion={playableContent.protocolVersion}
      backgroundLabel={resolvedBackground.label}
      sceneId={currentScene?.sceneId ?? "hongmen-loading"}
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
            <p className="font-display text-lg text-amber-50 md:text-xl">{currentScene?.speaker}</p>
          </div>
        ) : undefined
      }
      onContinue={continueStory}
      footer={
        <>
          {currentScene?.type === "decision" && !currentChoice ? (
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
            continueLabel={isLoading ? "生成中" : "继续"}
            showContinueHint={!isLoading && !isAwaitingChoice && !isFinished}
          />
        </>
      }
    >
      <p className="min-h-[110px] text-base leading-8 text-stone-100 md:min-h-[128px] md:text-lg">
        {isInitialLoading
          ? "正在生成开场……"
          : currentScene?.text ?? "当前这一幕暂时无法载入。"}
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
