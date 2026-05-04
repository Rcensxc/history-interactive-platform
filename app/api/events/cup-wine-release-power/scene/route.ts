import { NextResponse } from "next/server";
import {
  CUP_WINE_AI_EVENT_ID,
  generateCupWineAiStoryPackage,
  shouldUseCupWineAiMode,
  type CupWineAiStoryPackageRequest,
} from "@/lib/cup-wine-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: CupWineAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as CupWineAiStoryPackageRequest;
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
    payload.eventId !== CUP_WINE_AI_EVENT_ID ||
    !shouldUseCupWineAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持杯酒释兵权的整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateCupWineAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[cup-wine-ai][route]", {
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
