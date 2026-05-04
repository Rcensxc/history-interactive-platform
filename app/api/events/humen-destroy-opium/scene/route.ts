import { NextResponse } from "next/server";
import {
  generateHumenDestroyOpiumAiStoryPackage,
  HUMEN_DESTROY_OPIUM_AI_EVENT_ID,
  shouldUseHumenDestroyOpiumAiMode,
  type HumenDestroyOpiumAiStoryPackageRequest,
} from "@/lib/humen-destroy-opium-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: HumenDestroyOpiumAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as HumenDestroyOpiumAiStoryPackageRequest;
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
    payload.eventId !== HUMEN_DESTROY_OPIUM_AI_EVENT_ID ||
    !shouldUseHumenDestroyOpiumAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持虎门销烟的林则徐整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateHumenDestroyOpiumAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[humen-destroy-opium-ai][route]", {
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
