import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  EventViewpoint,
  PlaceholderAsset,
  RedCliffsAiScriptLine,
  RedCliffsAiScriptPackage,
} from "@/types/content";

export const RED_CLIFFS_AI_EVENT_ID = "battle-of-red-cliffs";
export const RED_CLIFFS_AI_VIEWPOINT_ID = "zhuge-liang";

const RED_CLIFFS_AI_DEFAULT_MODEL = "openai/gpt-4o-mini";
const RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION =
  "red-cliffs-linear-script-v1" as const;

type RedCliffsBeatId =
  | "river-watch"
  | "alliance-briefing"
  | "timing-pressure"
  | "huang-gai-commitment"
  | "launch"
  | "aftermath";

type RedCliffsBeatBlueprint = {
  beatId: RedCliffsBeatId;
  title: string;
  dramaticGoal: string;
  backgroundTag: keyof typeof redCliffsAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
  allowedSpeakers: string[];
};

type RedCliffsAiDebugInfo = {
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

export type RedCliffsAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type RedCliffsAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: RedCliffsAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: RedCliffsAiDebugInfo;
};

type RedCliffsScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const redCliffsAiBackdropMap = {
  "river-night": {
    label: "赤壁",
    tone: "ink",
    description: "背景占位：江面夜色未动，真正的紧张在风向和判断里慢慢堆高。",
  },
  "command-tent": {
    label: "联营",
    tone: "ink",
    description: "背景占位：军帐、烛火与沙盘同时压住气氛，任何一句话都带着分量。",
  },
  "strategy-table": {
    label: "谋局",
    tone: "amber",
    description: "背景占位：军图摊开，所有人都在算同一个时间点能不能同时成立。",
  },
  "departure-dock": {
    label: "江岸",
    tone: "crimson",
    description: "背景占位：登船前的江岸更安静，也更像真正动手前最后一次停顿。",
  },
  "embers-aftermath": {
    label: "火光",
    tone: "amber",
    description: "背景占位：火势已起，真正值得回看的却是火起之前那一连串判断。",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const redCliffsSpeakerVisualKeyMap = {
  周瑜: "zhouyu",
  诸葛亮: "zhuge-liang",
  黄盖: "huang-gai",
} as const;

const redCliffsBeatBlueprints: RedCliffsBeatBlueprint[] = [
  {
    beatId: "river-watch",
    title: "江面观察",
    dramaticGoal: "以诸葛亮第一视角建立夜色、风向和联盟气氛里的压迫感。",
    backgroundTag: "river-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: [],
  },
  {
    beatId: "alliance-briefing",
    title: "同席定调",
    dramaticGoal: "让周瑜和诸葛亮把联盟当前最核心的判断讲清楚。",
    backgroundTag: "command-tent",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: ["周瑜", "诸葛亮"],
  },
  {
    beatId: "timing-pressure",
    title: "时机压力",
    dramaticGoal: "把火攻前最危险的地方收束成时机、信任和执行压力。",
    backgroundTag: "strategy-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: ["周瑜", "诸葛亮"],
  },
  {
    beatId: "huang-gai-commitment",
    title: "黄盖请命",
    dramaticGoal: "让执行者真正把最危险的一步接过去。",
    backgroundTag: "departure-dock",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: ["黄盖", "周瑜"],
  },
  {
    beatId: "launch",
    title: "临发前夜",
    dramaticGoal: "用更克制的方式写出行动终于要压到同一刻的感觉。",
    backgroundTag: "departure-dock",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
    allowedSpeakers: ["诸葛亮"],
  },
  {
    beatId: "aftermath",
    title: "火后收束",
    dramaticGoal: "收束诸葛亮视角下的胜负感受，突出真正的胜负早在火起前决定。",
    backgroundTag: "embers-aftermath",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
    allowedSpeakers: ["诸葛亮"],
  },
];

function getRedCliffsPlayableBase(): EventPlayableContent {
  const playableContent = getEventPlayableContent(RED_CLIFFS_AI_EVENT_ID);
  if (!playableContent) {
    throw new Error("Missing red cliffs playable content.");
  }

  return playableContent;
}

function getRedCliffsAiViewpoint(): EventViewpoint {
  const viewpoint = getRedCliffsPlayableBase().viewpoints.find(
    (item) => item.id === RED_CLIFFS_AI_VIEWPOINT_ID,
  );

  if (!viewpoint) {
    throw new Error("Missing red cliffs AI viewpoint.");
  }

  return viewpoint;
}

function getFallbackPlayableContent() {
  return getRedCliffsPlayableBase();
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function createRedCliffsAiRequestId() {
  return `red-cliffs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getOpenAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = openRouterApiKey || openAiApiKey || "";
  const apiKeySource: RedCliffsAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      RED_CLIFFS_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createRedCliffsAiDebugInfo(
  config: ReturnType<typeof getOpenAiConfig>,
): RedCliffsAiDebugInfo {
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
  return redCliffsBeatBlueprints
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

function buildRedCliffsStoryPackagePrompt(
  params: RedCliffsAiStoryPackageRequest,
) {
  const viewpoint = getRedCliffsAiViewpoint();
  const eventItem = getHistoricalEvent(RED_CLIFFS_AI_EVENT_ID);

  if (!eventItem) {
    throw new Error("Missing red cliffs event.");
  }

  const systemPrompt = [
    "You generate one fixed-route script package for a Chinese historical AVG experience.",
    "Output only strict JSON that follows the provided schema.",
    "Write all text in Simplified Chinese.",
    "Do not output layout, UI, CSS, camera language, file paths, asset filenames, choices, nextSceneId, backgroundTag, standeeKey, or state updates.",
    "The event is 赤壁之战 and the fixed first-person viewpoint is 诸葛亮.",
    "This is a single linear route with no player branching.",
    "Keep the tone tense, restrained, natural, and readable for general users.",
    "Narration rules:",
    "- narration uses empty speaker.",
    "- narration is only Zhuge Liang's first-person observation, feeling, or judgment.",
    "- no quoted dialogue in narration.",
    "- each narration line should be short but complete, not a fragment.",
    "- a natural target is around 35 to 80 Chinese characters.",
    "Dialogue rules:",
    "- each line contains only one speaker talking.",
    "- no narration, no action description, no crowd reaction, no third-person summary.",
    "- dialogue should sound like one complete spoken sentence or two short linked sentences.",
    "- a natural target is around 18 to 45 Chinese characters.",
    "- if a speaker needs more words, split into multiple short lines.",
    "Characters allowed to speak are only 周瑜, 诸葛亮, 黄盖.",
    "Return all beats in the fixed order exactly once.",
  ].join("\n");

  const userPrompt = [
    `Event title: ${eventItem.title}`,
    `Event summary: ${eventItem.description}`,
    `Fixed viewpoint: ${viewpoint.name}`,
    `Viewpoint note: ${viewpoint.summary}`,
    `Required protocolVersion: ${RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION}`,
    `Required viewpointId: ${RED_CLIFFS_AI_VIEWPOINT_ID}`,
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

async function requestStructuredRedCliffsScriptPackage(params: {
  request: RedCliffsAiStoryPackageRequest;
  requestId: string;
}): Promise<{
  scriptPackage: RedCliffsAiScriptPackage;
  debug: RedCliffsAiDebugInfo;
}> {
  const config = getOpenAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createRedCliffsAiDebugInfo(config);

  if (!apiKey) {
    throw new Error(
      "Missing API key. Please set OPENROUTER_API_KEY or OPENAI_API_KEY and restart the dev server.",
    );
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildRedCliffsStoryPackagePrompt(params.request);
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = redCliffsBeatBlueprints.length;
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
          name: "red_cliffs_linear_script_package",
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
                enum: [RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: { type: "string" },
              beats: {
                type: "array",
                minItems: redCliffsBeatBlueprints.length,
                maxItems: redCliffsBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: redCliffsBeatBlueprints.map((beat) => beat.beatId),
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
    debug.timings.upstreamRequestMs = Number(
      (performance.now() - upstreamStart).toFixed(1),
    );
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
    scriptPackage: JSON.parse(outputText) as RedCliffsAiScriptPackage,
    debug,
  };
}

function normalizeRedCliffsScriptLine(
  line: RedCliffsAiScriptLine,
): RedCliffsAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: normalizeText(line.text),
  };
}

function normalizeRedCliffsScriptPackage(
  scriptPackage: RedCliffsAiScriptPackage,
): RedCliffsAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as RedCliffsBeatId,
      lines: beat.lines.map(normalizeRedCliffsScriptLine),
    })),
  };
}

function validateRedCliffsScriptPackage(
  scriptPackage: RedCliffsAiScriptPackage,
): RedCliffsScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;
  const dialogueNarrationPattern =
    /(你看见|你听见|你察觉|众人|周围|四下|江面|军帐里|有人|身后|此刻|这一瞬)/;

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(`protocolVersion 必须是 ${RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.viewpointId !== RED_CLIFFS_AI_VIEWPOINT_ID) {
    errors.push(`viewpointId 必须是 ${RED_CLIFFS_AI_VIEWPOINT_ID}。`);
  }
  if (scriptPackage.beats.length !== redCliffsBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${redCliffsBeatBlueprints.length}。`);
  }

  redCliffsBeatBlueprints.forEach((blueprint, index) => {
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
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点局势感或判断感。`,
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
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 混入了旁白或环境叙述。`);
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 10 || totalLines > 16) {
    warnings.push("总 line 数量偏离推荐范围 10-16。");
  }

  const hasZhugeDialogue = scriptPackage.beats.some((beat) =>
    beat.lines.some((line) => line.speaker === "诸葛亮"),
  );
  if (!hasZhugeDialogue) {
    warnings.push("当前脚本里诸葛亮还没有明确发言，建议至少保留一到两条清晰判断。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatRedCliffsScriptValidation(
  result: RedCliffsScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return {
      mode: "hidden",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    redCliffsSpeakerVisualKeyMap[speaker as keyof typeof redCliffsSpeakerVisualKeyMap];

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

function adaptRedCliffsScriptPackageToPlayableContent(
  scriptPackage: RedCliffsAiScriptPackage,
): EventPlayableContent {
  const base = getRedCliffsPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = redCliffsBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId:
          redCliffsSpeakerVisualKeyMap[
            line.speaker as keyof typeof redCliffsSpeakerVisualKeyMap
          ] ?? (line.speaker ? undefined : "narration"),
        text: line.text,
        background: redCliffsAiBackdropMap[blueprint.backgroundTag],
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
    eventId: RED_CLIFFS_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

export function shouldUseRedCliffsAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId = viewpointId?.trim() || RED_CLIFFS_AI_VIEWPOINT_ID;
  return eventId === RED_CLIFFS_AI_EVENT_ID && normalizedViewpointId === RED_CLIFFS_AI_VIEWPOINT_ID;
}

export function getRedCliffsAiInitialViewpointId() {
  return RED_CLIFFS_AI_VIEWPOINT_ID;
}

export async function generateRedCliffsAiStoryPackage(
  params: RedCliffsAiStoryPackageRequest,
): Promise<RedCliffsAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent();

  if (
    params.eventId !== RED_CLIFFS_AI_EVENT_ID ||
    params.viewpointId !== RED_CLIFFS_AI_VIEWPOINT_ID
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持赤壁之战诸葛亮视角的 AI 线性脚本生成。",
    };
  }

  try {
    const requestId = params.clientRequestId?.trim() || createRedCliffsAiRequestId();
    const { scriptPackage, debug } = await requestStructuredRedCliffsScriptPackage({
      request: params,
      requestId,
    });

    const normalizedPackage = normalizeRedCliffsScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateRedCliffsScriptPackage(normalizedPackage);
    debug.timings.validationMs = Number((performance.now() - validationStart).toFixed(1));

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 线性脚本结构不合法，已切回本地静态剧情。",
        error: formatRedCliffsScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptRedCliffsScriptPackageToPlayableContent(normalizedPackage);
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
    const debug = createRedCliffsAiDebugInfo(getOpenAiConfig());
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);
    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[red-cliffs-ai] linear script package request failed", {
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
