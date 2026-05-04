import { NextResponse } from "next/server";
import {
  generateTianjiHorseRaceAiStoryPackage,
  TIANJI_HORSE_RACE_AI_EVENT_ID,
  shouldUseTianjiHorseRaceAiMode,
  type TianjiHorseRaceAiStoryPackageRequest,
} from "@/lib/tianji-horse-race-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: TianjiHorseRaceAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as TianjiHorseRaceAiStoryPackageRequest;
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
    payload.eventId !== TIANJI_HORSE_RACE_AI_EVENT_ID ||
    !shouldUseTianjiHorseRaceAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持田忌赛马的田忌整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateTianjiHorseRaceAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[tianji-horse-race-ai][route]", {
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
