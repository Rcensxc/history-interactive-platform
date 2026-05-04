import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
  TianjiHorseRaceAiScriptBeat,
  TianjiHorseRaceAiScriptLine,
  TianjiHorseRaceAiScriptPackage,
} from "@/types/content";

export const TIANJI_HORSE_RACE_AI_EVENT_ID = "tianji-horse-race";
export const TIANJI_HORSE_RACE_AI_DEFAULT_VIEWPOINT_ID = "tianji";
export const TIANJI_HORSE_RACE_AI_SUPPORTED_VIEWPOINT_IDS = ["tianji"] as const;

type SupportedTianjiHorseRaceViewpointId =
  (typeof TIANJI_HORSE_RACE_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const TIANJI_HORSE_RACE_AI_DEFAULT_MODEL = "Qwen3Flash";
const TIANJI_HORSE_RACE_AI_SCRIPT_PROTOCOL_VERSION =
  "tianji-horse-race-linear-script-v1" as const;

type TianjiHorseRaceBeatId =
  | "racecourse-side"
  | "sunbin-observes"
  | "switch-order"
  | "first-round-given"
  | "tianji-uneasy"
  | "second-round-turns"
  | "third-round-locks"
  | "king-and-crowd-react"
  | "after-race";

type TianjiHorseRaceBeatBlueprint = {
  beatId: TianjiHorseRaceBeatId;
  title: string;
  backgroundTag: keyof typeof tianjiHorseRaceAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type TianjiHorseRaceViewpointProfile = {
  id: SupportedTianjiHorseRaceViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<TianjiHorseRaceBeatId, string>;
  fallbackBeats: TianjiHorseRaceAiScriptBeat[];
};

type TianjiHorseRaceAiDebugInfo = {
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

export type TianjiHorseRaceAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type TianjiHorseRaceAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: TianjiHorseRaceAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: TianjiHorseRaceAiDebugInfo;
};

type TianjiHorseRaceScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const tianjiHorseRaceAiBackdropMap = {
  "racecourse-side": {
    label: "赛场",
    tone: "jade",
    description:
      "背景占位图：赛马场边旗影、尘土和观赛台上的目光一起压下来，最难稳住的不是马，而是人心。",
    backgroundKey: "horse-race-course",
  },
  "viewing-stand": {
    label: "看台",
    tone: "ink",
    description:
      "背景占位图：看台边的低声提醒和四周议论混在一起，真正决定输赢的话往往就落在这几句短促耳语里。",
    backgroundKey: "horse-race-viewing-stand",
  },
  "finish-lane": {
    label: "终点",
    tone: "amber",
    description:
      "背景占位图：终点线前后尘土未落，齐王和场边人的反应跟着赛果一齐翻转。",
    backgroundKey: "horse-race-finish-lane",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const tianjiHorseRaceSpeakerVisualKeyMap = {
  田忌: "tianji",
  孙膑: "sunbin",
  齐王: "qiwang",
  场边人: "crowd",
} as const;

const allowedSpeakerNames = ["田忌", "孙膑", "齐王", "场边人"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const tianjiHorseRaceBeatBlueprints: TianjiHorseRaceBeatBlueprint[] = [
  {
    beatId: "racecourse-side",
    title: "赛马场边",
    backgroundTag: "racecourse-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "sunbin-observes",
    title: "孙膑观察马匹",
    backgroundTag: "viewing-stand",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "switch-order",
    title: "孙膑提出换序",
    backgroundTag: "viewing-stand",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "first-round-given",
    title: "第一轮故意让出",
    backgroundTag: "racecourse-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "tianji-uneasy",
    title: "田忌不安",
    backgroundTag: "viewing-stand",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "second-round-turns",
    title: "第二轮反转",
    backgroundTag: "racecourse-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "third-round-locks",
    title: "第三轮定局",
    backgroundTag: "racecourse-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "king-and-crowd-react",
    title: "齐王与众人反应",
    backgroundTag: "finish-lane",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "after-race",
    title: "赛后收束",
    backgroundTag: "finish-lane",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const tianjiHorseRaceViewpointProfiles: Record<
  SupportedTianjiHorseRaceViewpointId,
  TianjiHorseRaceViewpointProfile
> = {
  tianji: {
    id: "tianji",
    displayName: "田忌",
    title: "赛场主位视角",
    narrationRule:
      "旁白只能写田忌第一视角此刻正在看到、听到和判断到的现场变化：赛场、看台、孙膑的低声提醒、齐王一方的气势、三轮赛果带来的心情变化。不要写成兵法讲解，不要写历史故事概述。",
    userGoal:
      "把田忌写成一个被推上赛场、原本没有把握的人。他先是担心自己在众目之下出丑，随后被孙膑逼着信一次不合常规的顺序安排，最后亲眼看见局面怎么在三轮里被翻过来。",
    voiceNotes: [
      "田忌说话要有不安、迟疑和逐步理解的过程，不是一开始就全懂。",
      "孙膑说话要冷静、观察细，不长篇讲大道理，而是用简短提醒点出关键。",
      "齐王和场边人的反应可以少量出现，用来增强赛场现场感。",
      "三轮比赛必须写清楚，不能把反转压缩成一句抽象总结。",
    ],
    beatGoals: {
      "racecourse-side":
        "先让玩家站到赛马场边，看见齐王一方的声势与自己一方的压力。",
      "sunbin-observes":
        "让孙膑通过观察双方上中下三等马，先把顺序比强弱更关键的感觉立起来。",
      "switch-order":
        "让孙膑提出换序，田忌明确迟疑，不要一下子就接受。",
      "first-round-given":
        "第一轮要清楚地故意让出，并写出场边笑声和局面更紧的感觉。",
      "tianji-uneasy":
        "让田忌把不安说出来，孙膑再把真正的胜负解释到位一点。",
      "second-round-turns":
        "把第二轮的反转写清楚，让场边气氛跟着变。",
      "third-round-locks":
        "把第三轮定局写清楚，让田忌真正看懂前面那一输换来了什么。",
      "king-and-crowd-react":
        "让齐王或场边人意识到变化来自顺序，不是马匹本身突然变强。",
      "after-race":
        "收在赛场余味上，不做抽象兵法总结，只让田忌意识到次序改变了整局。",
    },
    fallbackBeats: [
      {
        beatId: "racecourse-side",
        lines: [
          {
            speaker: "",
            text: "你刚到赛马场边，就先看见齐王一方人马整齐、观者成列，连看台上的笑声都透着笃定。自己这边虽不至于太弱，可真要按常规对上，你心里并没有多少胜算。",
          },
          {
            speaker: "田忌",
            text: "今日这一场若照平日排法去跑，怕是输多赢少。可赛到齐王跟前，若败得太难看，丢的就不只是这一局了。",
          },
        ],
      },
      {
        beatId: "sunbin-observes",
        lines: [
          {
            speaker: "孙膑",
            text: "先别急着应战。你看他们的上、中、下三等马，确实层层都比你略强一点，可也正因为只是略强，这里面才有能翻的地方。",
          },
          {
            speaker: "",
            text: "你顺着他的目光看过去，只见孙膑不像在看谁更快，倒像在看三轮若换一种排法，会不会把整场胜负挪个位置。",
          },
        ],
      },
      {
        beatId: "switch-order",
        lines: [
          {
            speaker: "孙膑",
            text: "第一轮别拿上等马去拼。先以下等对他们上等，把这一局让出去；后两轮，再以上对中、中对下，整局还有得翻。",
          },
          {
            speaker: "田忌",
            text: "先送一局出去？场边人连开赛前都在看我笑话，若第一轮就输，只怕他们更认定我今日是来认败的。",
          },
        ],
      },
      {
        beatId: "first-round-given",
        lines: [
          {
            speaker: "",
            text: "第一轮一开，你这边的下等马果然被齐王上等马压过去。终点还没跑完，看台边已经有人笑出声来，像在替这一场提前下了定论。",
          },
          {
            speaker: "场边人",
            text: "这排法也太怪了！田忌莫不是被逼急了，连最该先稳住的一轮都不要了？",
          },
        ],
      },
      {
        beatId: "tianji-uneasy",
        lines: [
          {
            speaker: "田忌",
            text: "你听见没有？他们已经把这一输当成全局了。若后两轮稍有差池，我今日便不是输马，是当众自己把脸递出去了。",
          },
          {
            speaker: "孙膑",
            text: "让他们先认定你乱了更好。真正算总局的人，不会被这一轮牵走。下一轮以上等对他们中等，胜负现在才开始往你手里走。",
          },
        ],
      },
      {
        beatId: "second-round-turns",
        lines: [
          {
            speaker: "",
            text: "第二轮起跑后，局面一下变了。你的上等马压住对面中等马往前冲，方才还在窃笑的人先收了声，连齐王身边的人也开始伸长脖子去看终点。",
          },
          {
            speaker: "场边人",
            text: "这一轮竟然是田忌赢了？若第三轮再能接上，方才那一输岂不是早就算进去了？",
          },
        ],
      },
      {
        beatId: "third-round-locks",
        lines: [
          {
            speaker: "田忌",
            text: "我明白了。第一轮不是白丢，而是先把他们最强的一匹引出来。如今我的中等马对他们下等马，真正决定整局的，反倒是刚才那一让。",
          },
          {
            speaker: "",
            text: "第三轮冲过终点时，你终于不再只盯着胜负本身，而是第一次真看清楚：一场比赛的输赢，原来也能被出场顺序重新排过。",
          },
        ],
      },
      {
        beatId: "king-and-crowd-react",
        lines: [
          {
            speaker: "齐王",
            text: "好个田忌，好个孙膑。马并没有忽然换骨，是你们换了次序。方才输的那一场，原来是为了把后两场都赢下来。",
          },
          {
            speaker: "场边人",
            text: "难怪第一轮他们像是故意不争，原来从那时候起，这场赛就已经不只是比谁的马快了。",
          },
        ],
      },
      {
        beatId: "after-race",
        lines: [
          {
            speaker: "",
            text: "赛场上的尘土慢慢落下时，你回头再看方才三轮，已经知道自己真正赢下来的不是某一匹马，而是把人人看惯的顺序先打乱了一次。",
          },
          {
            speaker: "田忌",
            text: "若只盯着眼前这一局，我今日早在第一轮就乱了。可一旦把三轮连起来看，先让出去的那一步，反倒成了最值的一步。",
          },
        ],
      },
    ],
  },
};

function createTianjiHorseRaceAiRequestId() {
  return `tianji-horse-race-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTianjiHorseRacePlayableBase() {
  const playableContent = getEventPlayableContent(TIANJI_HORSE_RACE_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(TIANJI_HORSE_RACE_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("田忌赛马的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getTianjiHorseRaceViewpointProfile(
  viewpointId: SupportedTianjiHorseRaceViewpointId,
) {
  return tianjiHorseRaceViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: TianjiHorseRaceAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      TIANJI_HORSE_RACE_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createTianjiHorseRaceAiDebugInfo(
  config = getAiConfig(),
): TianjiHorseRaceAiDebugInfo {
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
      upstreamCallCount: 1,
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
  const profile = getTianjiHorseRaceViewpointProfile(
    TIANJI_HORSE_RACE_AI_DEFAULT_VIEWPOINT_ID,
  );

  return tianjiHorseRaceBeatBlueprints
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

function buildTianjiHorseRaceStoryPackagePrompt(
  request: TianjiHorseRaceAiStoryPackageRequest & {
    viewpointId: SupportedTianjiHorseRaceViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(TIANJI_HORSE_RACE_AI_EVENT_ID);
  const viewpoint = getTianjiHorseRaceViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "田忌赛马"}`,
    "这不是历史概述，不是兵法讲解，也不是策略课总结。",
    "这是田忌第一视角正在经历的一场赛马现场：赛前看出自己不占上风、听孙膑观察马匹、被要求换序、第一轮故意让出、后两轮逐渐反转，最后才真正明白顺序如何翻局。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "每一幕都必须围绕具体现场推进：赛马场边、看台、起跑、终点、场边人议论、齐王反应，以及田忌和孙膑之间一句接一句的判断。",
    "不要把“以弱胜强”写成抽象口号，也不要省掉三轮比赛过程。",
    "对话必须有来有回：田忌会迟疑、不安、逐步明白；孙膑会观察、提醒、点出关键，但不长篇说教。",
    "dialogue 只能是一名角色在说话；narration 只能是空 speaker 的第一视角观察与感受。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "脚本必须像一场完整的小型赛场现场，而不是人物观点列表。",
    "总 line 数量建议在 18 到 24 条之间，让三轮比赛都能清楚展开。",
    "三轮比赛必须明显可读：第一轮故意让出、第二轮反转、第三轮定局。",
    "田忌要有从怀疑到理解的过程，孙膑要用简短判断把顺序的关键推出来，场边反应可以少量出现增强现场感。",
    "固定 beat 顺序如下：",
    serializeBeatBlueprints(),
    "齐威王可以出场说话，但不要把他写成宏观点评员；场边人也只能少量出现，用来衬托气氛变化。",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredTianjiHorseRaceScriptPackage(params: {
  request: TianjiHorseRaceAiStoryPackageRequest & {
    viewpointId: SupportedTianjiHorseRaceViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: TianjiHorseRaceAiScriptPackage;
  debug: TianjiHorseRaceAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createTianjiHorseRaceAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildTianjiHorseRaceStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = tianjiHorseRaceBeatBlueprints.length;
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
          name: "tianji_horse_race_linear_script_package",
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
                enum: [TIANJI_HORSE_RACE_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...TIANJI_HORSE_RACE_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: tianjiHorseRaceBeatBlueprints.length,
                maxItems: tianjiHorseRaceBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: tianjiHorseRaceBeatBlueprints.map((beat) => beat.beatId),
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
    scriptPackage: JSON.parse(outputText) as TianjiHorseRaceAiScriptPackage,
    debug,
  };
}

function normalizeTianjiHorseRaceScriptLine(
  line: TianjiHorseRaceAiScriptLine,
): TianjiHorseRaceAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeTianjiHorseRaceScriptPackage(
  scriptPackage: TianjiHorseRaceAiScriptPackage,
): TianjiHorseRaceAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as TianjiHorseRaceBeatId,
      lines: beat.lines.map(normalizeTianjiHorseRaceScriptLine),
    })),
  };
}

function validateTianjiHorseRaceScriptPackage(
  scriptPackage: TianjiHorseRaceAiScriptPackage,
  viewpointId: SupportedTianjiHorseRaceViewpointId,
): TianjiHorseRaceScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== TIANJI_HORSE_RACE_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${TIANJI_HORSE_RACE_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== tianjiHorseRaceBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${tianjiHorseRaceBeatBlueprints.length}。`);
  }

  let narrationCount = 0;
  let tianjiDialogueCount = 0;
  let sunbinDialogueCount = 0;
  let crowdOrKingCount = 0;

  tianjiHorseRaceBeatBlueprints.forEach((blueprint, index) => {
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
        narrationCount += 1;
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (line.text.length < 28) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补一点赛场气氛或田忌判断。`,
          );
        }
        if (line.text.length > 110) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议再收紧一些。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 不在允许名单中：${line.speaker}`,
        );
      }
      if (line.speaker === "田忌") {
        tianjiDialogueCount += 1;
      }
      if (line.speaker === "孙膑") {
        sunbinDialogueCount += 1;
      }
      if (line.speaker === "齐王" || line.speaker === "场边人") {
        crowdOrKingCount += 1;
      }

      if (line.text.length < 14) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏短，容易像提纲。`,
        );
      }
      if (line.text.length > 68) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏长，建议再像赛场口语一些。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 16 || totalLines > 24) {
    warnings.push("总 line 数量偏离推荐范围 16-24。");
  }
  if (tianjiDialogueCount < 2) {
    warnings.push("田忌的直接发言偏少，建议再加强他从迟疑到明白的过程。");
  }
  if (sunbinDialogueCount < 2) {
    warnings.push("孙膑的关键提醒偏少，建议再加强他推动换序和稳住田忌的作用。");
  }
  if (crowdOrKingCount < 2) {
    warnings.push("场边或齐王的反应偏少，赛场气氛会显得不够鲜明。");
  }
  if (narrationCount > scriptPackage.beats.length) {
    warnings.push("旁白比重偏高，建议把更多推进交给田忌与孙膑的对话。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatTianjiHorseRaceScriptValidation(
  result: TianjiHorseRaceScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatTianjiHorseRaceWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }
  if (speaker === "田忌") {
    return {
      mode: "speaker",
      speakerId: "tianji",
      visualKey: "tianji",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    tianjiHorseRaceSpeakerVisualKeyMap[
      speaker as keyof typeof tianjiHorseRaceSpeakerVisualKeyMap
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

function adaptTianjiHorseRaceScriptPackageToPlayableContent(
  scriptPackage: TianjiHorseRaceAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getTianjiHorseRacePlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = tianjiHorseRaceBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        tianjiHorseRaceSpeakerVisualKeyMap[
          line.speaker as keyof typeof tianjiHorseRaceSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: tianjiHorseRaceAiBackdropMap[blueprint.backgroundTag],
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
    eventId: TIANJI_HORSE_RACE_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): TianjiHorseRaceAiScriptPackage {
  const profile = getTianjiHorseRaceViewpointProfile(
    TIANJI_HORSE_RACE_AI_DEFAULT_VIEWPOINT_ID,
  );

  return {
    packageId: "tianji-horse-race-fallback-tianji",
    storyId: "tianji-horse-race-tianji",
    protocolVersion: TIANJI_HORSE_RACE_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: TIANJI_HORSE_RACE_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isTianjiHorseRaceAiSupportedViewpoint(viewpointId)) {
    return getTianjiHorseRacePlayableBase();
  }

  return adaptTianjiHorseRaceScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isTianjiHorseRaceAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedTianjiHorseRaceViewpointId {
  return (TIANJI_HORSE_RACE_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(
    viewpointId,
  );
}

export function shouldUseTianjiHorseRaceAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || TIANJI_HORSE_RACE_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === TIANJI_HORSE_RACE_AI_EVENT_ID &&
    isTianjiHorseRaceAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getTianjiHorseRaceAiInitialViewpointId() {
  return TIANJI_HORSE_RACE_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateTianjiHorseRaceAiStoryPackage(
  params: TianjiHorseRaceAiStoryPackageRequest,
): Promise<TianjiHorseRaceAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== TIANJI_HORSE_RACE_AI_EVENT_ID ||
    !isTianjiHorseRaceAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持田忌赛马的田忌 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createTianjiHorseRaceAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredTianjiHorseRaceScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage =
      normalizeTianjiHorseRaceScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateTianjiHorseRaceScriptPackage(
      normalizedPackage,
      params.viewpointId,
    );
    debug.timings.validationMs = Number((performance.now() - validationStart).toFixed(1));

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));
      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 线性脚本结构不合法，已切回本地静态剧情。",
        error: formatTianjiHorseRaceScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptTianjiHorseRaceScriptPackageToPlayableContent(normalizedPackage);
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
      warning:
        validation.warnings.length > 0
          ? formatTianjiHorseRaceWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createTianjiHorseRaceAiDebugInfo(getAiConfig());
    const errorMessage = error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[tianji-horse-race-ai] linear script package request failed", {
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
