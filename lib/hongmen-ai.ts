import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import { validateEventPlayableContent } from "@/lib/story-protocol-validation";
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

const HONGMEN_AI_DEFAULT_MODEL = "Qwen3Flash";
const HONGMEN_AI_SCRIPT_PROTOCOL_VERSION = "hongmen-linear-script-v1" as const;

type HongmenBeatId =
  | "cao-informs"
  | "xiangbo-night-visit"
  | "zhangliang-reports"
  | "liubang-apology"
  | "xiangyu-softens"
  | "fanzeng-signals"
  | "xiangzhuang-dances"
  | "xiangbo-shields"
  | "zhangliang-summons"
  | "fankuai-remonstrates"
  | "liubang-exits"
  | "aftermath";

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
  apiKeySource: "OPENROUTER_API_KEY" | "API_KEY" | "missing";
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
  validation?: {
    errors: string[];
    warnings: string[];
  };
};//定义了鸿门AI故事包请求的调试信息结构

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
//定义了鸿门AI故事包中使用的背景占位资源
const hongmenSpeakerVisualKeyMap = {
  项羽: "xiangyu",
  项伯: "xiangbo",
  樊哙: "fan-kuai",
} as const;

const hongmenBeatBlueprints: HongmenBeatBlueprint[] = [
  {
    beatId: "cao-informs",
    title: "曹无伤告密",
    dramaticGoal: "从杀机先起写起，让刘邦意识到局势已经不是普通会面。",
    backgroundTag: "camp-night",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: [],
  },
  {
    beatId: "xiangbo-night-visit",
    title: "项伯夜访张良",
    dramaticGoal: "写出夜访时的急迫感，让危险第一次真正逼近刘邦身边。",
    backgroundTag: "camp-night",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["项伯", "张良"],
  },
  {
    beatId: "zhangliang-reports",
    title: "张良报信",
    dramaticGoal: "让刘邦得知消息、权衡去留，并在惊疑中决定赴宴。",
    backgroundTag: "camp-night",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["张良"],
  },
  {
    beatId: "liubang-apology",
    title: "刘邦入席谢罪",
    dramaticGoal: "写出刘邦入席后的低姿态与试探，让宴席正式开始。",
    backgroundTag: "banquet-seat",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["项羽"],
  },
  {
    beatId: "xiangyu-softens",
    title: "项羽受话 项伯缓场",
    dramaticGoal: "让项羽态度一度转缓，席面上出现暂时的松动和虚假平静。",
    backgroundTag: "banquet-seat",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["项羽", "项伯"],
  },
  {
    beatId: "fanzeng-signals",
    title: "范增数目项王",
    dramaticGoal: "把席间暗流真正推到台前，写出范增催杀而项羽迟疑的压迫感。",
    backgroundTag: "banquet-seat",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["范增", "项羽"],
  },
  {
    beatId: "xiangzhuang-dances",
    title: "项庄舞剑",
    dramaticGoal: "让杀机从目光变成动作，宴席上的危险开始公开逼近。",
    backgroundTag: "banquet-seat",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["项庄", "项羽"],
  },
  {
    beatId: "xiangbo-shields",
    title: "项伯翼蔽沛公",
    dramaticGoal: "写出项伯以身体护住刘邦，让席上危险在瞬间变得具象。",
    backgroundTag: "banquet-seat",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: [],
  },
  {
    beatId: "zhangliang-summons",
    title: "张良召樊哙",
    dramaticGoal: "让宴外的应对动作接上来，为局势反转做准备。",
    backgroundTag: "tent-entrance",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: ["张良", "樊哙"],
  },
  {
    beatId: "fankuai-remonstrates",
    title: "樊哙闯帐陈词",
    dramaticGoal: "让樊哙闯入后的刚烈气势压住席面，替刘邦争出一线转圜。",
    backgroundTag: "tent-entrance",
    minLines: 3,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["樊哙", "项羽"],
  },
  {
    beatId: "liubang-exits",
    title: "刘邦借故离席",
    dramaticGoal: "写出刘邦借机离席、疾行脱身，张良被迫留下善后。",
    backgroundTag: "exit-shadow",
    minLines: 2,
    maxLines: 4,
    allowNarration: true,
    allowedSpeakers: ["项伯", "张良"],
  },
  {
    beatId: "aftermath",
    title: "席后余震收束",
    dramaticGoal: "收束脱身后的余震，留下鸿门宴未尽的寒意与后患。",
    backgroundTag: "exit-shadow",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
    allowedSpeakers: [],
  },
];
//定义了鸿门宴故事的节拍蓝图，包括每个节拍的标题、戏剧目标、背景占位、台词数量范围、是否允许旁白以及允许出现的角色。
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
}//规范化文本，去除多余的空格和换行

function createHongmenAiRequestId() {
  return `hongmen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const AiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || AiApiKey || "";
  const apiKeySource: HongmenAiDebugInfo["apiKeySource"] = openRouterApiKey
    ? "OPENROUTER_API_KEY"
    : AiApiKey
      ? "API_KEY"
      : "missing";

  return {
    apiKey,
    apiKeySource,
    model:
      process.env.OPENROUTER_MODEL?.trim() ||
      process.env.AI_MODEL?.trim() ||
      HONGMEN_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}//获取AI配置，包括API密钥、模型名称、上游URL和请求头信息

function createHongmenAiDebugInfo(
  config: ReturnType<typeof getAiConfig>,
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
}//创建一个初始的调试信息对象

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
}//从上游响应的原始负载中提取文本内容

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
}//将节拍蓝图序列化为Markdown格式

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
    "The whole package should feel like completing one full dramatic experience of 鸿门宴, not a synopsis, outline, recap, or bullet summary.",
    "Follow the provided beat order closely so the story advances in the same broad narrative order as the source episode.",
    "Keep the first-person experience rooted in Liu Bang's immediate sight, judgment, pressure, and choices.",
    "Different speakers should sound distinct: Xiang Yu should feel heavy and dominant, Xiang Bo should feel urgent or smoothing, Fan Kuai should feel blunt and forceful.",
    "Avoid formulaic sentence openings, repeated phrasing, and interchangeable lines that could belong to any scene.",
    "Narration rules:",
    "- narration uses empty speaker.",
    "- narration is only Liu Bang's first-person feeling or observation.",
    "- no quoted dialogue in narration.",
    "- each narration line should be short but complete, not a fragment or abstract hint.",
    "- narration should usually contain some environment sense, situation pressure, or inner feeling.",
    "- a natural target is around 28 to 90 Chinese characters, usually one or two sentences or two to three short lines.",
    "Dialogue rules:",
    "- each line contains only one speaker talking.",
    "- no narration, no action description, no crowd reaction, no third-person summary.",
    "- each dialogue line should be short but feel like one complete spoken sentence, not a label or outline.",
    "- a natural target is around 14 to 52 Chinese characters.",
    "- if a speaker needs more words, split into multiple short but complete lines.",
    "Scale rules:",
    `- total line count should usually land around 28 to 40 for the whole package.`,
    "- most beats should contain 2 to 4 lines, and key pressure beats can use the upper end of the range.",
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
}//构建发送给AI的系统提示和用户提示词

async function requestStructuredHongmenScriptPackage(params: {
  request: HongmenAiStoryPackageRequest;
  requestId: string;
}): Promise<{
  scriptPackage: HongmenAiScriptPackage;
  debug: HongmenAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createHongmenAiDebugInfo(config);

  if (!apiKey) {
    throw new Error(
      "APIkey丢失，设置API_KEY并重启开发服务器。",
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
//向上游AI服务发送请求
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
    throw new Error("AI返回的是空结构化结果.");
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
    speaker: typeof line?.speaker === "string" ? line.speaker.trim() : "",
    text: normalizeText(typeof line?.text === "string" ? line.text : ""),
  };
}

function normalizeHongmenScriptPackage(
  scriptPackage: HongmenAiScriptPackage,
): HongmenAiScriptPackage {
  return {
    packageId:
      typeof scriptPackage.packageId === "string" ? scriptPackage.packageId.trim() : "",
    storyId: typeof scriptPackage.storyId === "string" ? scriptPackage.storyId.trim() : "",
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId:
      typeof scriptPackage.viewpointId === "string" ? scriptPackage.viewpointId.trim() : "",
    beats: Array.isArray(scriptPackage.beats)
      ? scriptPackage.beats.map((beat) => ({
          beatId: typeof beat?.beatId === "string" ? beat.beatId.trim() : "",
          lines: Array.isArray(beat?.lines) ? beat.lines.map(normalizeHongmenScriptLine) : [],
        }))
      : [],
  };
}

function createGeneratedFallbackId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function ensureNonEmptyIdentifier(value: string, fallback: string) {
  return value || fallback;
}

function ensureHongmenScriptPackageMetadata(
  scriptPackage: HongmenAiScriptPackage,
): HongmenAiScriptPackage {
  return {
    ...scriptPackage,
    packageId: ensureNonEmptyIdentifier(scriptPackage.packageId, createHongmenAiRequestId()),
    storyId: ensureNonEmptyIdentifier(scriptPackage.storyId, HONGMEN_AI_EVENT_ID),
    viewpointId: ensureNonEmptyIdentifier(scriptPackage.viewpointId, HONGMEN_AI_VIEWPOINT_ID),
    beats: scriptPackage.beats.map((beat, index) => ({
      beatId: ensureNonEmptyIdentifier(
        beat.beatId,
        hongmenBeatBlueprints[index]?.beatId ?? createGeneratedFallbackId("beat", index),
      ),
      lines: beat.lines,
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
  const repetitivePattern = /(我知道|我只能|我不敢|我看着).*\1/;

  if (!scriptPackage.packageId) {
    warnings.push("packageId 为空，已按兜底值继续处理。");
  }
  if (!scriptPackage.storyId) {
    warnings.push("storyId 为空，已按事件兜底值继续处理。");
  }
  if (scriptPackage.protocolVersion !== HONGMEN_AI_SCRIPT_PROTOCOL_VERSION) {
    warnings.push(`protocolVersion 不是 ${HONGMEN_AI_SCRIPT_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.viewpointId !== HONGMEN_AI_VIEWPOINT_ID) {
    warnings.push(`viewpointId 不是 ${HONGMEN_AI_VIEWPOINT_ID}。`);
  }
  if (!Array.isArray(scriptPackage.beats) || scriptPackage.beats.length === 0) {
    errors.push("beats 不能为空。");
  } else if (scriptPackage.beats.length !== hongmenBeatBlueprints.length) {
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
      warnings.push(
        `${blueprint.beatId} 的 line 数量必须在 ${blueprint.minLines}-${blueprint.maxLines} 之间。`,
      );
    }

    beat.lines.forEach((line, lineIndex) => {
      if (!line.text) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 text 不能为空。`);
      }

      if (line.speaker === "刘邦") {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 把刘邦写成了显式 speaker，当前仍会保留输出。`,
        );
      }

      if (!line.speaker) {
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (quotePattern.test(line.text)) {
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白出现了引号对白。`);
        }
        if (line.text.length > 110 || line.text.split("\n").length > 4) {
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长。`);
        }
        if (line.text.length < 20) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点环境感、局势感或心理感。`,
          );
        }
        if (repetitivePattern.test(line.text)) {
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白有重复句式。`);
        }
        return;
      }

      if (!blueprint.allowedSpeakers.includes(line.speaker)) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 只能是 ${blueprint.allowedSpeakers.join(" / ") || "空字符串"}。`,
        );
      }
      if (line.text.includes("\n")) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 出现了换行。`);
      }
      if (line.text.length > 72) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏长。`);
      }
      if (line.text.length < 10) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏短，建议写成更完整的一句人话。`,
        );
      }
      if (quotePattern.test(line.text)) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 出现了嵌套引号。`);
      }
      if (dialogueNarrationPattern.test(line.text)) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 混入了旁白或群体信息。`,
        );
      }
      if (repetitivePattern.test(line.text)) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 有重复句式。`);
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines === 0) {
    errors.push("所有 beat 都没有可播放的 line。");
  }
  if (totalLines < 28 || totalLines > 40) {
    warnings.push("总 line 数量偏离推荐范围 28-40。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}//验证AI生成的剧本包是否符合预期的结构和内容要求，返回错误和警告信息

function formatHongmenFatalValidation(errors: string[]) {
  return errors.join(" ");
}

function formatHongmenPlayabilityErrors(errors: string[]) {
  return errors.join(" ");
}

function formatHongmenWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }

  return `调试信息：AI输出存在 ${warnings.length} 条 warning`;
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
}//根据说话人创建场景立绘，刘邦视角不显示任何立绘，其他角色如果没有预设的视觉资源则隐藏立绘

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
  });//将每个 beat 的 line 转换为场景

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

    const normalizedPackage = ensureHongmenScriptPackageMetadata(
      normalizeHongmenScriptPackage(scriptPackage),
    );
    const validationStart = performance.now();
    const validation = validateHongmenScriptPackage(normalizedPackage);
    debug.timings.validationMs = Number((performance.now() - validationStart).toFixed(1));
    debug.validation = {
      errors: validation.errors,
      warnings: validation.warnings,
    };

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 线性脚本结构不合法，已切回本地静态剧情。",
        error: formatHongmenFatalValidation(validation.errors),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptHongmenScriptPackageToPlayableContent(normalizedPackage);
    const playabilityReport = validateEventPlayableContent(adaptedPlayableContent);
    debug.metrics.packageLineCount = normalizedPackage.beats.reduce(
      (sum, beat) => sum + beat.lines.length,
      0,
    );
    debug.timings.adaptMs = Number((performance.now() - adaptStart).toFixed(1));

    if (!playabilityReport.ok) {
      debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));
      debug.validation = {
        errors: [
          ...validation.errors,
          ...playabilityReport.errors.map((issue) => issue.message),
        ],
        warnings: [
          ...validation.warnings,
          ...playabilityReport.warnings.map((issue) => issue.message),
        ],
      };

      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 剧情无法转换为可播放内容，已切回本地静态剧情。",
        error: formatHongmenPlayabilityErrors(
          playabilityReport.errors.map((issue) => issue.message),
        ),
        debug,
      };
    }

    if (playabilityReport.warnings.length > 0) {
      validation.warnings.push(
        ...playabilityReport.warnings.map((issue) => `playable:${issue.message}`),
      );
      debug.validation = {
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    if (validation.warnings.length > 0) {
      console.warn("[hongmen-ai] script package generated with warnings", {
        requestId,
        warningCount: validation.warnings.length,
        warnings: validation.warnings,
      });
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    return {
      ok: true,
      source: "ai",
      scriptPackage: normalizedPackage,
      playableContent: adaptedPlayableContent,
      warning: formatHongmenWarningSummary(validation.warnings),
      debug,
    };
  } catch (error) {
    const debug = createHongmenAiDebugInfo(getAiConfig());
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
}//主函数，根据请求参数生成鸿门宴AI剧本包，并处理各种错误和警告情况，最终返回可播放内容或回退到本地静态剧情
