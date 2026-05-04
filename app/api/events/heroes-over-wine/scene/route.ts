import { NextResponse } from "next/server";
import {
  generateHeroesOverWineAiStoryPackage,
  HEROES_OVER_WINE_AI_EVENT_ID,
  shouldUseHeroesOverWineAiMode,
  type HeroesOverWineAiStoryPackageRequest,
} from "@/lib/heroes-over-wine-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: HeroesOverWineAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as HeroesOverWineAiStoryPackageRequest;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "请求体不是合法 JSON。",
      },
      { status: 400 },
    );
  }

  if (
    !payload ||
    payload.eventId !== HEROES_OVER_WINE_AI_EVENT_ID ||
    !shouldUseHeroesOverWineAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持煮酒论英雄的刘备整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateHeroesOverWineAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[heroes-over-wine-ai][route]", {
    requestId: result.debug?.requestId ?? payload.clientRequestId ?? "unknown",
    packageMode: "full-story-package",
    triggerSource: payload.triggerSource ?? "unknown",
    viewpointId: payload.viewpointId,
    timings: result.debug?.timings,
    metrics: result.debug?.metrics,
    source: result.source,
    ok: result.ok,
  });

  return NextResponse.json(result);
}
