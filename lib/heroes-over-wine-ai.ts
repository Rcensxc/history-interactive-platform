import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  HeroesOverWineAiScriptBeat,
  HeroesOverWineAiScriptLine,
  HeroesOverWineAiScriptPackage,
  PlaceholderAsset,
} from "@/types/content";

export const HEROES_OVER_WINE_AI_EVENT_ID = "heroes-over-wine";
export const HEROES_OVER_WINE_AI_DEFAULT_VIEWPOINT_ID = "liubei";
export const HEROES_OVER_WINE_AI_SUPPORTED_VIEWPOINT_IDS = ["liubei"] as const;

type SupportedHeroesOverWineViewpointId =
  (typeof HEROES_OVER_WINE_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const HEROES_OVER_WINE_AI_DEFAULT_MODEL = "Qwen3Flash";
const HEROES_OVER_WINE_AI_SCRIPT_PROTOCOL_VERSION =
  "heroes-over-wine-linear-script-v1" as const;

type HeroesOverWineBeatId =
  | "invited-to-seat"
  | "cao-opens-topic"
  | "ask-for-heroes"
  | "cao-rejects-names"
  | "line-turns-to-liubei"
  | "thunder-and-dropped-chopsticks"
  | "liubei-covers"
  | "after-seat";

type HeroesOverWineBeatBlueprint = {
  beatId: HeroesOverWineBeatId;
  title: string;
  backgroundTag: keyof typeof heroesOverWineAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type HeroesOverWineViewpointProfile = {
  id: SupportedHeroesOverWineViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<HeroesOverWineBeatId, string>;
  fallbackBeats: HeroesOverWineAiScriptBeat[];
};

type HeroesOverWineAiDebugInfo = {
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

export type HeroesOverWineAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type HeroesOverWineAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: HeroesOverWineAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: HeroesOverWineAiDebugInfo;
};

type HeroesOverWineScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const heroesOverWineAiBackdropMap = {
  "pavilion-waiting": {
    label: "亭下",
    tone: "amber",
    description:
      "背景占位图：雨意压在亭外，青梅和温酒都已备好，真正先落座的却是试探。",
    backgroundKey: "heroes-rain-pavilion",
  },
  "banquet-hall": {
    label: "酒席",
    tone: "amber",
    description:
      "背景占位图：室内酒席、青梅和温酒并排摆着，闲谈表面松弛，话锋却越来越近。",
    backgroundKey: "heroes-banquet-hall",
  },
  "after-rain-courtyard": {
    label: "席后",
    tone: "ink",
    description:
      "背景占位图：席散后，回廊与庭院都被雨气压得很静，真正放不下的是席上刚刚那句试探。",
    backgroundKey: "heroes-courtyard-after-rain",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const heroesOverWineSpeakerVisualKeyMap = {
  刘备: "liubei",
  曹操: "caocao",
  侍从: "attendant",
} as const;

const allowedSpeakerNames = ["刘备", "曹操", "侍从"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const heroesOverWineBeatBlueprints: HeroesOverWineBeatBlueprint[] = [
  {
    beatId: "invited-to-seat",
    title: "被请入席",
    backgroundTag: "pavilion-waiting",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "cao-opens-topic",
    title: "曹操谈起天下局势",
    backgroundTag: "banquet-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "ask-for-heroes",
    title: "曹操问谁可称英雄",
    backgroundTag: "banquet-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "cao-rejects-names",
    title: "曹操一一否定",
    backgroundTag: "banquet-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "line-turns-to-liubei",
    title: "话锋落到刘备身上",
    backgroundTag: "banquet-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "thunder-and-dropped-chopsticks",
    title: "惊雷与失箸",
    backgroundTag: "pavilion-waiting",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "liubei-covers",
    title: "刘备顺势自掩",
    backgroundTag: "banquet-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "after-seat",
    title: "席后余惊",
    backgroundTag: "after-rain-courtyard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const heroesOverWineViewpointProfiles: Record<
  SupportedHeroesOverWineViewpointId,
  HeroesOverWineViewpointProfile
> = {
  liubei: {
    id: "liubei",
    displayName: "刘备",
    title: "隐忍赴席视角",
    narrationRule:
      "旁白只能写刘备第一视角当下的观察、快速判断和心理压迫，不写三国大势，不写宏观历史总结，不写后世评价。",
    userGoal:
      "把刘备写成一个被请来饮酒却始终不敢松气的人。他外表谦退、说话收着锋芒，心里却一直在判断曹操每句话到底试探到了哪一步。",
    voiceNotes: [
      "刘备说话克制、留余地，像是在给自己留退路。",
      "刘备内心反应要快，但表面仍然维持温和和谦退。",
      "曹操说话像闲谈，却句句带压迫，不要写成喝斥式对话。",
    ],
    beatGoals: {
      "invited-to-seat": "让玩家先落进这场酒局的表面松弛与内在警觉里。",
      "cao-opens-topic": "让曹操从酒和天气慢慢把话引向天下人物。",
      "ask-for-heroes": "让刘备意识到对方真正在试的，是自己会把谁放进英雄之列。",
      "cao-rejects-names": "让曹操逐个否定，把问题一步步逼回刘备身上。",
      "line-turns-to-liubei": "让“唯使君与操耳”落下时，气氛明显变冷。",
      "thunder-and-dropped-chopsticks": "把惊雷、失箸和被盯着观察反应的压迫写出来。",
      "liubei-covers": "让刘备借雷声顺势自掩，暂时把危险遮过去。",
      "after-seat": "收在席散后的余惊，不做宏观总结，只保留心理余波。",
    },
    fallbackBeats: [
      {
        beatId: "invited-to-seat",
        lines: [
          {
            speaker: "",
            text: "侍从请你入席时，青梅和温酒已经摆在案上。桌上看着只是闲宴，可你还没坐稳，就先觉得这顿酒不会只是叙旧。",
          },
          {
            speaker: "侍从",
            text: "使君请。丞相今日难得有兴，特意要同你对坐饮几杯。",
          },
        ],
      },
      {
        beatId: "cao-opens-topic",
        lines: [
          {
            speaker: "曹操",
            text: "这酒趁热喝才好。天上阴云未散，青梅入口微酸，正适合说几句闲话。",
          },
          {
            speaker: "",
            text: "他先说酒，又说天气，语气像真在消磨一段清闲时辰。可你越听越觉得，这话迟早要转到人身上。",
          },
        ],
      },
      {
        beatId: "ask-for-heroes",
        lines: [
          {
            speaker: "曹操",
            text: "玄德行走天下已久，见的人也多。不妨说说看，如今天下谁可称英雄？",
          },
          {
            speaker: "",
            text: "这一问来得像随口，却比杯中酒更烫。你知道他不是想听名字本身，而是想看你会把自己放在什么位置上。",
          },
        ],
      },
      {
        beatId: "cao-rejects-names",
        lines: [
          {
            speaker: "刘备",
            text: "袁绍出身名门，兵多地广；刘表据荆州；孙策旧业亦不可轻。备识浅，只能想到这些。",
          },
          {
            speaker: "曹操",
            text: "袁绍外宽内忌，刘表徒守门户，别人也各有短处。玄德提他们，倒像是在替真正该被提到的人先让路。",
          },
        ],
      },
      {
        beatId: "line-turns-to-liubei",
        lines: [
          {
            speaker: "",
            text: "你正想着还该怎样把话引开，他却已经把杯放下，像在轻轻替这场闲谈收尾。真正危险的那句，就在他抬眼看你的时候落了下来。",
          },
          {
            speaker: "曹操",
            text: "今天下英雄，唯使君与操耳。其余诸人，不过随势起落，难当此称。",
          },
        ],
      },
      {
        beatId: "thunder-and-dropped-chopsticks",
        lines: [
          {
            speaker: "",
            text: "亭外惊雷忽然炸开，你手中箸一下滑落。案上一声轻响，比雷还先敲在心口上，而曹操的目光正好落在你脸上。",
          },
          {
            speaker: "曹操",
            text: "玄德为何失手？莫不是这一声雷，比我方才的话还叫人难安？",
          },
        ],
      },
      {
        beatId: "liubei-covers",
        lines: [
          {
            speaker: "刘备",
            text: "备素来畏雷，幼时如此，至今未改。方才失态，倒叫明公见笑了。至于英雄之说，更不敢当。",
          },
          {
            speaker: "",
            text: "话说得越平，你心里反而越紧。可至少这一刻，他没有继续把那层纸当面捅破。",
          },
        ],
      },
      {
        beatId: "after-seat",
        lines: [
          {
            speaker: "",
            text: "离席时雨声已经压低了回廊里的脚步。你知道自己暂时把这一关糊过去了，可也知道，曹操今日既然把那句话点到你身上，就绝不会再把你当成寻常客人。",
          },
          {
            speaker: "刘备",
            text: "酒席散了，话却没散。往后每一步，都得比今天更小心。",
          },
        ],
      },
    ],
  },
};

function createHeroesOverWineAiRequestId() {
  return `heroes-over-wine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getHeroesOverWinePlayableBase() {
  const playableContent = getEventPlayableContent(HEROES_OVER_WINE_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(HEROES_OVER_WINE_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("煮酒论英雄的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getHeroesOverWineViewpointProfile(
  viewpointId: SupportedHeroesOverWineViewpointId,
) {
  return heroesOverWineViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: HeroesOverWineAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      HEROES_OVER_WINE_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createHeroesOverWineAiDebugInfo(
  config = getAiConfig(),
): HeroesOverWineAiDebugInfo {
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
  const profile = getHeroesOverWineViewpointProfile(
    HEROES_OVER_WINE_AI_DEFAULT_VIEWPOINT_ID,
  );

  return heroesOverWineBeatBlueprints
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

function buildHeroesOverWineStoryPackagePrompt(
  request: HeroesOverWineAiStoryPackageRequest & {
    viewpointId: SupportedHeroesOverWineViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(HEROES_OVER_WINE_AI_EVENT_ID);
  const viewpoint = getHeroesOverWineViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "煮酒论英雄"}`,
    "这不是历史概述，不是三国局势说明，也不是百科介绍。",
    "这是刘备第一视角正在经历的一场具体酒局：被请入席、听曹操试探、被点到自己、借惊雷失箸掩饰惊慌，最后暂时脱身。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "每个 beat 都必须是具体现场：当前在哪里、谁在说话、谁察觉到了什么、这一幕如何把心理压力再推近一步。",
    "不要写抽象评价，不要总结三国历史，不要把事件写成宏观纪录片。",
    "dialogue 只能是一名角色在说话，narration 只能是空 speaker 的第一视角观察或心里判断。",
    "要写出酒席上的危险藏在闲谈里的感觉：曹操笑谈中带试探，刘备表面谦退、内心迅速判断。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "脚本必须像一场完整的小型历史现场，而不是人物观点列表。",
    "建议整体 line 数量在 16 到 24 条之间，每个 beat 都有基本展开空间。",
    "旁白要有现场感和心理压迫，但不要写成长篇散文；对话要像一句完整的人话。",
    "曹操说话要体现：随意中带试探，笑谈里有压迫。",
    "刘备说话要体现：谨慎、低调、隐忍，不能让曹操看出真正志向。",
    "固定 beat 顺序如下：",
    serializeBeatBlueprints(),
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredHeroesOverWineScriptPackage(params: {
  request: HeroesOverWineAiStoryPackageRequest & {
    viewpointId: SupportedHeroesOverWineViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: HeroesOverWineAiScriptPackage;
  debug: HeroesOverWineAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createHeroesOverWineAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildHeroesOverWineStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = heroesOverWineBeatBlueprints.length;
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
          name: "heroes_over_wine_linear_script_package",
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
                enum: [HEROES_OVER_WINE_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...HEROES_OVER_WINE_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: heroesOverWineBeatBlueprints.length,
                maxItems: heroesOverWineBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: heroesOverWineBeatBlueprints.map((beat) => beat.beatId),
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
    scriptPackage: JSON.parse(outputText) as HeroesOverWineAiScriptPackage,
    debug,
  };
}

function normalizeHeroesOverWineScriptLine(
  line: HeroesOverWineAiScriptLine,
): HeroesOverWineAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeHeroesOverWineScriptPackage(
  scriptPackage: HeroesOverWineAiScriptPackage,
): HeroesOverWineAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as HeroesOverWineBeatId,
      lines: beat.lines.map(normalizeHeroesOverWineScriptLine),
    })),
  };
}

function validateHeroesOverWineScriptPackage(
  scriptPackage: HeroesOverWineAiScriptPackage,
  viewpointId: SupportedHeroesOverWineViewpointId,
): HeroesOverWineScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== HEROES_OVER_WINE_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${HEROES_OVER_WINE_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== heroesOverWineBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${heroesOverWineBeatBlueprints.length}。`);
  }

  heroesOverWineBeatBlueprints.forEach((blueprint, index) => {
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
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点现场感或心理判断。`,
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
      if (line.text.length > 66) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏长，建议拆成两条。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 16 || totalLines > 24) {
    warnings.push("总 line 数量偏离推荐范围 16-24。");
  }

  const liubeiDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "刘备").length,
    0,
  );
  if (liubeiDialogueCount < 2) {
    warnings.push("刘备当前发言偏少，建议再补几句更能体现他隐忍应对的对白。");
  }

  const caocaoDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "曹操").length,
    0,
  );
  if (caocaoDialogueCount < 2) {
    warnings.push("曹操的直接试探偏少，建议让他至少有两次明显推进压力的发言。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatHeroesOverWineScriptValidation(
  result: HeroesOverWineScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatHeroesOverWineWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }
  if (speaker === "刘备") {
    return {
      mode: "speaker",
      speakerId: "liubei",
      visualKey: "liubei",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    heroesOverWineSpeakerVisualKeyMap[
      speaker as keyof typeof heroesOverWineSpeakerVisualKeyMap
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

function adaptHeroesOverWineScriptPackageToPlayableContent(
  scriptPackage: HeroesOverWineAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getHeroesOverWinePlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = heroesOverWineBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        heroesOverWineSpeakerVisualKeyMap[
          line.speaker as keyof typeof heroesOverWineSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: heroesOverWineAiBackdropMap[blueprint.backgroundTag],
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
    eventId: HEROES_OVER_WINE_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): HeroesOverWineAiScriptPackage {
  const profile = getHeroesOverWineViewpointProfile(
    HEROES_OVER_WINE_AI_DEFAULT_VIEWPOINT_ID,
  );

  return {
    packageId: "heroes-over-wine-fallback-liubei",
    storyId: "heroes-over-wine-liubei",
    protocolVersion: HEROES_OVER_WINE_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: HEROES_OVER_WINE_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isHeroesOverWineAiSupportedViewpoint(viewpointId)) {
    return getHeroesOverWinePlayableBase();
  }

  return adaptHeroesOverWineScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isHeroesOverWineAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedHeroesOverWineViewpointId {
  return (
    HEROES_OVER_WINE_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]
  ).includes(viewpointId);
}

export function shouldUseHeroesOverWineAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || HEROES_OVER_WINE_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === HEROES_OVER_WINE_AI_EVENT_ID &&
    isHeroesOverWineAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getHeroesOverWineAiInitialViewpointId() {
  return HEROES_OVER_WINE_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateHeroesOverWineAiStoryPackage(
  params: HeroesOverWineAiStoryPackageRequest,
): Promise<HeroesOverWineAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== HEROES_OVER_WINE_AI_EVENT_ID ||
    !isHeroesOverWineAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持煮酒论英雄的刘备 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createHeroesOverWineAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredHeroesOverWineScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage =
      normalizeHeroesOverWineScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateHeroesOverWineScriptPackage(
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
        error: formatHeroesOverWineScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptHeroesOverWineScriptPackageToPlayableContent(normalizedPackage);
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
          ? formatHeroesOverWineWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createHeroesOverWineAiDebugInfo(getAiConfig());
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

    console.error("[heroes-over-wine-ai] linear script package request failed", {
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
