import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  EventViewpoint,
  JingkeAiScriptBeat,
  JingkeAiScriptLine,
  JingkeAiScriptPackage,
  PlaceholderAsset,
} from "@/types/content";

export const JINGKE_AI_EVENT_ID = "jingke-assassinates-qin";
export const JINGKE_AI_DEFAULT_VIEWPOINT_ID = "jingke";
export const JINGKE_AI_SUPPORTED_VIEWPOINT_IDS = ["jingke"] as const;

type SupportedJingkeViewpointId =
  (typeof JINGKE_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const JINGKE_AI_DEFAULT_MODEL = "Qwen3Flash";
const JINGKE_AI_SCRIPT_PROTOCOL_VERSION = "jingke-linear-script-v1" as const;

type JingkeBeatId =
  | "palace-waiting"
  | "qinwuyang-falters"
  | "offer-map"
  | "map-unfolds"
  | "dagger-revealed"
  | "king-rises"
  | "pillar-chase"
  | "dagger-thrown"
  | "jingke-seized"
  | "failed-coda";

type JingkeBeatBlueprint = {
  beatId: JingkeBeatId;
  title: string;
  backgroundTag: keyof typeof jingkeAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type JingkeViewpointProfile = {
  id: SupportedJingkeViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<JingkeBeatId, string>;
  fallbackBeats: JingkeAiScriptBeat[];
};

type JingkeAiDebugInfo = {
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

export type JingkeAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type JingkeAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: JingkeAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: JingkeAiDebugInfo;
};

type JingkeScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const jingkeAiBackdropMap = {
  "palace-outer-waiting": {
    label: "殿外",
    tone: "ink",
    description:
      "背景占位图：秦宫殿外的候见之地，石阶、殿门与礼制把杀机先压在门内。",
    backgroundKey: "qin-palace-antehall",
  },
  "throne-court": {
    label: "朝堂",
    tone: "ink",
    description:
      "背景占位图：高阔的秦宫朝堂，礼数未乱，危险却在地图展开时一寸寸逼近。",
    backgroundKey: "qin-throne-hall",
  },
  "hall-chaos": {
    label: "乱局",
    tone: "crimson",
    description:
      "背景占位图：图穷匕见后的殿中混乱，喝止、奔走与兵刃声把秩序全部掀开。",
    backgroundKey: "qin-chaos-hall",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const jingkeSpeakerVisualKeyMap = {
  荆轲: "jingke",
  秦舞阳: "qinwuyang",
  嬴政: "yingzheng",
  秦廷群臣: "courtier",
  殿中侍卫: "guard",
} as const;

const allowedSpeakerNames = [
  "荆轲",
  "秦舞阳",
  "嬴政",
  "秦廷群臣",
  "殿中侍卫",
] as const;

const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const jingkeBeatBlueprints: JingkeBeatBlueprint[] = [
  {
    beatId: "palace-waiting",
    title: "秦宫殿外候见",
    backgroundTag: "palace-outer-waiting",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "qinwuyang-falters",
    title: "秦舞阳失态",
    backgroundTag: "palace-outer-waiting",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "offer-map",
    title: "荆轲上前献图",
    backgroundTag: "throne-court",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "map-unfolds",
    title: "地图缓缓展开",
    backgroundTag: "throne-court",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "dagger-revealed",
    title: "图穷匕见",
    backgroundTag: "throne-court",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "king-rises",
    title: "秦王惊起",
    backgroundTag: "hall-chaos",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "pillar-chase",
    title: "绕柱追刺",
    backgroundTag: "hall-chaos",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "dagger-thrown",
    title: "匕首掷出",
    backgroundTag: "hall-chaos",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "jingke-seized",
    title: "荆轲被制",
    backgroundTag: "hall-chaos",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "failed-coda",
    title: "失败收束",
    backgroundTag: "hall-chaos",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const jingkeViewpointProfiles: Record<
  SupportedJingkeViewpointId,
  JingkeViewpointProfile
> = {
  jingke: {
    id: "jingke",
    displayName: "荆轲",
    title: "刺客视角",
    narrationRule:
      "旁白只能写荆轲第一视角当下的观察、压住呼吸的判断和逼近秦王时的危险感，不写历史意义，不写后世评价，不写宏观解说。",
    userGoal:
      "把荆轲写成一个正在秦宫礼制之内一步步逼近危险的人。他克制、紧张、决绝，越靠近秦王，越要让每个动作看起来像寻常朝见。",
    voiceNotes: [
      "克制，不大喊口号",
      "紧张，但不慌乱",
      "决绝，不回头",
      "会迅速判断秦舞阳失态带来的风险",
      "越接近秦王，心理压迫越重",
    ],
    beatGoals: {
      "palace-waiting":
        "先把秦宫殿外候见的现场写具体：地图、匕首、石阶、殿门、召见前的呼吸，让危险从一开始就落在现场里。",
      "qinwuyang-falters":
        "让秦舞阳露出惧色，荆轲必须当场判断并出声稳住，表现刺杀还没开始就已经在出问题。",
      "offer-map":
        "写荆轲如何在礼仪表面不动声色地上前献图，让靠近秦王这件事本身成为一层危险推进。",
      "map-unfolds":
        "让地图一点点展开，距离一点点缩短，危险藏在礼节之下，不要跳太快。",
      "dagger-revealed":
        "图穷匕见必须写得具体，让匕首出现和荆轲的手先一步动起来。",
      "king-rises":
        "写秦王惊起、群臣一时来不及扑上的混乱，突出礼制与距离反而先拦住了别人。",
      "pillar-chase":
        "写绕柱追刺的动作感，不要概括成一句失败，要让殿中秩序一点点破掉。",
      "dagger-thrown":
        "写荆轲已经知道局面在失手边缘，匕首掷出是最后一押，不要写成爽文慢镜头。",
      "jingke-seized":
        "让危险从刺杀转成失败后的压迫，写侍卫和秦臣终于压上来的那一刻。",
      "failed-coda":
        "收束时只保留现场余味，让荆轲知道行动失败，不写宏大历史总结。",
    },
    fallbackBeats: [
      {
        beatId: "palace-waiting",
        lines: [
          {
            speaker: "",
            text: "殿门还没开，你握着地图外卷，袖里那把匕首贴着手臂，冷得很稳。石阶尽头一点风都没有，反倒是秦舞阳的呼吸先乱了。",
          },
          {
            speaker: "",
            text: "你知道真正难过的不是拔刀那一刻，而是进殿之前每一步都得像寻常朝见，不能让任何一个人先从脸色上看出你此行不是来献图的。",
          },
        ],
      },
      {
        beatId: "qinwuyang-falters",
        lines: [
          {
            speaker: "秦舞阳",
            text: "我……我只是觉得这殿里太冷，脚下一时没站稳。",
          },
          {
            speaker: "荆轲",
            text: "抬头，把东西捧稳。到了这里还让人看出怯意，只会先把所有目光都引到我们身上。",
          },
        ],
      },
      {
        beatId: "offer-map",
        lines: [
          {
            speaker: "",
            text: "你被引到秦王座前，礼数一层层压在动作上。地图捧在手里时一切都还像真正的进献，可你知道，越靠近王座，越没有第二次补救的机会。",
          },
          {
            speaker: "嬴政",
            text: "燕地既遣你来献图，那便上前呈来。寡人要亲眼看看，他们究竟献的是地，还是别的心思。",
          },
        ],
      },
      {
        beatId: "map-unfolds",
        lines: [
          {
            speaker: "",
            text: "图卷在你手里慢慢摊开，纸声细得几乎听不见。你和秦王之间那段原本由礼节撑出来的距离，也跟着一寸寸缩短。",
          },
          {
            speaker: "",
            text: "你不能快，快了就像急着做事；你也不能慢，慢了只会让更多目光落到你手上。危险正藏在这种看似平稳的分寸里。",
          },
        ],
      },
      {
        beatId: "dagger-revealed",
        lines: [
          {
            speaker: "",
            text: "图卷将尽，卷尾那点硬冷终于露了出来。你的手比念头更先一步抓住匕首，袖口、纸边和刀柄在同一瞬间全都变了性质。",
          },
          {
            speaker: "嬴政",
            text: "你——",
          },
        ],
      },
      {
        beatId: "king-rises",
        lines: [
          {
            speaker: "",
            text: "秦王惊起得很快，座前的礼制在那一瞬间全散了。殿里的人都看见了危险，可他们离得太远，规矩又太重，谁都没能立刻扑到王前。",
          },
          {
            speaker: "秦廷群臣",
            text: "护驾！护驾！别让他再逼近！",
          },
        ],
      },
      {
        beatId: "pillar-chase",
        lines: [
          {
            speaker: "",
            text: "你追着秦王绕柱而动，脚步已经顾不上从容。原本整齐的朝堂只剩奔走和喝止，柱影一次次把你和王座之间的距离切开，又逼你再贴上去。",
          },
          {
            speaker: "",
            text: "到这时你已经知道，真正决定成败的不是有没有拔刀，而是乱局里那一小步还能不能再赶上。",
          },
        ],
      },
      {
        beatId: "dagger-thrown",
        lines: [
          {
            speaker: "",
            text: "你再逼不上去，最后只能把匕首掷出去。那一下像把所有准备都一口气推出手去，可寒光擦开空气之后，终究还是没替你把局面钉住。",
          },
          {
            speaker: "秦廷群臣",
            text: "他失手了！别给他回身的空当！",
          },
        ],
      },
      {
        beatId: "jingke-seized",
        lines: [
          {
            speaker: "殿中侍卫",
            text: "拿下！他已无退路，别让他再近王前一步！",
          },
          {
            speaker: "",
            text: "侍卫和群臣终于一起压上来。刺杀这一刻已经过去，危险却没有散，只是从逼近秦王，变成了你清清楚楚知道自己再也走不出这座殿。",
          },
        ],
      },
      {
        beatId: "failed-coda",
        lines: [
          {
            speaker: "",
            text: "你知道行动失败了。昨夜准备的一切、殿外压住的呼吸、图卷尽头那一寸寒光，到这里终于只剩一个结果：门开得够近，刀却还是差了一线。",
          },
          {
            speaker: "",
            text: "殿里的喝止和脚步声还没停，可你心里已经清楚，真正收束这一切的，不是别人的怒喝，而是你亲手把最后那一步走到了尽头。",
          },
        ],
      },
    ],
  },
};

function getJingkePlayableBase() {
  const playableContent = getEventPlayableContent(JINGKE_AI_EVENT_ID);
  if (!playableContent) {
    throw new Error("Missing jingke playable content.");
  }
  return playableContent;
}

function getJingkeAiViewpoint(
  viewpointId: SupportedJingkeViewpointId,
): EventViewpoint {
  const playableContent = getJingkePlayableBase();
  const viewpoint = playableContent.viewpoints.find((item) => item.id === viewpointId);
  if (!viewpoint) {
    throw new Error(`Missing jingke viewpoint: ${viewpointId}`);
  }
  return viewpoint;
}

function getJingkeViewpointProfile(viewpointId: SupportedJingkeViewpointId) {
  return jingkeViewpointProfiles[viewpointId];
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function createJingkeAiRequestId() {
  return `jingke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: JingkeAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      JINGKE_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createJingkeAiDebugInfo(
  config = getAiConfig(),
): JingkeAiDebugInfo {
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
  const profile = getJingkeViewpointProfile(JINGKE_AI_DEFAULT_VIEWPOINT_ID);

  return jingkeBeatBlueprints
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

function buildJingkeStoryPackagePrompt(
  params: JingkeAiStoryPackageRequest & {
    viewpointId: SupportedJingkeViewpointId;
  },
) {
  const viewpoint = getJingkeAiViewpoint(params.viewpointId);
  const eventItem = getHistoricalEvent(JINGKE_AI_EVENT_ID);
  const profile = getJingkeViewpointProfile(params.viewpointId);

  if (!eventItem) {
    throw new Error("Missing jingke event.");
  }

  const systemPrompt = [
    "You generate one fixed-route script package for a Chinese historical AVG experience.",
    "Output only strict JSON that follows the provided schema.",
    "Write all text in Simplified Chinese.",
    "Do not output layout, UI, CSS, file paths, asset filenames, branching choices, nextSceneId, backgroundTag, standeeKey, or state variables.",
    `The event is ${eventItem.title} and the fixed first-person viewpoint is ${profile.displayName}.`,
    "This is not a macro history summary. It must feel like the viewpoint is personally going through a specific palace audience that turns into an assassination attempt.",
    "Every beat must stay concrete: where the viewpoint stands, what object is in hand, who is speaking, who notices what, and how danger moves one step closer.",
    "Do not write abstract political evaluation or textbook commentary.",
    "Narration rules:",
    "- narration uses empty speaker.",
    `- ${profile.narrationRule}`,
    "- narration should be short but complete, with scene, movement, and inner judgment.",
    "- no quoted dialogue inside narration.",
    "- a natural target is around 35 to 85 Chinese characters per narration line.",
    "Dialogue rules:",
    "- each line contains only one speaker talking.",
    "- dialogue must sound like a complete line a person would really say in that dangerous moment.",
    "- no history lecture, no abstract slogans, no omniscient explanation.",
    "- a natural target is around 16 to 48 Chinese characters per line.",
    "- if a speaker needs more words, split into multiple short lines.",
    `Allowed dialogue speakers are only ${allowedSpeakerNames.join("、")}。`,
    "Story rhythm rules:",
    "- return all beats in the fixed order exactly once.",
    "- keep the tension escalating from waiting outside the hall to complete chaos inside the hall.",
    "- the map, the approach, the reveal, and the failed chase must all feel physically staged.",
    "- avoid repetitive sentence openings and avoid summary tone.",
    `The viewpoint should keep these traits: ${profile.voiceNotes.join("、")}。`,
  ].join("\n");

  const userPrompt = [
    `Event title: ${eventItem.title}`,
    `Event summary: ${eventItem.description}`,
    `Fixed viewpoint: ${viewpoint.name}`,
    `Viewpoint role: ${viewpoint.title}`,
    `Viewpoint note: ${viewpoint.summary}`,
    `Story goal: ${profile.userGoal}`,
    `Required protocolVersion: ${JINGKE_AI_SCRIPT_PROTOCOL_VERSION}`,
    `Required viewpointId: ${params.viewpointId}`,
    `Required beat plan:\n${serializeBeatBlueprints()}`,
    `Client trigger source: ${params.triggerSource ?? "initial"}`,
    "The program controls background switches, standee rules, scene progression, and ending locally.",
    "Do not omit any beat.",
    "The experience should feel like 荆轲 is in the audience hall himself, not like a later historian explaining the event.",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredJingkeScriptPackage(params: {
  request: JingkeAiStoryPackageRequest & {
    viewpointId: SupportedJingkeViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: JingkeAiScriptPackage;
  debug: JingkeAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createJingkeAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildJingkeStoryPackagePrompt(params.request);
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = jingkeBeatBlueprints.length;
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
          name: "jingke_linear_script_package",
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
                enum: [JINGKE_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...JINGKE_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: jingkeBeatBlueprints.length,
                maxItems: jingkeBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: jingkeBeatBlueprints.map((beat) => beat.beatId),
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
      `Upstream request failed with status ${response.status} ${response.statusText}. Body: ${
        upstreamBody || "(empty body)"
      }`,
    );
  }

  debug.timings.upstreamRequestMs = Number((performance.now() - upstreamStart).toFixed(1));
  const extractStart = performance.now();
  const payload = (await response.json()) as unknown;
  const outputText = extractResponseText(payload);

  if (!outputText) {
    throw new Error("AI 结构化输出为空。");
  }

  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number((performance.now() - extractStart).toFixed(1));

  return {
    scriptPackage: JSON.parse(outputText) as JingkeAiScriptPackage,
    debug,
  };
}

function normalizeJingkeScriptLine(line: JingkeAiScriptLine): JingkeAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: normalizeText(line.text),
  };
}

function normalizeJingkeScriptPackage(
  scriptPackage: JingkeAiScriptPackage,
): JingkeAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as JingkeBeatId,
      lines: beat.lines.map(normalizeJingkeScriptLine),
    })),
  };
}

function validateJingkeScriptPackage(
  scriptPackage: JingkeAiScriptPackage,
  viewpointId: SupportedJingkeViewpointId,
): JingkeScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;

  if (!scriptPackage.packageId) errors.push("packageId 不能为空。");
  if (!scriptPackage.storyId) errors.push("storyId 不能为空。");
  if (scriptPackage.protocolVersion !== JINGKE_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(`protocolVersion 必须是 ${JINGKE_AI_SCRIPT_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== jingkeBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${jingkeBeatBlueprints.length}。`);
  }

  jingkeBeatBlueprints.forEach((blueprint, index) => {
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
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白里出现了引号对白，建议改成纯第一视角叙述。`);
        }
        if (line.text.length < 26) {
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补一点现场感或心理压迫。`);
        }
        if (line.text.length > 110) {
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议拆成两条更像 AVG 的短幕。`);
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 不在允许名单内。`);
      }
      if (line.text.length < 10) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏短，建议写成更完整的一句人话。`);
      }
      if (line.text.length > 66) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏长，建议拆成两条。`);
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 20 || totalLines > 30) {
    warnings.push("总 line 数量偏离推荐范围 20-30。");
  }

  const jingkeDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "荆轲").length,
    0,
  );
  if (jingkeDialogueCount < 2) {
    warnings.push("荆轲当前发言偏少，建议再补几句更能体现他克制与决绝的对话。");
  }
  const qinwuyangDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "秦舞阳").length,
    0,
  );
  if (qinwuyangDialogueCount === 0) {
    warnings.push("秦舞阳没有明确出声，建议至少给他一条失态或压不住的反应。");
  }
  const yingzhengDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "嬴政").length,
    0,
  );
  if (yingzhengDialogueCount === 0) {
    warnings.push("嬴政没有明确出声，建议至少给他一条在朝堂上的直接反应。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatJingkeScriptValidation(result: JingkeScriptValidationResult) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatJingkeWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }
  if (speaker === "荆轲") {
    return {
      mode: "speaker",
      speakerId: "jingke",
      visualKey: "jingke",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    jingkeSpeakerVisualKeyMap[speaker as keyof typeof jingkeSpeakerVisualKeyMap];

  if (!visualKey) {
    return { mode: "hidden" };
  }

  return {
    mode: "speaker",
    speakerId: visualKey,
    visualKey,
  };
}

function adaptJingkeScriptPackageToPlayableContent(
  scriptPackage: JingkeAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getJingkePlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = jingkeBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        jingkeSpeakerVisualKeyMap[
          line.speaker as keyof typeof jingkeSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: jingkeAiBackdropMap[blueprint.backgroundTag],
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
    eventId: JINGKE_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): JingkeAiScriptPackage {
  const profile = getJingkeViewpointProfile(JINGKE_AI_DEFAULT_VIEWPOINT_ID);

  return {
    packageId: "jingke-fallback-jingke",
    storyId: "jingke-assassinates-qin-jingke",
    protocolVersion: JINGKE_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: JINGKE_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isJingkeAiSupportedViewpoint(viewpointId)) {
    return getJingkePlayableBase();
  }
  return adaptJingkeScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isJingkeAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedJingkeViewpointId {
  return (JINGKE_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(viewpointId);
}

export function shouldUseJingkeAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId = viewpointId?.trim() || JINGKE_AI_DEFAULT_VIEWPOINT_ID;
  return (
    eventId === JINGKE_AI_EVENT_ID &&
    isJingkeAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getJingkeAiInitialViewpointId() {
  return JINGKE_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateJingkeAiStoryPackage(
  params: JingkeAiStoryPackageRequest,
): Promise<JingkeAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== JINGKE_AI_EVENT_ID ||
    !isJingkeAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持荆轲刺秦的荆轲 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId = params.clientRequestId?.trim() || createJingkeAiRequestId();
    const { scriptPackage, debug } = await requestStructuredJingkeScriptPackage({
      request: {
        ...params,
        viewpointId: params.viewpointId,
      },
      requestId,
    });

    const normalizedPackage = normalizeJingkeScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateJingkeScriptPackage(
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
        error: formatJingkeScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptJingkeScriptPackageToPlayableContent(normalizedPackage);
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
          ? formatJingkeWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createJingkeAiDebugInfo(getAiConfig());
    const errorMessage = error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[jingke-ai] linear script package request failed", {
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
