"use client";

import type { ReactNode } from "react";

type ImmersiveStageShellProps = {
  accent?: "amber" | "jade";
  protocolVersion?: string;
  backgroundLabel?: string;
  backgroundImage?: string;
  sceneId?: string;
  topActions: ReactNode;
  standee?: ReactNode;
  speakerBadge?: ReactNode;
  onContinue: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

function EmptyStandeeSlot() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-[430px] translate-y-3 transition-all duration-300"
    >
      <div className="min-h-[420px]" />
    </div>
  );
}

const stageBackdropClasses = {
  amber:
    "absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,212,147,0.14),transparent_24%),radial-gradient(circle_at_15%_24%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(11,13,16,0.06)_0%,rgba(11,13,16,0.24)_42%,rgba(6,7,10,0.96)_100%)]",
  jade:
    "absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(196,255,233,0.12),transparent_22%),radial-gradient(circle_at_20%_22%,rgba(255,255,255,0.06),transparent_28%),linear-gradient(180deg,rgba(11,13,16,0.05)_0%,rgba(11,13,16,0.24)_42%,rgba(6,7,10,0.96)_100%)]",
} as const;

export function ImmersiveStageShell({
  accent = "amber",
  protocolVersion,
  backgroundLabel,
  backgroundImage,
  sceneId,
  topActions,
  standee,
  speakerBadge,
  onContinue,
  children,
  footer,
}: ImmersiveStageShellProps) {
  return (
    <div className="px-3 py-3 md:px-5 md:py-5">
      <div
        data-story-protocol={protocolVersion}
        data-story-background={backgroundLabel}
        data-story-scene={sceneId}
        className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-[32px] border border-white/10 bg-[#090b0f] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      >
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
        ) : null}
        <div className={stageBackdropClasses[accent]} />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.18),rgba(0,0,0,0.18)),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:auto,96px_96px,96px_96px]" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgba(7,8,12,0.18)_20%,rgba(7,8,12,0.94)_100%)]" />

        <div className="absolute right-0 top-0 z-20 flex items-center justify-end gap-2 px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center gap-2">{topActions}</div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={onContinue}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onContinue();
            }
          }}
          className="relative flex min-h-[calc(100vh-8rem)] flex-col justify-end outline-none"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-[11.5rem] z-10 px-4 md:px-8">
            <div className="mx-auto flex max-w-6xl justify-center">
              {standee ?? <EmptyStandeeSlot />}
            </div>
          </div>

          <div className="relative z-20 mt-auto px-2 pb-2 md:px-3 md:pb-3">
            <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,13,18,0.88),rgba(7,9,13,0.98))] px-4 pb-4 pt-3 shadow-[0_-18px_55px_rgba(0,0,0,0.3)] backdrop-blur-md md:px-6 md:pb-5 md:pt-4">
              <div className="mb-4">{speakerBadge ?? <div className="h-[44px]" />}</div>

              <div className="space-y-4">
                {children}
                {footer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type StageProgressFooterProps = {
  isFinished: boolean;
  finishedText: string;
  showContinueHint?: boolean;
  continueLabel?: string;
};

export function StageProgressFooter({
  isFinished,
  finishedText,
  showContinueHint = true,
  continueLabel = "继续",
}: StageProgressFooterProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-stone-400">
      <div>{isFinished ? finishedText : " "}</div>
      {!isFinished && showContinueHint ? (
        <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-stone-400/70">
          <span>{continueLabel}</span>
          <span className="animate-pulse text-sm text-stone-300/80">›</span>
        </div>
      ) : null}
    </div>
  );
}
