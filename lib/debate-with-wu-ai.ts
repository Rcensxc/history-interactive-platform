import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import { formatStoryWarningSummary } from "@/lib/story-warning";
import type {
  DebateWithWuScholarsAiScriptBeat,
  DebateWithWuScholarsAiScriptPackage,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
} from "@/types/content";

export const DEBATE_WITH_WU_AI_EVENT_ID = "debate-with-wu-scholars";
export const DEBATE_WITH_WU_AI_DEFAULT_VIEWPOINT_ID = "zhuge-liang";
export const DEBATE_WITH_WU_AI_SUPPORTED_VIEWPOINT_IDS = ["zhuge-liang"] as const;

type SupportedDebateWithWuViewpointId =
  (typeof DEBATE_WITH_WU_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const DEBATE_WITH_WU_AI_DEFAULT_MODEL = "Qwen3Flash";
const DEBATE_WITH_WU_AI_SCRIPT_PROTOCOL_VERSION =
  "debate-with-wu-scholars-linear-script-v1" as const;

type DebateWithWuBeatId =
  | "enter-wu-hall"
  | "courtiers-open"
  | "zhangzhao-challenges"
  | "zhuge-initial-answer"
  | "courtiers-press"
  | "zhuge-counter-question"
  | "zhangzhao-argues-again"
  | "zhuge-reveals-stakes"
  | "sunquan-observes"
  | "resistance-softens"
  | "final-stance"
  | "hall-after-echo";

type DebateWithWuBeatBlueprint = {
  beatId: DebateWithWuBeatId;
  title: string;
  backgroundTag: keyof typeof debateWithWuAiBackdropMap;
  minLines: number;
  maxLines: number;
};

type DebateWithWuViewpointProfile = {
  id: SupportedDebateWithWuViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<DebateWithWuBeatId, string>;
  fallbackBeats: DebateWithWuScholarsAiScriptBeat[];
};

type DebateWithWuAiDebugInfo = {
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

export type DebateWithWuAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type DebateWithWuAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: DebateWithWuScholarsAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: DebateWithWuAiDebugInfo;
};

type DebateWithWuScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const debateWithWuAiBackdropMap = {
  "court-approach": {
    label: "堂前",
    tone: "ink",
    description:
      "背景占位图：入吴堂前的长阶与门影，把还未开口的议论先压成了一股并不友善的气息。",
    backgroundKey: "wu-court-approach",
  },
  "debate-hall": {
    label: "朝堂",
    tone: "ink",
    description:
      "背景占位图：东吴议事堂上臣列分坐，真正压人的不是兵刃，而是一句句发问落在堂中时那种没法后退的感觉。",
    backgroundKey: "wu-court-hall",
  },
  dais: {
    label: "主位",
    tone: "jade",
    description:
      "背景占位图：主位与堂前之间隔着并不算远的距离，谁的话真正撬动了局面，都能被看得格外清楚。",
    backgroundKey: "wu-court-dais",
  },
  "after-debate": {
    label: "余声",
    tone: "amber",
    description:
      "背景占位图：辩论暂歇之后，堂上没有立刻散去，低声交换的目光和未说出口的判断还悬在空气里。",
    backgroundKey: "wu-court-after",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const debateWithWuSpeakerVisualKeyMap = {
  诸葛亮: "zhuge-liang",
  张昭: "zhangzhao",
  东吴群臣: "courtier",
  孙权: "sunquan",
  引路内侍: "usher",
} as const;

const allowedSpeakerNames = [
  "诸葛亮",
  "张昭",
  "东吴群臣",
  "孙权",
  "引路内侍",
] as const;

const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const debateWithWuBeatBlueprints: DebateWithWuBeatBlueprint[] = [
  { beatId: "enter-wu-hall", title: "入吴堂前", backgroundTag: "court-approach", minLines: 2, maxLines: 3 },
  { beatId: "courtiers-open", title: "群臣先声", backgroundTag: "debate-hall", minLines: 2, maxLines: 3 },
  { beatId: "zhangzhao-challenges", title: "张昭发难", backgroundTag: "debate-hall", minLines: 2, maxLines: 3 },
  { beatId: "zhuge-initial-answer", title: "诸葛亮初答", backgroundTag: "dais", minLines: 2, maxLines: 3 },
  { beatId: "courtiers-press", title: "群臣追问", backgroundTag: "debate-hall", minLines: 2, maxLines: 3 },
  { beatId: "zhuge-counter-question", title: "诸葛亮反问", backgroundTag: "dais", minLines: 2, maxLines: 3 },
  { beatId: "zhangzhao-argues-again", title: "张昭再辩", backgroundTag: "debate-hall", minLines: 2, maxLines: 3 },
  { beatId: "zhuge-reveals-stakes", title: "诸葛亮点破利害", backgroundTag: "dais", minLines: 2, maxLines: 3 },
  { beatId: "sunquan-observes", title: "孙权观察", backgroundTag: "dais", minLines: 2, maxLines: 3 },
  { beatId: "resistance-softens", title: "群臣气势松动", backgroundTag: "debate-hall", minLines: 2, maxLines: 3 },
  { beatId: "final-stance", title: "诸葛亮收束陈词", backgroundTag: "dais", minLines: 2, maxLines: 3 },
  { beatId: "hall-after-echo", title: "朝堂余声", backgroundTag: "after-debate", minLines: 2, maxLines: 3 },
];

const debateWithWuViewpointProfiles: Record<
  SupportedDebateWithWuViewpointId,
  DebateWithWuViewpointProfile
> = {
  "zhuge-liang": {
    id: "zhuge-liang",
    displayName: "诸葛亮",
    title: "东吴朝堂使者视角",
    narrationRule:
      "旁白只能写诸葛亮第一视角当下亲眼所见和心里立刻掠过的判断：堂上谁在先开口、哪一句是在试探、哪一句是在真正逼问、孙权的神色有没有变化、群臣的气势是更齐了还是已经松动。不要写成历史总结或战略论文。",
    userGoal:
      "把诸葛亮写成一个在满堂质疑里保持冷静、善于转移问题焦点的人。他不是为了逞口舌之快，而是要把东吴的注意力从“刘备能不能撑住”一点点扳到“江东若先求降会失去什么”。",
    voiceNotes: [
      "诸葛亮说话要克制、聪明、有锋芒，但不要长篇演讲。",
      "张昭和群臣不是反派，他们要表现出对曹军压力的真实顾虑。",
      "孙权不必多说话，但要让人感觉到他在认真衡量哪一边更站得住。",
      "对话必须有来有回，每一句最好都接住上一句，而不是各说各的。",
    ],
    beatGoals: {
      "enter-wu-hall": "先把诸葛亮放进并不友善的堂前，让玩家感到今天注定不是一次轻松会见。",
      "courtiers-open": "让群臣先把矛头对准刘备实力，朝堂压力由此形成。",
      "zhangzhao-challenges": "让张昭代表主降一方提出尖锐而现实的质疑，话要重但不能工具人化。",
      "zhuge-initial-answer": "诸葛亮先稳住节奏，不急着动怒，而是把刘备处境和曹操威胁一起摆出来。",
      "courtiers-press": "继续加压，让堂上反问东吴若抗曹失败怎么办。",
      "zhuge-counter-question": "让诸葛亮把问题反过来，逼东吴去看求降的代价。",
      "zhangzhao-argues-again": "张昭继续坚持谨慎立场，体现他不是空口阻拦，而是真有现实顾虑。",
      "zhuge-reveals-stakes": "诸葛亮点破利害，把降曹不等于安全这一层说实。",
      "sunquan-observes": "通过细节写孙权开始更认真地听，而不是马上表态。",
      "resistance-softens": "让原本整齐的反对声出现裂缝，有人开始沉默或改口。",
      "final-stance": "诸葛亮用短而有力的话收束，不要写成长篇陈词。",
      "hall-after-echo": "收在朝堂现场余味上，让人感觉真正决断还没下，但风向已经被撬动。",
    },
    fallbackBeats: [
      {
        beatId: "enter-wu-hall",
        lines: [
          {
            speaker: "",
            text: "你被引入东吴议事堂前时，门内低声议论并没有因为脚步靠近就停下。堂上的气息不算失礼，却也绝称不上欢迎，像每个人都已经先替你准备好了一轮要问的话。",
          },
          {
            speaker: "引路内侍",
            text: "诸葛先生，请入堂。主上与群臣都在等你，只是今日堂上议得正紧，先生进门之后，怕是很难只说一句客套话了。",
          },
        ],
      },
      {
        beatId: "courtiers-open",
        lines: [
          {
            speaker: "东吴群臣",
            text: "刘备兵少势弱，寄身荆州尚且未稳，如今却要江东陪着去挡曹操。使者既来了，不如先说清楚：凭什么要我们把整片江东跟着押上？",
          },
          {
            speaker: "",
            text: "这一句一落下，堂中不少目光都朝你压来。你知道今日若只照着寻常陈情的路去答，堂上的人不会给你第二次慢慢解释的机会。",
          },
        ],
      },
      {
        beatId: "zhangzhao-challenges",
        lines: [
          {
            speaker: "张昭",
            text: "刘玄德屡经败阵，如今寄兵于外、根基未定，却想拉江东同抗曹公。先生既号称善谋，总该先回答一句：凭这样薄的家底，何以让人信你们不是先把别人拖下水？",
          },
          {
            speaker: "",
            text: "张昭这话并不高声，却把堂上的试探一下说实了。你一抬眼，就能看见不少人已经顺着他的话把问题越推越近，只等看你怎么接。",
          },
        ],
      },
      {
        beatId: "zhuge-initial-answer",
        lines: [
          {
            speaker: "诸葛亮",
            text: "玄德兵少，这一点亮不讳言；曹操势大，亮也不敢轻看。可今日真正该问的，不是谁眼下一时强弱，而是曹操若顺江东而下，诸位还能不能像今日这样安坐堂中，自议去留。",
          },
          {
            speaker: "",
            text: "你先不跟着堂上的轻视走，只把问题往更大的去路上扳。几道原本带着笑意的目光先收了一收，像是没想到你不替刘备辩白，反倒先把江东摆上了桌面。",
          },
        ],
      },
      {
        beatId: "courtiers-press",
        lines: [
          {
            speaker: "东吴群臣",
            text: "若抗曹而败，江东岂不是先毁在自己手里？你说不降是险，难道迎战就不是险？若这一步踏错，孙氏多年基业又由谁来担？",
          },
          {
            speaker: "",
            text: "堂上的议论声比先前更实了些。你听得出来，这已经不只是质疑刘备，而是在逼你证明：抗曹到底凭什么不是把江东推向另一种更快的险境。",
          },
        ],
      },
      {
        beatId: "zhuge-counter-question",
        lines: [
          {
            speaker: "诸葛亮",
            text: "若一味只求眼前稳妥，便真有稳妥可言吗？江东今日若先低头，曹操得地得势，往后主上还能守住几成自主？若终究避不开强敌，越早看清这一点，江东才越不是被人逼到墙角才反应。",
          },
          {
            speaker: "",
            text: "你把话锋从“刘备能否倚靠”转成“江东究竟敢不敢把命运交给别人”。堂上有人下意识要接话，却又像先被这层反问绊了一下。",
          },
        ],
      },
      {
        beatId: "zhangzhao-argues-again",
        lines: [
          {
            speaker: "张昭",
            text: "曹军强盛是实，江东兵民也是真。老臣所忧的不是一时名节，而是若贸然交战，败则俱败。江东不是不能战，而是不能只凭几句激昂之词，就把多年积蓄一起押进去。",
          },
          {
            speaker: "诸葛亮",
            text: "张公所虑，亮并不敢轻。可正因江东多年自立，才更该明白：真正会让这些积蓄一朝尽失的，不是先做准备的一战，而是把求安错当成求生。",
          },
        ],
      },
      {
        beatId: "zhuge-reveals-stakes",
        lines: [
          {
            speaker: "诸葛亮",
            text: "降曹并不等于安全，只是把今日必须自己扛的难，换成往后要受人摆布的难。江东若还能自作主张，便当想清楚要守的是地，是人，还是能不能继续自己做决定。",
          },
          {
            speaker: "东吴群臣",
            text: "……使者这话，倒不是替刘备一味求援了。若只顾眼前松快，往后真未必还能轮到江东自己说了算。",
          },
        ],
      },
      {
        beatId: "sunquan-observes",
        lines: [
          {
            speaker: "",
            text: "你这时才看见孙权先前一直按在扶手上的手收紧了一寸。他并未立刻发话，可那道原本只像旁听的目光已经真正落到你和张昭之间，像是在衡量谁说的才是江东必须先面对的事。",
          },
          {
            speaker: "孙权",
            text: "堂上之议，孤都听着。使者不必急于求成，但有一层倒说得清楚：此事不能只看刘备，也不能只看一时的安稳。",
          },
        ],
      },
      {
        beatId: "resistance-softens",
        lines: [
          {
            speaker: "东吴群臣",
            text: "若真要抗曹，也总得有能抗的法子。只是现在看来，使者说的已不止是替刘备求援，而是在逼江东先想清楚：这一步究竟是险在前，还是险在后。",
          },
          {
            speaker: "",
            text: "原本整齐的反对声到这里终于不像先前那样齐整了。有人沉默，有人交换眼神，有人不再急着替求降辩护，你知道堂上的缝已经被撬开了一道。",
          },
        ],
      },
      {
        beatId: "final-stance",
        lines: [
          {
            speaker: "诸葛亮",
            text: "亮今日来，不是逼江东逞一时血气，只是把真正的选择摆在堂上。抗曹固然险，可求降未必生；若终须一战，越早看清这一点，江东便越是替自己守根本，而不是替旁人收残局。",
          },
          {
            speaker: "孙权",
            text: "今日之议，已不必再照旧话反复。诸位各自退后再思量，孤也要把方才这番话，静下来重新掂一掂。",
          },
        ],
      },
      {
        beatId: "hall-after-echo",
        lines: [
          {
            speaker: "",
            text: "堂上一时安静下来，连刚才接得最急的声音都慢了半拍。你知道今日并没有把大局当场定下，可也看见那层原本绷得很紧的反对，已经被撬出一道能让真正决断透进来的缝。",
          },
          {
            speaker: "东吴群臣",
            text: "……使者这一遭，不只是在替刘备说话。堂上的事，怕是从这一刻起，就再难只按原先那条路往下走了。",
          },
        ],
      },
    ],
  },
};

function createDebateWithWuAiRequestId() {
  return `debate-with-wu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDebateWithWuPlayableBase() {
  const playableContent = getEventPlayableContent(DEBATE_WITH_WU_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(DEBATE_WITH_WU_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("舌战群儒的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getDebateWithWuViewpointProfile(
  viewpointId: SupportedDebateWithWuViewpointId,
) {
  return debateWithWuViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: DebateWithWuAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      DEBATE_WITH_WU_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createDebateWithWuAiDebugInfo(
  config = getAiConfig(),
): DebateWithWuAiDebugInfo {
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
  return debateWithWuBeatBlueprints
    .map(
      (beat, index) =>
        `${index + 1}. ${beat.beatId}《${beat.title}》推荐 ${beat.minLines}-${beat.maxLines} 条 line`,
    )
    .join("\n");
}

function buildDebateWithWuStoryPackagePrompt(params: {
  viewpointId: SupportedDebateWithWuViewpointId;
}) {
  const viewpoint = getDebateWithWuViewpointProfile(params.viewpointId);
  const systemPrompt = [
    "你正在为一个历史互动项目生成线性剧情脚本包。",
    `事件：舌战群儒。第一视角：${viewpoint.displayName}${viewpoint.title}。`,
    viewpoint.narrationRule,
    `写作目标：${viewpoint.userGoal}`,
    ...viewpoint.voiceNotes.map((note) => `- ${note}`),
    "",
    "这是一场发生在东吴朝堂上的具体辩论现场，不是赤壁前战略概述，不是历史意义总结，也不是诸葛亮个人长篇演讲。",
    "每一幕都必须写清楚：谁先发问、谁在回应、哪一句让堂上气氛更紧、哪一句让人心开始松动。",
    "张昭、孙权、东吴群臣、引路内侍都是剧情临时角色，可以说话，但他们不是人物馆可选人物，也不要把他们写成 standee 角色。",
    "dialogue 只能是一名角色在说话；narration 只能是空 speaker 的第一视角观察。",
    "所有对话都要接住上一句，避免各说各的。诸葛亮不能连续长篇输出，张昭也不能写成只负责抬杠的工具人。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或任何分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "这段脚本要让玩家感觉自己正在亲历一场东吴朝堂上的多轮辩论，而不是在读战略分析。",
    "总 line 数建议 24 到 32 条，保证有足够来回交锋，但不要写成长篇大段议论文。",
    "请严格按以下 beat 顺序生成：",
    serializeBeatBlueprints(),
    "",
    "每个 beat 的写法重点：",
    ...debateWithWuBeatBlueprints.map(
      (beat) => `- ${beat.beatId}: ${viewpoint.beatGoals[beat.beatId]}`,
    ),
  ].join("\n");

  return { systemPrompt, userPrompt };
}

async function requestStructuredDebateWithWuScriptPackage(params: {
  request: DebateWithWuAiStoryPackageRequest & {
    viewpointId: SupportedDebateWithWuViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: DebateWithWuScholarsAiScriptPackage;
  debug: DebateWithWuAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createDebateWithWuAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildDebateWithWuStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = debateWithWuBeatBlueprints.length;
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
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "debate_with_wu_scholars_story_package",
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
                enum: [DEBATE_WITH_WU_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...DEBATE_WITH_WU_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: debateWithWuBeatBlueprints.length,
                maxItems: debateWithWuBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: debateWithWuBeatBlueprints.map((beat) => beat.beatId),
                    },
                    lines: {
                      type: "array",
                      minItems: 2,
                      maxItems: 4,
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
                            minLength: 6,
                            maxLength: 160,
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

  debug.timings.upstreamRequestMs = Number(
    (performance.now() - upstreamStart).toFixed(1),
  );
  debug.upstreamStatus = response.status;
  debug.upstreamStatusText = response.statusText;

  const upstreamBody = await readResponseBody(response);
  debug.upstreamBody = upstreamBody;

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}.`);
  }

  const extractStart = performance.now();
  const payload = upstreamBody ? JSON.parse(upstreamBody) : {};
  const outputText = extractResponseText(payload);
  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number(
    (performance.now() - extractStart).toFixed(1),
  );

  if (!outputText) {
    throw new Error("AI 杩斿洖涓病鏈夊彲瑙ｆ瀽鐨勮剼鏈枃鏈€?");
  }

  return {
    scriptPackage: JSON.parse(outputText) as DebateWithWuScholarsAiScriptPackage,
    debug,
  };
}

function normalizeDebateWithWuScriptPackage(
  scriptPackage: DebateWithWuScholarsAiScriptPackage,
): DebateWithWuScholarsAiScriptPackage {
  return {
    ...scriptPackage,
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    beats: debateWithWuBeatBlueprints.map((blueprint, index) => {
      const sourceBeat = scriptPackage.beats[index];
      const lines = Array.isArray(sourceBeat?.lines) ? sourceBeat.lines : [];
      return {
        beatId: blueprint.beatId,
        lines: lines.map((line) => ({
          speaker: (line.speaker || "").trim(),
          text: line.text.trim(),
        })),
      };
    }),
  };
}

function validateDebateWithWuScriptPackage(
  scriptPackage: DebateWithWuScholarsAiScriptPackage,
  viewpointId: SupportedDebateWithWuViewpointId,
): DebateWithWuScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (scriptPackage.protocolVersion !== DEBATE_WITH_WU_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push("protocolVersion 与当前事件不匹配。");
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push("viewpointId 与当前事件请求不匹配。");
  }
  if (scriptPackage.beats.length !== debateWithWuBeatBlueprints.length) {
    errors.push("beat 数量不符合舌战群儒的固定骨架。");
  }

  let totalLines = 0;
  let narrationCount = 0;
  let zhugeDialogueCount = 0;
  let zhangzhaoDialogueCount = 0;
  let sunquanDialogueCount = 0;

  for (const [index, beat] of scriptPackage.beats.entries()) {
    const blueprint = debateWithWuBeatBlueprints[index];
    if (!blueprint) {
      errors.push(`第 ${index + 1} 个 beat 超出了固定骨架。`);
      continue;
    }
    if (beat.beatId !== blueprint.beatId) {
      errors.push(`beat 顺序错误：期待 ${blueprint.beatId}，收到 ${beat.beatId}。`);
    }
    if (!Array.isArray(beat.lines) || beat.lines.length === 0) {
      errors.push(`${beat.beatId} 缺少 lines。`);
      continue;
    }
    if (beat.lines.length < blueprint.minLines || beat.lines.length > blueprint.maxLines) {
      warnings.push(`${beat.beatId} 的 line 数量偏离推荐区间 ${blueprint.minLines}-${blueprint.maxLines}。`);
    }

    for (const [lineIndex, line] of beat.lines.entries()) {
      totalLines += 1;
      if (!line.text.trim()) {
        errors.push(`${beat.beatId} 第 ${lineIndex + 1} 条 line 缺少文本。`);
      }
      if (line.speaker && !allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(`${beat.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 不在允许名单内。`);
      }
      if (!line.speaker) {
        narrationCount += 1;
      }
      if (line.speaker === "诸葛亮") {
        zhugeDialogueCount += 1;
      }
      if (line.speaker === "张昭") {
        zhangzhaoDialogueCount += 1;
      }
      if (line.speaker === "孙权") {
        sunquanDialogueCount += 1;
      }
    }
  }

  if (totalLines < 24 || totalLines > 34) {
    warnings.push("总 line 数量偏离推荐范围 24-34。");
  }
  if (narrationCount > debateWithWuBeatBlueprints.length + 2) {
    warnings.push("旁白比重偏高，建议把更多压力放回堂上对话里。");
  }
  if (zhugeDialogueCount < 5) {
    warnings.push("诸葛亮直接发言偏少，主视角存在感可能不够。");
  }
  if (zhangzhaoDialogueCount < 2) {
    warnings.push("张昭发难和再辩的存在感偏弱，辩论张力可能不足。");
  }
  if (sunquanDialogueCount < 1) {
    warnings.push("孙权的观察或发声偏少，决策者被撬动的感觉可能不够明显。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatDebateWithWuScriptValidation(
  result: DebateWithWuScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (speaker === "诸葛亮") {
    return {
      mode: "speaker",
      speakerId: "zhuge-liang",
      visualKey: "zhuge-liang",
      hideForViewpoint: true,
    };
  }

  return { mode: "hidden" };
}

function adaptDebateWithWuScriptPackageToPlayableContent(
  scriptPackage: DebateWithWuScholarsAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getDebateWithWuPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = debateWithWuBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        debateWithWuSpeakerVisualKeyMap[
          line.speaker as keyof typeof debateWithWuSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: debateWithWuAiBackdropMap[blueprint.backgroundTag],
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
    eventId: DEBATE_WITH_WU_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): DebateWithWuScholarsAiScriptPackage {
  const profile = getDebateWithWuViewpointProfile(
    DEBATE_WITH_WU_AI_DEFAULT_VIEWPOINT_ID,
  );

  return {
    packageId: "debate-with-wu-scholars-fallback-zhuge-liang",
    storyId: "debate-with-wu-scholars-zhuge-liang",
    protocolVersion: DEBATE_WITH_WU_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: DEBATE_WITH_WU_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isDebateWithWuAiSupportedViewpoint(viewpointId)) {
    return getDebateWithWuPlayableBase();
  }

  return adaptDebateWithWuScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isDebateWithWuAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedDebateWithWuViewpointId {
  return (
    DEBATE_WITH_WU_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]
  ).includes(viewpointId);
}

export function shouldUseDebateWithWuAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || DEBATE_WITH_WU_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === DEBATE_WITH_WU_AI_EVENT_ID &&
    isDebateWithWuAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getDebateWithWuAiInitialViewpointId() {
  return DEBATE_WITH_WU_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateDebateWithWuAiStoryPackage(
  params: DebateWithWuAiStoryPackageRequest,
): Promise<DebateWithWuAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== DEBATE_WITH_WU_AI_EVENT_ID ||
    !isDebateWithWuAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持舌战群儒的诸葛亮 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createDebateWithWuAiRequestId();
    const { scriptPackage, debug } = await requestStructuredDebateWithWuScriptPackage({
      request: {
        ...params,
        viewpointId: params.viewpointId,
      },
      requestId,
    });

    const normalizedPackage = normalizeDebateWithWuScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateDebateWithWuScriptPackage(
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
        warning:
          formatStoryWarningSummary(validation.warnings) ??
          "AI 输出结构不合法，已切回本地静态剧情。",
        error: formatDebateWithWuScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const playableContent = adaptDebateWithWuScriptPackageToPlayableContent(
      normalizedPackage,
    );
    debug.timings.adaptMs = Number((performance.now() - adaptStart).toFixed(1));
    debug.timings.serviceTotalMs = Number(
      (performance.now() - serviceStart).toFixed(1),
    );
    debug.metrics.packageLineCount = normalizedPackage.beats.reduce(
      (sum, beat) => sum + beat.lines.length,
      0,
    );

    return {
      ok: true,
      scriptPackage: normalizedPackage,
      playableContent,
      source: "ai",
      warning: formatStoryWarningSummary(validation.warnings),
      debug,
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      warning: "AI 线性脚本生成失败，已切回本地静态剧情。",
      error: error instanceof Error ? error.message : "未知错误",
      debug: {
        ...createDebateWithWuAiDebugInfo(),
        requestId: params.clientRequestId?.trim() || "",
        timings: {
          serviceTotalMs: Number((performance.now() - serviceStart).toFixed(1)),
        },
      },
    };
  }
}
