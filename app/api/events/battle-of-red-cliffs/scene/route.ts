import { NextResponse } from "next/server";
import {
  generateRedCliffsAiStoryPackage,
  RED_CLIFFS_AI_EVENT_ID,
  shouldUseRedCliffsAiMode,
  type RedCliffsAiStoryPackageRequest,
} from "@/lib/red-cliffs-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: RedCliffsAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as RedCliffsAiStoryPackageRequest;
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
    payload.eventId !== RED_CLIFFS_AI_EVENT_ID ||
    !shouldUseRedCliffsAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "当前接口只支持赤壁之战的诸葛亮、周瑜、黄盖三条整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateRedCliffsAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[red-cliffs-ai][route]", {
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
