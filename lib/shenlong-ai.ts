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
  ShenlongAiScriptBeat,
  ShenlongAiScriptLine,
  ShenlongAiScriptPackage,
} from "@/types/content";

export const SHENLONG_AI_EVENT_ID = "shenlong-coup-eve";
export const SHENLONG_AI_DEFAULT_VIEWPOINT_ID = "wuzetian";
export const SHENLONG_AI_SUPPORTED_VIEWPOINT_IDS = ["wuzetian"] as const;

type SupportedShenlongViewpointId =
  (typeof SHENLONG_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const SHENLONG_AI_DEFAULT_MODEL = "Qwen3Flash";
const SHENLONG_AI_SCRIPT_PROTOCOL_VERSION =
  "shenlong-linear-script-v1" as const;

type ShenlongBeatId =
  | "sickbed-night"
  | "strange-report"
  | "guard-question"
  | "waner-enters"
  | "report-names"
  | "midnight-footsteps"
  | "attendant-talk"
  | "next-morning-sound"
  | "request-for-audience"
  | "dress-and-rise"
  | "doors-open"
  | "aftermath-whisper";

type ShenlongBeatBlueprint = {
  beatId: ShenlongBeatId;
  title: string;
  backgroundTag: keyof typeof shenlongAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type ShenlongViewpointProfile = {
  id: SupportedShenlongViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<ShenlongBeatId, string>;
  fallbackBeats: ShenlongAiScriptBeat[];
};

type ShenlongAiDebugInfo = {
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

export type ShenlongAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type ShenlongAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: ShenlongAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: ShenlongAiDebugInfo;
};

type ShenlongScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const shenlongAiBackdropMap = {
  "sickbed-night": {
    label: "夜殿",
    tone: "jade",
    description: "背景占位图：病榻边的低灯、药气与安静得过分的夜殿。",
    backgroundKey: "palace-night-chamber",
  },
  "inner-corridor": {
    label: "廊下",
    tone: "ink",
    description: "背景占位图：殿门外的回廊被夜色压住，脚步和低声传令忽远忽近。",
    backgroundKey: "palace-inner-corridor",
  },
  "report-table": {
    label: "奏报",
    tone: "amber",
    description: "背景占位图：烛火落在奏报上，几个名字比别的字更像自己浮出来。",
    backgroundKey: "palace-night-chamber",
  },
  "palace-dawn": {
    label: "清晨",
    tone: "amber",
    description: "背景占位图：第二天清晨，宫门外的传令和队伍声不再遮掩。",
    backgroundKey: "palace-gate-dawn",
  },
  "hall-threshold": {
    label: "启门",
    tone: "crimson",
    description: "背景占位图：殿门被推开时，晨光和来人的身影一起落进来。",
    backgroundKey: "palace-hall-threshold",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const shenlongSpeakerVisualKeyMap = {
  武则天: "wuzetian",
  上官婉儿: "shangguan-waner",
  近侍: "attendant",
  宫人: "messenger",
  来人: "visitor",
} as const;

const allowedSpeakerNames = [
  "武则天",
  "上官婉儿",
  "近侍",
  "宫人",
  "来人",
  "张柬之",
  "崔玄暐",
  "内侍",
] as const;

const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const shenlongBeatBlueprints: ShenlongBeatBlueprint[] = [
  {
    beatId: "sickbed-night",
    title: "病榻前的夜色",
    backgroundTag: "sickbed-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "strange-report",
    title: "宫人传来异样消息",
    backgroundTag: "sickbed-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "guard-question",
    title: "武则天追问殿外守卫",
    backgroundTag: "inner-corridor",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "waner-enters",
    title: "上官婉儿入殿",
    backgroundTag: "sickbed-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "report-names",
    title: "奏报里的名字",
    backgroundTag: "report-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "midnight-footsteps",
    title: "夜半殿外脚步声",
    backgroundTag: "inner-corridor",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "attendant-talk",
    title: "武则天与近侍短谈",
    backgroundTag: "sickbed-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "next-morning-sound",
    title: "第二天清晨，宫门外的动静变了",
    backgroundTag: "palace-dawn",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "request-for-audience",
    title: "有人请求入见",
    backgroundTag: "palace-dawn",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "dress-and-rise",
    title: "武则天整理仪容，准备面对来人",
    backgroundTag: "sickbed-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "doors-open",
    title: "门被推开",
    backgroundTag: "hall-threshold",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "aftermath-whisper",
    title: "余声收束",
    backgroundTag: "hall-threshold",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const shenlongViewpointProfiles: Record<
  SupportedShenlongViewpointId,
  ShenlongViewpointProfile
> = {
  wuzetian: {
    id: "wuzetian",
    displayName: "武则天",
    title: "病中女皇视角",
    narrationRule:
      "旁白只能写武则天第一视角的观察、疲惫、警觉和对权力变化的敏感，不写历史解说，不写上帝视角判断。",
    userGoal:
      "把武则天写成正在病中熬过一夜的人，她依旧清醒、威严、善于察觉宫中气息变化，但身体和精神都已能感到疲惫与逼近。",
    voiceNotes: [
      "清醒而警觉",
      "仍保留威严和压人气势",
      "病中疲惫不能写成软弱",
      "对人心与权力变化极敏感",
      "像正在经历现场，不像在回顾历史",
    ],
    beatGoals: {
      "sickbed-night":
        "先让武则天在病榻前感到夜色、药气、低灯和过分的安静，把现场立起来，不要一开始就概括政治局势。",
      "strange-report":
        "通过宫人回话把异样带进殿内，让武则天先从细节听出不对，而不是直接知道政变已经到来。",
      "guard-question":
        "让武则天主动追问守卫调动，用含糊的答话体现局势已经有人不敢说明白。",
      "waner-enters":
        "把上官婉儿写成谨慎入殿的人，她带来消息，却仍在衡量每个字该怎么说。",
      "report-names":
        "通过奏报和名字让武则天意识到这不是普通政务，重点是她在看到名字时如何立刻想通其中的意味。",
      "midnight-footsteps":
        "把夜半殿外越来越近的脚步声、甲叶声和传令声写得具体，让压迫感变强。",
      "attendant-talk":
        "让武则天和近侍短谈，重点不是讲大道理，而是借迟疑、沉默和不敢担保来体现人心正在移动。",
      "next-morning-sound":
        "必须明确写出“第二天清晨”或同等明确时间转换，让夜里和清晨之间的变化被看见。",
      "request-for-audience":
        "让殿外请求入见的口气表面仍恭敬，但气氛已明显不同，像礼数还在，实权却已经逼到门口。",
      "dress-and-rise":
        "写武则天意识到避不开后整理仪容、扶身而起的细节，让她的威严和身体疲惫同时成立。",
      "doors-open":
        "把殿门打开写成具体瞬间，让昨夜那些零碎异常在这一刻连成线，不要抽象概括。",
      "aftermath-whisper":
        "收束时仍停留在现场余味里，只让武则天意识到昨夜诸般细节已经连成一条线，不要写成宏大历史总结。",
    },
    fallbackBeats: [
      {
        beatId: "sickbed-night",
        lines: [
          {
            speaker: "",
            text: "夜灯压得很低，药气还浮在帷帐里。朕明明病得困乏，却偏偏一直醒着，总觉得这宫里安静得不像平日。",
          },
          {
            speaker: "",
            text: "越是听不见多余动静，心里越知道事情没那么简单。真正先压上来的，从来不是一句坏消息，而是空气里那点不肯说透的异样。",
          },
        ],
      },
      {
        beatId: "strange-report",
        lines: [
          {
            speaker: "宫人",
            text: "陛下，外头换值比平时迟了些。奴婢听见殿外几次传令，却没人敢高声说清到底是哪边的人在安排。",
          },
          {
            speaker: "",
            text: "她跪得很低，声音压得更低。朕听得出来，她不是不知道，只是不敢替门外那层动静先说出一个名字。",
          },
        ],
      },
      {
        beatId: "guard-question",
        lines: [
          {
            speaker: "武则天",
            text: "谁调了守卫？朕病在这里，门外的人换了几拨，竟没有一人先来给朕一句明白话。",
          },
          {
            speaker: "近侍",
            text: "回陛下，外头说是照常轮值，只是夜里传令的人多，奴婢一时也不敢乱认到底是谁在作主。",
          },
        ],
      },
      {
        beatId: "waner-enters",
        lines: [
          {
            speaker: "上官婉儿",
            text: "今夜递进来的不是常例奏报，臣不敢先替陛下断，只能先送到榻前，请陛下亲自过目。",
          },
          {
            speaker: "",
            text: "她说得谨慎，连把奏报递过来的动作都放得极轻。越是这样，越说明她已经看见了什么，却还不肯先替朕点破。",
          },
        ],
      },
      {
        beatId: "report-names",
        lines: [
          {
            speaker: "",
            text: "烛火压在纸边，张柬之、崔玄暐几个名字一并落进朕眼里。那些字不像寻常奏报里的名单，更像是从几处地方同时朝一处聚拢。",
          },
          {
            speaker: "武则天",
            text: "这些名字同夜出现在朕榻前，不会只是碰巧。若只是政务，他们不会挑在这样的时辰一齐浮上来。",
          },
        ],
      },
      {
        beatId: "midnight-footsteps",
        lines: [
          {
            speaker: "",
            text: "夜更深了，殿外却没有静下去。脚步声里夹进甲叶轻碰的细响，像有人还想守着礼数，却也不再打算把行迹完全藏住。",
          },
          {
            speaker: "",
            text: "朕听着那动静一点点靠近，心里反而越发清醒。昨夜最先变的，原来不是人心，而是门外那层谁都不肯明说的秩序。",
          },
        ],
      },
      {
        beatId: "attendant-talk",
        lines: [
          {
            speaker: "武则天",
            text: "告诉朕，到了这会儿，宫里还有多少人肯照旧听命？不要拿空话安朕，朕要听实情。",
          },
          {
            speaker: "近侍",
            text: "人心未必全散，只是今夜外头传令太密，奴婢不敢替谁担保。他们不是不听，只像都在等，看晨里第一道门会先朝谁开。",
          },
        ],
      },
      {
        beatId: "next-morning-sound",
        lines: [
          {
            speaker: "",
            text: "第二天清晨，朕几乎还没真正睡过去，殿外的动静已经换了样。传令声、整队声、靴底压过石地的声音，一层层从宫门那边推过来。",
          },
          {
            speaker: "",
            text: "夜里的猜测到这时已经不必再猜。有人正在把昨夜那点暗流摆到白天里，而且不打算再给朕装作不知道的余地。",
          },
        ],
      },
      {
        beatId: "request-for-audience",
        lines: [
          {
            speaker: "来人",
            text: "陛下，外臣奉名请入殿面奏。所陈之事关系重大，不敢再候，请陛下准许。",
          },
          {
            speaker: "",
            text: "口气还是恭敬的，礼数也一样没少，可朕听得出来，这份恭敬里已经多了不容回避的硬度。",
          },
        ],
      },
      {
        beatId: "dress-and-rise",
        lines: [
          {
            speaker: "武则天",
            text: "扶朕起来，整衣冠。昨夜那些不肯说明白的话，到此刻已经不用别人替朕解释了。",
          },
          {
            speaker: "",
            text: "身子一动，病意便更重些，可朕知道这时候躺着反而更像退了。门外既然已经推到眼前，朕就得让他们看见朕是坐着等他们来的。",
          },
        ],
      },
      {
        beatId: "doors-open",
        lines: [
          {
            speaker: "",
            text: "门被推开的那一下，晨光和人影一起落进殿里。昨夜那些零碎异常终于全都接上了，谁在等、谁在拖、谁已经另换了主意，到此刻都不再只是猜测。",
          },
          {
            speaker: "来人",
            text: "臣等入见，请陛下听奏。",
          },
        ],
      },
      {
        beatId: "aftermath-whisper",
        lines: [
          {
            speaker: "",
            text: "朕忽然明白，真正改变局势的从来不是眼前这一声通传，而是昨夜每一道脚步、每一封奏报、每一个迟疑的人早已把路慢慢铺到了这里。",
          },
          {
            speaker: "",
            text: "等门被推开时，昨夜那些细微异常已经全连成了一条线。事情不是在这一刻才开始，只是在这一刻，再也没人能替它遮住了。",
          },
        ],
      },
    ],
  },
};

function getShenlongPlayableBase() {
  const playableContent = getEventPlayableContent(SHENLONG_AI_EVENT_ID);

  if (!playableContent) {
    throw new Error("Missing shenlong playable content.");
  }

  return playableContent;
}

function getShenlongAiViewpoint(
  viewpointId: SupportedShenlongViewpointId,
): EventViewpoint {
  const playableContent = getShenlongPlayableBase();
  const viewpoint = playableContent.viewpoints.find(
    (item) => item.id === viewpointId,
  );

  if (!viewpoint) {
    throw new Error(`Missing shenlong viewpoint: ${viewpointId}`);
  }

  return viewpoint;
}

function getShenlongViewpointProfile(
  viewpointId: SupportedShenlongViewpointId,
) {
  return shenlongViewpointProfiles[viewpointId];
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function createShenlongAiRequestId() {
  return `shenlong-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: ShenlongAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      SHENLONG_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createShenlongAiDebugInfo(
  config = getAiConfig(),
): ShenlongAiDebugInfo {
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
  const profile = getShenlongViewpointProfile(SHENLONG_AI_DEFAULT_VIEWPOINT_ID);

  return shenlongBeatBlueprints
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

function buildShenlongStoryPackagePrompt(
  params: ShenlongAiStoryPackageRequest & {
    viewpointId: SupportedShenlongViewpointId;
  },
) {
  const viewpoint = getShenlongAiViewpoint(params.viewpointId);
  const eventItem = getHistoricalEvent(SHENLONG_AI_EVENT_ID);
  const profile = getShenlongViewpointProfile(params.viewpointId);

  if (!eventItem) {
    throw new Error("Missing shenlong event.");
  }

  const systemPrompt = [
    "You generate one fixed-route script package for a Chinese historical AVG experience.",
    "Output only strict JSON that follows the provided schema.",
    "Write all text in Simplified Chinese.",
    "Do not output layout, UI, CSS, file paths, asset filenames, branching choices, nextSceneId, backgroundTag, standeeKey, or state variables.",
    `The event is ${eventItem.title} and the fixed first-person viewpoint is ${profile.displayName}.`,
    "This is not a macro history summary. It must feel like the viewpoint is living through a concrete stretch of one unusual night and the next morning.",
    "Each beat must stay concrete: where the character is, who enters, what is reported, what sound is heard, what is noticed, and how the pressure moves closer.",
    "If time moves from night to the next morning, the text must explicitly say so with wording like “第二天清晨”. Do not jump time silently.",
    "Keep the tone tense, restrained, readable, and story-like for general users.",
    "Supporting historical figures may appear in dialogue, but only from the allowed speaker list.",
    "Narration rules:",
    "- narration uses empty speaker.",
    `- ${profile.narrationRule}`,
    "- narration should be short but complete, with atmosphere, action, and inner judgment, not abstract political commentary.",
    "- no quoted dialogue inside narration.",
    "- a natural target is around 35 to 90 Chinese characters per narration line.",
    "Dialogue rules:",
    "- each line contains only one speaker talking.",
    "- dialogue must sound like a complete line a person would really say in the moment.",
    "- no encyclopedia summary, no thesis language, no abstract political slogans.",
    "- a natural target is around 18 to 52 Chinese characters per line.",
    "- if a speaker needs more words, split into multiple short lines.",
    `Allowed dialogue speakers are only ${allowedSpeakerNames.join("、")}。`,
    "Story rhythm rules:",
    "- return all beats in the fixed order exactly once.",
    "- let the pressure move inward scene by scene, not by abstract summary.",
    "- avoid repetitive sentence openings and repeated template phrases.",
    "- the final result should read like a compact palace-night historical novella, not a history article.",
    `The viewpoint should keep these traits: ${profile.voiceNotes.join("、")}。`,
  ].join("\n");

  const userPrompt = [
    `Event title: ${eventItem.title}`,
    `Event summary: ${eventItem.description}`,
    `Fixed viewpoint: ${viewpoint.name}`,
    `Viewpoint role: ${viewpoint.title}`,
    `Viewpoint note: ${viewpoint.summary}`,
    `Story goal: ${profile.userGoal}`,
    `Required protocolVersion: ${SHENLONG_AI_SCRIPT_PROTOCOL_VERSION}`,
    `Required viewpointId: ${params.viewpointId}`,
    `Required beat plan:\n${serializeBeatBlueprints()}`,
    `Client trigger source: ${params.triggerSource ?? "initial"}`,
    "The program controls background switches, standee rules, scene progression, and ending locally.",
    "Do not omit any beat.",
    "Do not turn the experience into a macro explanation of the Shenlong Coup. Keep it inside the room, the corridor, the reports, the footsteps, and the approaching morning.",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredShenlongScriptPackage(params: {
  request: ShenlongAiStoryPackageRequest & {
    viewpointId: SupportedShenlongViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: ShenlongAiScriptPackage;
  debug: ShenlongAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createShenlongAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildShenlongStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = shenlongBeatBlueprints.length;
  debug.metrics.triggerSource = params.request.triggerSource;
  debug.timings.promptBuildMs = Number(
    (performance.now() - promptStart).toFixed(1),
  );

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
          name: "shenlong_linear_script_package",
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
                enum: [SHENLONG_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...SHENLONG_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: shenlongBeatBlueprints.length,
                maxItems: shenlongBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: shenlongBeatBlueprints.map((beat) => beat.beatId),
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
      `Upstream request failed with status ${response.status} ${response.statusText}. Body: ${
        upstreamBody || "(empty body)"
      }`,
    );
  }

  debug.timings.upstreamRequestMs = Number(
    (performance.now() - upstreamStart).toFixed(1),
  );
  const extractStart = performance.now();
  const payload = (await response.json()) as unknown;
  const outputText = extractResponseText(payload);

  if (!outputText) {
    throw new Error("AI 结构化输出为空。");
  }

  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number(
    (performance.now() - extractStart).toFixed(1),
  );

  return {
    scriptPackage: JSON.parse(outputText) as ShenlongAiScriptPackage,
    debug,
  };
}

function normalizeShenlongScriptLine(
  line: ShenlongAiScriptLine,
): ShenlongAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: normalizeText(line.text),
  };
}

function normalizeShenlongScriptPackage(
  scriptPackage: ShenlongAiScriptPackage,
): ShenlongAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as ShenlongBeatId,
      lines: beat.lines.map(normalizeShenlongScriptLine),
    })),
  };
}

function validateShenlongScriptPackage(
  scriptPackage: ShenlongAiScriptPackage,
  viewpointId: SupportedShenlongViewpointId,
): ShenlongScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== SHENLONG_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${SHENLONG_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== shenlongBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${shenlongBeatBlueprints.length}。`);
  }

  shenlongBeatBlueprints.forEach((blueprint, index) => {
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
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 text 不能为空。`,
        );
        return;
      }

      if (!line.speaker) {
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (quotePattern.test(line.text)) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白里出现了引号对白，建议改成纯第一视角叙述。`,
          );
        }
        if (line.text.length < 28) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点场景感或心理感。`,
          );
        }
        if (line.text.length > 110) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议拆成两条更像 AVG 的短幕。`,
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
      if (line.text.length > 64) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏长，建议拆成两条短 line。`,
        );
      }
      if (quotePattern.test(line.text)) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 内嵌了引号，建议改得更自然。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.length,
    0,
  );
  if (totalLines < 22 || totalLines > 32) {
    warnings.push("总 line 数量偏离推荐范围 22-32。");
  }

  const nextMorningBeat = scriptPackage.beats.find(
    (beat) => beat.beatId === "next-morning-sound",
  );
  if (
    nextMorningBeat &&
    !nextMorningBeat.lines.some((line) => line.text.includes("第二天清晨"))
  ) {
    warnings.push("时间跳转 beat 没有明确写出“第二天清晨”，建议补足时间变化。");
  }

  const wuzetianDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) =>
      sum + beat.lines.filter((line) => line.speaker === "武则天").length,
    0,
  );
  if (wuzetianDialogueCount === 0) {
    warnings.push("当前脚本里武则天没有明确发言，建议至少保留两条能体现威严与判断的对白。");
  } else if (wuzetianDialogueCount < 2) {
    warnings.push("武则天当前发言偏少，建议再补一两条更能体现她位置与压力的对白。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatShenlongScriptValidation(
  result: ShenlongScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatShenlongWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }

  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (speaker !== "武则天") {
    return {
      mode: "hidden",
    };
  }

  return {
    mode: "speaker",
    speakerId: "wuzetian",
    visualKey: "wuzetian",
    hideForViewpoint: true,
  };
}

function adaptShenlongScriptPackageToPlayableContent(
  scriptPackage: ShenlongAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getShenlongPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = shenlongBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        shenlongSpeakerVisualKeyMap[
          line.speaker as keyof typeof shenlongSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: shenlongAiBackdropMap[blueprint.backgroundTag],
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
    eventId: SHENLONG_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): ShenlongAiScriptPackage {
  const profile = getShenlongViewpointProfile(SHENLONG_AI_DEFAULT_VIEWPOINT_ID);

  return {
    packageId: "shenlong-fallback-wuzetian",
    storyId: "shenlong-coup-eve-wuzetian",
    protocolVersion: SHENLONG_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: SHENLONG_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isShenlongAiSupportedViewpoint(viewpointId)) {
    return getShenlongPlayableBase();
  }

  return adaptShenlongScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isShenlongAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedShenlongViewpointId {
  return (
    SHENLONG_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]
  ).includes(viewpointId);
}

export function shouldUseShenlongAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || SHENLONG_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === SHENLONG_AI_EVENT_ID &&
    isShenlongAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getShenlongAiInitialViewpointId() {
  return SHENLONG_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateShenlongAiStoryPackage(
  params: ShenlongAiStoryPackageRequest,
): Promise<ShenlongAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== SHENLONG_AI_EVENT_ID ||
    !isShenlongAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持神龙政变前夜的武则天 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createShenlongAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredShenlongScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage = normalizeShenlongScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateShenlongScriptPackage(
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
        error: formatShenlongScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptShenlongScriptPackageToPlayableContent(normalizedPackage);
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
          ? formatShenlongWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createShenlongAiDebugInfo(getAiConfig());
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

    console.error("[shenlong-ai] linear script package request failed", {
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
