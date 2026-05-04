import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  CupWineAiScriptBeat,
  CupWineAiScriptLine,
  CupWineAiScriptPackage,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
} from "@/types/content";

export const CUP_WINE_AI_EVENT_ID = "cup-wine-release-power";
export const CUP_WINE_AI_DEFAULT_VIEWPOINT_ID = "zhaokuangyin";
export const CUP_WINE_AI_SUPPORTED_VIEWPOINT_IDS = ["zhaokuangyin"] as const;

type SupportedCupWineViewpointId =
  (typeof CUP_WINE_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const CUP_WINE_AI_DEFAULT_MODEL = "Qwen3Flash";
const CUP_WINE_AI_SCRIPT_PROTOCOL_VERSION = "cup-wine-linear-script-v1" as const;

type CupWineBeatId =
  | "banquet-begins"
  | "wine-rounds"
  | "emperor-sighs"
  | "testing-the-mood"
  | "hidden-concern"
  | "silence-around-cups"
  | "retreat-offered"
  | "generals-respond"
  | "toast-returns"
  | "night-gate-after";

type CupWineBeatBlueprint = {
  beatId: CupWineBeatId;
  title: string;
  backgroundTag: keyof typeof cupWineAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type CupWineViewpointProfile = {
  id: SupportedCupWineViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<CupWineBeatId, string>;
  fallbackBeats: CupWineAiScriptBeat[];
};

type CupWineAiDebugInfo = {
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

export type CupWineAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type CupWineAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: CupWineAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: CupWineAiDebugInfo;
};

type CupWineScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const cupWineAiBackdropMap = {
  "palace-banquet": {
    label: "夜宴",
    tone: "amber",
    description:
      "背景占位图：宫中夜宴灯火平稳压着席面，酒食摆得亲近，真正慢慢压下来的却是每个人听话时的神色。",
    backgroundKey: "song-banquet-hall",
  },
  "hall-interior": {
    label: "殿内",
    tone: "amber",
    description:
      "背景占位图：殿内话声不高，杯盏仍在传递，可皇帝每一句轻轻落下的话，都像在替将领们把后路说得越来越窄。",
    backgroundKey: "song-palace-interior",
  },
  "night-gate": {
    label: "宫门",
    tone: "ink",
    description:
      "背景占位图：宫门外夜色安静下来，酒席上的笑语已经散开，真正留在心上的，是兵权如何在酒杯之间交了出去。",
    backgroundKey: "song-palace-gate-night",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const cupWineSpeakerVisualKeyMap = {
  赵匡胤: "zhaokuangyin",
  石守信: "general",
  席间将领: "general",
  内侍: "attendant",
} as const;

const allowedSpeakerNames = ["赵匡胤", "石守信", "席间将领", "内侍"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const cupWineBeatBlueprints: CupWineBeatBlueprint[] = [
  {
    beatId: "banquet-begins",
    title: "宫中设宴",
    backgroundTag: "palace-banquet",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "wine-rounds",
    title: "酒过数巡",
    backgroundTag: "palace-banquet",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "emperor-sighs",
    title: "皇帝忽然叹息",
    backgroundTag: "hall-interior",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "testing-the-mood",
    title: "将领察觉话中有话",
    backgroundTag: "hall-interior",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "hidden-concern",
    title: "赵匡胤点破隐忧",
    backgroundTag: "hall-interior",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "silence-around-cups",
    title: "酒席上的沉默",
    backgroundTag: "hall-interior",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "retreat-offered",
    title: "皇帝给出台阶",
    backgroundTag: "hall-interior",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "generals-respond",
    title: "将领回应",
    backgroundTag: "hall-interior",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "toast-returns",
    title: "酒宴重新热起来",
    backgroundTag: "palace-banquet",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "night-gate-after",
    title: "席后余声",
    backgroundTag: "night-gate",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const cupWineViewpointProfiles: Record<
  SupportedCupWineViewpointId,
  CupWineViewpointProfile
> = {
  zhaokuangyin: {
    id: "zhaokuangyin",
    displayName: "赵匡胤",
    title: "皇帝主视角",
    narrationRule:
      "旁白只能写赵匡胤第一视角当下看到的席面变化、将领神色、酒意冷热和自己如何把话一步步引向兵权与后患，不能写成宋初制度分析，也不能写成中央集权概述。",
    userGoal:
      "把赵匡胤写成一位在酒席上不动声色收权的人。他说话温和、从容，像是在替旧将安排退路，但内里一直精确观察每个人何时听懂、何时低头。",
    voiceNotes: [
      "赵匡胤说话要温和、从容，不靠怒气压人，而是靠把退路先说出来让对方无法拒绝。",
      "赵匡胤的旁白要体现观察和判断，能看到席间神色如何一层层变冷，但不要写成全知全能的制度总结。",
      "石守信和席间将领的回应要体现试探、紧张和不得不退让，不能一上来就直接服软。",
      "整场戏的危险不在刀兵，而在每一句温和话落下后，所有人都更清楚兵权不能再握在手里。",
    ],
    beatGoals: {
      "banquet-begins":
        "把玩家先落进宫中酒宴现场，让他看见席面齐整、旧将入座，却知道今夜绝不只是叙旧。",
      "wine-rounds":
        "先让气氛热起来，再让赵匡胤判断时机差不多了，真正的话该慢慢往外放。",
      "emperor-sighs":
        "用一声叹息把话锋从饮酒转向不安，让席上第一次明显变冷。",
      "testing-the-mood":
        "让石守信或席间将领试着接话，但还不敢先把真正的意思说破。",
      "hidden-concern":
        "让赵匡胤点明‘你们未必有异心，但部下若黄袍加身又如何’这一层真正重量。",
      "silence-around-cups":
        "把沉默写成席间可见的神色、停杯和交换目光，而不是抽象总结。",
      "retreat-offered":
        "让赵匡胤给出安享富贵、交出兵权的退路，语气温和，但安排已经落定。",
      "generals-respond":
        "让将领们多轮回应，不是空泛表态，而是一点点听懂后顺势低头。",
      "toast-returns":
        "表面气氛重新热起来，实则赵匡胤清楚最关键的一步已经落下。",
      "night-gate-after":
        "收在离席后的夜色和赵匡胤心里的稳当感，不做宏观历史总结。",
    },
    fallbackBeats: [
      {
        beatId: "banquet-begins",
        lines: [
          {
            speaker: "",
            text: "今夜这场酒宴摆得很稳，灯火、酒器和菜肴都挑不出半点怠慢。你看着几位宿将依次入席，心里却很清楚，若只为叙旧，不必把这些旧部都请到同一桌前。",
          },
          {
            speaker: "内侍",
            text: "陛下今夜只想与旧日同袍饮几杯，诸位将军尽可安心落座，不必拘礼。",
          },
        ],
      },
      {
        beatId: "wine-rounds",
        lines: [
          {
            speaker: "赵匡胤",
            text: "今日不讲公事。你们当年跟朕从行伍里拼出来，如今还能坐在殿里喝酒，本就是一件值得尽兴的事。",
          },
          {
            speaker: "",
            text: "席上的笑意慢慢松开了一些。你端着酒看过去，知道这种松动恰好够了，再往后说的话，才会有人一字不漏地听进去。",
          },
        ],
      },
      {
        beatId: "emperor-sighs",
        lines: [
          {
            speaker: "",
            text: "酒过数巡，你把杯沿在案上一搁，长长出了一口气。那一声不重，却足够让席上原本松开的肩背又一点点收回去。",
          },
          {
            speaker: "赵匡胤",
            text: "做皇帝的人，看着富贵在手，心里却未必真安稳。夜里睡下去，有时也会想着，人到了这个位置，究竟靠什么才能睡得踏实。",
          },
        ],
      },
      {
        beatId: "testing-the-mood",
        lines: [
          {
            speaker: "石守信",
            text: "陛下若有忧心，臣等自当替陛下分担。今日虽是酒宴，可若真有话要说，臣等也不敢只顾饮酒装糊涂。",
          },
          {
            speaker: "席间将领",
            text: "陛下若有未安之处，不妨直言。臣等昔日同起兵间，今日坐在这里，也不是只会举杯陪笑。",
          },
        ],
      },
      {
        beatId: "hidden-concern",
        lines: [
          {
            speaker: "赵匡胤",
            text: "你们自然没有异心，这一点朕从不疑。可你们手下那些人呢？哪天若有人把黄袍往你们身上一披，说是替你们做主，那时你们又能如何自明？",
          },
          {
            speaker: "",
            text: "这句话落下来时，席间神色都变了。你看见他们听懂了今夜不是来叙旧，而是来把一件迟早得说破的事，在酒席上先说穿。",
          },
        ],
      },
      {
        beatId: "silence-around-cups",
        lines: [
          {
            speaker: "",
            text: "杯子还在手里，席上的人却都像忽然不会再饮了。你看见有人与旁席对了一眼，又各自把目光收回去，谁也不敢先替自己把那层意思说出口。",
          },
          {
            speaker: "石守信",
            text: "陛下所疑，臣如今听明白了。只是这话既然落到臣等身上，臣等也不能再装作仍只是一场闲谈。",
          },
        ],
      },
      {
        beatId: "retreat-offered",
        lines: [
          {
            speaker: "赵匡胤",
            text: "正因为你们是旧人，朕才替你们想得更远。与其日后提心吊胆，不如交兵权、置田宅，安享富贵，让子孙都跟着安稳。",
          },
          {
            speaker: "赵匡胤",
            text: "朕不是不念旧功，恰恰是念旧，才不愿看你们将来被人情势推到退无可退的地步。今夜把路说清，反倒是替彼此都留余地。",
          },
        ],
      },
      {
        beatId: "generals-respond",
        lines: [
          {
            speaker: "席间将领",
            text: "陛下既把前后都替臣等想到了，臣等若还握着兵权不放，反倒像是不懂分寸了。今日能听见这番话，已经是陛下给的体面。",
          },
          {
            speaker: "石守信",
            text: "臣愿听命。兵权归朝廷，臣等退居田宅，这条路虽不是臣先前想过的，却是今夜之后最该走的一条路。",
          },
        ],
      },
      {
        beatId: "toast-returns",
        lines: [
          {
            speaker: "赵匡胤",
            text: "既然话都说开了，今夜便仍是旧友饮酒。来，再满一杯，往后各安本分，便算不负今夜这一席。",
          },
          {
            speaker: "",
            text: "杯盏重新举起来，笑语也跟着回到席面上。可你知道，那不是事情过去了，而是最重的一步已经在这几杯酒之间落完了。",
          },
        ],
      },
      {
        beatId: "night-gate-after",
        lines: [
          {
            speaker: "",
            text: "离席时，宫门外的夜色比开席前更静。你回头想这桌酒宴，知道兵权不是被刀枪夺走的，而是被你在酒杯之间稳稳收了回来。",
          },
          {
            speaker: "赵匡胤",
            text: "今夜这场酒，终究还是把该定的事定下来了。往后他们能安，朝廷也能安，朕要的正是这一份不必再藏的稳当。",
          },
        ],
      },
    ],
  },
};

function createCupWineAiRequestId() {
  return `cup-wine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getCupWinePlayableBase() {
  const playableContent = getEventPlayableContent(CUP_WINE_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(CUP_WINE_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("杯酒释兵权的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getCupWineViewpointProfile(viewpointId: SupportedCupWineViewpointId) {
  return cupWineViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: CupWineAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      CUP_WINE_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createCupWineAiDebugInfo(config = getAiConfig()): CupWineAiDebugInfo {
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
  const profile = getCupWineViewpointProfile(CUP_WINE_AI_DEFAULT_VIEWPOINT_ID);

  return cupWineBeatBlueprints
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

function buildCupWineStoryPackagePrompt(
  request: CupWineAiStoryPackageRequest & {
    viewpointId: SupportedCupWineViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(CUP_WINE_AI_EVENT_ID);
  const viewpoint = getCupWineViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "杯酒释兵权"}`,
    "这不是历史概述，不是宋初制度分析，也不是中央集权的政治解说。",
    "这是赵匡胤第一视角正在经历的一场宫中酒宴：旧将入席、几巡酒后、话锋转向富贵与后患、将领们慢慢听懂兵权已不能再握在手里，最后在体面中顺势退让。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "每个 beat 都必须是具体现场：当前在哪里、谁在说话、谁察觉到了什么、这一幕如何把压力再往前推一步。",
    "对话要有来有回。赵匡胤与将领之间必须出现多轮自然互动，不能写成皇帝一句、将领一句的摘要。",
    "不要写抽象历史评价，不要写成论文，也不要把收权写成政治口号。",
    "dialogue 只能是一名角色在说话；narration 只能是空 speaker 的第一视角观察。",
    "赵匡胤要温和、从容、话术很轻但压力很重；石守信和席间将领要体现试探、紧张、听懂后不得不退让。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "脚本必须像一场完整的小剧场酒宴，而不是政治观点列表。",
    "建议整体 line 数量在 20 到 28 条之间，让赵匡胤和席间将领都至少有多次发言机会。",
    "旁白要少而关键，主要用来观察席面变化和人心转冷；对话是主体，而且后一句要能接住前一句。",
    "不要写成长篇散文，也不要把内容写成制度总结。",
    "固定 beat 顺序如下：",
    serializeBeatBlueprints(),
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredCupWineScriptPackage(params: {
  request: CupWineAiStoryPackageRequest & {
    viewpointId: SupportedCupWineViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: CupWineAiScriptPackage;
  debug: CupWineAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createCupWineAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildCupWineStoryPackagePrompt(params.request);
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = cupWineBeatBlueprints.length;
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
          name: "cup_wine_linear_script_package",
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
                enum: [CUP_WINE_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...CUP_WINE_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: cupWineBeatBlueprints.length,
                maxItems: cupWineBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: cupWineBeatBlueprints.map((beat) => beat.beatId),
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
    scriptPackage: JSON.parse(outputText) as CupWineAiScriptPackage,
    debug,
  };
}

function normalizeCupWineScriptLine(line: CupWineAiScriptLine): CupWineAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeCupWineScriptPackage(
  scriptPackage: CupWineAiScriptPackage,
): CupWineAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as CupWineBeatId,
      lines: beat.lines.map(normalizeCupWineScriptLine),
    })),
  };
}

function validateCupWineScriptPackage(
  scriptPackage: CupWineAiScriptPackage,
  viewpointId: SupportedCupWineViewpointId,
): CupWineScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== CUP_WINE_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(`protocolVersion 必须是 ${CUP_WINE_AI_SCRIPT_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== cupWineBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${cupWineBeatBlueprints.length}。`);
  }

  let narrationCount = 0;
  let emperorDialogueCount = 0;
  let generalDialogueCount = 0;

  cupWineBeatBlueprints.forEach((blueprint, index) => {
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
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补一点席间气氛或皇帝判断。`,
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

      if (line.speaker === "赵匡胤") {
        emperorDialogueCount += 1;
      }
      if (line.speaker === "石守信" || line.speaker === "席间将领") {
        generalDialogueCount += 1;
      }

      if (line.text.length < 16) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对白偏短，容易像一句提纲。`,
        );
      }
      if (line.text.length > 76) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对白偏长，建议更像酒席现场口语。`,
        );
      }
    });
  });

  if (emperorDialogueCount < 3) {
    warnings.push("赵匡胤的发言次数偏少，建议让他的温和试探和收权安排更完整。");
  }
  if (generalDialogueCount < 2) {
    warnings.push("将领侧的发言次数偏少，建议让席间试探与退让更有层次。");
  }
  if (narrationCount > cupWineBeatBlueprints.length) {
    warnings.push("旁白比重偏高，建议把更多推进交给酒席对话。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatCupWineScriptValidation(result: CupWineScriptValidationResult) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatCupWineWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning。`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }

  const visualKey =
    cupWineSpeakerVisualKeyMap[speaker as keyof typeof cupWineSpeakerVisualKeyMap];

  if (!visualKey) {
    return { mode: "hidden" };
  }

  if (speaker === "赵匡胤") {
    return {
      mode: "speaker",
      speakerId: "zhaokuangyin",
      visualKey: "zhaokuangyin",
      hideForViewpoint: true,
    };
  }

  return {
    mode: "speaker",
    speakerId: visualKey,
    visualKey,
  };
}

function adaptCupWineScriptPackageToPlayableContent(
  scriptPackage: CupWineAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getCupWinePlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = cupWineBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        cupWineSpeakerVisualKeyMap[
          line.speaker as keyof typeof cupWineSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: cupWineAiBackdropMap[blueprint.backgroundTag],
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
    eventId: CUP_WINE_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): CupWineAiScriptPackage {
  const profile = getCupWineViewpointProfile(CUP_WINE_AI_DEFAULT_VIEWPOINT_ID);

  return {
    packageId: "cup-wine-fallback-zhaokuangyin",
    storyId: "cup-wine-zhaokuangyin",
    protocolVersion: CUP_WINE_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: CUP_WINE_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isCupWineAiSupportedViewpoint(viewpointId)) {
    return getCupWinePlayableBase();
  }

  return adaptCupWineScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isCupWineAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedCupWineViewpointId {
  return (CUP_WINE_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(
    viewpointId,
  );
}

export function shouldUseCupWineAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || CUP_WINE_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === CUP_WINE_AI_EVENT_ID &&
    isCupWineAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getCupWineAiInitialViewpointId() {
  return CUP_WINE_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateCupWineAiStoryPackage(
  params: CupWineAiStoryPackageRequest,
): Promise<CupWineAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== CUP_WINE_AI_EVENT_ID ||
    !isCupWineAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持杯酒释兵权的赵匡胤 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId = params.clientRequestId?.trim() || createCupWineAiRequestId();
    const { scriptPackage, debug } = await requestStructuredCupWineScriptPackage({
      request: {
        ...params,
        viewpointId: params.viewpointId,
      },
      requestId,
    });

    const normalizedPackage = normalizeCupWineScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateCupWineScriptPackage(
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
        error: formatCupWineScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent = adaptCupWineScriptPackageToPlayableContent(
      normalizedPackage,
    );
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
          ? formatCupWineWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createCupWineAiDebugInfo(getAiConfig());
    const errorMessage = error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[cup-wine-ai] linear script package request failed", {
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
