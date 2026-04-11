"use client";

import { useState } from "react";
import {
  hongmenRoles,
  hongmenScenes,
  hongmenSpeakerVisuals,
  hongmenStageMeta,
} from "@/data/history-registry";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";
import { SectionTitle } from "@/components/ui/section-title";
import type { HongmenChoice } from "@/types/content";

export function HongmenDemo() {
  const initialRoleId = hongmenRoles[0]?.id ?? "";
  const [mode, setMode] = useState<"prepare" | "story">("prepare");
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId);
  const [progress, setProgress] = useState(1);
  const [choices, setChoices] = useState<Record<string, HongmenChoice>>({});

  const selectedRole =
    hongmenRoles.find((role) => role.id === selectedRoleId) ?? hongmenRoles[0];

  const currentScene = hongmenScenes[Math.min(progress - 1, hongmenScenes.length - 1)];
  const isFinished = progress >= hongmenScenes.length;
  const currentChoice = currentScene ? choices[currentScene.sceneId] : undefined;
  const activeVisual =
    hongmenSpeakerVisuals[currentScene?.speaker ?? ""] ?? {
      label: selectedRole?.portraitLabel ?? "宴",
      tone: selectedRole?.portraitTone ?? "ink",
      subtitle: selectedRole?.title ?? "当前视角",
      alignment: "center" as const,
    };
  const showSpeakerName = currentScene.speaker !== "旁白";
  const showStandee =
    currentScene?.type === "dialogue" &&
    currentScene.speaker !== selectedRole?.name &&
    currentScene.speaker !== "旁白";

  const resetDemo = (roleId = selectedRoleId) => {
    setSelectedRoleId(roleId);
    setProgress(1);
    setChoices({});
  };

  const startStory = () => {
    resetDemo(selectedRoleId);
    setMode("story");
  };

  const backToPrepare = () => {
    setMode("prepare");
    resetDemo(selectedRoleId);
  };

  const handleChoice = (sceneId: string, choice: HongmenChoice) => {
    setChoices((current) => ({
      ...current,
      [sceneId]: choice,
    }));
    setProgress((current) => Math.min(current + 1, hongmenScenes.length));
  };

  const continueStory = () => {
    if (isFinished) {
      return;
    }

    if (currentScene?.type === "decision" && !currentChoice) {
      return;
    }

    setProgress((current) => Math.min(current + 1, hongmenScenes.length));
  };

  if (mode === "story" && selectedRole && currentScene) {
    return (
      <div className="px-3 py-3 md:px-5 md:py-5">
        <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-[32px] border border-white/10 bg-[#090b0f] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,212,147,0.14),transparent_24%),radial-gradient(circle_at_15%_24%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(11,13,16,0.06)_0%,rgba(11,13,16,0.24)_42%,rgba(6,7,10,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.18),rgba(0,0,0,0.18)),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:auto,96px_96px,96px_96px]" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgba(7,8,12,0.18)_20%,rgba(7,8,12,0.94)_100%)]" />

          <div className="absolute right-0 top-0 z-20 flex items-center justify-end gap-2 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center gap-2">
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
                  resetDemo(selectedRoleId);
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
                    <div className="flex items-center justify-between gap-3 text-sm text-stone-400">
                      <div>
                        {isFinished
                          ? "这一轮试玩已结束。"
                          : " "}
                      </div>
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <section className="mb-8">
        <SectionTitle
          eyebrow="Hongmen Banquet Demo"
          title={hongmenStageMeta.title}
          description={hongmenStageMeta.preparationDescription}
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
                  选择你的视角
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  这里仍保留网页式布局，用于选角和阅读试玩说明。点击“开始剧情”后，界面会切换到更完整的 AVG 式沉浸场景。
                </p>
              </div>

              <div className="space-y-4">
                {hongmenRoles.map((role) => {
                  const active = role.id === selectedRoleId;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
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
                          <PlaceholderArt
                            label={role.portraitLabel}
                            tone={role.portraitTone}
                            className="w-28 shrink-0"
                          />
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-display text-2xl text-stone-50">
                                {role.name}
                              </h3>
                              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
                                {role.title}
                              </span>
                            </div>
                            <p className="text-sm leading-7 text-stone-300">
                              {role.summary}
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
                试玩说明
              </p>
              <div>
                <h2 className="font-display text-3xl text-stone-50">
                  {selectedRole?.name ?? "未选择角色"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  {selectedRole?.perspective}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/15 p-4 text-sm leading-7 text-stone-300">
                {selectedRole?.pressure}
              </div>

              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <PlaceholderArt
                  label={hongmenStageMeta.backdropLabel}
                  caption={hongmenStageMeta.backdropDescription}
                  tone="crimson"
                  className="min-h-[250px]"
                />
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-stone-400">进入正式剧情后会保留的核心结构</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-stone-200">
                    <p>1. 大背景场景</p>
                    <p>2. 人物立绘展示</p>
                    <p>3. 底部大对话框</p>
                    <p>4. 角色名牌</p>
                    <p>5. 点击推进对白</p>
                    <p>6. 关键决策按钮</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-amber-200/18 bg-amber-100/8 p-4">
                <div>
                  <p className="text-sm text-amber-50/80">当前选择</p>
                  <p className="mt-2 font-display text-2xl text-amber-50">
                    {selectedRole?.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startStory}
                  className="rounded-full border border-amber-200/28 bg-amber-100/12 px-6 py-3 text-sm text-amber-50 transition hover:border-amber-200/45 hover:bg-amber-100/18"
                >
                  开始剧情
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
