import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  EmptyCityAiScriptBeat,
  EmptyCityAiScriptLine,
  EmptyCityAiScriptPackage,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
} from "@/types/content";

export const EMPTY_CITY_AI_EVENT_ID = "empty-city-stratagem";
export const EMPTY_CITY_AI_DEFAULT_VIEWPOINT_ID = "zhuge-liang";
export const EMPTY_CITY_AI_SUPPORTED_VIEWPOINT_IDS = ["zhuge-liang"] as const;

type SupportedEmptyCityViewpointId =
  (typeof EMPTY_CITY_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const EMPTY_CITY_AI_DEFAULT_MODEL = "Qwen3Flash";
const EMPTY_CITY_AI_SCRIPT_PROTOCOL_VERSION =
  "empty-city-linear-script-v1" as const;

type EmptyCityBeatId =
  | "urgent-report"
  | "city-panics"
  | "open-the-gates"
  | "ascend-the-tower"
  | "wei-army-arrives"
  | "tower-stillness"
  | "simayi-hesitates"
  | "wei-army-withdraws"
  | "aftermath-breath";

type EmptyCityBeatBlueprint = {
  beatId: EmptyCityBeatId;
  title: string;
  backgroundTag: keyof typeof emptyCityAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type EmptyCityViewpointProfile = {
  id: SupportedEmptyCityViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<EmptyCityBeatId, string>;
  fallbackBeats: EmptyCityAiScriptBeat[];
};

type EmptyCityAiDebugInfo = {
  requestId: string;
  upstreamUrl: string;
  model: string;
  hasApiKey: boolean;
  apiKeySource: "OPENROUTER_API_KEY" | "AI_API_KEY" | "missing";
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

export type EmptyCityAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type EmptyCityAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: EmptyCityAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: EmptyCityAiDebugInfo;
};

type EmptyCityScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const emptyCityAiBackdropMap = {
  "city-gate": {
    label: "城门",
    tone: "ink",
    description:
      "背景占位图：古城门与急报、马蹄、慌乱一起逼近，所有人都知道敌军已经快压到眼前。",
    backgroundKey: "empty-city-gate",
  },
  watchtower: {
    label: "城楼",
    tone: "ink",
    description:
      "背景占位图：城楼高处风更冷，香烟和琴声都被压得极细，越从容越像把命押在一处。",
    backgroundKey: "empty-city-watchtower",
  },
  "army-below": {
    label: "城下",
    tone: "amber",
    description:
      "背景占位图：魏军压到城下，旌旗、甲叶和观望都停在城外，所有人都在等主将那一刻判断。",
    backgroundKey: "empty-city-below",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const emptyCitySpeakerVisualKeyMap = {
  诸葛亮: "zhuge-liang",
  司马懿: "simayi",
  守军: "guard",
  随从: "attendant",
  魏将: "guard",
} as const;

const allowedSpeakerNames = ["诸葛亮", "司马懿", "守军", "随从", "魏将"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const emptyCityBeatBlueprints: EmptyCityBeatBlueprint[] = [
  {
    beatId: "urgent-report",
    title: "城中急报",
    backgroundTag: "city-gate",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "city-panics",
    title: "城内惊慌",
    backgroundTag: "city-gate",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "open-the-gates",
    title: "诸葛亮下令开城门",
    backgroundTag: "city-gate",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "ascend-the-tower",
    title: "登楼抚琴",
    backgroundTag: "watchtower",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "wei-army-arrives",
    title: "司马懿军到城下",
    backgroundTag: "army-below",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "tower-stillness",
    title: "城楼上的安静",
    backgroundTag: "watchtower",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "simayi-hesitates",
    title: "司马懿起疑",
    backgroundTag: "army-below",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "wei-army-withdraws",
    title: "魏军退去",
    backgroundTag: "city-gate",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "aftermath-breath",
    title: "余惊收束",
    backgroundTag: "watchtower",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const emptyCityViewpointProfiles: Record<
  SupportedEmptyCityViewpointId,
  EmptyCityViewpointProfile
> = {
  "zhuge-liang": {
    id: "zhuge-liang",
    displayName: "诸葛亮",
    title: "城楼主事视角",
    narrationRule:
      "旁白只能写诸葛亮第一视角当下的判断、观察和压住全城惊慌时的心理计算，不写三国战争概述，不写军事分析，不写后世评价。",
    userGoal:
      "把诸葛亮写成一个在兵力空虚、敌军逼近时仍然先稳住人心的人。他表面从容、动作克制，心里却一直在计算司马懿会不会被这份从容反过来绊住。",
    voiceNotes: [
      "诸葛亮说话要稳，不急不乱，但能看出每句话都在压住局面。",
      "诸葛亮的内心应体现对人心、节奏和司马懿判断习惯的精准估量。",
      "司马懿说话要谨慎、多疑，不愿轻易把整支兵马压进一座过于安静的空城。",
    ],
    beatGoals: {
      "urgent-report": "让玩家一开始就明白敌军逼近、城中兵空，这不是从容开局，而是被推到边缘。",
      "city-panics": "让城内惊慌显形，突出真正先要守的是人心而不是城墙。",
      "open-the-gates": "让开城门这个判断显得又反常又具体，像把全城都压进一场赌局。",
      "ascend-the-tower": "把登楼、焚香、抚琴写成具体动作，让从容成为可见的表演。",
      "wei-army-arrives": "让司马懿军到城下后的观察和压迫感真正落到眼前。",
      "tower-stillness": "让城楼上的安静本身变成危险来源，谁先乱谁就输。",
      "simayi-hesitates": "让司马懿的疑心和熟悉诸葛亮这一点真正起作用。",
      "wei-army-withdraws": "让退兵那刻先写成不敢立刻松气，而不是马上庆祝。",
      "aftermath-breath": "收在城楼上那口迟来的气，不做宏大总结，只保留余惊和判断后的冷静。",
    },
    fallbackBeats: [
      {
        beatId: "urgent-report",
        lines: [
          {
            speaker: "",
            text: "急报送上城楼时，你先听见的是马蹄越来越近。城里可调的人已经不多，而司马懿的大军正在往这边压来，留给你判断的时间只剩眼前这一阵。",
          },
          {
            speaker: "守军",
            text: "丞相，前锋已经快到城下了。城中兵力空虚，真要硬守，怕是连一轮冲击都未必撑得过去。",
          },
        ],
      },
      {
        beatId: "city-panics",
        lines: [
          {
            speaker: "随从",
            text: "要不要先闭门固守？若再迟片刻，城里的人心怕是先散了。",
          },
          {
            speaker: "",
            text: "城中那点慌乱正在往外冒，越多人开口，越像在替敌军把“这里真的空了”说出来。你知道，这时候先乱的若是自己人，城门关得再快也没用。",
          },
        ],
      },
      {
        beatId: "open-the-gates",
        lines: [
          {
            speaker: "诸葛亮",
            text: "城门打开。让老卒照常洒扫街道，不许奔走呼喊。谁都不必装勇，只把该做的事做得像平日一样。",
          },
          {
            speaker: "",
            text: "命令一出口，连楼上的人都愣了一瞬。可你更清楚，今日能守住这座空城的，从来不是兵力，而是让司马懿先不敢信自己的眼睛。",
          },
        ],
      },
      {
        beatId: "ascend-the-tower",
        lines: [
          {
            speaker: "",
            text: "你登上城楼，命人焚香，把琴摆在身前。风从楼边穿过去，连袖角都没怎么动，可城下越来越近的那支军队，已经在逼你把每一分从容都做成看得见的样子。",
          },
          {
            speaker: "诸葛亮",
            text: "都静下来。楼上若先乱了气息，城下就会立刻看见我们是真的空。",
          },
        ],
      },
      {
        beatId: "wei-army-arrives",
        lines: [
          {
            speaker: "司马懿",
            text: "城门洞开，街上却只见洒扫，不见奔走。诸葛亮若真无准备，不会把一座城摆得这样给我看。",
          },
          {
            speaker: "",
            text: "魏军停在城外，旌旗和甲叶都没有立刻压上来。你不往下多看，只让琴声往城下落，因为此刻最重要的不是解释，而是让这份安静自己生出分量。",
          },
        ],
      },
      {
        beatId: "tower-stillness",
        lines: [
          {
            speaker: "",
            text: "琴弦一响，楼上的人便更不敢出声。每个人都知道，只要有一点慌乱从城楼漏下去，这座“空城”就会立刻从计策变成破绽。",
          },
          {
            speaker: "随从",
            text: "丞相，若他们再逼近一步……",
          },
        ],
      },
      {
        beatId: "simayi-hesitates",
        lines: [
          {
            speaker: "司马懿",
            text: "诸葛亮平生谨慎，最不肯把性命押在侥幸上。今日越从容，越像早在城内等我先犯错。退一步未必失机，进一步却可能正中其算。",
          },
          {
            speaker: "魏将",
            text: "都督，城里未见伏兵，若此时不进，岂不是白白放他一城？",
          },
        ],
      },
      {
        beatId: "wei-army-withdraws",
        lines: [
          {
            speaker: "",
            text: "退兵号令传下来时，城中没有人敢立刻松气。你仍让琴声照旧，仍让街上的扫帚声照旧，只等马蹄声一点点退远，等那阵压到城门前的疑心终于被他自己带走。",
          },
          {
            speaker: "诸葛亮",
            text: "先别出声。等他们真正退远，再让这口气落下来。",
          },
        ],
      },
      {
        beatId: "aftermath-breath",
        lines: [
          {
            speaker: "",
            text: "等城下终于只剩风声，你才觉得握弦的手指有些发麻。今日能退司马懿，不是因为这座城真有余力，而是因为他太熟悉你的谨慎，反而不敢相信你会真空到如此地步。",
          },
          {
            speaker: "诸葛亮",
            text: "记住今日这口气。守住城的，不是城门先闭上，而是人心没有先塌下去。",
          },
        ],
      },
    ],
  },
};

function createEmptyCityAiRequestId() {
  return `empty-city-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getEmptyCityPlayableBase() {
  const playableContent = getEventPlayableContent(EMPTY_CITY_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(EMPTY_CITY_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("空城计的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getEmptyCityViewpointProfile(
  viewpointId: SupportedEmptyCityViewpointId,
) {
  return emptyCityViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: EmptyCityAiDebugInfo["apiKeySource"] = openRouterApiKey
    ? "OPENROUTER_API_KEY"
    : aiApiKey
      ? "AI_API_KEY"
      : "missing";

  return {
    apiKey,
    apiKeySource,
    model:
      process.env.OPENROUTER_MODEL?.trim() ||
      process.env.AI_MODEL?.trim() ||
      EMPTY_CITY_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createEmptyCityAiDebugInfo(
  config = getAiConfig(),
): EmptyCityAiDebugInfo {
  return {
    requestId: "",
    upstreamUrl: config.upstreamUrl,
    model: config.model,
    hasApiKey: !!config.apiKey,
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

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const response = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const textFragments =
    response.output
      ?.flatMap((item) =>
        item.content
          ?.filter((content) => content.type === "output_text")
          .map((content) => content.text ?? "") ?? [],
      )
      .join("") ?? "";

  return textFragments.trim();
}

function serializeBeatBlueprints() {
  const profile = getEmptyCityViewpointProfile(EMPTY_CITY_AI_DEFAULT_VIEWPOINT_ID);

  return emptyCityBeatBlueprints
    .map((beat, index) =>
      [
        `${index + 1}. beatId=${beat.beatId}`,
        `title=${beat.title}`,
        `goal=${profile.beatGoals[beat.beatId]}`,
        `lineRange=${beat.minLines}-${beat.maxLines}`,
        `allowNarration=${beat.allowNarration ? "true" : "false"}`,
        `allowedDialogueSpeakers=${allowedSpeakerNames.join(" / ")}`,
        `backgroundHandledLocally=${beat.backgroundTag}`,
      ].join(" | "),
    )
    .join("\n");
}

function buildEmptyCityStoryPackagePrompt(
  request: EmptyCityAiStoryPackageRequest & {
    viewpointId: SupportedEmptyCityViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(EMPTY_CITY_AI_EVENT_ID);
  const viewpoint = getEmptyCityViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "空城计"}`,
    "这不是历史概述，不是三国战局分析，也不是诸葛亮智谋总结。",
    "这是诸葛亮第一视角正在经历的一次具体城下对峙：城中兵力空虚、司马懿大军逼近、城门打开、登楼抚琴、全城都在等魏军到底进不进城。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "每一幕都必须围绕具体动作、城楼场景、敌军逼近、心理判断推进。",
    "不要写抽象历史评价，不要写成论文或军事解说。",
    "诸葛亮要体现：镇定、清醒、表面从容，内心仍在精确计算。",
    "司马懿要体现：谨慎、多疑、不愿轻易冒进，而且熟悉诸葛亮的习惯，因此越看越不敢轻信。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "脚本必须像一场完整的小型历史现场，而不是观点摘要。",
    "建议整体 line 数量在 18 到 26 条之间，每个 beat 都有基本展开空间。",
    "旁白要有现场感和心理压迫，但不要写成长篇散文；对话要像一句完整的人话。",
    "固定 beat 顺序如下：",
    serializeBeatBlueprints(),
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredEmptyCityScriptPackage(params: {
  request: EmptyCityAiStoryPackageRequest & {
    viewpointId: SupportedEmptyCityViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: EmptyCityAiScriptPackage;
  debug: EmptyCityAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createEmptyCityAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildEmptyCityStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = emptyCityBeatBlueprints.length;
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
          name: "empty_city_linear_script_package",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["packageId", "storyId", "protocolVersion", "viewpointId", "beats"],
            properties: {
              packageId: { type: "string" },
              storyId: { type: "string" },
              protocolVersion: {
                type: "string",
                enum: [EMPTY_CITY_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...EMPTY_CITY_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: emptyCityBeatBlueprints.length,
                maxItems: emptyCityBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: emptyCityBeatBlueprints.map((beat) => beat.beatId),
                    },
                    lines: {
                      type: "array",
                      minItems: 2,
                      maxItems: 3,
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["speaker", "text"],
                        properties: {
                          speaker: {
                            type: "string",
                            enum: ["", ...allowedSpeakerNames],
                          },
                          text: {
                            type: "string",
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
      },
    }),
  });

  debug.timings.upstreamRequestMs = Number((performance.now() - upstreamStart).toFixed(1));
  debug.upstreamStatus = response.status;
  debug.upstreamStatusText = response.statusText;

  if (!response.ok) {
    const body = await readResponseBody(response);
    debug.upstreamBody = body;
    throw new Error(
      `AI request failed with status ${response.status} ${response.statusText}. Body:${body}`,
    );
  }

  const extractStart = performance.now();
  const payload = (await response.json()) as unknown;
  const outputText = extractResponseText(payload);
  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number((performance.now() - extractStart).toFixed(1));

  if (!outputText) {
    throw new Error("AI response did not include structured script text.");
  }

  return {
    scriptPackage: JSON.parse(outputText) as EmptyCityAiScriptPackage,
    debug,
  };
}

function normalizeEmptyCityScriptLine(
  line: EmptyCityAiScriptLine,
): EmptyCityAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeEmptyCityScriptPackage(
  scriptPackage: EmptyCityAiScriptPackage,
): EmptyCityAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as EmptyCityBeatId,
      lines: beat.lines.map(normalizeEmptyCityScriptLine),
    })),
  };
}

function validateEmptyCityScriptPackage(
  scriptPackage: EmptyCityAiScriptPackage,
  viewpointId: SupportedEmptyCityViewpointId,
): EmptyCityScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== EMPTY_CITY_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${EMPTY_CITY_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== emptyCityBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${emptyCityBeatBlueprints.length}。`);
  }

  emptyCityBeatBlueprints.forEach((blueprint, index) => {
    const beat = scriptPackage.beats[index];
    if (!beat) {
      errors.push(`缺少关键 beat：${blueprint.beatId}`);
      return;
    }
    if (beat.beatId !== blueprint.beatId) {
      errors.push(`第 ${index + 1} 个 beat 必须是 ${blueprint.beatId}。`);
    }
    if (beat.lines.length === 0) {
      errors.push(`${blueprint.beatId} 不能为空。`);
    } else if (
      beat.lines.length < blueprint.minLines ||
      beat.lines.length > blueprint.maxLines
    ) {
      warnings.push(
        `${blueprint.beatId} 的 line 数量偏离推荐范围 ${blueprint.minLines}-${blueprint.maxLines}。`,
      );
    }

    beat.lines.forEach((line, lineIndex) => {
      if (!line.text) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 text 不能为空。`);
        return;
      }

      if (!line.speaker) {
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (quotePattern.test(line.text)) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白里出现了引号对白，建议改成纯第一视角观察。`,
          );
        }
        if (line.text.length < 28) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点现场感或心理压迫。`,
          );
        }
        if (line.text.length > 110) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议拆成更像 AVG 的短幕。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 只能是 ${allowedSpeakerNames.join(" / ")}。`,
        );
      }
      if (line.text.length < 12) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏短，建议写成更完整的一句人话。`,
        );
      }
      if (line.text.length > 68) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏长，建议拆成两条。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 18 || totalLines > 26) {
    warnings.push("总 line 数量偏离推荐范围 18-26。");
  }

  const zhugeDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "诸葛亮").length,
    0,
  );
  if (zhugeDialogueCount < 2) {
    warnings.push("诸葛亮当前发言偏少，建议再补几句更能体现他稳住局面的对白。");
  }

  const simayiDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "司马懿").length,
    0,
  );
  if (simayiDialogueCount < 2) {
    warnings.push("司马懿的直接判断偏少，建议让他至少有两次明显起疑的发言。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatEmptyCityScriptValidation(result: EmptyCityScriptValidationResult) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatEmptyCityWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }
  if (speaker === "诸葛亮") {
    return {
      mode: "speaker",
      speakerId: "zhuge-liang",
      visualKey: "zhuge-liang",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    emptyCitySpeakerVisualKeyMap[
      speaker as keyof typeof emptyCitySpeakerVisualKeyMap
    ];

  if (!visualKey) {
    return { mode: "hidden" };
  }

  return {
    mode: "speaker",
    speakerId: visualKey,
    visualKey,
  };
}

function adaptEmptyCityScriptPackageToPlayableContent(
  scriptPackage: EmptyCityAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getEmptyCityPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = emptyCityBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        emptyCitySpeakerVisualKeyMap[
          line.speaker as keyof typeof emptyCitySpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: emptyCityAiBackdropMap[blueprint.backgroundTag],
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
    contentSource,
    eventId: EMPTY_CITY_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): EmptyCityAiScriptPackage {
  const profile = getEmptyCityViewpointProfile(EMPTY_CITY_AI_DEFAULT_VIEWPOINT_ID);

  return {
    packageId: "empty-city-fallback-zhuge-liang",
    storyId: "empty-city-stratagem-zhuge-liang",
    protocolVersion: EMPTY_CITY_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: EMPTY_CITY_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isEmptyCityAiSupportedViewpoint(viewpointId)) {
    return getEmptyCityPlayableBase();
  }

  return adaptEmptyCityScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isEmptyCityAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedEmptyCityViewpointId {
  return (EMPTY_CITY_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(
    viewpointId,
  );
}

export function shouldUseEmptyCityAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || EMPTY_CITY_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === EMPTY_CITY_AI_EVENT_ID &&
    isEmptyCityAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getEmptyCityAiInitialViewpointId() {
  return EMPTY_CITY_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateEmptyCityAiStoryPackage(
  params: EmptyCityAiStoryPackageRequest,
): Promise<EmptyCityAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== EMPTY_CITY_AI_EVENT_ID ||
    !isEmptyCityAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持空城计的诸葛亮 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createEmptyCityAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredEmptyCityScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage = normalizeEmptyCityScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateEmptyCityScriptPackage(
      normalizedPackage,
      params.viewpointId,
    );
    debug.timings.validationMs = Number(
      (performance.now() - validationStart).toFixed(1),
    );

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number(
        (performance.now() - serviceStart).toFixed(1),
      );
      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 线性脚本结构不合法，已切回本地静态剧情。",
        error: formatEmptyCityScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptEmptyCityScriptPackageToPlayableContent(normalizedPackage);
    debug.metrics.packageLineCount = normalizedPackage.beats.reduce(
      (sum, beat) => sum + beat.lines.length,
      0,
    );
    debug.timings.adaptMs = Number((performance.now() - adaptStart).toFixed(1));
    debug.timings.serviceTotalMs = Number(
      (performance.now() - serviceStart).toFixed(1),
    );

    return {
      ok: true,
      source: "ai",
      scriptPackage: normalizedPackage,
      playableContent: adaptedPlayableContent,
      warning:
        validation.warnings.length > 0
          ? formatEmptyCityWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createEmptyCityAiDebugInfo(getAiConfig());
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(
      errorMessage,
    );

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number(
      (performance.now() - serviceStart).toFixed(1),
    );

    console.error("[empty-city-ai] linear script package request failed", {
      ...debug,
      error: errorMessage,
      viewpointId: params.viewpointId,
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
