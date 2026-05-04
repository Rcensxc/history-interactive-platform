import { NextResponse } from "next/server";
import {
  BREAK_CAULDRONS_AI_EVENT_ID,
  generateBreakCauldronsAiStoryPackage,
  shouldUseBreakCauldronsAiMode,
  type BreakCauldronsAiStoryPackageRequest,
} from "@/lib/break-cauldrons-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: BreakCauldronsAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as BreakCauldronsAiStoryPackageRequest;
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
    payload.eventId !== BREAK_CAULDRONS_AI_EVENT_ID ||
    !shouldUseBreakCauldronsAiMode(payload.eventId, payload.viewpointId) ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持破釜沉舟的项羽整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateBreakCauldronsAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[break-cauldrons-ai][route]", {
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
