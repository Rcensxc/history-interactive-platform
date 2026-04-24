"use client";

import { useMemo, useRef, useState } from "react";
import {
  defaultTimeTheaterSelection,
  timeTheaterCastIds,
  timeTheaterStageMeta,
  timeTheaterTopics,
} from "@/data/time-theater";
import { enrichSharedBackgroundAsset } from "@/data/background-asset-manifest";
import { historicalFigures } from "@/data/history-registry";
import { getCharacterStandeeImage } from "@/data/character-asset-manifest";
import { cn } from "@/lib/cn";
import {
  ImmersiveStageShell,
  StageProgressFooter,
} from "@/components/play/immersive-stage-shell";
import { StageStandeeCard } from "@/components/play/stage-standee-card";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { SectionTitle } from "@/components/ui/section-title";
import type {
  HistoricalFigure,
  TimeTheaterAiScriptPackage,
  TimeTheaterTopic,
} from "@/types/content";

type TimeTheaterApiResponse = {
  ok: boolean;
  scriptPackage: TimeTheaterAiScriptPackage;
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

type TriggerSource = "initial" | "reset";

export function TimeTheaterDemo() {
  const cast = useMemo(
    () => historicalFigures.filter((figure) => timeTheaterCastIds.includes(figure.id)),
    [],
  );

  const initialSelection = useMemo(() => {
    const preferred = defaultTimeTheaterSelection.filter((id) =>
      cast.some((figure) => figure.id === id),
    );

    if (preferred.length >= 2) {
      return preferred.slice(0, 3);
    }

    return cast.slice(0, 3).map((figure) => figure.id);
  }, [cast]);

  const [mode, setMode] = useState<"prepare" | "story">("prepare");
  const [selectedIds, setSelectedIds] = useState(initialSelection);
  const [viewpointId, setViewpointId] = useState(initialSelection[0] ?? "");
  const [topicId, setTopicId] = useState(timeTheaterTopics[0]?.id ?? "");
  const [scriptPackage, setScriptPackage] = useState<TimeTheaterAiScriptPackage | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const requestInFlightRef = useRef(false);
  const requestCountRef = useRef(0);

  const selectedCast = cast.filter((figure) => selectedIds.includes(figure.id));
  const activeTopic =
    timeTheaterTopics.find((topic) => topic.id === topicId) ?? timeTheaterTopics[0];
  const effectiveViewpointId = selectedIds.includes(viewpointId)
    ? viewpointId
    : selectedIds[0] ?? "";
  const selectedViewpoint =
    selectedCast.find((figure) => figure.id === effectiveViewpointId) ??
    selectedCast[0] ??
    null;
  const stageReady =
    selectedIds.length >= 2 &&
    selectedIds.length <= 3 &&
    !!activeTopic &&
    !!selectedViewpoint;
  const resolvedBackdrop = enrichSharedBackgroundAsset({
    label: timeTheaterStageMeta.backdropLabel,
    tone: "jade",
    description: timeTheaterStageMeta.backdropDescription,
    backgroundKey: timeTheaterStageMeta.backdropKey,
  });

  const currentLine = scriptPackage?.lines[lineIndex] ?? null;
  const isFinished =
    !!scriptPackage &&
    scriptPackage.lines.length > 0 &&
    lineIndex >= scriptPackage.lines.length - 1;
  const currentSpeaker =
    currentLine?.type === "dialogue"
      ? selectedCast.find((figure) => figure.id === currentLine.speakerId) ?? null
      : null;
  const showSpeakerName = !!currentSpeaker;
  const showStandee = !!currentSpeaker && currentSpeaker.id !== effectiveViewpointId;
  const activeVisual = currentSpeaker
    ? {
        label: currentSpeaker.portraitLabel,
        subtitle: `${currentSpeaker.dynasty} · ${currentSpeaker.role}`,
        alignment: "center" as const,
        tone: currentSpeaker.portraitTone,
        image: getCharacterStandeeImage(currentSpeaker.id),
      }
    : {
        label: selectedViewpoint?.portraitLabel ?? "剧",
        subtitle: selectedViewpoint?.name ?? "第一视角",
        alignment: "center" as const,
        tone: selectedViewpoint?.portraitTone ?? "jade",
      };

  const createLocalFallbackScriptPackage = ({
    topic,
    characters,
    viewpoint,
  }: {
    topic: TimeTheaterTopic;
    characters: HistoricalFigure[];
    viewpoint: HistoricalFigure;
  }): TimeTheaterAiScriptPackage => ({
    protocolVersion: "time-theater-linear-v1",
    topicId: topic.id,
    viewpointId: viewpoint.id,
    characters: characters.map((item) => item.id),
    lines: [
      {
        type: "narration",
        speakerId: "",
        text: topic.opening,
      },
      ...characters.flatMap((figure, index) => {
        const nextFigure = characters[(index + 1) % characters.length];
        return [
          {
            type: "dialogue" as const,
            speakerId: figure.id,
            text:
              index === 0
                ? `若把“${topic.title}”摆到我面前，我最先关心的，不会是空话，而是眼前局面究竟先该稳住什么。`
                : `若轮到我先表态，我会从${figure.role}的角度回答这个主题，因为真正难的往往不是说得漂亮，而是判断能不能落下去。`,
          },
          {
            type: "dialogue" as const,
            speakerId: nextFigure.id,
            text: "你这话说得稳，可若只停在表态上，还是太轻了。真到局势发紧的时候，谁来承担那一步，才会把差别真正拉开。",
          },
        ];
      }),
      {
        type: "narration",
        speakerId: "",
        text: `${viewpoint.name}听到这里，已经能感觉到桌上的气氛变了。众人谈的还是同一个主题，可真正碰撞的地方，已经慢慢落在“谁来承担”与“先做什么”上。`,
      },
      {
        type: "dialogue",
        speakerId: viewpoint.id,
        text: "听你们说到这里，我更在意的已经不是谁讲得更漂亮，而是谁的判断真能在最难的时候先落到地上。",
      },
      {
        type: "narration",
        speakerId: "",
        text: `${viewpoint.name}重新看向同席的人物，发现这场讨论真正留下来的，不是整齐答案，而是他们面对同一个问题时，真正看重的先后与分量。`,
      },
    ],
  });

  const toggleCharacter = (figureId: string) => {
    setSelectedIds((current) => {
      if (current.includes(figureId)) {
        if (current.length <= 2) {
          return current;
        }

        return current.filter((id) => id !== figureId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, figureId];
    });
  };

  async function loadScriptPackage(triggerSource: TriggerSource) {
    if (!activeTopic || !selectedViewpoint || requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;
    requestCountRef.current += 1;
    const clientRequestId = `time-theater-${Date.now()}-${requestCountRef.current}`;

    setMode("story");
    setIsLoading(true);
    setStatusMessage("");
    setScriptPackage(null);
    setLineIndex(0);

    try {
      const response = await fetch("/api/time-theater/script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterIds: selectedIds,
          viewpointId: selectedViewpoint.id,
          topicId: activeTopic.id,
          clientRequestId,
          triggerSource,
        }),
      });

      if (!response.ok) {
        throw new Error(`Script package request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as TimeTheaterApiResponse;
      setScriptPackage(payload.scriptPackage);
      setLineIndex(0);

      if (payload.source === "fallback-local") {
        setStatusMessage(payload.warning ?? "AI 剧本生成失败，已切回本地预设试玩内容。");
      } else if (payload.warning) {
        setStatusMessage(payload.warning);
      }
    } catch {
      const fallbackPackage = createLocalFallbackScriptPackage({
        topic: activeTopic,
        characters: selectedCast,
        viewpoint: selectedViewpoint,
      });
      setScriptPackage(fallbackPackage);
      setLineIndex(0);
      setStatusMessage("剧场脚本请求失败，已切回本地预设试玩内容。");
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  }

  const startInteraction = () => {
    if (!stageReady) {
      return;
    }

    void loadScriptPackage("initial");
  };

  const resetInteraction = () => {
    if (!stageReady) {
      return;
    }

    void loadScriptPackage("reset");
  };

  const backToPrepare = () => {
    setMode("prepare");
    setLineIndex(0);
  };

  const continueStory = () => {
    if (!scriptPackage || !currentLine || isLoading || isFinished) {
      return;
    }

    setLineIndex((current) => Math.min(current + 1, scriptPackage.lines.length - 1));
  };

  if (mode === "story") {
    if (isLoading || !scriptPackage || !currentLine) {
      return (
        <ImmersiveStageShell
          accent="jade"
          backgroundLabel={resolvedBackdrop.label}
          backgroundImage={resolvedBackdrop.image}
          sceneId="time-theater-loading"
          topActions={
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  backToPrepare();
                }}
                className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-stone-200 transition hover:border-white/20 hover:text-stone-50"
              >
                返回准备页
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  resetInteraction();
                }}
                className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-stone-200 transition hover:border-white/20 hover:text-stone-50"
              >
                重开互动
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
            正在生成整场讨论……
          </p>
        </ImmersiveStageShell>
      );
    }

    return (
      <ImmersiveStageShell
        accent="jade"
        backgroundLabel={resolvedBackdrop.label}
        backgroundImage={resolvedBackdrop.image}
        sceneId={`${scriptPackage.topicId}-${lineIndex + 1}`}
        topActions={
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                backToPrepare();
              }}
              className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-stone-200 transition hover:border-white/20 hover:text-stone-50"
            >
              返回准备页
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                resetInteraction();
              }}
              className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-stone-200 transition hover:border-white/20 hover:text-stone-50"
            >
              重开互动
            </button>
          </>
        }
        standee={
          showStandee ? <StageStandeeCard visual={activeVisual} /> : null
        }
        speakerBadge={
          showSpeakerName ? (
            <div className="inline-flex rounded-[16px] border border-amber-200/18 bg-amber-100/8 px-4 py-2">
              <p className="font-display text-lg text-amber-50 md:text-xl">
                {currentSpeaker?.name ?? ""}
              </p>
            </div>
          ) : undefined
        }
        onContinue={continueStory}
        footer={
          <>
            {statusMessage ? (
              <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-stone-300/80">
                {statusMessage}
              </div>
            ) : null}
            <StageProgressFooter
              isFinished={isFinished}
              finishedText="这一轮跨时空讨论已结束。"
              showContinueHint={!isFinished}
            />
          </>
        }
      >
        <p className="min-h-[110px] text-base leading-8 text-stone-100 md:min-h-[128px] md:text-lg">
          {currentLine.text}
        </p>
      </ImmersiveStageShell>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <section className="mb-8">
        <SectionTitle
          eyebrow="Time Theater"
          title={timeTheaterStageMeta.title}
          description={timeTheaterStageMeta.preparationDescription}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Panel className="p-6 md:p-7">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                  准备页
                </p>
                <h2 className="mt-3 font-display text-3xl text-stone-50">
                  选择同台人物
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  最多可选择三位历史人物同台讨论，至少需要两位才能开始剧场。
                </p>
              </div>

              <div className="grid gap-3">
                {cast.map((figure) => {
                  const active = selectedIds.includes(figure.id);

                  return (
                    <button
                      key={figure.id}
                      type="button"
                      onClick={() => toggleCharacter(figure.id)}
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
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-lg text-stone-50">
                            {figure.portraitLabel}
                          </div>
                          <div>
                            <p className="font-display text-2xl text-stone-50">
                              {figure.name}
                            </p>
                            <p className="text-sm text-stone-400">
                              {figure.dynasty} · {figure.role}
                            </p>
                          </div>
                        </div>
                      </Panel>
                    </button>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-6 md:p-7">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                设定互动
              </p>

              <div>
                <p className="mb-3 text-sm text-stone-400">第一视角</p>
                <div className="flex flex-wrap gap-3">
                  {selectedCast.map((figure) => (
                    <button
                      key={figure.id}
                      type="button"
                      onClick={() => setViewpointId(figure.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        effectiveViewpointId === figure.id
                          ? "border-amber-200/40 bg-amber-100/12 text-amber-50"
                          : "border-white/10 bg-white/5 text-stone-300 hover:text-stone-50",
                      )}
                    >
                      {figure.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm text-stone-400">讨论主题</p>
                <div className="space-y-3">
                  {timeTheaterTopics.map((topic) => {
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setTopicId(topic.id)}
                        className={cn(
                          "w-full rounded-[20px] border p-4 text-left transition-colors",
                          topicId === topic.id
                            ? "border-amber-200/30 bg-amber-100/10"
                            : "border-white/10 bg-white/5 hover:border-white/20",
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-base text-stone-100">{topic.title}</p>
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-stone-300">
                            可自由组合讨论
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-stone-400">
                          {topic.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.02fr_0.98fr]">
                <PlaceholderArt
                  label={timeTheaterStageMeta.backdropLabel}
                  caption={timeTheaterStageMeta.backdropDescription}
                  tone="jade"
                  className="min-h-[250px]"
                />
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-stone-400">当前剧场</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-stone-200">
                    <p>1.</p>
                    <p>2. </p>
                    <p>3.</p>
                    <p>4.</p>
                    <p>5.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-amber-200/18 bg-amber-100/8 p-4">
                <div>
                  <p className="text-sm text-amber-50/80">当前设定</p>
                  <p className="mt-2 font-display text-2xl text-amber-50">
                    {selectedViewpoint?.name ?? "未选择视角"}
                  </p>
                  <p className="mt-2 text-sm text-amber-50/80">
                    {activeTopic?.title ?? "未选择主题"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startInteraction}
                  disabled={!stageReady}
                  className={cn(
                    "rounded-full border px-6 py-3 text-sm transition",
                    stageReady
                      ? "border-amber-200/28 bg-amber-100/12 text-amber-50 hover:border-amber-200/45 hover:bg-amber-100/18"
                      : "border-white/10 bg-white/5 text-stone-500",
                  )}
                >
                  开始剧场
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
