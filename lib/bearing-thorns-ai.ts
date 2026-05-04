import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  BearingThornsAiScriptBeat,
  BearingThornsAiScriptLine,
  BearingThornsAiScriptPackage,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
} from "@/types/content";

export const BEARING_THORNS_AI_EVENT_ID = "bearing-thorns-apology";
export const BEARING_THORNS_AI_DEFAULT_VIEWPOINT_ID = "linxiangru";
export const BEARING_THORNS_AI_SUPPORTED_VIEWPOINT_IDS = ["linxiangru"] as const;

type SupportedBearingThornsViewpointId =
  (typeof BEARING_THORNS_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const BEARING_THORNS_AI_DEFAULT_MODEL = "Qwen3Flash";
const BEARING_THORNS_AI_SCRIPT_PROTOCOL_VERSION =
  "bearing-thorns-linear-script-v1" as const;

type BearingThornsBeatId =
  | "courtyard-interrupted"
  | "retainer-reports-lianpo"
  | "ask-about-posture"
  | "whether-to-admit"
  | "lianpo-enters"
  | "lianpo-apologizes"
  | "linxiangru-responds"
  | "lianpo-bows-lower"
  | "step-forward-and-lift"
  | "reconciliation-in-hall"
  | "courtyard-after-silence";

type BearingThornsBeatBlueprint = {
  beatId: BearingThornsBeatId;
  title: string;
  backgroundTag: keyof typeof bearingThornsAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type BearingThornsViewpointProfile = {
  id: SupportedBearingThornsViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<BearingThornsBeatId, string>;
  fallbackBeats: BearingThornsAiScriptBeat[];
};

type BearingThornsAiDebugInfo = {
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

export type BearingThornsAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type BearingThornsAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: BearingThornsAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: BearingThornsAiDebugInfo;
};

type BearingThornsScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const bearingThornsAiBackdropMap = {
  "manor-courtyard": {
    label: "府中",
    tone: "bronze",
    description:
      "背景占位图：赵国上卿府中本来平静，门外突来的急报把所有人的呼吸都先压住了。",
    backgroundKey: "zhao-manor-courtyard",
  },
  "gate-steps": {
    label: "府门",
    tone: "crimson",
    description:
      "背景占位图：府门石阶前有人背着荆条站住，来意还没说出口，气氛已经先一步沉了下去。",
    backgroundKey: "zhao-manor-gate",
  },
  "reception-hall": {
    label: "堂前",
    tone: "jade",
    description:
      "背景占位图：会客堂前灯影很稳，真正变化的是堂内众人的心气和两个重臣之间那层慢慢松开的防备。",
    backgroundKey: "zhao-manor-hall",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const bearingThornsSpeakerVisualKeyMap = {
  蔺相如: "linxiangru",
  廉颇: "lianpo",
  门客: "retainer",
  家臣: "servant",
} as const;

const allowedSpeakerNames = ["蔺相如", "廉颇", "门客", "家臣"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const bearingThornsBeatBlueprints: BearingThornsBeatBlueprint[] = [
  {
    beatId: "courtyard-interrupted",
    title: "府中平静被打断",
    backgroundTag: "manor-courtyard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "retainer-reports-lianpo",
    title: "门客说廉颇来了",
    backgroundTag: "gate-steps",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "ask-about-posture",
    title: "蔺相如追问情形",
    backgroundTag: "manor-courtyard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "whether-to-admit",
    title: "是否请入",
    backgroundTag: "manor-courtyard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "lianpo-enters",
    title: "廉颇入府",
    backgroundTag: "gate-steps",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "lianpo-apologizes",
    title: "廉颇开口请罪",
    backgroundTag: "reception-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "linxiangru-responds",
    title: "蔺相如回应",
    backgroundTag: "reception-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "lianpo-bows-lower",
    title: "廉颇再回应",
    backgroundTag: "reception-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "step-forward-and-lift",
    title: "双方走近",
    backgroundTag: "reception-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "reconciliation-in-hall",
    title: "将相和解",
    backgroundTag: "reception-hall",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "courtyard-after-silence",
    title: "余声收束",
    backgroundTag: "manor-courtyard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const bearingThornsViewpointProfiles: Record<
  SupportedBearingThornsViewpointId,
  BearingThornsViewpointProfile
> = {
  linxiangru: {
    id: "linxiangru",
    displayName: "蔺相如",
    title: "府中主事视角",
    narrationRule:
      "旁白只能写蔺相如第一视角当下的观察、迟疑与判断，只能围绕府门、门客通报、廉颇背荆入内、堂前对话和府中气氛变化展开，不能写成将相和的历史意义总结，也不能写成道德讲解。",
    userGoal:
      "把蔺相如写成正在府中接一口难气的人。他不是摆姿态讲美德，而是在一层层判断：门外这趟登门到底是真低头，还是旧怨换了一种样子重来。",
    voiceNotes: [
      "蔺相如说话要稳、短、有分寸，不急着责备，也不空讲大道理。",
      "廉颇说话要直、有重量，带羞愧，但不要写得过分文绉绉。",
      "门客和家臣只少量参与，用来推进场景和制造迟疑感。",
      "这条事件的核心是多轮对话互动，不是两个人各说一句观点。",
    ],
    beatGoals: {
      "courtyard-interrupted":
        "先让玩家落进府中原本平静、却被一声急报突然打断的现场里。",
      "retainer-reports-lianpo":
        "通过门客具体通报，把‘廉颇背荆站在门外’这件事立起来。",
      "ask-about-posture":
        "让蔺相如不是立刻表态，而是先追问廉颇的神色、随从和姿态。",
      "whether-to-admit":
        "让府中人对请不请入产生迟疑，逼出蔺相如的稳重判断。",
      "lianpo-enters":
        "把廉颇从府门到堂前的重量写出来，让气氛明显变化。",
      "lianpo-apologizes":
        "让廉颇先开口请罪，不要长篇演讲，但要真低下头。",
      "linxiangru-responds":
        "让蔺相如回应过去的退让原因，重点是府中国家局势，不是道德说教。",
      "lianpo-bows-lower":
        "让廉颇接住蔺相如的话，再进一步承认自己只盯着个人名位。",
      "step-forward-and-lift":
        "把和解从语言往动作推进，让双方真正走近。",
      "reconciliation-in-hall":
        "用一轮自然回应把和解落地，而不是一句空泛总结。",
      "courtyard-after-silence":
        "收在府中余波和门客反应上，让玩家感觉见证了一次关系修复现场。",
    },
    fallbackBeats: [
      {
        beatId: "courtyard-interrupted",
        lines: [
          {
            speaker: "",
            text: "府中原本只有廊下风声和案前翻动竹简的轻响。可一阵急促脚步闯进来时，你先放下的不是手里的事，而是心里那一点原本稳着的平气。",
          },
          {
            speaker: "门客",
            text: "上卿，门外来人求见，语气很急，不像平常投帖拜访。属下不敢擅断，先来请你示下。",
          },
        ],
      },
      {
        beatId: "retainer-reports-lianpo",
        lines: [
          {
            speaker: "门客",
            text: "来的是廉将军。他没有乘车，也没有摆排场，只背着荆条站在府门石阶下，身边人都不敢大声说话。",
          },
          {
            speaker: "",
            text: "“廉颇”两个字一出口，堂中原本安静的人都像被轻轻撞了一下。可真正叫人停住呼吸的，不是他来了，而是他竟背着荆条。",
          },
        ],
      },
      {
        beatId: "ask-about-posture",
        lines: [
          {
            speaker: "蔺相如",
            text: "他面上是怒，是急，还是已经把气压下去了？随来的有几人？站在那里，可曾有催逼叩门的意思？",
          },
          {
            speaker: "门客",
            text: "他一直立着，不曾喝骂，也不催门。只是低着头，像在等一声通报，连跟来的家将都不敢先开口。",
          },
        ],
      },
      {
        beatId: "whether-to-admit",
        lines: [
          {
            speaker: "家臣",
            text: "上卿，廉将军过去几次言语都太硬。今日虽然背荆而来，可若仍有别意，把人请进来，府中反倒难收拾。",
          },
          {
            speaker: "蔺相如",
            text: "若他真是来挑衅，就不会背着荆条站在众人都看得见的地方。既然他把脸先放下来了，我们也不能让这一步停在门外。",
          },
        ],
      },
      {
        beatId: "lianpo-enters",
        lines: [
          {
            speaker: "",
            text: "府门开时，你先看见的是那束在背上的荆条，随后才是廉颇低下去的肩。他进门的步子并不快，可每一步都把堂中的防备再压低一点。",
          },
          {
            speaker: "门客",
            text: "廉将军已到堂前。属下方才一直看着，他进门时一句重话都没有，只像怕把这口气说错了地方。",
          },
        ],
      },
      {
        beatId: "lianpo-apologizes",
        lines: [
          {
            speaker: "廉颇",
            text: "相如，我今日背荆而来，不是图一个礼数。过去是我只看见自己那口气，拿你当争强的人，话说得重，也做得难看。",
          },
          {
            speaker: "廉颇",
            text: "若你今日不肯见我，我也认。可这趟路我必须来走，不把这句话当面说出来，我这身甲穿得再久，也只剩羞愧。",
          },
        ],
      },
      {
        beatId: "linxiangru-responds",
        lines: [
          {
            speaker: "蔺相如",
            text: "将军愿意来，我就该见。先前我几次退让，并不是怕你锋芒逼人，而是赵国外有强敌，若将相在城中先斗起来，只会让旁人得利。",
          },
          {
            speaker: "",
            text: "你说得不快，也不抬高声气。堂中人听见的不是一番漂亮道理，而是你把过去那些忍让重新放回了赵国这个更大的局面里。",
          },
        ],
      },
      {
        beatId: "lianpo-bows-lower",
        lines: [
          {
            speaker: "廉颇",
            text: "你顾的是赵国，我顾的却只是自己的名位。今日站到你堂前，我才知道自己这些年仗着军功，竟把心看窄到了这个地步。",
          },
          {
            speaker: "廉颇",
            text: "若你还肯把我当并肩的人，我这条老命往后便不再只替自己争一口气。过去那几番冒犯，我愿一并认下。",
          },
        ],
      },
      {
        beatId: "step-forward-and-lift",
        lines: [
          {
            speaker: "",
            text: "你上前一步，堂中紧绷着的人都下意识看向你们之间那点距离。那不是寻常几步路，而是从旧怨走到真正肯把人扶起来的一步。",
          },
          {
            speaker: "蔺相如",
            text: "将军既把话带到了这里，就不必再让荆条留在身上。今日若还只算一场请罪，那反倒把你我都看轻了。",
          },
        ],
      },
      {
        beatId: "reconciliation-in-hall",
        lines: [
          {
            speaker: "廉颇",
            text: "相如，你肯这样接我，我这趟就没有白来。往后再有人在赵国之内拨弄你我，我先记住今天这堂前说过的话。",
          },
          {
            speaker: "蔺相如",
            text: "你我若都把赵国放在前头，过去那点芥蒂便不必再拿出来压人。今日这一礼，我收下；往后并肩，该收的是同一条心。",
          },
        ],
      },
      {
        beatId: "courtyard-after-silence",
        lines: [
          {
            speaker: "",
            text: "堂前重新安静下来时，门客和家臣先松开的不是嘴，而是肩。你知道方才见到的并不只是廉颇低头，而是两个人终于肯把那口硬气放到赵国之后去衡量。",
          },
          {
            speaker: "门客",
            text: "方才门外那阵风声还叫人心里发紧，如今再听，却只觉得府中总算把一件悬着许久的事落到了地上。",
          },
        ],
      },
    ],
  },
};

function createBearingThornsAiRequestId() {
  return `bearing-thorns-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getBearingThornsPlayableBase() {
  const playableContent = getEventPlayableContent(BEARING_THORNS_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(BEARING_THORNS_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("负荆请罪的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getBearingThornsViewpointProfile(
  viewpointId: SupportedBearingThornsViewpointId,
) {
  return bearingThornsViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: BearingThornsAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      BEARING_THORNS_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createBearingThornsAiDebugInfo(
  config = getAiConfig(),
): BearingThornsAiDebugInfo {
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
  const profile = getBearingThornsViewpointProfile(
    BEARING_THORNS_AI_DEFAULT_VIEWPOINT_ID,
  );

  return bearingThornsBeatBlueprints
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

function buildBearingThornsStoryPackagePrompt(
  request: BearingThornsAiStoryPackageRequest & {
    viewpointId: SupportedBearingThornsViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(BEARING_THORNS_AI_EVENT_ID);
  const viewpoint = getBearingThornsViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "负荆请罪"}`,
    "这不是历史概述，不是将相和的道德总结，也不是百科介绍。",
    "这是蔺相如第一视角正在经历的一次府中现场：门外来报、廉颇背荆到门前、门客迟疑、请入、堂前谢罪、回应、再回应、真正和解。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "每一幕都必须围绕具体动作、通报、入府、请罪、回应、走近、和解推进。",
    "对话必须有来有回，不能是廉颇说一句、蔺相如说一句就结束。至少要让两人形成多轮自然回应。",
    "不要写抽象历史评价，不要写成论文，也不要把“顾全大局”写成口号。",
    "dialogue 只能是一名角色说话；narration 只能是空 speaker 的第一视角观察或感受。",
    "蔺相如要稳重、克制、有分寸；廉颇要直、有羞愧、有重量，但不是空泛忏悔。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "脚本必须像一场完整的小剧场现场，而不是人物观点摘要。",
    "建议整体 line 数量在 22 到 30 条之间，让廉颇和蔺相如都至少有多次发言机会。",
    "旁白要少而关键，主要用来感受府中气氛变化；对话是主体，而且后一句要能接住前一句。",
    "不要写成长篇散文，也不要写成宏观总结。",
    "固定 beat 顺序如下：",
    serializeBeatBlueprints(),
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredBearingThornsScriptPackage(params: {
  request: BearingThornsAiStoryPackageRequest & {
    viewpointId: SupportedBearingThornsViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: BearingThornsAiScriptPackage;
  debug: BearingThornsAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createBearingThornsAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildBearingThornsStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = bearingThornsBeatBlueprints.length;
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
          name: "bearing_thorns_linear_script_package",
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
                enum: [BEARING_THORNS_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...BEARING_THORNS_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: bearingThornsBeatBlueprints.length,
                maxItems: bearingThornsBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: bearingThornsBeatBlueprints.map((beat) => beat.beatId),
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
    scriptPackage: JSON.parse(outputText) as BearingThornsAiScriptPackage,
    debug,
  };
}

function normalizeBearingThornsScriptLine(
  line: BearingThornsAiScriptLine,
): BearingThornsAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeBearingThornsScriptPackage(
  scriptPackage: BearingThornsAiScriptPackage,
): BearingThornsAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as BearingThornsBeatId,
      lines: beat.lines.map(normalizeBearingThornsScriptLine),
    })),
  };
}

function validateBearingThornsScriptPackage(
  scriptPackage: BearingThornsAiScriptPackage,
  viewpointId: SupportedBearingThornsViewpointId,
): BearingThornsScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== BEARING_THORNS_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(`protocolVersion 必须是 ${BEARING_THORNS_AI_SCRIPT_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== bearingThornsBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${bearingThornsBeatBlueprints.length}。`);
  }

  let narrationCount = 0;
  let linxiangruDialogueCount = 0;
  let lianpoDialogueCount = 0;

  bearingThornsBeatBlueprints.forEach((blueprint, index) => {
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
        if (line.text.length < 24) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补一点府中气氛或第一视角判断。`,
          );
        }
        if (line.text.length > 95) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议再收紧一点。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker as (typeof allowedSpeakerNames)[number])) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 不在允许名单中：${line.speaker}`,
        );
      }

      if (line.speaker === "蔺相如") {
        linxiangruDialogueCount += 1;
      }
      if (line.speaker === "廉颇") {
        lianpoDialogueCount += 1;
      }

      if (line.text.length < 16) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对白偏短，容易像一句提纲。`,
        );
      }
      if (line.text.length > 72) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对白偏长，建议再像现场口语一些。`,
        );
      }
    });
  });

  if (linxiangruDialogueCount < 3) {
    warnings.push("蔺相如的对白次数偏少，建议让他在府中判断与回应上更有存在感。");
  }
  if (lianpoDialogueCount < 3) {
    warnings.push("廉颇的对白次数偏少，建议让他的请罪与再回应更有重量。");
  }
  if (narrationCount > scriptPackage.beats.length) {
    warnings.push("旁白比重偏高，建议把更多推进交给人物对话。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatBearingThornsScriptValidation(
  result: BearingThornsScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatBearingThornsWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }
  if (speaker === "蔺相如") {
    return {
      mode: "speaker",
      speakerId: "linxiangru",
      visualKey: "linxiangru",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    bearingThornsSpeakerVisualKeyMap[
      speaker as keyof typeof bearingThornsSpeakerVisualKeyMap
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

function adaptBearingThornsScriptPackageToPlayableContent(
  scriptPackage: BearingThornsAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getBearingThornsPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = bearingThornsBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        bearingThornsSpeakerVisualKeyMap[
          line.speaker as keyof typeof bearingThornsSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: bearingThornsAiBackdropMap[blueprint.backgroundTag],
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
    eventId: BEARING_THORNS_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): BearingThornsAiScriptPackage {
  const profile = getBearingThornsViewpointProfile(
    BEARING_THORNS_AI_DEFAULT_VIEWPOINT_ID,
  );

  return {
    packageId: "bearing-thorns-fallback-linxiangru",
    storyId: "bearing-thorns-linxiangru",
    protocolVersion: BEARING_THORNS_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: BEARING_THORNS_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isBearingThornsAiSupportedViewpoint(viewpointId)) {
    return getBearingThornsPlayableBase();
  }

  return adaptBearingThornsScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isBearingThornsAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedBearingThornsViewpointId {
  return (BEARING_THORNS_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(
    viewpointId,
  );
}

export function shouldUseBearingThornsAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || BEARING_THORNS_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === BEARING_THORNS_AI_EVENT_ID &&
    isBearingThornsAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getBearingThornsAiInitialViewpointId() {
  return BEARING_THORNS_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateBearingThornsAiStoryPackage(
  params: BearingThornsAiStoryPackageRequest,
): Promise<BearingThornsAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== BEARING_THORNS_AI_EVENT_ID ||
    !isBearingThornsAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持负荆请罪的蔺相如 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createBearingThornsAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredBearingThornsScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage = normalizeBearingThornsScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateBearingThornsScriptPackage(
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
        error: formatBearingThornsScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptBearingThornsScriptPackageToPlayableContent(normalizedPackage);
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
          ? formatBearingThornsWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createBearingThornsAiDebugInfo(getAiConfig());
    const errorMessage = error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[bearing-thorns-ai] linear script package request failed", {
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
