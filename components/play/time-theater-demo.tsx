"use client";

import { useMemo, useState } from "react";
import {
  defaultTimeTheaterSelection,
  timeTheaterSpeakerVisuals,
  timeTheaterStageMeta,
  timeTheaterScripts,
  timeTheaterTopics,
} from "@/data/time-theater";
import { historicalFigures } from "@/data/history-registry";
import { cn } from "@/lib/cn";
import {
  ImmersiveStageShell,
  StageProgressFooter,
} from "@/components/play/immersive-stage-shell";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { SectionTitle } from "@/components/ui/section-title";

export function TimeTheaterDemo() {
  const cast = useMemo(
    () =>
      historicalFigures.filter((figure) => figure.canJoinTimeTheater),
    [],
  );

  const [mode, setMode] = useState<"prepare" | "story">("prepare");
  const [selectedIds, setSelectedIds] = useState(defaultTimeTheaterSelection);
  const [viewpointId, setViewpointId] = useState(defaultTimeTheaterSelection[0]);
  const [topicId, setTopicId] = useState(timeTheaterTopics[0]?.id ?? "");
  const [progress, setProgress] = useState(1);

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
    !!activeTopic &&
    !!selectedViewpoint &&
    activeTopic.requiredSpeakerIds.every((speakerId) => selectedIds.includes(speakerId));
  const topicScript = activeTopic ? timeTheaterScripts[activeTopic.id] ?? [] : [];
  const storyLines = activeTopic
    ? [{ speakerId: "narrator", text: activeTopic.opening }, ...topicScript]
    : [];
  const currentLine =
    storyLines[Math.min(progress - 1, Math.max(storyLines.length - 1, 0))] ?? null;
  const isFinished = progress >= storyLines.length;
  const currentSpeaker =
    currentLine && currentLine.speakerId !== "narrator"
      ? cast.find((figure) => figure.id === currentLine.speakerId) ?? null
      : null;
  const activeVisual =
    currentLine && timeTheaterSpeakerVisuals[currentLine.speakerId]
      ? timeTheaterSpeakerVisuals[currentLine.speakerId]
      : {
          label: selectedViewpoint?.portraitLabel ?? "剧",
          tone: selectedViewpoint?.portraitTone ?? "ink",
          subtitle: selectedViewpoint?.name ?? "剧场视角",
        };
  const showSpeakerName = !!currentLine && currentLine.speakerId !== "narrator";
  const showStandee =
    !!currentLine &&
    currentLine.speakerId !== "narrator" &&
    currentLine.speakerId !== effectiveViewpointId;

  const toggleCharacter = (figureId: string) => {
    setSelectedIds((current) => {
      if (current.includes(figureId)) {
        if (current.length === 1) {
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

  const startInteraction = () => {
    if (!stageReady) {
      return;
    }

    setProgress(1);
    setMode("story");
  };

  const resetInteraction = () => {
    setProgress(1);
  };

  const backToPrepare = () => {
    setMode("prepare");
    setProgress(1);
  };

  const continueStory = () => {
    if (isFinished) {
      return;
    }

    setProgress((current) => Math.min(current + 1, storyLines.length));
  };

  if (mode === "story" && currentLine) {
    return (
      <ImmersiveStageShell
        accent="jade"
        backgroundLabel={timeTheaterStageMeta.backdropLabel}
        sceneId={currentLine.speakerId}
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
          showStandee ? (
            <div className="w-full max-w-[430px] translate-y-3 transition-all duration-300">
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
                {currentSpeaker?.name ?? "匿名角色"}
              </p>
            </div>
          ) : undefined
        }
        onContinue={continueStory}
        footer={
          <StageProgressFooter
            isFinished={isFinished}
            finishedText="这一轮互动已结束。"
          />
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
          eyebrow="Time Theater Demo"
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
                  当前先保留少量人物与话题，只把“多人同台 + 第一视角 + 进入正式互动”的流程做稳定。最多可选择 3 位角色同台。
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
                <p className="mb-3 text-sm text-stone-400">讨论话题</p>
                <div className="space-y-3">
                  {timeTheaterTopics.map((topic) => {
                    const available = topic.requiredSpeakerIds.every((speakerId) =>
                      selectedIds.includes(speakerId),
                    );

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
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs",
                              available
                                ? "border border-emerald-200/25 bg-emerald-100/8 text-emerald-100"
                                : "border border-white/10 bg-black/20 text-stone-400",
                            )}
                          >
                            {available ? "可开始互动" : "需补齐人物"}
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
                  <p className="text-sm text-stone-400">正式互动页会保留的核心结构</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-stone-200">
                    <p>1. 大背景场景</p>
                    <p>2. 当前发言角色居中立绘</p>
                    <p>3. 底部大对话框</p>
                    <p>4. 极简功能按钮</p>
                    <p>5. 点击继续推进</p>
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
                    {activeTopic?.title ?? "未选择话题"}
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
                  开始互动
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
