import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import { formatStoryWarningSummary } from "@/lib/story-warning";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
  ScrapeBoneAiScriptBeat,
  ScrapeBoneAiScriptLine,
  ScrapeBoneAiScriptPackage,
} from "@/types/content";

export const SCRAPE_BONE_AI_EVENT_ID = "scrape-bone-healing";
export const SCRAPE_BONE_AI_DEFAULT_VIEWPOINT_ID = "guanyu";
export const SCRAPE_BONE_AI_SUPPORTED_VIEWPOINT_IDS = ["guanyu"] as const;

type SupportedScrapeBoneViewpointId =
  (typeof SCRAPE_BONE_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const SCRAPE_BONE_AI_DEFAULT_MODEL = "Qwen3Flash";
const SCRAPE_BONE_AI_SCRIPT_PROTOCOL_VERSION =
  "scrape-bone-linear-script-v1" as const;

type ScrapeBoneBeatId =
  | "injury-in-tent"
  | "huatuo-examines"
  | "guanyu-accepts"
  | "tools-prepared"
  | "first-cut"
  | "scraping-bone"
  | "guanyu-keeps-composure"
  | "huatuo-continues"
  | "bandage-wrapped"
  | "treatment-complete"
  | "aftertaste-in-tent";

type ScrapeBoneBeatBlueprint = {
  beatId: ScrapeBoneBeatId;
  title: string;
  backgroundTag: keyof typeof scrapeBoneAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type ScrapeBoneViewpointProfile = {
  id: SupportedScrapeBoneViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<ScrapeBoneBeatId, string>;
  fallbackBeats: ScrapeBoneAiScriptBeat[];
};

type ScrapeBoneAiDebugInfo = {
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

export type ScrapeBoneAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type ScrapeBoneAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: ScrapeBoneAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: ScrapeBoneAiDebugInfo;
};

type ScrapeBoneScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const scrapeBoneAiBackdropMap = {
  "healing-tent": {
    label: "军帐",
    tone: "jade",
    description:
      "背景占位图：帐中灯火偏低，药气压着布帛与兵甲的气味，几乎所有人都把呼吸放轻了。",
    backgroundKey: "war-tent-healing",
  },
  "surgery-table": {
    label: "疗伤",
    tone: "amber",
    description:
      "背景占位图：刀具、药物和布帛都摆在近处，真正压人的不是兵刃，而是所有人都知道那一刀很快就会落下。",
    backgroundKey: "war-tent-surgery",
  },
  "after-bandage": {
    label: "收束",
    tone: "amber",
    description:
      "背景占位图：包扎已成，帐中的压迫感慢慢松开，灯影、药气和人声都像刚从紧绷里退出来。",
    backgroundKey: "war-tent-recovery",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const scrapeBoneSpeakerVisualKeyMap = {
  关羽: "guanyu",
  华佗: "huatuo",
  军医助手: "assistant",
  帐中将士: "soldier",
} as const;

const allowedSpeakerNames = ["关羽", "华佗", "军医助手", "帐中将士"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const scrapeBoneBeatBlueprints: ScrapeBoneBeatBlueprint[] = [
  {
    beatId: "injury-in-tent",
    title: "军帐内的伤势",
    backgroundTag: "healing-tent",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "huatuo-examines",
    title: "华佗查看伤口",
    backgroundTag: "healing-tent",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "guanyu-accepts",
    title: "关羽决定治疗",
    backgroundTag: "healing-tent",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "tools-prepared",
    title: "刀具准备",
    backgroundTag: "surgery-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "first-cut",
    title: "第一刀落下",
    backgroundTag: "surgery-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "scraping-bone",
    title: "刮骨之声",
    backgroundTag: "surgery-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "guanyu-keeps-composure",
    title: "关羽谈笑如常",
    backgroundTag: "surgery-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "huatuo-continues",
    title: "华佗继续清毒",
    backgroundTag: "surgery-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "bandage-wrapped",
    title: "包扎伤口",
    backgroundTag: "after-bandage",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "treatment-complete",
    title: "治疗结束",
    backgroundTag: "after-bandage",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "aftertaste-in-tent",
    title: "余声收束",
    backgroundTag: "after-bandage",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const scrapeBoneViewpointProfiles: Record<
  SupportedScrapeBoneViewpointId,
  ScrapeBoneViewpointProfile
> = {
  guanyu: {
    id: "guanyu",
    displayName: "关羽",
    title: "军帐主视角",
    narrationRule:
      "旁白只能写关羽第一视角此刻亲眼看到、听到和压在心上的东西：帐中灯火、药气、伤口的沉重感、华佗下刀前后的节奏、帐中将士的神色变化，以及自己如何在众人面前把痛与威仪一起稳住。不要写成人物品格评价，也不要写成血腥猎奇描写。",
    userGoal:
      "把关羽写成一个明知剧痛将至、却不肯在帐中失态的人。他不是靠高喊口号显勇，而是靠短句、动作和继续下棋或饮酒的从容，把众人先稳住，再把自己稳住。",
    voiceNotes: [
      "关羽说话要短、稳、有硬气，但不要夸张成爽文式豪语。",
      "华佗说话要体现医者判断与风险说明，不要写成冷冰冰的医学解说。",
      "帐中将士和军医助手可以少量出声，用来增强紧张与震动，但不要喧宾夺主。",
      "对痛感的描写要克制，重点是空气、声音、目光和众人反应带来的压力，不要写血腥细节。",
    ],
    beatGoals: {
      "injury-in-tent":
        "让玩家先落在军帐之中，看见伤势、灯火和将士神色，先立起压抑气氛。",
      "huatuo-examines":
        "让华佗明确说出毒已入骨、必须刮骨去毒，把治疗风险落下来。",
      "guanyu-accepts":
        "让关羽做出决定，并用短句与动作表现他不愿在众人面前露怯。",
      "tools-prepared":
        "把刀具、药物、布帛摆开时的静压写清楚，让所有人都知道真正危险的一刻要到了。",
      "first-cut":
        "让第一刀落下时的紧张感进入现场，但不要过度血腥。",
      "scraping-bone":
        "重点写那种令人发紧的声音和旁人的反应，让压力达到高点。",
      "guanyu-keeps-composure":
        "让关羽通过谈笑、下棋或饮酒把镇定立住，不要只靠一句‘我不怕痛’。",
      "huatuo-continues":
        "让华佗继续治疗并与关羽形成自然对话，体现两人都在硬撑这一刻。",
      "bandage-wrapped":
        "包扎开始时要明显感觉到帐中压迫感松开，但余悸还在。",
      "treatment-complete":
        "让华佗说明毒已去、治疗完成，帐中众人终于敢重新出声。",
      "aftertaste-in-tent":
        "收在军帐余味里，不做宏大总结，只让玩家记住刚才那份克制的震动。",
    },
    fallbackBeats: [
      {
        beatId: "injury-in-tent",
        lines: [
          {
            speaker: "",
            text: "你坐在军帐里，左臂伤处已经黑得发沉。灯火压低，药气和汗味一起闷在帐中，将士们明明离得不远，却像谁也不敢先把目光久留在那条手臂上。",
          },
          {
            speaker: "帐中将士",
            text: "将军，伤口又肿了。华先生已在帐外候着，只等您一句话。",
          },
        ],
      },
      {
        beatId: "huatuo-examines",
        lines: [
          {
            speaker: "华佗",
            text: "毒气已入骨，再拖便不是痛不痛的问题了。要保住这条手臂，只能割开伤处，刮骨去毒。",
          },
          {
            speaker: "",
            text: "帐中几个人听见“刮骨”二字时，脸色都跟着变了一变。比起伤口本身，更吓人的是他们都知道，这一刀下去谁也替不了你。",
          },
        ],
      },
      {
        beatId: "guanyu-accepts",
        lines: [
          {
            speaker: "关羽",
            text: "既然该治，就不必多说。摆棋，置酒，都照常来。先生只管下手，不必为我缓半分。",
          },
          {
            speaker: "",
            text: "你把话说得很平，像只是安排一件日常小事。可帐里的人都听得出来，这不是逞强，是你不肯让众人先看见你乱。",
          },
        ],
      },
      {
        beatId: "tools-prepared",
        lines: [
          {
            speaker: "军医助手",
            text: "布帛、药末、热酒都备好了。若有人撑不住帐中这场面，便往外退一步，别在先生落刀时乱了手脚。",
          },
          {
            speaker: "",
            text: "刀具和药物摆齐后，帐里忽然静得出奇。有人把呼吸放得更轻，有人索性偏开视线，仿佛不先回避一点，就会连自己的手心也跟着发抖。",
          },
        ],
      },
      {
        beatId: "first-cut",
        lines: [
          {
            speaker: "",
            text: "第一刀落下时，帐中没有人出声。你只觉得伤处那一点骤然绷紧，像整条手臂都被拉到了一根看不见的线上，灯火、药气和众人的目光也跟着一起收窄了。",
          },
          {
            speaker: "帐中将士",
            text: "……末将还是头一回见人这样治伤。",
          },
        ],
      },
      {
        beatId: "scraping-bone",
        lines: [
          {
            speaker: "",
            text: "刀刃往里走，细而发紧的刮擦声从帐中央一点点传开。那声音并不高，却比战场上的喊杀更让人后背发凉，连棋子落在案上的轻响都像被压住了。",
          },
          {
            speaker: "华佗",
            text: "再忍片刻，毒还没清透。越是这时候，越不能乱。",
          },
        ],
      },
      {
        beatId: "guanyu-keeps-composure",
        lines: [
          {
            speaker: "关羽",
            text: "这一局还没分出高下，谁先乱手，谁便先输。你们若实在不敢看，就把眼睛放到棋盘上，不必都盯着我这条手臂。",
          },
          {
            speaker: "",
            text: "你把话说得像平日帐中闲谈，可正因为说得平，帐里的人才更难掩住脸上的震动。痛并没有少半分，只是被你硬生生压在了神色下面。",
          },
        ],
      },
      {
        beatId: "huatuo-continues",
        lines: [
          {
            speaker: "华佗",
            text: "将军能稳得住，我这里就能做得更准。再往下一点，毒血清尽，手臂才能真保下来。",
          },
          {
            speaker: "关羽",
            text: "先生只管治。帐里今日若先怕了，往后上阵时，才真要叫人笑话。",
          },
        ],
      },
      {
        beatId: "bandage-wrapped",
        lines: [
          {
            speaker: "",
            text: "等药敷上去、布帛一圈圈缠回手臂，帐里的压迫感才慢慢散开。方才不敢抬头的人这时才敢重新看过来，像刚从一场极长的静默里透出一口气。",
          },
          {
            speaker: "军医助手",
            text: "药已敷稳，只剩最后包扎。再撑一撑，这一阵就算过去了。",
          },
        ],
      },
      {
        beatId: "treatment-complete",
        lines: [
          {
            speaker: "华佗",
            text: "毒已去得差不多了，静养便可。今日这一刀总算没白挨，往后只要不再拖误，手臂照旧能用。",
          },
          {
            speaker: "关羽",
            text: "如此便好。诸位不必再守着一脸惊色，刀已落完，帐中这口气也该放回去了。",
          },
        ],
      },
      {
        beatId: "aftertaste-in-tent",
        lines: [
          {
            speaker: "",
            text: "你收回手臂时，帐中终于有人敢重新说话。刀声早停了，可方才那阵紧绷还留在每张脸上。真正留住众人的，不只是伤，而是你在最疼的时候仍把整座军帐先稳住了。",
          },
          {
            speaker: "帐中将士",
            text: "今日这一幕，末将往后大概很难忘了。",
          },
        ],
      },
    ],
  },
};

function createScrapeBoneAiRequestId() {
  return `scrape-bone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getScrapeBonePlayableBase() {
  const playableContent = getEventPlayableContent(SCRAPE_BONE_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(SCRAPE_BONE_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("刮骨疗毒的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getScrapeBoneViewpointProfile(
  viewpointId: SupportedScrapeBoneViewpointId,
) {
  return scrapeBoneViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: ScrapeBoneAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      SCRAPE_BONE_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createScrapeBoneAiDebugInfo(
  config = getAiConfig(),
): ScrapeBoneAiDebugInfo {
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
  const profile = getScrapeBoneViewpointProfile(
    SCRAPE_BONE_AI_DEFAULT_VIEWPOINT_ID,
  );

  return scrapeBoneBeatBlueprints
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

function buildScrapeBoneStoryPackagePrompt(
  request: ScrapeBoneAiStoryPackageRequest & {
    viewpointId: SupportedScrapeBoneViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(SCRAPE_BONE_AI_EVENT_ID);
  const viewpoint = getScrapeBoneViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "刮骨疗毒"}`,
    "这不是历史概述，不是人物品格评价，也不是关于忠义勇武的宏观总结。",
    "这是关羽第一视角正在经历的一场军帐疗伤现场：毒伤入骨、华佗下刀、帐中将士不敢直视、关羽用短句和动作把众人先稳住。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "每个 beat 都必须是具体现场：当前在哪里、谁在说话、谁在察觉什么、这一幕怎样把治疗中的压力再往前推一步。",
    "重点写军帐、呼吸、刀具、药气、棋局或酒盏、华佗的判断、将士不敢看的反应，不要写血腥猎奇细节。",
    "对话要自然有来有回。关羽和华佗之间必须有几轮可听见的互动；帐中将士与军医助手可以少量出声，帮助托住现场压力。",
    "不要让关羽空喊口号，也不要让华佗长篇讲医理。关羽的镇定要通过短句、动作和继续下棋或饮酒体现；华佗要通过稳重判断和明确指令体现。",
    "dialogue 只能是一名角色在说话；narration 只能是空 speaker 的第一视角观察。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "这段脚本要像一场完整的小型现场体验，而不是把“刮骨疗毒”讲成故事简介。",
    "整体建议 22 到 30 条 line，让治疗前、治疗中和治疗后的压力变化都能展开。",
    "治疗过程必须清楚：伤口入骨、华佗判断、关羽决定、刀具准备、第一刀、刮骨声、谈笑稳场、继续治疗、包扎、疗后余惊。",
    "旁白要少而关键，主要用于关羽的即时感受和帐中气氛；对话应成为主导。",
    "请严格按照以下 beat 顺序生成：",
    serializeBeatBlueprints(),
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredScrapeBoneScriptPackage(params: {
  request: ScrapeBoneAiStoryPackageRequest & {
    viewpointId: SupportedScrapeBoneViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: ScrapeBoneAiScriptPackage;
  debug: ScrapeBoneAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createScrapeBoneAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildScrapeBoneStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = scrapeBoneBeatBlueprints.length;
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
          name: "scrape_bone_linear_script_package",
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
                enum: [SCRAPE_BONE_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...SCRAPE_BONE_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: scrapeBoneBeatBlueprints.length,
                maxItems: scrapeBoneBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: scrapeBoneBeatBlueprints.map((beat) => beat.beatId),
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
    scriptPackage: JSON.parse(outputText) as ScrapeBoneAiScriptPackage,
    debug,
  };
}

function normalizeScrapeBoneScriptLine(
  line: ScrapeBoneAiScriptLine,
): ScrapeBoneAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeScrapeBoneScriptPackage(
  scriptPackage: ScrapeBoneAiScriptPackage,
): ScrapeBoneAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as ScrapeBoneBeatId,
      lines: beat.lines.map(normalizeScrapeBoneScriptLine),
    })),
  };
}

function validateScrapeBoneScriptPackage(
  scriptPackage: ScrapeBoneAiScriptPackage,
  viewpointId: SupportedScrapeBoneViewpointId,
): ScrapeBoneScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== SCRAPE_BONE_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${SCRAPE_BONE_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== scrapeBoneBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${scrapeBoneBeatBlueprints.length}。`);
  }

  let narrationCount = 0;
  let guanyuDialogueCount = 0;
  let huatuoDialogueCount = 0;
  let supportDialogueCount = 0;

  scrapeBoneBeatBlueprints.forEach((blueprint, index) => {
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
          errors.push(`${blueprint.beatId} 不允许空 speaker 旁白。`);
        }
        if (line.text.length < 24) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补一点帐中气息或关羽判断。`,
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

      if (line.speaker === "关羽") {
        guanyuDialogueCount += 1;
      } else if (line.speaker === "华佗") {
        huatuoDialogueCount += 1;
      } else {
        supportDialogueCount += 1;
      }

      if (line.text.length < 14) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏短，容易像提纲。`,
        );
      }
      if (line.text.length > 78) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏长，建议更像帐中短句。`,
        );
      }
      if (/血流|血肉|骨屑|喷涌|撕开/.test(line.text)) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条描写偏血腥，建议再收住一些。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 20 || totalLines > 28) {
    warnings.push("总 line 数量偏离推荐范围 20-28。");
  }
  if (guanyuDialogueCount < 3) {
    warnings.push("关羽的直接发言偏少，建议再加强他用短句稳住场面的存在感。");
  }
  if (huatuoDialogueCount < 2) {
    warnings.push("华佗的关键发言偏少，建议再强化他作为医者的判断与操作节奏。");
  }
  if (supportDialogueCount < 2) {
    warnings.push("帐中将士或军医助手的反应偏少，现场紧张感可能不够完整。");
  }
  if (narrationCount > scrapeBoneBeatBlueprints.length + 1) {
    warnings.push("旁白比重偏高，建议把更多推进交给帐中的对话与动作。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatScrapeBoneScriptValidation(
  result: ScrapeBoneScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }

  const visualKey =
    scrapeBoneSpeakerVisualKeyMap[
      speaker as keyof typeof scrapeBoneSpeakerVisualKeyMap
    ];

  if (!visualKey) {
    return { mode: "hidden" };
  }

  if (speaker === "关羽") {
    return {
      mode: "speaker",
      speakerId: "guanyu",
      visualKey: "guanyu",
      hideForViewpoint: true,
    };
  }

  return {
    mode: "speaker",
    speakerId: visualKey,
    visualKey,
  };
}

function adaptScrapeBoneScriptPackageToPlayableContent(
  scriptPackage: ScrapeBoneAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getScrapeBonePlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = scrapeBoneBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        scrapeBoneSpeakerVisualKeyMap[
          line.speaker as keyof typeof scrapeBoneSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: scrapeBoneAiBackdropMap[blueprint.backgroundTag],
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
    eventId: SCRAPE_BONE_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): ScrapeBoneAiScriptPackage {
  const profile = getScrapeBoneViewpointProfile(
    SCRAPE_BONE_AI_DEFAULT_VIEWPOINT_ID,
  );

  return {
    packageId: "scrape-bone-fallback-guanyu",
    storyId: "scrape-bone-guanyu",
    protocolVersion: SCRAPE_BONE_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: SCRAPE_BONE_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isScrapeBoneAiSupportedViewpoint(viewpointId)) {
    return getScrapeBonePlayableBase();
  }

  return adaptScrapeBoneScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isScrapeBoneAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedScrapeBoneViewpointId {
  return (SCRAPE_BONE_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(
    viewpointId,
  );
}

export function shouldUseScrapeBoneAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || SCRAPE_BONE_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === SCRAPE_BONE_AI_EVENT_ID &&
    isScrapeBoneAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getScrapeBoneAiInitialViewpointId() {
  return SCRAPE_BONE_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateScrapeBoneAiStoryPackage(
  params: ScrapeBoneAiStoryPackageRequest,
): Promise<ScrapeBoneAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== SCRAPE_BONE_AI_EVENT_ID ||
    !isScrapeBoneAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持刮骨疗毒的关羽 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createScrapeBoneAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredScrapeBoneScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage =
      normalizeScrapeBoneScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateScrapeBoneScriptPackage(
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
        error: formatScrapeBoneScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptScrapeBoneScriptPackageToPlayableContent(normalizedPackage);
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
    const debug = createScrapeBoneAiDebugInfo(getAiConfig());
    const errorMessage = error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[scrape-bone-ai] linear script package request failed", {
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
