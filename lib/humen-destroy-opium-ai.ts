import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import { formatStoryWarningSummary } from "@/lib/story-warning";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  HumenDestroyOpiumAiScriptBeat,
  HumenDestroyOpiumAiScriptLine,
  HumenDestroyOpiumAiScriptPackage,
  PlaceholderAsset,
} from "@/types/content";

export const HUMEN_DESTROY_OPIUM_AI_EVENT_ID = "humen-destroy-opium";
export const HUMEN_DESTROY_OPIUM_AI_DEFAULT_VIEWPOINT_ID = "linzexu";
export const HUMEN_DESTROY_OPIUM_AI_SUPPORTED_VIEWPOINT_IDS = ["linzexu"] as const;

type SupportedHumenViewpointId =
  (typeof HUMEN_DESTROY_OPIUM_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const HUMEN_DESTROY_OPIUM_AI_DEFAULT_MODEL = "Qwen3Flash";
const HUMEN_DESTROY_OPIUM_AI_SCRIPT_PROTOCOL_VERSION =
  "humen-destroy-opium-linear-script-v1" as const;

type HumenBeatId =
  | "seaside-morning"
  | "crates-carried-in"
  | "linzexu-arrives"
  | "checking-registers"
  | "dump-into-pit"
  | "crowd-watches"
  | "foreign-eyes"
  | "order-to-continue"
  | "destruction-continues"
  | "day-settles"
  | "aftertaste-humen";

type HumenBeatBlueprint = {
  beatId: HumenBeatId;
  title: string;
  backgroundTag: keyof typeof humenAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type HumenViewpointProfile = {
  id: SupportedHumenViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<HumenBeatId, string>;
  fallbackBeats: HumenDestroyOpiumAiScriptBeat[];
};

type HumenAiDebugInfo = {
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

export type HumenDestroyOpiumAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type HumenDestroyOpiumAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: HumenDestroyOpiumAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: HumenAiDebugInfo;
};

type HumenScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const humenAiBackdropMap = {
  "seaside-morning": {
    label: "虎门",
    tone: "jade",
    description:
      "背景占位图：海风、盐气和一列列待查验的木箱把现场压成了一场必须当众做完的差事。",
    backgroundKey: "humen-seaside-morning",
  },
  "opium-yard": {
    label: "查验",
    tone: "amber",
    description:
      "背景占位图：封条、木箱、册页和催促声都挤在一起，真正压人的不是喧闹，而是每一项都不能记错。",
    backgroundKey: "humen-opium-yard",
  },
  "destruction-pit": {
    label: "销烟池",
    tone: "ink",
    description:
      "背景占位图：石灰、海水与烟土混在池中，气味、潮气和声响让人意识到这不是口头命令，而是正在发生的处置。",
    backgroundKey: "humen-destruction-pit",
  },
  "crowd-edge": {
    label: "围观",
    tone: "amber",
    description:
      "背景占位图：远处围看的百姓和更远处冷眼旁观的人，把整个现场又压上了一层不能出错的分量。",
    backgroundKey: "humen-crowd-edge",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const humenSpeakerVisualKeyMap = {
  林则徐: "linzexu",
  现场小吏: "clerk",
  督办官员: "officer",
  现场清军: "soldier",
  围观百姓: "citizen",
  远处旁观者: "foreign-observer",
} as const;

const allowedSpeakerNames = [
  "林则徐",
  "现场小吏",
  "督办官员",
  "现场清军",
  "围观百姓",
  "远处旁观者",
] as const;

const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const humenBeatBlueprints: HumenBeatBlueprint[] = [
  {
    beatId: "seaside-morning",
    title: "虎门海边清晨",
    backgroundTag: "seaside-morning",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "crates-carried-in",
    title: "箱子被抬入现场",
    backgroundTag: "opium-yard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "linzexu-arrives",
    title: "林则徐到场",
    backgroundTag: "opium-yard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "checking-registers",
    title: "查验与登记",
    backgroundTag: "opium-yard",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "dump-into-pit",
    title: "投入销烟池",
    backgroundTag: "destruction-pit",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "crowd-watches",
    title: "百姓围观",
    backgroundTag: "crowd-edge",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "foreign-eyes",
    title: "外国商人的目光",
    backgroundTag: "crowd-edge",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "order-to-continue",
    title: "林则徐下令继续",
    backgroundTag: "destruction-pit",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "destruction-continues",
    title: "销烟持续",
    backgroundTag: "destruction-pit",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "day-settles",
    title: "当日收束",
    backgroundTag: "crowd-edge",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "aftertaste-humen",
    title: "余声收束",
    backgroundTag: "seaside-morning",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const humenViewpointProfiles: Record<
  SupportedHumenViewpointId,
  HumenViewpointProfile
> = {
  linzexu: {
    id: "linzexu",
    displayName: "林则徐",
    title: "督办者视角",
    narrationRule:
      "旁白只能写林则徐第一视角当下亲眼所见和亲身所感：海风、箱子、封条、登记册、销烟池、围观者的目光，以及自己如何一边稳住现场秩序、一边确认每一步都不能出错。不要写成近代史总结或政治口号。",
    userGoal:
      "把林则徐写成一个站在公开行动现场、以秩序和执行力压住全场的人。他的分量来自稳、准、硬，而不是长篇演讲。",
    voiceNotes: [
      "林则徐说话应稳、短、明确，重点在规程、秩序和不能出错。",
      "小吏、官员、清军、百姓、旁观者都只说短句，用来增强现场感，不要讲历史课。",
      "不要把虎门销烟写成教材总结或宣传稿，要写成海风里一箱箱真的被查验、登记、投入销烟池的现场。",
      "可以写气味、潮湿、册页、封条、石灰和围观人群的反应，但不要夸张煽情。",
    ],
    beatGoals: {
      "seaside-morning":
        "先把玩家放进海边清晨的现场：潮气、列队、箱子和等待开始的压感。",
      "crates-carried-in":
        "让搬运、查验和登记动作启动起来，气氛从准备转成执行。",
      "linzexu-arrives":
        "让林则徐出场，带来秩序和重量，但不要写成长篇讲话。",
      "checking-registers":
        "通过对封条、册页和数字的核对，让玩家意识到这不是乱烧，而是按规程做给所有人看。",
      "dump-into-pit":
        "把销烟池、石灰、海水和烟土的现场感写出来，让行动真正落地。",
      "crowd-watches":
        "让围观百姓的短句把“很多人在看”这层感觉提起来。",
      "foreign-eyes":
        "增加远处注视的压力，但不要写成夸张对抗，只让现场更不能出错。",
      "order-to-continue":
        "让林则徐把现场重新压稳，继续推进处置。",
      "destruction-continues":
        "写出持续销毁的漫长与沉重，让公开行动的分量真正形成。",
      "day-settles":
        "让当天收束下来，百姓散去，官员仍在核对，留下余味。",
      "aftertaste-humen":
        "收在现场见证感上，不要升格成宏大历史结论。",
    },
    fallbackBeats: [
      {
        beatId: "seaside-morning",
        lines: [
          {
            speaker: "",
            text: "海风一早就刮得很重。你踩着潮湿的地面走到虎门现场时，清军已经列开，远处堆着的木箱一层一层压在岸边，像把这一天的重量先摆在了众人眼前。",
          },
          {
            speaker: "现场清军",
            text: "各处都站稳，不许乱走。等箱子搬齐、册页对上，今天这一场就要当众开始。",
          },
        ],
      },
      {
        beatId: "crates-carried-in",
        lines: [
          {
            speaker: "督办官员",
            text: "这一列先入场，照封条顺序摆。登记的人把箱数记清楚，谁也别图快省掉一道手续。",
          },
          {
            speaker: "",
            text: "木箱一只只被抬近，脚步声、木板摩擦声和潮气混在一起。你翻开册页时，已经能听见外围百姓压低了声音议论。",
          },
        ],
      },
      {
        beatId: "linzexu-arrives",
        lines: [
          {
            speaker: "林则徐",
            text: "先看池，再看册。封条、箱数、倾倒次序，一项也不要乱。既然是公开销毁，就要让人挑不出半点含糊。",
          },
          {
            speaker: "",
            text: "你听他的话不高，却把场上的杂声一下压了下去。原本只顾搬抬的人也都收紧了动作，仿佛谁先乱一点，都会让整片海边跟着失手。",
          },
        ],
      },
      {
        beatId: "checking-registers",
        lines: [
          {
            speaker: "现场小吏",
            text: "这批封条对上了，箱数也齐。再往后记一行，来源、移交和入池次序都得补全。",
          },
          {
            speaker: "",
            text: "你一边记，一边看见旁边的人不断催促动作快些。可越是在这种时候，你越明白，今天最怕的不是慢，而是有人回头时发现账上和眼前对不上。",
          },
        ],
      },
      {
        beatId: "dump-into-pit",
        lines: [
          {
            speaker: "",
            text: "箱盖被撬开后，烟土一团团倒入池中。石灰和海水混进去时，味道立刻冲了上来，不至呛人，却足够让每一个站近的人都清楚：眼前这些东西正在被一点点毁掉。",
          },
          {
            speaker: "督办官员",
            text: "这一池继续照规程来，倾倒完就补记。别只顾看，谁手上的笔停了，谁回头就先来对账。",
          },
        ],
      },
      {
        beatId: "crowd-watches",
        lines: [
          {
            speaker: "围观百姓",
            text: "真在销了……不是喊两句就散的样子。你看那些箱子，一箱箱真往池里送。",
          },
          {
            speaker: "",
            text: "你顺着声音看过去，百姓站得并不近，可每双眼睛都像钉在池边。有人低声说话，有人只是看着，这种沉默反倒比嘈杂更让人知道今天有多重。",
          },
        ],
      },
      {
        beatId: "foreign-eyes",
        lines: [
          {
            speaker: "督办官员",
            text: "远处也有人在看，手上别乱。越是这时候，册页越要对得明白，动作越要稳。",
          },
          {
            speaker: "",
            text: "你顺着他的目光瞥见更远处那些并不欢迎此事的人。没人上前闹，可正因如此，现场每一个细小失误都像会被放大得更清楚。",
          },
        ],
      },
      {
        beatId: "order-to-continue",
        lines: [
          {
            speaker: "林则徐",
            text: "继续。查验、登记、倾倒，照次序走。今日既然当众销毁，就不要让任何一处留成含糊口实。",
          },
          {
            speaker: "",
            text: "他没有多说，可场上所有人都重新找到自己的节奏。刚才那点被目光压出来的紧绷，没有散掉，而是被硬生生拢进了继续做事的手里。",
          },
        ],
      },
      {
        beatId: "destruction-continues",
        lines: [
          {
            speaker: "",
            text: "时间慢慢往后推，池边的人换了几轮，册页上的数字也一行行往下压。你开始明白，这场销烟真正沉重的地方不是某一个响亮瞬间，而是它必须被稳稳做完、做给所有人看。",
          },
          {
            speaker: "现场小吏",
            text: "这一批记完了，再接下一列。字不能乱，数更不能乱，回头查起来，今天每一箱都得有来有去。",
          },
        ],
      },
      {
        beatId: "day-settles",
        lines: [
          {
            speaker: "",
            text: "等这一批处置完，百姓开始慢慢散开，海风里还留着石灰和潮水混出来的味道。官员们没有立刻收手，仍站在一旁对着箱数和册页反复核准，像生怕这一天最后松在自己手里。",
          },
          {
            speaker: "督办官员",
            text: "把最后两页再核一遍，别看人群散了，今天的事还没到能粗的时候。",
          },
        ],
      },
      {
        beatId: "aftertaste-humen",
        lines: [
          {
            speaker: "",
            text: "你合上册页再回头看虎门，记住的不是某一句响亮话，而是海风、木箱、销烟池和一整天都落在这里的目光。今天这件事之所以沉重，正因为它不是纸上的命令，而是真的在众人眼前被做完了。",
          },
          {
            speaker: "围观百姓",
            text: "走吧，今天这地方看过的人，回去大概都不会忘。",
          },
        ],
      },
    ],
  },
};

function createHumenAiRequestId() {
  return `humen-destroy-opium-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getHumenPlayableBase() {
  const playableContent = getEventPlayableContent(HUMEN_DESTROY_OPIUM_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(HUMEN_DESTROY_OPIUM_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("虎门销烟的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getHumenViewpointProfile(viewpointId: SupportedHumenViewpointId) {
  return humenViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: HumenAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      HUMEN_DESTROY_OPIUM_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createHumenAiDebugInfo(config = getAiConfig()): HumenAiDebugInfo {
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

  const outputText = (payload as { output_text?: unknown }).output_text;
  if (typeof outputText === "string") {
    return outputText.trim();
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return "";
  }

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const block of content) {
      if (!block || typeof block !== "object") {
        continue;
      }
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        return text.trim();
      }
    }
  }

  return "";
}

function serializeBeatBlueprints() {
  return humenBeatBlueprints
    .map(
      (beat, index) =>
        `${index + 1}. ${beat.beatId}｜${beat.title}｜推荐 ${beat.minLines}-${beat.maxLines} 条 line`,
    )
    .join("\n");
}

function buildHumenStoryPackagePrompt(params: {
  viewpointId: SupportedHumenViewpointId;
}) {
  const viewpoint = getHumenViewpointProfile(params.viewpointId);
  const systemPrompt = [
    "你正在为一个历史互动项目生成线性剧情脚本包。",
    `事件：虎门销烟。第一视角：${viewpoint.displayName}${viewpoint.title}。`,
    viewpoint.narrationRule,
    `写作目标：${viewpoint.userGoal}`,
    ...viewpoint.voiceNotes.map((note) => `- ${note}`),
    "",
    "这是一次具体现场体验，不是历史概述，不是近代史意义总结，不是宣传稿。",
    "每一幕都必须回答：现在在哪里、谁在动作、谁在说话、谁注意到了什么、这一步怎样让现场更沉、更紧、更不可回头。",
    "重点写海风、箱子、封条、登记册、清军列队、销烟池、石灰与海水、围观百姓、远处旁观者的目光。",
    "林则徐不要长篇讲话，只用短而稳的命令和确认现场秩序来体现他的分量。",
    "小吏、官员、清军、百姓、远处旁观者都只说短句，不要发表历史课总结。",
    "dialogue 只能是一名角色在说话；narration 只能是空 speaker 的第一视角观察。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "这段脚本要让玩家感觉自己正在虎门海边亲眼见证一场公开销烟行动，而不是在读历史教材。",
    "总 line 数建议 22 到 30 条，让现场准备、查验登记、投入销烟池、围观压力和当日收束都能展开。",
    "请严格按以下 beat 顺序生成：",
    serializeBeatBlueprints(),
    "",
    "每个 beat 的写法重点：",
    ...humenBeatBlueprints.map((beat) => `- ${beat.beatId}: ${viewpoint.beatGoals[beat.beatId]}`),
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredHumenScriptPackage(params: {
  request: HumenDestroyOpiumAiStoryPackageRequest & {
    viewpointId: SupportedHumenViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: HumenDestroyOpiumAiScriptPackage;
  debug: HumenAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createHumenAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildHumenStoryPackagePrompt(params.request);
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = humenBeatBlueprints.length;
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
          name: "humen_destroy_opium_linear_script_package",
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
                enum: [HUMEN_DESTROY_OPIUM_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...HUMEN_DESTROY_OPIUM_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: humenBeatBlueprints.length,
                maxItems: humenBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: humenBeatBlueprints.map((beat) => beat.beatId),
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
    scriptPackage: JSON.parse(outputText) as HumenDestroyOpiumAiScriptPackage,
    debug,
  };
}

function normalizeHumenScriptLine(
  line: HumenDestroyOpiumAiScriptLine,
): HumenDestroyOpiumAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeHumenScriptPackage(
  scriptPackage: HumenDestroyOpiumAiScriptPackage,
): HumenDestroyOpiumAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as HumenBeatId,
      lines: beat.lines.map(normalizeHumenScriptLine),
    })),
  };
}

function validateHumenScriptPackage(
  scriptPackage: HumenDestroyOpiumAiScriptPackage,
  viewpointId: SupportedHumenViewpointId,
): HumenScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== HUMEN_DESTROY_OPIUM_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(`protocolVersion 必须是 ${HUMEN_DESTROY_OPIUM_AI_SCRIPT_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== humenBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${humenBeatBlueprints.length}。`);
  }

  let narrationCount = 0;
  let linzexuDialogueCount = 0;
  let supportDialogueCount = 0;

  humenBeatBlueprints.forEach((blueprint, index) => {
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
          errors.push(`${blueprint.beatId} 不允许空 speaker 旁白。`);
        }
        if (line.text.length < 24) {
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短。`);
        }
        if (line.text.length > 118) {
          warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长。`);
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 不在允许名单中：${line.speaker}`,
        );
      }

      if (line.speaker === "林则徐") {
        linzexuDialogueCount += 1;
      } else {
        supportDialogueCount += 1;
      }

      if (line.text.length < 10) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏短。`);
      }
      if (line.text.length > 72) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏长。`);
      }
      if (/历史意义|近代史|反侵略斗争|民族觉醒|制度改革/.test(line.text)) {
        warnings.push(`${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏像教材总结。`);
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 22 || totalLines > 30) {
    warnings.push("总 line 数量偏离推荐范围 22-30。");
  }
  if (linzexuDialogueCount < 3) {
    warnings.push("林则徐直接发言偏少，建议再强化他的现场压场感。");
  }
  if (supportDialogueCount < 6) {
    warnings.push("现场辅助角色发言偏少，围观和执行压力可能不够完整。");
  }
  if (narrationCount > humenBeatBlueprints.length + 2) {
    warnings.push("旁白比重偏高，建议让更多推进落到现场对话和动作上。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatHumenScriptValidation(result: HumenScriptValidationResult) {
  return [...result.errors, ...result.warnings].join(" ");
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }

  if (speaker === "林则徐") {
    return {
      mode: "speaker",
      speakerId: "linzexu",
      visualKey: "linzexu",
      hideForViewpoint: true,
    };
  }

  return { mode: "hidden" };
}

function adaptHumenScriptPackageToPlayableContent(
  scriptPackage: HumenDestroyOpiumAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getHumenPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = humenBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        humenSpeakerVisualKeyMap[
          line.speaker as keyof typeof humenSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: humenAiBackdropMap[blueprint.backgroundTag],
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
    eventId: HUMEN_DESTROY_OPIUM_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): HumenDestroyOpiumAiScriptPackage {
  const profile = getHumenViewpointProfile(HUMEN_DESTROY_OPIUM_AI_DEFAULT_VIEWPOINT_ID);

  return {
    packageId: "humen-destroy-opium-fallback-linzexu",
    storyId: "humen-destroy-opium-linzexu",
    protocolVersion: HUMEN_DESTROY_OPIUM_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: HUMEN_DESTROY_OPIUM_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isHumenAiSupportedViewpoint(viewpointId)) {
    return getHumenPlayableBase();
  }

  return adaptHumenScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isHumenAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedHumenViewpointId {
  return (HUMEN_DESTROY_OPIUM_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(
    viewpointId,
  );
}

export function shouldUseHumenDestroyOpiumAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || HUMEN_DESTROY_OPIUM_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === HUMEN_DESTROY_OPIUM_AI_EVENT_ID &&
    isHumenAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getHumenDestroyOpiumAiInitialViewpointId() {
  return HUMEN_DESTROY_OPIUM_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateHumenDestroyOpiumAiStoryPackage(
  params: HumenDestroyOpiumAiStoryPackageRequest,
): Promise<HumenDestroyOpiumAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== HUMEN_DESTROY_OPIUM_AI_EVENT_ID ||
    !isHumenAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持虎门销烟的林则徐 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createHumenAiRequestId();
    const { scriptPackage, debug } = await requestStructuredHumenScriptPackage({
      request: {
        ...params,
        viewpointId: params.viewpointId,
      },
      requestId,
    });

    const normalizedPackage = normalizeHumenScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateHumenScriptPackage(
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
        error: formatHumenScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptHumenScriptPackageToPlayableContent(normalizedPackage);
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
          ? formatStoryWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createHumenAiDebugInfo(getAiConfig());
    const errorMessage = error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[humen-destroy-opium-ai] linear script package request failed", {
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
