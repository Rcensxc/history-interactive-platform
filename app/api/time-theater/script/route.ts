import { NextResponse } from "next/server";
import {
  generateTimeTheaterAiScriptPackage,
  type TimeTheaterAiScriptRequest,
} from "@/lib/time-theater-ai";

export async function POST(request: Request) {
  const routeStart = performance.now();
  let payload: TimeTheaterAiScriptRequest | null = null;

  try {
    payload = (await request.json()) as TimeTheaterAiScriptRequest;
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
    !Array.isArray(payload.characterIds) ||
    typeof payload.viewpointId !== "string" ||
    typeof payload.topicId !== "string" ||
    (payload.triggerSource !== undefined &&
      payload.triggerSource !== "initial" &&
      payload.triggerSource !== "reset")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前接口只支持跨时空剧场线性脚本生成请求。",
      },
      { status: 400 },
    );
  }

  const routeAfterPayloadMs = Number((performance.now() - routeStart).toFixed(1));
  const result = await generateTimeTheaterAiScriptPackage(payload);
  const routeBeforeResponseMs = Number((performance.now() - routeStart).toFixed(1));

  if (result.debug) {
    result.debug.timings = {
      ...result.debug.timings,
      routePayloadParsedMs: routeAfterPayloadMs,
      routeTotalMs: routeBeforeResponseMs,
    };
  }

  console.info("[time-theater-ai][route]", {
    requestId: result.debug?.requestId ?? payload.clientRequestId ?? "unknown",
    triggerSource: payload.triggerSource ?? "unknown",
    selectedCount: payload.characterIds.length,
    topicId: payload.topicId,
    viewpointId: payload.viewpointId,
    source: result.source,
    ok: result.ok,
    timings: result.debug?.timings,
    metrics: result.debug?.metrics,
  });

  return NextResponse.json(result);
}
