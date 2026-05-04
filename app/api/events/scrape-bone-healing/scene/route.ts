import { NextResponse } from "next/server";
import {
  generateScrapeBoneAiStoryPackage,
  SCRAPE_BONE_AI_EVENT_ID,
  shouldUseScrapeBoneAiMode,
  type ScrapeBoneAiStoryPackageRequest,
} from "@/lib/scrape-bone-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: ScrapeBoneAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as ScrapeBoneAiStoryPackageRequest;
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
    payload.eventId !== SCRAPE_BONE_AI_EVENT_ID ||
    !shouldUseScrapeBoneAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持刮骨疗毒的关羽整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateScrapeBoneAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[scrape-bone-ai][route]", {
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
