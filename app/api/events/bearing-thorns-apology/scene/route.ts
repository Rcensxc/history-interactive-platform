import { NextResponse } from "next/server";
import {
  BEARING_THORNS_AI_EVENT_ID,
  generateBearingThornsAiStoryPackage,
  shouldUseBearingThornsAiMode,
  type BearingThornsAiStoryPackageRequest,
} from "@/lib/bearing-thorns-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: BearingThornsAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as BearingThornsAiStoryPackageRequest;
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
    payload.eventId !== BEARING_THORNS_AI_EVENT_ID ||
    !shouldUseBearingThornsAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持负荆请罪的蔺相如整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateBearingThornsAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[bearing-thorns-ai][route]", {
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
