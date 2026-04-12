import { NextResponse } from "next/server";
import {
  generateHongmenAiStoryPackage,
  HONGMEN_AI_EVENT_ID,
  HONGMEN_AI_VIEWPOINT_ID,
  type HongmenAiStoryPackageRequest,
} from "@/lib/hongmen-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: HongmenAiStoryPackageRequest | null = null;

  try {
    payload = (await request.json()) as HongmenAiStoryPackageRequest;
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
    payload.eventId !== HONGMEN_AI_EVENT_ID ||
    payload.viewpointId !== HONGMEN_AI_VIEWPOINT_ID ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持鸿门宴刘邦视角的整包剧情生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateHongmenAiStoryPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[hongmen-ai][route]", {
    requestId: result.debug?.requestId ?? payload.clientRequestId ?? "unknown",
    packageMode: "full-story-package",
    triggerSource: payload.triggerSource ?? "unknown",
    timings: result.debug?.timings,
    metrics: result.debug?.metrics,
    source: result.source,
    ok: result.ok,
  });

  return NextResponse.json(result);
}
