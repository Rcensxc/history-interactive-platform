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
  RedCliffsAiScriptBeat,
  RedCliffsAiScriptLine,
  RedCliffsAiScriptPackage,
} from "@/types/content";

export const RED_CLIFFS_AI_EVENT_ID = "battle-of-red-cliffs";
export const RED_CLIFFS_AI_DEFAULT_VIEWPOINT_ID = "zhuge-liang";
export const RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS = [
  "zhuge-liang",
  "zhouyu",
  "huang-gai",
] as const;

type SupportedRedCliffsViewpointId =
  (typeof RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS)[number];

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
  backgroundTag: keyof typeof redCliffsAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type RedCliffsViewpointProfile = {
  id: SupportedRedCliffsViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  beatGoals: Record<RedCliffsBeatId, string>;
  fallbackBeats: RedCliffsAiScriptBeat[];
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
    description:
      "背景占位图：江面夜色未动，真正的紧张感压在风向、判断与联盟默契里。",
  },
  "command-tent": {
    label: "联营",
    tone: "ink",
    description:
      "背景占位图：军帐、烛火与沙盘同处一室，所有部署都在等待同一个时机。",
  },
  "strategy-table": {
    label: "谋局",
    tone: "amber",
    description:
      "背景占位图：军图摊开，风向、军心和火攻路径都被摆在一张案上。",
  },
  "departure-dock": {
    label: "江岸",
    tone: "crimson",
    description:
      "背景占位图：登船前的江岸安静得过分，真正危险的那一步已经逼到眼前。",
  },
  "embers-aftermath": {
    label: "火光",
    tone: "amber",
    description:
      "背景占位图：火势已起，真正值得回看的却是火起之前那一连串判断。",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const redCliffsSpeakerNameMap: Record<SupportedRedCliffsViewpointId, string> = {
  "zhuge-liang": "诸葛亮",
  zhouyu: "周瑜",
  "huang-gai": "黄盖",
};

const redCliffsSpeakerVisualKeyMap = {
  周瑜: "zhouyu",
  诸葛亮: "zhuge-liang",
  黄盖: "huang-gai",
} as const;

const redCliffsBeatBlueprints: RedCliffsBeatBlueprint[] = [
  {
    beatId: "river-watch",
    title: "江面观察",
    backgroundTag: "river-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "alliance-briefing",
    title: "联盟定调",
    backgroundTag: "command-tent",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "timing-pressure",
    title: "时机压力",
    backgroundTag: "strategy-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "huang-gai-commitment",
    title: "黄盖请命",
    backgroundTag: "departure-dock",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "launch",
    title: "临发一刻",
    backgroundTag: "departure-dock",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
  },
  {
    beatId: "aftermath",
    title: "火后收束",
    backgroundTag: "embers-aftermath",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
  },
];

const redCliffsViewpointProfiles: Record<
  SupportedRedCliffsViewpointId,
  RedCliffsViewpointProfile
> = {
  "zhuge-liang": {
    id: "zhuge-liang",
    displayName: "诸葛亮",
    title: "联盟谋臣视角",
    narrationRule:
      "旁白只能写诸葛亮第一视角的观察、判断和对联盟节奏的把握，不写旁观者总结。",
    userGoal:
      "突出诸葛亮如何在联盟关系、时机判断和整体布局之间稳住局面。",
    beatGoals: {
      "river-watch": "先写出诸葛亮在江面夜色中的判断感，重点是风向未定时的压迫感。",
      "alliance-briefing": "让诸葛亮和周瑜围绕联盟节奏与判断方式展开克制对话。",
      "timing-pressure": "把诸葛亮最看重的时机与默契讲清楚，不要写成炫技式奇谋。",
      "huang-gai-commitment":
        "让诸葛亮从旁判断黄盖请命的风险和必要性，保持冷静而清楚的视角差异。",
      launch: "写出诸葛亮在真正动手前如何把所有判断重新压成一个答案。",
      aftermath: "收束时强调诸葛亮对这场胜负真正转折点的理解，而不是简单庆功。",
    },
    fallbackBeats: [
      {
        beatId: "river-watch",
        lines: [
          {
            speaker: "",
            text: "江面一时还很安静，可真正让人无法松气的，不是今夜会不会开战，而是所有判断能不能在同一刻落稳。",
          },
          {
            speaker: "",
            text: "我看着水面与船影，只觉得这一仗最难的地方从来不在火起之后，而在火起之前谁先把节奏算准。",
          },
        ],
      },
      {
        beatId: "alliance-briefing",
        lines: [
          {
            speaker: "周瑜",
            text: "曹军越觉得自己稳，我们越不能急。真正要抓的，是他最松却还没觉出危险已近的那一刻。",
          },
          {
            speaker: "诸葛亮",
            text: "只要联盟里每一步都能按时落下，这场火就不是侥幸，而是顺势推成的结果。",
          },
        ],
      },
      {
        beatId: "timing-pressure",
        lines: [
          {
            speaker: "",
            text: "我知道眼下最怕的不是没有计策，而是有人早一步，有人慢一步，最后把原本能成的局自己拉散。",
          },
          {
            speaker: "诸葛亮",
            text: "风向只是一个信号，真正要对齐的，是军心、信任和出手的顺序。",
          },
        ],
      },
      {
        beatId: "huang-gai-commitment",
        lines: [
          {
            speaker: "黄盖",
            text: "若没人把这一步做得像真的，曹军就不会真把门打开。到最后，总得有人先压上去。",
          },
          {
            speaker: "",
            text: "我看着他把最危险的话说得平稳，心里更清楚，真正的火攻从来不只是点火，而是谁肯先把自己放进局里。",
          },
        ],
      },
      {
        beatId: "launch",
        lines: [
          {
            speaker: "",
            text: "江风终于转了。我没有再多说，只把先前所有分散的判断重新压成一个答案：现在，必须动。",
          },
          {
            speaker: "周瑜",
            text: "到这里，犹豫反而最伤局。既然都已落位，就让这一步直直压过去。",
          },
        ],
      },
      {
        beatId: "aftermath",
        lines: [
          {
            speaker: "",
            text: "火光照亮江面时，我反而更清楚地看见，赤壁真正的胜负，其实早在火起之前就已经慢慢定下来了。",
          },
          {
            speaker: "诸葛亮",
            text: "真正难的从来不是点燃那一刻，而是让所有人都在那一刻之前相信，值得一起押上去。",
          },
        ],
      },
    ],
  },
  zhouyu: {
    id: "zhouyu",
    displayName: "周瑜",
    title: "联军主帅视角",
    narrationRule:
      "旁白只能写周瑜第一视角对军心、联盟和战场节奏的判断，不写旁观式解说。",
    userGoal:
      "突出周瑜作为主导者，如何把联盟、军心和战术都压到同一节拍上。",
    beatGoals: {
      "river-watch": "先写周瑜如何观察夜色、风向与全军气息，突出主导者对节奏的敏感。",
      "alliance-briefing": "让周瑜主导定调，诸葛亮回应，体现统帅与谋臣的差异。",
      "timing-pressure": "把周瑜最在意的军心、执行与时机压力讲清楚。",
      "huang-gai-commitment":
        "让周瑜从主帅角度衡量黄盖请命的风险与必要性，体现他必须拍板的压力。",
      launch: "写周瑜在真正下令前的最后收束感，不要写成泛泛而谈。",
      aftermath: "收束时强调周瑜看到的不是火势本身，而是联军终于被他压到同一拍上。",
    },
    fallbackBeats: [
      {
        beatId: "river-watch",
        lines: [
          {
            speaker: "",
            text: "夜色压在江面上，四下都很安静。我最在意的不是眼前有多少船，而是整支联军能不能在同一刻听懂我的命令。",
          },
          {
            speaker: "",
            text: "这一仗真要打成，靠的不会是哪一句豪言，而是所有该落下去的环节都得在同一拍上落稳。",
          },
        ],
      },
      {
        beatId: "alliance-briefing",
        lines: [
          {
            speaker: "周瑜",
            text: "曹军自恃兵多，心就会先松。只要我们把节奏握住，他们以为稳的地方，反而最容易先裂开。",
          },
          {
            speaker: "诸葛亮",
            text: "主将若能把全局压稳，后面的每一步就不再是冒进，而是顺势推进。",
          },
        ],
      },
      {
        beatId: "timing-pressure",
        lines: [
          {
            speaker: "",
            text: "我最怕的不是敌军太强，而是自己人有人快一步、有人慢一步，最后让一场本可成的布局被节奏拖散。",
          },
          {
            speaker: "周瑜",
            text: "风向要等，军心也要等。不到所有人都能同时动的那一刻，这一把火就不能先点。",
          },
        ],
      },
      {
        beatId: "huang-gai-commitment",
        lines: [
          {
            speaker: "黄盖",
            text: "若这一步总要有人去做，那就让我去。只要我演得足够真，曹军就会把破口自己打开。",
          },
          {
            speaker: "周瑜",
            text: "一旦走出去，就没有回头的余地。我要的不只是你敢去，而是你能把这一险步稳稳做成。",
          },
        ],
      },
      {
        beatId: "launch",
        lines: [
          {
            speaker: "",
            text: "等了整夜的风终于转过来。我知道自己不能再多犹豫半分，此时若不把全军一口气压出去，前面的判断都会白费。",
          },
          {
            speaker: "周瑜",
            text: "既然时机到了，就让这一步落到底。真正的统帅，不该在最后一刻自己先松手。",
          },
        ],
      },
      {
        beatId: "aftermath",
        lines: [
          {
            speaker: "",
            text: "火势照亮江面时，我反而更清楚，这一战真正决定胜负的，不是火本身，而是我能不能先把联军压成一个整体。",
          },
          {
            speaker: "周瑜",
            text: "若每个人都还在各打各的算盘，再好的计策也只会散在风里。今晚最难的，是先把人心拧到一起。",
          },
        ],
      },
    ],
  },
  "huang-gai": {
    id: "huang-gai",
    displayName: "黄盖",
    title: "火攻执行者视角",
    narrationRule:
      "旁白只能写黄盖第一视角的感受、判断和执行压力，不写外部总结。",
    userGoal:
      "突出黄盖如何把最危险的一步当成必须完成的任务，重点写执行者视角的心理压力。",
    beatGoals: {
      "river-watch": "先写黄盖如何感受夜色、风势与行动前的压抑，突出执行者对风险的直觉。",
      "alliance-briefing": "让黄盖身在局中听见主将与谋臣定调，感到这份安排最终会落到自己身上。",
      "timing-pressure": "把黄盖对时机和破绽的警惕写清楚，强调一步失手会让整场火攻崩掉。",
      "huang-gai-commitment":
        "让黄盖真正接下这一步，展现他如何把赴险说得平稳而坚定。",
      launch: "写黄盖在临行前把自己压住的那一刻，不要写成抒情散文。",
      aftermath: "收束时强调黄盖回看这场火攻时，对执行与承担的理解。",
    },
    fallbackBeats: [
      {
        beatId: "river-watch",
        lines: [
          {
            speaker: "",
            text: "江面很静，可我心里一点也松不下来。真正让我警惕的，不是曹军会不会察觉，而是自己有没有把每一个细节都撑到最后。",
          },
          {
            speaker: "",
            text: "这类局最怕的从来不是没人敢谋，而是轮到执行时，先有人在最后一刻露了怯。",
          },
        ],
      },
      {
        beatId: "alliance-briefing",
        lines: [
          {
            speaker: "周瑜",
            text: "联盟和战术我来压，真正要命的一环，是谁能把最险的一步做得像真的。",
          },
          {
            speaker: "",
            text: "我站在帐中听着这些话，心里明白，这一仗最后总会有人把自己先放上桌面，而那个人多半就是我。",
          },
        ],
      },
      {
        beatId: "timing-pressure",
        lines: [
          {
            speaker: "",
            text: "对我来说，时机不是一句话，而是每一个动作都不能多也不能少。只要露出一点不对，曹军就不会真信。",
          },
          {
            speaker: "黄盖",
            text: "既然要骗过对面，就得先骗过所有盯着我的人。越到这时候，越不能让人看出我心里有半分迟疑。",
          },
        ],
      },
      {
        beatId: "huang-gai-commitment",
        lines: [
          {
            speaker: "黄盖",
            text: "若这一步必须有人去走，那就让我去。火攻要成，先得让别人真以为我已经被逼到绝路。",
          },
          {
            speaker: "周瑜",
            text: "这一步一旦压上去，就只能往前。你若肯担，我就把后面的局都替你接稳。",
          },
        ],
      },
      {
        beatId: "launch",
        lines: [
          {
            speaker: "",
            text: "真正上船前，我反而冷静下来了。前面的筹谋再多，到最后都只剩一件事：我得把这一险步替所有人走到底。",
          },
          {
            speaker: "黄盖",
            text: "若我在这时候先乱了，那整场火攻就只是纸上的好看话。既然已经入局，就不能给自己留退路。",
          },
        ],
      },
      {
        beatId: "aftermath",
        lines: [
          {
            speaker: "",
            text: "火光起时，我没有先想到胜负，只想到那一步终于撑过去了。原来所谓大局，很多时候也只是有人肯先把命押上去。",
          },
          {
            speaker: "黄盖",
            text: "计策再好，也总得有人真的去做。若没人肯把最险的一步走完，再周全的布局也只是摆在案上的话。",
          },
        ],
      },
    ],
  },
};

const allowedSpeakerNames = Object.values(redCliffsSpeakerNameMap);

function isRedCliffsAiSupportedViewpoint(
  viewpointId?: string,
): viewpointId is SupportedRedCliffsViewpointId {
  return RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS.includes(
    viewpointId as SupportedRedCliffsViewpointId,
  );
}

function getRedCliffsPlayableBase(): EventPlayableContent {
  const playableContent = getEventPlayableContent(RED_CLIFFS_AI_EVENT_ID);
  if (!playableContent) {
    throw new Error("Missing red cliffs playable content.");
  }

  return playableContent;
}

function getRedCliffsAiViewpoint(
  viewpointId: SupportedRedCliffsViewpointId,
): EventViewpoint {
  const viewpoint = getRedCliffsPlayableBase().viewpoints.find(
    (item) => item.id === viewpointId,
  );

  if (!viewpoint) {
    throw new Error(`Missing red cliffs AI viewpoint: ${viewpointId}.`);
  }

  return viewpoint;
}

function getRedCliffsViewpointProfile(
  viewpointId: SupportedRedCliffsViewpointId,
) {
  return redCliffsViewpointProfiles[viewpointId];
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

function serializeBeatBlueprints(
  viewpointId: SupportedRedCliffsViewpointId,
) {
  const profile = getRedCliffsViewpointProfile(viewpointId);

  return redCliffsBeatBlueprints
    .map((beat) =>
      [
        `- beatId=${beat.beatId}`,
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

function buildRedCliffsStoryPackagePrompt(
  params: RedCliffsAiStoryPackageRequest & {
    viewpointId: SupportedRedCliffsViewpointId;
  },
) {
  const viewpoint = getRedCliffsAiViewpoint(params.viewpointId);
  const eventItem = getHistoricalEvent(RED_CLIFFS_AI_EVENT_ID);
  const profile = getRedCliffsViewpointProfile(params.viewpointId);

  if (!eventItem) {
    throw new Error("Missing red cliffs event.");
  }

  const systemPrompt = [
    "You generate one fixed-route script package for a Chinese historical AVG experience.",
    "Output only strict JSON that follows the provided schema.",
    "Write all text in Simplified Chinese.",
    "Do not output layout, UI, CSS, camera language, file paths, asset filenames, choices, nextSceneId, backgroundTag, standeeKey, or state updates.",
    `The event is ${eventItem.title} and the fixed first-person viewpoint is ${profile.displayName}.`,
    "This is a single linear route with no player branching.",
    "Keep the tone tense, restrained, natural, and readable for general users.",
    "Narration rules:",
    "- narration uses empty speaker.",
    `- ${profile.narrationRule}`,
    "- no quoted dialogue in narration.",
    "- each narration line should be short but complete, not a fragment.",
    "- a natural target is around 35 to 80 Chinese characters.",
    "Dialogue rules:",
    "- each line contains only one speaker talking.",
    "- no narration, no action description, no crowd reaction, no third-person summary.",
    "- dialogue should sound like one complete spoken sentence or two short linked sentences.",
    "- a natural target is around 18 to 45 Chinese characters.",
    "- if a speaker needs more words, split into multiple short lines.",
    `Characters allowed to speak are only ${allowedSpeakerNames.join("、")}。`,
    "Return all beats in the fixed order exactly once.",
  ].join("\n");

  const userPrompt = [
    `Event title: ${eventItem.title}`,
    `Event summary: ${eventItem.description}`,
    `Fixed viewpoint: ${viewpoint.name}`,
    `Viewpoint role: ${viewpoint.title}`,
    `Viewpoint note: ${viewpoint.summary}`,
    `Story goal: ${profile.userGoal}`,
    `Required protocolVersion: ${RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION}`,
    `Required viewpointId: ${params.viewpointId}`,
    `Required beat plan:\n${serializeBeatBlueprints(params.viewpointId)}`,
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
  request: RedCliffsAiStoryPackageRequest & {
    viewpointId: SupportedRedCliffsViewpointId;
  };
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
  const { systemPrompt, userPrompt } = buildRedCliffsStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = redCliffsBeatBlueprints.length;
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
              viewpointId: {
                type: "string",
                enum: [...RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS],
              },
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
    throw new Error("OpenAI returned empty structured output.");
  }

  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number(
    (performance.now() - extractStart).toFixed(1),
  );

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
  viewpointId: SupportedRedCliffsViewpointId,
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
    errors.push(
      `protocolVersion 必须是 ${RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
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
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 text 不能为空。`,
        );
      }

      if (!line.speaker) {
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (quotePattern.test(line.text)) {
          errors.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白不能出现引号对白。`,
          );
        }
        if (line.text.length > 90 || line.text.split("\n").length > 3) {
          errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白需要更短。`);
        }
        if (line.text.length < 24) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点局势感或心理感。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNames.includes(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 只能是 ${allowedSpeakerNames.join(" / ")}。`,
        );
      }
      if (line.text.includes("\n")) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 不能换行。`,
        );
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
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 不要嵌套引号。`,
        );
      }
      if (dialogueNarrationPattern.test(line.text)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 混入了旁白或环境叙述。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.length,
    0,
  );
  if (totalLines < 10 || totalLines > 16) {
    warnings.push("总 line 数量偏离推荐范围 10-16。");
  }

  const selectedSpeakerName = redCliffsSpeakerNameMap[viewpointId];
  const hasSelectedViewpointDialogue = scriptPackage.beats.some((beat) =>
    beat.lines.some((line) => line.speaker === selectedSpeakerName),
  );
  if (!hasSelectedViewpointDialogue) {
    warnings.push(
      `当前脚本里 ${selectedSpeakerName} 还没有明确发言，建议至少保留一到两条体现视角差异的对白。`,
    );
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
    redCliffsSpeakerVisualKeyMap[
      speaker as keyof typeof redCliffsSpeakerVisualKeyMap
    ];

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
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
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
    contentSource,
    eventId: RED_CLIFFS_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(
  viewpointId: SupportedRedCliffsViewpointId,
): RedCliffsAiScriptPackage {
  const profile = getRedCliffsViewpointProfile(viewpointId);

  return {
    packageId: `red-cliffs-fallback-${viewpointId}`,
    storyId: `red-cliffs-${viewpointId}`,
    protocolVersion: RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isRedCliffsAiSupportedViewpoint(viewpointId)) {
    return getRedCliffsPlayableBase();
  }

  return adaptRedCliffsScriptPackageToPlayableContent(
    createFallbackScriptPackage(viewpointId),
    "local-scripted",
  );
}

export function shouldUseRedCliffsAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || RED_CLIFFS_AI_DEFAULT_VIEWPOINT_ID;
  return (
    eventId === RED_CLIFFS_AI_EVENT_ID &&
    isRedCliffsAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getRedCliffsAiInitialViewpointId() {
  return RED_CLIFFS_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateRedCliffsAiStoryPackage(
  params: RedCliffsAiStoryPackageRequest,
): Promise<RedCliffsAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== RED_CLIFFS_AI_EVENT_ID ||
    !isRedCliffsAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持赤壁之战的诸葛亮、周瑜、黄盖三条 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createRedCliffsAiRequestId();
    const { scriptPackage, debug } = await requestStructuredRedCliffsScriptPackage(
      {
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      },
    );

    const normalizedPackage = normalizeRedCliffsScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateRedCliffsScriptPackage(
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
    debug.timings.serviceTotalMs = Number(
      (performance.now() - serviceStart).toFixed(1),
    );

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

    console.error("[red-cliffs-ai] linear script package request failed", {
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
