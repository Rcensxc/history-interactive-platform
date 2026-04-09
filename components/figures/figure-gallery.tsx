"use client";

import { useMemo, useState } from "react";
import { historicalFigures } from "@/data/historical-figures";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/panel";
import { PlaceholderArt } from "@/components/ui/placeholder-art";

export function FigureGallery() {
  const dynasties = useMemo(
    () => ["全部朝代", ...new Set(historicalFigures.map((figure) => figure.dynasty))],
    [],
  );
  const roles = useMemo(
    () => ["全部身份", ...new Set(historicalFigures.map((figure) => figure.role))],
    [],
  );

  const [activeDynasty, setActiveDynasty] = useState("全部朝代");
  const [activeRole, setActiveRole] = useState("全部身份");
  const [selectedId, setSelectedId] = useState(historicalFigures[0]?.id ?? "");

  const filteredFigures = useMemo(() => {
    return historicalFigures.filter((figure) => {
      const dynastyMatch =
        activeDynasty === "全部朝代" || figure.dynasty === activeDynasty;
      const roleMatch = activeRole === "全部身份" || figure.role === activeRole;

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
                首批资料卡仅作试玩占位，后续可替换真实图像与更完整人物档案
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
                    <PlaceholderArt
                      label={figure.portraitLabel}
                      caption={`${figure.dynasty} · ${figure.role}`}
                      tone={figure.portraitTone}
                      className="min-h-[180px]"
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

            <PlaceholderArt
              label={selectedFigure.portraitLabel}
              caption={`${selectedFigure.title} · ${selectedFigure.signatureEvent}`}
              tone={selectedFigure.portraitTone}
              className="min-h-[260px]"
            />

            <div className="space-y-4 text-sm leading-7 text-stone-300">
              <div>
                <p className="text-stone-500">人物介绍</p>
                <p className="mt-2">{selectedFigure.introduction}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-stone-500">朝代</p>
                  <p className="mt-2">{selectedFigure.dynasty}</p>
                </div>
                <div>
                  <p className="text-stone-500">职业 / 身份</p>
                  <p className="mt-2">{selectedFigure.role}</p>
                </div>
              </div>
              <div>
                <p className="text-stone-500">代表事件</p>
                <p className="mt-2">{selectedFigure.signatureEvent}</p>
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
        ) : (
          <div className="text-sm text-stone-300">
            当前没有可展示的人物资料，请先调整筛选条件。
          </div>
        )}
      </Panel>
    </div>
  );
}
