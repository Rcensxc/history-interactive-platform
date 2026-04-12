import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  EventViewpoint,
  HongmenAiScriptLine,
  HongmenAiScriptPackage,
  PlaceholderAsset,
} from "@/types/content";

export const HONGMEN_AI_EVENT_ID = "hongmen-banquet";
export const HONGMEN_AI_VIEWPOINT_ID = "liubang";

const HONGMEN_AI_DEFAULT_MODEL = "openai/gpt-4o-mini";
const HONGMEN_AI_SCRIPT_PROTOCOL_VERSION = "hongmen-linear-script-v1" as const;

type HongmenBeatId =
  | "arrival"
  | "banquet-probe"
  | "pressure-rise"
  | "fan-kuai-entry"
  | "exit"
  | "ending";

type HongmenBeatBlueprint = {
  beatId: HongmenBeatId;
  title: string;
  dramaticGoal: string;
  backgroundTag: keyof typeof hongmenAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
  allowedSpeakers: string[];
};

type HongmenAiDebugInfo = {
  requestId: string;
  upstreamUrl: string;
  model: string;
  hasApiKey: boolean;
  apiKeySource: "OPENROUTER_API_KEY" | "OPENAI_API_KEY" | "missing";
  refererHeader: string;
  titleHeader: string;
  requestShape: {
    inputMode: "responses-message-array";
    schemaMode: "text.format.json_schema";
  };
  timings: {
    promptBuildMs?: number;
    upstreamRequestMs?: number;
    extractOutputMs?: number;
    validationMs?: number;
    adaptMs?: number;
    serviceTotalMs?: number;
    routePayloadParsedMs?: number;
    routeTotalMs?: number;
  };
  metrics: {
    historyCount: number;
    historySummaryLength: number;
    systemPromptLength: number;
    userPromptLength: number;
    upstreamOutputLength: number;
    retryCount: number;
    upstreamCallCount: number;
    packageRequestCount?: number;
    packageBeatCount?: number;
    packageLineCount?: number;
    triggerSource?: string;
  };
  upstreamStatus?: number;
  upstreamStatusText?: string;
  upstreamBody?: string;
};

export type HongmenAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type HongmenAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: HongmenAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: HongmenAiDebugInfo;
};

type HongmenScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const hongmenAiBackdropMap = {
  "camp-night": {
    label: "鸿门",
    tone: "crimson",
    description: "背景占位：夜色压在营地上，火光映在酒器与兵刃之间。",
  },
  "banquet-seat": {
    label: "宴席",
    tone: "crimson",
    description: "背景占位：主席前方灯火偏暗，礼数和试探同时压在席面上。",
  },
  "tent-entrance": {
    label: "帐门",
    tone: "bronze",
    description: "背景占位：帐门被掀开，席间气氛被更强硬的动作突然打断。",
  },
  "exit-shadow": {
    label: "退路",
    tone: "ink",
    description: "背景占位：营帐边缘与火光背后的阴影，退场与脱身都藏在缝隙里。",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const hongmenSpeakerVisualKeyMap = {
  项羽: "xiangyu",
  项伯: "xiangbo",
  樊哙: "fan-kuai",
} as const;

const hongmenBeatBlueprints: HongmenBeatBlueprint[] = [
  {
    beatId: "arrival",
    title: "入场与警觉",
    dramaticGoal: "以刘邦第一视角建立赴宴时的不安和警觉。",
    backgroundTag: "camp-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: [],
  },
  {
    beatId: "banquet-probe",
    title: "席间试探",
    dramaticGoal: "席间礼数仍在，但试探已经开始压上来。",
    backgroundTag: "banquet-seat",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["项羽", "项伯"],
  },
  {
    beatId: "pressure-rise",
    title: "压力升高",
    dramaticGoal: "把宴席里的危险再往前推一层，让刘邦更明显感到受困。",
    backgroundTag: "banquet-seat",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: ["项羽", "项伯"],
  },
  {
    beatId: "fan-kuai-entry",
    title: "樊哙闯入",
    dramaticGoal: "让樊哙闯入后的张力迅速改变席间空气。",
    backgroundTag: "tent-entrance",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["樊哙", "项羽"],
  },
  {
    beatId: "exit",
    title: "脱身离席",
    dramaticGoal: "让脱身动作带着紧张感，但保持节制和可读性。",
    backgroundTag: "exit-shadow",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: ["项伯"],
  },
  {
    beatId: "ending",
    title: "结尾收束",
    dramaticGoal: "用克制的方式收束这一轮鸿门宴体验，突出惊险余味。",
    backgroundTag: "exit-shadow",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
    allowedSpeakers: [],
  },
];

function getHongmenPlayableBase(): EventPlayableContent {
  const playableContent = getEventPlayableContent(HONGMEN_AI_EVENT_ID);
  if (!playableContent) {
    throw new Error("Missing hongmen playable content.");
  }

  return playableContent;
}

function getHongmenAiViewpoint(): EventViewpoint {
  const viewpoint = getHongmenPlayableBase().viewpoints.find(
    (item) => item.id === HONGMEN_AI_VIEWPOINT_ID,
  );

  if (!viewpoint) {
    throw new Error("Missing hongmen AI viewpoint.");
  }

  return viewpoint;
}

function getFallbackPlayableContent() {
  return getHongmenPlayableBase();
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function createHongmenAiRequestId() {
  return `hongmen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getOpenAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = openRouterApiKey || openAiApiKey || "";
  const apiKeySource: HongmenAiDebugInfo["apiKeySource"] = openRouterApiKey
    ? "OPENROUTER_API_KEY"
    : openAiApiKey
      ? "OPENAI_API_KEY"
      : "missing";

  return {
    apiKey,
    apiKeySource,
    model:
      process.env.OPENROUTER_MODEL?.trim() ||
      process.env.OPENAI_MODEL?.trim() ||
      HONGMEN_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createHongmenAiDebugInfo(
  config: ReturnType<typeof getOpenAiConfig>,
): HongmenAiDebugInfo {
  return {
    requestId: "",
    upstreamUrl: config.upstreamUrl,
    model: config.model,
    hasApiKey: Boolean(config.apiKey),
    apiKeySource: config.apiKeySource,
    refererHeader: config.refererHeader,
    titleHeader: config.titleHeader,
    requestShape: {
      inputMode: "responses-message-array",
      schemaMode: "text.format.json_schema",
    },
    timings: {},
    metrics: {
      historyCount: 0,
      historySummaryLength: 0,
      systemPromptLength: 0,
      userPromptLength: 0,
      upstreamOutputLength: 0,
      retryCount: 0,
      upstreamCallCount: 0,
    },
  };
}

async function readResponseBody(response: Response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function extractResponseText(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "output" in payload &&
    Array.isArray(payload.output)
  ) {
    const textParts: string[] = [];

    for (const item of payload.output) {
      if (
        item &&
        typeof item === "object" &&
        "content" in item &&
        Array.isArray(item.content)
      ) {
        for (const content of item.content) {
          if (
            content &&
            typeof content === "object" &&
            "text" in content &&
            typeof content.text === "string"
          ) {
            textParts.push(content.text);
          }
        }
      }
    }

    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  return "";
}

function serializeBeatBlueprints() {
  return hongmenBeatBlueprints
    .map((beat) => {
      const speakerRule =
        beat.allowedSpeakers.length > 0
          ? beat.allowedSpeakers.join(" / ")
          : "(only narration with empty speaker)";

      return [
        `- beatId=${beat.beatId}`,
        `title=${beat.title}`,
        `goal=${beat.dramaticGoal}`,
        `lineRange=${beat.minLines}-${beat.maxLines}`,
        `allowNarration=${beat.allowNarration ? "true" : "false"}`,
        `allowedSpeakers=${speakerRule}`,
        `backgroundHandledLocally=${beat.backgroundTag}`,
      ].join(" | ");
    })
    .join("\n");
}

function buildHongmenStoryPackagePrompt(
  params: HongmenAiStoryPackageRequest,
) {
  const viewpoint = getHongmenAiViewpoint();
  const eventItem = getHistoricalEvent(HONGMEN_AI_EVENT_ID);

  if (!eventItem) {
    throw new Error("Missing hongmen event.");
  }

  const systemPrompt = [
    "You generate one fixed-route script package for a Chinese historical AVG experience.",
    "Output only strict JSON that follows the provided schema.",
    "Write all text in Simplified Chinese.",
    "Do not output layout, UI, CSS, camera language, file paths, asset filenames, choices, nextSceneId, backgroundTag, standeeKey, or state updates.",
    "The event is 鸿门宴 and the fixed first-person viewpoint is 刘邦.",
    "This is a single linear route with no player branching.",
    "Keep the tone tense, restrained, natural, and readable for general users.",
    "Narration rules:",
    "- narration uses empty speaker.",
    "- narration is only Liu Bang's first-person feeling or observation.",
    "- no quoted dialogue in narration.",
    "- each narration line should be short but complete, not a fragment or abstract hint.",
    "- narration should usually contain some environment sense, situation pressure, or inner feeling.",
    "- a natural target is around 35 to 80 Chinese characters, usually one or two sentences or two to three short lines.",
    "Dialogue rules:",
    "- each line contains only one speaker talking.",
    "- no narration, no action description, no crowd reaction, no third-person summary.",
    "- each dialogue line should be short but feel like one complete spoken sentence, not a label or outline.",
    "- a natural target is around 18 to 45 Chinese characters.",
    "- if a speaker needs more words, split into multiple short but complete lines.",
    "Return all beats in the fixed order exactly once.",
  ].join("\n");

  const userPrompt = [
    `Event title: ${eventItem.title}`,
    `Event summary: ${eventItem.description}`,
    `Fixed viewpoint: ${viewpoint.name}`,
    `Viewpoint note: ${viewpoint.summary}`,
    `Required protocolVersion: ${HONGMEN_AI_SCRIPT_PROTOCOL_VERSION}`,
    `Required viewpointId: ${HONGMEN_AI_VIEWPOINT_ID}`,
    `Required beat plan:\n${serializeBeatBlueprints()}`,
    `Client trigger source: ${params.triggerSource ?? "initial"}`,
    "The program controls background switches, standee choice, scene progression, and ending locally.",
    "Do not omit any beat.",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredHongmenScriptPackage(params: {
  request: HongmenAiStoryPackageRequest;
  requestId: string;
}): Promise<{
  scriptPackage: HongmenAiScriptPackage;
  debug: HongmenAiDebugInfo;
}> {
  const config = getOpenAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createHongmenAiDebugInfo(config);

  if (!apiKey) {
    throw new Error(
      "Missing API key. Please set OPENROUTER_API_KEY or OPENAI_API_KEY and restart the dev server.",
    );
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildHongmenStoryPackagePrompt(params.request);
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = hongmenBeatBlueprints.length;
  debug.metrics.triggerSource = params.request.triggerSource;
  debug.timings.promptBuildMs = Number((performance.now() - promptStart).toFixed(1));

  const upstreamStart = performance.now();
  const response = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": refererHeader,
      "X-OpenRouter-Title": titleHeader,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          type: "message",
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "hongmen_linear_script_package",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "packageId",
              "storyId",
              "protocolVersion",
              "viewpointId",
              "beats",
            ],
            properties: {
              packageId: { type: "string" },
              storyId: { type: "string" },
              protocolVersion: {
                type: "string",
                enum: [HONGMEN_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: { type: "string" },
              beats: {
                type: "array",
                minItems: hongmenBeatBlueprints.length,
                maxItems: hongmenBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: hongmenBeatBlueprints.map((beat) => beat.beatId),
                    },
                    lines: {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["speaker", "text"],
                        properties: {
                          speaker: { type: "string" },
                          text: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const upstreamBody = await readResponseBody(response);
    debug.timings.upstreamRequestMs = Number((performance.now() - upstreamStart).toFixed(1));
    debug.upstreamStatus = response.status;
    debug.upstreamStatusText = response.statusText;
    debug.upstreamBody = upstreamBody;

    throw new Error(
      `Upstream request failed with status ${response.status} ${response.statusText}. Body: ${upstreamBody || "(empty body)"}`,
    );
  }

  debug.timings.upstreamRequestMs = Number((performance.now() - upstreamStart).toFixed(1));
  const extractStart = performance.now();
  const payload = (await response.json()) as unknown;
  const outputText = extractResponseText(payload);
  if (!outputText) {
    throw new Error("OpenAI returned empty structured output.");
  }
  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number((performance.now() - extractStart).toFixed(1));

  return {
    scriptPackage: JSON.parse(outputText) as HongmenAiScriptPackage,
    debug,
  };
}

function normalizeHongmenScriptLine(line: HongmenAiScriptLine): HongmenAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: normalizeText(line.text),
  };
}

function normalizeHongmenScriptPackage(
  scriptPackage: HongmenAiScriptPackage,
): HongmenAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim(),
      lines: beat.lines.map(normalizeHongmenScriptLine),
    })),
  };
}

function validateHongmenScriptPackage(
  scriptPackage: HongmenAiScriptPackage,
): HongmenScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;
  const dialogueNarrationPattern =
    /(你看见|你听见|你察觉|席间|众人|周围|四下|空气里|火光|营帐里|有人|身后|此刻|这一瞬)/;

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== HONGMEN_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(`protocolVersion 必须是 ${HONGMEN_AI_SCRIPT_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.viewpointId !== HONGMEN_AI_VIEWPOINT_ID) {
    errors.push(`viewpointId 必须是 ${HONGMEN_AI_VIEWPOINT_ID}。`);
  }
  if (scriptPackage.beats.length !== hongmenBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${hongmenBeatBlueprints.length}。`);
  }

  hongmenBeatBlueprints.forEach((blueprint, index) => {
    const beat = scriptPackage.beats[index];
    if (!beat) {
      errors.push(`缺少关键 beat：${blueprint.beatId}`);
      return;
    }

    if (beat.beatId !== blueprint.beatId) {
      errors.push(`第 ${index + 1} 个 beat 必须是 ${blueprint.beatId}。`);
    }

    if (beat.lines.length < blueprint.minLines || beat.lines.length > blueprint.maxLines) {
      errors.push(
        `${blueprint.beatId} 的 line 数量必须在 ${blueprint.minLines}-${blueprint.maxLines} 之间。`,
      );
    }

    beat.lines.forEach((line, lineIndex) => {
      if (!line.text) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 text 不能为空。`);
      }

      if (line.speaker === "刘邦") {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 line 不要把刘邦写成显式 speaker。`);
      }

      if (!line.speaker) {
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (quotePattern.test(line.text)) {
          errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白不能出现引号对白。`);
        }
        if (line.text.length > 90 || line.text.split("\n").length > 3) {
          errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白需要更短。`);
        }
        if (line.text.length < 24) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点环境感、局势感或心理感。`,
          );
        }
        return;
      }

      if (!blueprint.allowedSpeakers.includes(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 只能是 ${blueprint.allowedSpeakers.join(" / ") || "空字符串"}。`,
        );
      }
      if (line.text.includes("\n")) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 不能换行。`);
      }
      if (line.text.length > 56) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 太长。`);
      }
      if (line.text.length < 12) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏短，建议写成更完整的一句人话。`,
        );
      }
      if (quotePattern.test(line.text)) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 不要嵌套引号。`);
      }
      if (dialogueNarrationPattern.test(line.text)) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 混入了旁白或群体信息。`);
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 10 || totalLines > 18) {
    warnings.push("总 line 数量偏离推荐范围 10-18。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatHongmenScriptValidation(
  result: HongmenScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker || speaker === "刘邦") {
    return {
      mode: "hidden",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    hongmenSpeakerVisualKeyMap[speaker as keyof typeof hongmenSpeakerVisualKeyMap];

  if (!visualKey) {
    return {
      mode: "hidden",
    };
  }

  return {
    mode: "speaker",
    visualKey,
    hideForViewpoint: true,
  };
}

function adaptHongmenScriptPackageToPlayableContent(
  scriptPackage: HongmenAiScriptPackage,
): EventPlayableContent {
  const base = getHongmenPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = hongmenBeatBlueprints[beatIndex];
    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        text: line.text,
        background: hongmenAiBackdropMap[blueprint.backgroundTag],
        standee: createSceneStandee(line.speaker),
      } satisfies EventScene;
    });
  });

  const scenes = flattened.map((scene, index) => ({
    ...scene,
    nextSceneId: flattened[index + 1]?.sceneId,
  }));

  return {
    protocolVersion: "event-story-v1",
    contentSource: "ai-structured",
    eventId: HONGMEN_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

export function shouldUseHongmenAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId = viewpointId?.trim() || HONGMEN_AI_VIEWPOINT_ID;
  return eventId === HONGMEN_AI_EVENT_ID && normalizedViewpointId === HONGMEN_AI_VIEWPOINT_ID;
}

export function getHongmenAiInitialViewpointId() {
  return HONGMEN_AI_VIEWPOINT_ID;
}

export async function generateHongmenAiStoryPackage(
  params: HongmenAiStoryPackageRequest,
): Promise<HongmenAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent();

  if (
    params.eventId !== HONGMEN_AI_EVENT_ID ||
    params.viewpointId !== HONGMEN_AI_VIEWPOINT_ID
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持鸿门宴刘邦视角的 AI 线性脚本生成。",
    };
  }

  try {
    const requestId = params.clientRequestId?.trim() || createHongmenAiRequestId();
    const { scriptPackage, debug } = await requestStructuredHongmenScriptPackage({
      request: params,
      requestId,
    });

    const normalizedPackage = normalizeHongmenScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateHongmenScriptPackage(normalizedPackage);
    debug.timings.validationMs = Number((performance.now() - validationStart).toFixed(1));

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 线性脚本结构不合法，已切回本地静态剧情。",
        error: formatHongmenScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptHongmenScriptPackageToPlayableContent(normalizedPackage);
    debug.metrics.packageLineCount = normalizedPackage.beats.reduce(
      (sum, beat) => sum + beat.lines.length,
      0,
    );
    debug.timings.adaptMs = Number((performance.now() - adaptStart).toFixed(1));
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    return {
      ok: true,
      source: "ai",
      scriptPackage: normalizedPackage,
      playableContent: adaptedPlayableContent,
      debug,
    };
  } catch (error) {
    const debug = createHongmenAiDebugInfo(getOpenAiConfig());
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);
    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[hongmen-ai] linear script package request failed", {
      ...debug,
      error: errorMessage,
    });

    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      warning: "AI 线性脚本生成失败，已切回本地静态剧情。",
      error: errorMessage,
      debug,
    };
  }
}
