import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import { formatStoryWarningSummary } from "@/lib/story-warning";
import type {
  BoilBeansAiScriptBeat,
  BoilBeansAiScriptLine,
  BoilBeansAiScriptPackage,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
} from "@/types/content";

export const BOIL_BEANS_AI_EVENT_ID = "boil-beans-burn-stalks";
export const BOIL_BEANS_AI_DEFAULT_VIEWPOINT_ID = "caozhi";
export const BOIL_BEANS_AI_SUPPORTED_VIEWPOINT_IDS = ["caozhi"] as const;

type SupportedBoilBeansViewpointId =
  (typeof BOIL_BEANS_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const BOIL_BEANS_AI_DEFAULT_MODEL = "Qwen3Flash";
const BOIL_BEANS_AI_SCRIPT_PROTOCOL_VERSION =
  "boil-beans-linear-script-v1" as const;

type BoilBeansBeatId =
  | "summoned-into-hall"
  | "seven-step-decree"
  | "first-step-silence"
  | "second-third-steps"
  | "first-couplet"
  | "fourth-fifth-steps"
  | "middle-couplet"
  | "sixth-seventh-steps"
  | "final-couplet"
  | "hall-falls-silent"
  | "pressure-eases"
  | "cold-aftertaste";

type BoilBeansBeatBlueprint = {
  beatId: BoilBeansBeatId;
  title: string;
  backgroundTag: keyof typeof boilBeansAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
  injectFixedPoem?: boolean;
};

type BoilBeansViewpointProfile = {
  id: SupportedBoilBeansViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<BoilBeansBeatId, string>;
  fallbackBeats: BoilBeansAiScriptBeat[];
};

type BoilBeansAiDebugInfo = {
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

export type BoilBeansAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type BoilBeansAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: BoilBeansAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: BoilBeansAiDebugInfo;
};

type BoilBeansScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const fixedPoemCouplets = {
  "first-couplet": ["煮豆持作羹，", "漉菽以为汁。"],
  "middle-couplet": ["萁在釜下燃，", "豆在釜中泣。"],
  "final-couplet": ["本自同根生，", "相煎何太急？"],
} as const satisfies Partial<Record<BoilBeansBeatId, readonly string[]>>;

const fullFixedPoemLines = Object.values(fixedPoemCouplets).flat();
const fixedPoemLineSet = new Set<string>(fullFixedPoemLines);

const boilBeansAiBackdropMap = {
  "hall-summons": {
    label: "召入",
    tone: "ink",
    description:
      "背景占位图：魏宫大殿冷而安静，殿门一合上，脚步与目光都像被压进同一条线里。",
    backgroundKey: "wei-palace-hall",
  },
  "counting-steps": {
    label: "七步",
    tone: "amber",
    description:
      "背景占位图：殿中地面、衣摆与落步之间的空隙都被数得很清楚，越往前走，越没有回头的余地。",
    backgroundKey: "wei-palace-dais",
  },
  "after-poem": {
    label: "余寒",
    tone: "ink",
    description:
      "背景占位图：诗成之后，殿内比先前更静，连灯影都像在等上首那个人先开口。",
    backgroundKey: "wei-palace-after-audience",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const boilBeansSpeakerVisualKeyMap = {
  曹植: "caozhi",
  曹丕: "caopi",
  侍从: "attendant",
  群臣: "courtier",
} as const;

const allowedSpeakerNames = ["曹植", "曹丕", "侍从", "群臣"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const boilBeansBeatBlueprints: BoilBeansBeatBlueprint[] = [
  {
    beatId: "summoned-into-hall",
    title: "被召入殿",
    backgroundTag: "hall-summons",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "seven-step-decree",
    title: "曹丕提出七步成诗",
    backgroundTag: "hall-summons",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "first-step-silence",
    title: "第一步，殿中寂静",
    backgroundTag: "counting-steps",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "second-third-steps",
    title: "第二、三步，想到锅中豆",
    backgroundTag: "counting-steps",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "first-couplet",
    title: "诗句开始出现：前两句",
    backgroundTag: "counting-steps",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
    injectFixedPoem: true,
  },
  {
    beatId: "fourth-fifth-steps",
    title: "第四、五步，萁火与豆泣",
    backgroundTag: "counting-steps",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "middle-couplet",
    title: "诗句继续出现：中两句",
    backgroundTag: "counting-steps",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
    injectFixedPoem: true,
  },
  {
    beatId: "sixth-seventh-steps",
    title: "第六、七步，兄弟之意落下",
    backgroundTag: "counting-steps",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "final-couplet",
    title: "诗句收束：后两句",
    backgroundTag: "counting-steps",
    minLines: 1,
    maxLines: 2,
    allowNarration: true,
    injectFixedPoem: true,
  },
  {
    beatId: "hall-falls-silent",
    title: "殿中沉默",
    backgroundTag: "after-poem",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "pressure-eases",
    title: "压力退去",
    backgroundTag: "after-poem",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "cold-aftertaste",
    title: "余声收束",
    backgroundTag: "after-poem",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const boilBeansViewpointProfiles: Record<
  SupportedBoilBeansViewpointId,
  BoilBeansViewpointProfile
> = {
  caozhi: {
    id: "caozhi",
    displayName: "曹植",
    title: "七步求生视角",
    narrationRule:
      "旁白只能写曹植第一视角此刻亲眼所见、心里所想和当下判断到的殿中变化：曹丕的目光、群臣的安静、脚下步数、诗意如何一点点逼出来。不要写历史概述，不要写文学赏析，更不要把七步诗本身改写进旁白里。",
    userGoal:
      "把曹植写成一个被逼到七步之内必须开口的人：他才思敏捷，却不敢放肆；他知道自己要活下来，就必须把最深的痛意借诗说出，却又不能把怨气写成直斥。",
    voiceNotes: [
      "曹植的旁白要有紧张、敏感和克制，不是炫才式自信。",
      "曹丕说话要冷、短、压迫感强，不必多言，但每一句都像在往前逼。",
      "侍从和群臣只少量出现，用来烘托殿中的安静和目光压力。",
      "与七步诗相关的三组固定诗句由系统本地注入，AI 不得生成、改写或解释诗句正文。",
    ],
    beatGoals: {
      "summoned-into-hall":
        "让玩家一进殿就感到冷和静，知道这不是普通召见，而是一场所有人都在等结果的逼视。",
      "seven-step-decree":
        "把曹丕的要求压实：七步成诗，不成则有重后果，让这场试压真正落地。",
      "first-step-silence":
        "写出第一步迈出时殿中目光全落在曹植身上的紧感，让时间被明显压缩。",
      "second-third-steps":
        "通过第二、三步把曹植的心念从惊压推到诗意边缘，让“煮豆”的意象开始形成。",
      "first-couplet":
        "在诗句出现前后烘托曹植终于开口的瞬间，但不要生成诗句正文。",
      "fourth-fifth-steps":
        "把萁火与豆泣的意象在心中逼出来，让殿中气氛继续收紧。",
      "middle-couplet":
        "在诗句出现前后写出殿中人心已经听见其中隐意，但依然没人敢先动。",
      "sixth-seventh-steps":
        "把最后两步写成兄弟二字终于逼到眼前的瞬间，让曹植意识到最后一层意思必须落下。",
      "final-couplet":
        "在诗句出现前后写出压迫达到最高点，但诗句正文仍由系统本地固定插入。",
      "hall-falls-silent":
        "诗成之后先写沉默，不要立刻给结论，让玩家感到满殿在等曹丕表态。",
      "pressure-eases":
        "写曹丕没有继续逼迫，压力略退，但仍保留冷意和试探留下的刺。",
      "cold-aftertaste":
        "收在殿中余寒与兄弟裂痕，不做宏大历史总结。",
    },
    fallbackBeats: [
      {
        beatId: "summoned-into-hall",
        lines: [
          {
            speaker: "",
            text: "你被召入殿时，先撞上的不是喝斥，而是一种冷得过分的安静。曹丕坐在上首，群臣和侍从都把呼吸收得极轻，像是人人都知道，今夜这场召见不会只停在问答之间。",
          },
          {
            speaker: "曹植",
            text: "臣已奉召入殿。只是今日这一眼看去，倒像不是问诗文，更像先要看臣还能不能在众目之下站得住。",
          },
        ],
      },
      {
        beatId: "seven-step-decree",
        lines: [
          {
            speaker: "曹丕",
            text: "你素来以文章自负，今日便不妨当着众人试一试。七步之内成诗，若成不了，便说明你平日那些名声也不过如此。",
          },
          {
            speaker: "",
            text: "这话说得不高，却把整座大殿一下压窄了。你很清楚，曹丕要的从来不只是诗成不成，而是看你在这几步里会不会先乱。",
          },
        ],
      },
      {
        beatId: "first-step-silence",
        lines: [
          {
            speaker: "",
            text: "你迈出第一步，靴底落在殿砖上的声音被放得格外清楚。四周没有人敢替你出声，连侍从垂手站着的影子都像在跟着数你还能剩下几步。",
          },
          {
            speaker: "群臣",
            text: "……",
          },
        ],
      },
      {
        beatId: "second-third-steps",
        lines: [
          {
            speaker: "",
            text: "第二步、第三步接着落下，你不敢抬头直望上首，只能任心念顺着锅中之豆、釜下之火去找一句既能自明又不能把人逼绝的话。",
          },
          {
            speaker: "曹植",
            text: "若只是作巧句，今日过不了这一关。能救命的，不是工整，而是要让人听见我不敢明说的那层意思。",
          },
        ],
      },
      {
        beatId: "first-couplet",
        lines: [
          {
            speaker: "",
            text: "到第三步将尽时，句子终于先于慌乱落了下来。你知道这一开口，往后每一个字都再没有回头余地。",
          },
        ],
      },
      {
        beatId: "fourth-fifth-steps",
        lines: [
          {
            speaker: "",
            text: "第四步、第五步往前逼时，锅下的火和釜中的豆忽然都带上了人心的影子。殿里那些不敢抬眼的人，像也顺着你的句子听见了火里真正要烧到谁。",
          },
          {
            speaker: "侍从",
            text: "殿中连换气都慢了，谁也不敢先看陛下的神色。",
          },
        ],
      },
      {
        beatId: "middle-couplet",
        lines: [
          {
            speaker: "",
            text: "中间这两句一出口，诗意已经不再只是写物。你能感觉到群臣的沉默开始发硬，他们都听见了其中的人情和兄弟，却没人敢替这层意思点破。",
          },
        ],
      },
      {
        beatId: "sixth-seventh-steps",
        lines: [
          {
            speaker: "",
            text: "第六步时，你已经知道最后两句只能落到同根之意上；第七步逼近时，真正压人的不再是才思够不够快，而是你敢不敢把兄弟之痛当着满殿的人说到最深处。",
          },
          {
            speaker: "曹植",
            text: "再往前一步，若仍只藏着，不如不诗。可若说得太直，我也未必还能从这殿里把命带出去。",
          },
        ],
      },
      {
        beatId: "final-couplet",
        lines: [
          {
            speaker: "",
            text: "最后两句出口之前，殿中的冷意已经压到最高。你知道真正要刺中的不是谁的耳朵，而是兄弟之间一直不肯明说的那层裂口。",
          },
        ],
      },
      {
        beatId: "hall-falls-silent",
        lines: [
          {
            speaker: "",
            text: "诗成之后，大殿反而比先前更静。连平日最会察色的近臣也不敢先抬头，所有人都在等曹丕如何接住这六句把话说到底的诗。",
          },
          {
            speaker: "曹丕",
            text: "你倒真把话写出来了。",
          },
        ],
      },
      {
        beatId: "pressure-eases",
        lines: [
          {
            speaker: "曹丕",
            text: "既能在七步之内成诗，朕今日便不再多逼。只是有些心思，最好仍让它们停在诗里，不必再走到殿外去。",
          },
          {
            speaker: "",
            text: "这句话没有把寒意真正撤掉，却总算没再往前逼。你知道自己暂时活了下来，可也明白，刚才那六句已经把再也回不去的东西说穿了。",
          },
        ],
      },
      {
        beatId: "cold-aftertaste",
        lines: [
          {
            speaker: "",
            text: "退下之前，你回望那条刚走完的殿砖，七步已经不长，可每一步都像踩在兄弟之间越来越细的线上。命是暂时保住了，余下那点寒意却不会因为诗成就散干净。",
          },
          {
            speaker: "曹植",
            text: "诗能替我开一线生门，却开不了兄弟之间已经结下的这一层霜。",
          },
        ],
      },
    ],
  },
};

function createBoilBeansAiRequestId() {
  return `boil-beans-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getBoilBeansPlayableBase() {
  const playableContent = getEventPlayableContent(BOIL_BEANS_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(BOIL_BEANS_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("煮豆燃萁的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getBoilBeansViewpointProfile(
  viewpointId: SupportedBoilBeansViewpointId,
) {
  return boilBeansViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: BoilBeansAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      BOIL_BEANS_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createBoilBeansAiDebugInfo(
  config = getAiConfig(),
): BoilBeansAiDebugInfo {
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
  const profile = getBoilBeansViewpointProfile(BOIL_BEANS_AI_DEFAULT_VIEWPOINT_ID);

  return boilBeansBeatBlueprints
    .map((beat, index) =>
      [
        `${index + 1}. beatId=${beat.beatId}`,
        `title=${beat.title}`,
        `goal=${profile.beatGoals[beat.beatId]}`,
        `lineRange=${beat.minLines}-${beat.maxLines}`,
        `allowNarration=${beat.allowNarration ? "true" : "false"}`,
        `fixedPoemInjectedLocally=${beat.injectFixedPoem ? "true" : "false"}`,
        `allowedDialogueSpeakers=${allowedSpeakerNames.join(" / ")}`,
        `backgroundHandledLocally=${beat.backgroundTag}`,
      ].join(" | "),
    )
    .join("\n");
}

function buildBoilBeansStoryPackagePrompt(
  request: BoilBeansAiStoryPackageRequest & {
    viewpointId: SupportedBoilBeansViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(BOIL_BEANS_AI_EVENT_ID);
  const viewpoint = getBoilBeansViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "煮豆燃萁"}`,
    "这不是历史概述，不是文学赏析，也不是百科解说。",
    "这是曹植第一视角正在经历的一段殿中限时作诗求生现场：被召入殿、被逼七步成诗、每一步都越来越接近失手与失命、最后用诗把最不敢直说的话说到最深处。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "每一幕都必须围绕具体动作、殿中对话、脚步、目光和压力变化推进。",
    "对话必须短而有重量，曹丕不需要多话，但每一句都要有逼视感；侍从和群臣只能少量出现，用来烘托现场安静和目光压力。",
    "绝对不要生成、改写、补写、解释或仿写七步诗原文。与诗句相关的三组固定句子由本地系统注入，AI 只能写诗句前后与诗句之间的气氛、心理和对话内容。",
    "不要写抽象政治评价，不要写成兄弟相争的宏观概述，也不要写成夸张爽文。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "脚本应该像一段完整殿中现场，而不是观点列表或故事介绍。",
    "总 line 数量建议在 20 到 28 条之间，保证十二个 beat 都有基本展开空间，但不要写成长篇散文。",
    "固定 beat 顺序如下：",
    serializeBeatBlueprints(),
    "再次强调：三组七步诗正文不能生成，不能改写，不能仿写。遇到这三个 beat，你只写诗句前后的非诗句内容，让系统本地注入固定诗句。",
    `固定诗句如下，仅供你避开，不得输出：
1. 煮豆持作羹， / 漉菽以为汁。
2. 萁在釜下燃， / 豆在釜中泣。
3. 本自同根生， / 相煎何太急？`,
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredBoilBeansScriptPackage(params: {
  request: BoilBeansAiStoryPackageRequest & {
    viewpointId: SupportedBoilBeansViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: BoilBeansAiScriptPackage;
  debug: BoilBeansAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createBoilBeansAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildBoilBeansStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = boilBeansBeatBlueprints.length;
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
          name: "boil_beans_linear_script_package",
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
                enum: [BOIL_BEANS_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...BOIL_BEANS_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: boilBeansBeatBlueprints.length,
                maxItems: boilBeansBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: boilBeansBeatBlueprints.map((beat) => beat.beatId),
                    },
                    lines: {
                      type: "array",
                      minItems: 1,
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
    scriptPackage: JSON.parse(outputText) as BoilBeansAiScriptPackage,
    debug,
  };
}

function normalizeBoilBeansScriptLine(
  line: BoilBeansAiScriptLine,
): BoilBeansAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeBoilBeansScriptPackage(
  scriptPackage: BoilBeansAiScriptPackage,
): BoilBeansAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as BoilBeansBeatId,
      lines: beat.lines.map(normalizeBoilBeansScriptLine),
    })),
  };
}

function validateBoilBeansScriptPackage(
  scriptPackage: BoilBeansAiScriptPackage,
  viewpointId: SupportedBoilBeansViewpointId,
): BoilBeansScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== BOIL_BEANS_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${BOIL_BEANS_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== boilBeansBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${boilBeansBeatBlueprints.length}。`);
  }

  let narrationCount = 0;
  let caozhiDialogueCount = 0;
  let caopiDialogueCount = 0;

  boilBeansBeatBlueprints.forEach((blueprint, index) => {
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
      return;
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

      if (fixedPoemLineSet.has(line.text)) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 直接写出了固定诗句，系统会忽略 AI 版本并改用本地固定文本。`,
        );
      }

      if (!line.speaker) {
        narrationCount += 1;
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (line.text.length < 24) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补一点殿中压力或曹植判断。`,
          );
        }
        if (line.text.length > 120) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议收紧一点。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 不在允许名单中：${line.speaker}`,
        );
      }
      if (line.speaker === "曹植") {
        caozhiDialogueCount += 1;
      }
      if (line.speaker === "曹丕") {
        caopiDialogueCount += 1;
      }
      if (line.text.length < 10) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏短，读起来可能不够像完整人话。`,
        );
      }
      if (line.text.length > 68) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏长，建议再收紧一点。`,
        );
      }
    });
  });

  if (narrationCount < 5) {
    warnings.push("整段脚本旁白偏少，可能削弱曹植第一视角的紧迫感。");
  }
  if (caozhiDialogueCount < 3) {
    warnings.push("曹植直接开口的次数偏少，可能不够支撑七步求生的现场感。");
  }
  if (caopiDialogueCount < 2) {
    warnings.push("曹丕发言偏少，压迫感可能不够明确。");
  }

  Object.keys(fixedPoemCouplets).forEach((beatId) => {
    if (!scriptPackage.beats.find((beat) => beat.beatId === beatId)) {
      errors.push(`缺少固定诗句所在 beat：${beatId}`);
    }
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function createBoilBeansSceneText(
  lines: BoilBeansAiScriptLine[],
  separator = "\n",
) {
  return lines.map((line) => line.text).join(separator).trim();
}

function resolveBoilBeansSceneStandee(
  line: BoilBeansAiScriptLine,
): EventSceneStandee {
  if (!line.speaker) {
    return {
      mode: "hidden",
      speakerId: "narration",
      visualKey: "narration",
    };
  }

  const speakerId =
    boilBeansSpeakerVisualKeyMap[line.speaker as keyof typeof boilBeansSpeakerVisualKeyMap] ??
    line.speaker;

  return {
    mode: "speaker",
    speakerId,
    visualKey: speakerId,
    hideForViewpoint: true,
  };
}

function buildFixedPoemScene(
  beatId: keyof typeof fixedPoemCouplets,
  background: PlaceholderAsset,
  nextSceneId?: string,
): EventScene {
  return {
    sceneId: `${beatId}-poem`,
    type: "dialogue",
    speaker: "曹植",
    speakerId: "caozhi",
    text: fixedPoemCouplets[beatId].join("\n"),
    background,
    standee: {
      mode: "speaker",
      speakerId: "caozhi",
      visualKey: "caozhi",
      hideForViewpoint: true,
    },
    nextSceneId,
  };
}

function filterPoemLines(lines: BoilBeansAiScriptLine[]) {
  return lines.filter((line) => !fixedPoemLineSet.has(line.text));
}

function adaptBoilBeansScriptPackageToPlayableContent(
  scriptPackage: BoilBeansAiScriptPackage,
): EventPlayableContent {
  const basePlayableContent = getBoilBeansPlayableBase();
  const scenes: EventScene[] = [];

  boilBeansBeatBlueprints.forEach((blueprint, beatIndex) => {
    const beat = scriptPackage.beats[beatIndex];
    const background = boilBeansAiBackdropMap[blueprint.backgroundTag];
    const filteredLines = filterPoemLines(beat?.lines ?? []);

    filteredLines.forEach((line, lineIndex) => {
      scenes.push({
        sceneId: `${blueprint.beatId}-${lineIndex + 1}`,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker || "旁白",
        speakerId: line.speaker
          ? boilBeansSpeakerVisualKeyMap[
              line.speaker as keyof typeof boilBeansSpeakerVisualKeyMap
            ]
          : "narration",
        text: createBoilBeansSceneText([line]),
        background,
        standee: resolveBoilBeansSceneStandee(line),
      });
    });

    if (
      blueprint.injectFixedPoem &&
      Object.prototype.hasOwnProperty.call(fixedPoemCouplets, blueprint.beatId)
    ) {
      scenes.push(
        buildFixedPoemScene(
          blueprint.beatId as keyof typeof fixedPoemCouplets,
          background,
        ),
      );
    }
  });

  scenes.forEach((scene, index) => {
    scene.nextSceneId = scenes[index + 1]?.sceneId;
  });

  return {
    ...basePlayableContent,
    protocolVersion: "event-story-v1",
    contentSource: "local-scripted",
    initialSceneId: scenes[0]?.sceneId ?? basePlayableContent.initialSceneId,
    scenes,
  };
}

function createFallbackScriptPackage(
  viewpointId: SupportedBoilBeansViewpointId,
): BoilBeansAiScriptPackage {
  const profile = getBoilBeansViewpointProfile(viewpointId);
  return {
    packageId: `boil-beans-fallback-${viewpointId}`,
    storyId: BOIL_BEANS_AI_EVENT_ID,
    protocolVersion: BOIL_BEANS_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(
  viewpointId: SupportedBoilBeansViewpointId,
): EventPlayableContent {
  return adaptBoilBeansScriptPackageToPlayableContent(
    createFallbackScriptPackage(viewpointId),
  );
}

export function shouldUseBoilBeansAiMode(eventId: string, viewpointId?: string) {
  return (
    eventId === BOIL_BEANS_AI_EVENT_ID &&
    (!!viewpointId
      ? BOIL_BEANS_AI_SUPPORTED_VIEWPOINT_IDS.includes(
          viewpointId as SupportedBoilBeansViewpointId,
        )
      : true)
  );
}

export function getBoilBeansAiInitialViewpointId() {
  return BOIL_BEANS_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateBoilBeansAiStoryPackage(
  params: BoilBeansAiStoryPackageRequest,
): Promise<BoilBeansAiStoryPackageResponse> {
  const viewpointId = (params.viewpointId ||
    BOIL_BEANS_AI_DEFAULT_VIEWPOINT_ID) as SupportedBoilBeansViewpointId;
  const fallbackPlayableContent = getFallbackPlayableContent(viewpointId);
  const requestId = params.clientRequestId?.trim() || createBoilBeansAiRequestId();
  const serviceStart = performance.now();

  if (!shouldUseBoilBeansAiMode(params.eventId, viewpointId)) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前接口只支持煮豆燃萁的曹植整包剧情生成请求。",
    };
  }

  let debug = createBoilBeansAiDebugInfo();
  debug.requestId = requestId;

  try {
    const aiResult = await requestStructuredBoilBeansScriptPackage({
      request: {
        ...params,
        viewpointId,
      },
      requestId,
    });
    debug = aiResult.debug;

    const validationStart = performance.now();
    const normalizedPackage = normalizeBoilBeansScriptPackage(aiResult.scriptPackage);
    const validation = validateBoilBeansScriptPackage(normalizedPackage, viewpointId);
    debug.timings.validationMs = Number((performance.now() - validationStart).toFixed(1));
    debug.metrics.packageLineCount = normalizedPackage.beats.reduce(
      (sum, beat) => sum + beat.lines.length,
      0,
    );

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));
      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 线性脚本结构不合法，已切回本地静态剧情。",
        debug,
      };
    }

    const adaptStart = performance.now();
    const playableContent = adaptBoilBeansScriptPackageToPlayableContent(normalizedPackage);
    debug.timings.adaptMs = Number((performance.now() - adaptStart).toFixed(1));
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    return {
      ok: true,
      source: "ai",
      scriptPackage: normalizedPackage,
      playableContent,
      warning: formatStoryWarningSummary(validation.warnings),
      debug,
    };
  } catch (error) {
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: error instanceof Error ? error.message : "煮豆燃萁剧情生成失败。",
      debug,
    };
  }
}
