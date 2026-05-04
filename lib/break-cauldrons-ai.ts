import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  BreakCauldronsAiScriptBeat,
  BreakCauldronsAiScriptLine,
  BreakCauldronsAiScriptPackage,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  PlaceholderAsset,
} from "@/types/content";

export const BREAK_CAULDRONS_AI_EVENT_ID = "break-cauldrons-sink-boats";
export const BREAK_CAULDRONS_AI_DEFAULT_VIEWPOINT_ID = "xiangyu";
export const BREAK_CAULDRONS_AI_SUPPORTED_VIEWPOINT_IDS = ["xiangyu"] as const;

type SupportedBreakCauldronsViewpointId =
  (typeof BREAK_CAULDRONS_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const BREAK_CAULDRONS_AI_DEFAULT_MODEL = "Qwen3Flash";
const BREAK_CAULDRONS_AI_SCRIPT_PROTOCOL_VERSION =
  "break-cauldrons-linear-script-v1" as const;

type BreakCauldronsBeatId =
  | "after-crossing"
  | "boats-destroyed"
  | "cauldrons-broken"
  | "xiangyu-appears"
  | "no-retreat-order"
  | "ranks-react"
  | "war-drums-sound"
  | "dust-of-qin-army"
  | "forward-without-return";

type BreakCauldronsBeatBlueprint = {
  beatId: BreakCauldronsBeatId;
  title: string;
  backgroundTag: keyof typeof breakCauldronsAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type BreakCauldronsViewpointProfile = {
  id: SupportedBreakCauldronsViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<BreakCauldronsBeatId, string>;
  fallbackBeats: BreakCauldronsAiScriptBeat[];
};

type BreakCauldronsAiDebugInfo = {
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

export type BreakCauldronsAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type BreakCauldronsAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: BreakCauldronsAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: BreakCauldronsAiDebugInfo;
};

type BreakCauldronsScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const breakCauldronsAiBackdropMap = {
  "riverbank-after-crossing": {
    label: "河岸",
    tone: "ink",
    description:
      "背景占位图：刚渡河的河岸水汽未散，军士正匆忙整兵，后方还留着仓促过河后的狼狈气息。",
    backgroundKey: "battle-riverbank-crossing",
  },
  "wrecked-retreat-line": {
    label: "断后",
    tone: "crimson",
    description:
      "背景占位图：断船、碎釜和火光压在后方，所有人都看得见退路是如何被当场毁掉的。",
    backgroundKey: "battle-retreat-cut",
  },
  "frontline-muster": {
    label: "军前",
    tone: "crimson",
    description:
      "背景占位图：军阵重新收束，所有目光都落到军前那一道命令上，空气像被绷紧了一样。",
    backgroundKey: "battle-frontline-muster",
  },
  "dust-before-clash": {
    label: "阵前",
    tone: "amber",
    description:
      "背景占位图：秦军方向的尘土和旗影越压越近，号令声把每个人往前推，不再容人回头。",
    backgroundKey: "battle-before-clash",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const breakCauldronsSpeakerVisualKeyMap = {
  项羽: "xiangyu",
  军士: "soldier",
  军吏: "officer",
  鼓手: "drummer",
} as const;

const allowedSpeakerNames = ["项羽", "军士", "军吏", "鼓手"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const breakCauldronsBeatBlueprints: BreakCauldronsBeatBlueprint[] = [
  {
    beatId: "after-crossing",
    title: "渡河之后",
    backgroundTag: "riverbank-after-crossing",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "boats-destroyed",
    title: "船只被毁",
    backgroundTag: "wrecked-retreat-line",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "cauldrons-broken",
    title: "炊具被砸",
    backgroundTag: "wrecked-retreat-line",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "xiangyu-appears",
    title: "项羽现身军前",
    backgroundTag: "frontline-muster",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "no-retreat-order",
    title: "项羽下令",
    backgroundTag: "frontline-muster",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "ranks-react",
    title: "军中反应",
    backgroundTag: "frontline-muster",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "war-drums-sound",
    title: "战鼓响起",
    backgroundTag: "frontline-muster",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "dust-of-qin-army",
    title: "决战前一刻",
    backgroundTag: "dust-before-clash",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "forward-without-return",
    title: "余声收束",
    backgroundTag: "dust-before-clash",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const breakCauldronsViewpointProfiles: Record<
  SupportedBreakCauldronsViewpointId,
  BreakCauldronsViewpointProfile
> = {
  xiangyu: {
    id: "xiangyu",
    displayName: "项羽",
    title: "军前主将视角",
    narrationRule:
      "旁白只能写项羽第一视角当下的观察、压住军心时的判断，以及他看见士兵、断船、碎釜和军阵反应时的心理变化，不写巨鹿之战概述，不写宏观战争分析，不写后世评价。",
    userGoal:
      "把项羽写成站在军前、亲手断掉退路的人。即使当前入口是项羽视角，也不要写成俯瞰全局的全知战争总结，而要写成他站在河岸与军阵之间，亲眼看见队伍先惊、再被逼着稳住、再被号令推向前方的现场体验。",
    voiceNotes: [
      "项羽说话要短、重、冷，不做长篇鼓动。",
      "项羽的内心要体现冷硬判断，但不是全知全能的英雄独白。",
      "军士和军吏的对话要让玩家感觉到恐惧、骚动和被迫压住惊惧的过程。",
    ],
    beatGoals: {
      "after-crossing": "让玩家先踩进刚渡河后的仓促现场，知道楚军还没稳下来，敌军压力却已经压近。",
      "boats-destroyed": "让船被毁这件事作为看得见的动作出现，而不是被解释成战略概念。",
      "cauldrons-broken": "让砸锅的声音和反应把“久留无望”这层意思压到人心里。",
      "xiangyu-appears": "让项羽走到军前时，军中目光与安静一起收紧，像全军都在等一句定生死的话。",
      "no-retreat-order": "把项羽的命令写得短而重，像军令，不像演说。",
      "ranks-react": "让士兵的恐惧、发抖、握兵器这些具体反应出现，表现军心转向。",
      "war-drums-sound": "让战鼓和号令把局势从判断推成行动。",
      "dust-of-qin-army": "把秦军逼近的尘土、旗影和兵声写成眼前真实压力。",
      "forward-without-return": "只收束军前现场余味，不做巨鹿之战历史总结。",
    },
    fallbackBeats: [
      {
        beatId: "after-crossing",
        lines: [
          {
            speaker: "",
            text: "你刚带着人渡过河，河岸上的水汽还贴在甲片和衣角上。队伍里有人在整理兵器，有人还没把气喘匀，而远处秦军的压力已经像一层灰尘一样压过来。",
          },
          {
            speaker: "军吏",
            text: "将军，前队已经就位，可后面的人心还没稳。若秦军此刻就压上来，队伍未必能立刻拧成一股劲。",
          },
        ],
      },
      {
        beatId: "boats-destroyed",
        lines: [
          {
            speaker: "军士",
            text: "后头的船着火了！有人已经动手砍断船板，真要把咱们回去的路全断在河这边？",
          },
          {
            speaker: "",
            text: "惊呼一层层从后面传过来，比敌军还先撞进军阵。所有人都明白，那不是损失几只船，而是有人正在当着全军的面，把“退”这个字从今晚抹掉。",
          },
        ],
      },
      {
        beatId: "cauldrons-broken",
        lines: [
          {
            speaker: "",
            text: "船毁之后，军中的大釜又接连碎开。锅沿落地的脆响比刀兵更刺耳，像在告诉每个人：不只是退不回去，连暂时久留、再作打算的念头都不准再留。",
          },
          {
            speaker: "军士",
            text: "连锅都砸了……这不是逼咱们今夜就把命押出去吗？",
          },
        ],
      },
      {
        beatId: "xiangyu-appears",
        lines: [
          {
            speaker: "",
            text: "你走到军前时，原本乱起的低声议论忽然自己收住了。不是因为众人真就不怕了，而是所有人都在盯着你，等你把眼下这口要乱未乱的气压成一句能站得住的话。",
          },
          {
            speaker: "军吏",
            text: "将军在前！整队肃静！",
          },
        ],
      },
      {
        beatId: "no-retreat-order",
        lines: [
          {
            speaker: "项羽",
            text: "船已断，釜已碎。今日谁都不用再回头看河那边。前面是秦军，后面已经不是路，想活，就把这一仗先打出去。",
          },
          {
            speaker: "",
            text: "你没有多说。军前这种时候，句子越长，越像在给人犹豫的空隙；命令只要够重，就会自己压进每个人心里。",
          },
        ],
      },
      {
        beatId: "ranks-react",
        lines: [
          {
            speaker: "",
            text: "你看见有人脸色发白，也看见有人把刀柄握得更死。恐惧没有散，它只是忽然找不到退开的地方，于是被硬生生挤成一种必须往前的狠劲。",
          },
          {
            speaker: "军士",
            text: "都到这一步了，再怕也没地方退。与其等着死，不如真往前撞过去。",
          },
        ],
      },
      {
        beatId: "war-drums-sound",
        lines: [
          {
            speaker: "鼓手",
            text: "战鼓起！全军向前！",
          },
          {
            speaker: "",
            text: "鼓声一落，刚才还像压在胸口的惊惧，忽然被整齐的脚步推着往前走。破釜沉舟不再只是你下的一道令，而是所有人已经踩出去的第一步。",
          },
        ],
      },
      {
        beatId: "dust-of-qin-army",
        lines: [
          {
            speaker: "",
            text: "前方尘土、旗影和兵声一起压近，秦军已经不再是远处的名字，而是马上要撞上的真实敌阵。你知道从这一刻起，整支楚军能不能活下来，只剩往前这一条路。",
          },
          {
            speaker: "军吏",
            text: "前阵已见秦旗！各队收拢，听鼓向前，不得后顾！",
          },
        ],
      },
      {
        beatId: "forward-without-return",
        lines: [
          {
            speaker: "",
            text: "退路被毁之后，军中的人并没有忽然无所畏惧。只是每个人都被逼着明白，命已经不能再押在身后，只能押在前面那一场即将撞上的决战里。",
          },
          {
            speaker: "项羽",
            text: "向前。今日这一步，谁都不许给自己留第二条路。",
          },
        ],
      },
    ],
  },
};

function createBreakCauldronsAiRequestId() {
  return `break-cauldrons-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getBreakCauldronsPlayableBase() {
  const playableContent = getEventPlayableContent(BREAK_CAULDRONS_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(BREAK_CAULDRONS_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("破釜沉舟的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getBreakCauldronsViewpointProfile(
  viewpointId: SupportedBreakCauldronsViewpointId,
) {
  return breakCauldronsViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: BreakCauldronsAiDebugInfo["apiKeySource"] =
    openRouterApiKey
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
      BREAK_CAULDRONS_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createBreakCauldronsAiDebugInfo(
  config = getAiConfig(),
): BreakCauldronsAiDebugInfo {
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
  const profile = getBreakCauldronsViewpointProfile(
    BREAK_CAULDRONS_AI_DEFAULT_VIEWPOINT_ID,
  );

  return breakCauldronsBeatBlueprints
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

function buildBreakCauldronsStoryPackagePrompt(
  request: BreakCauldronsAiStoryPackageRequest & {
    viewpointId: SupportedBreakCauldronsViewpointId;
  },
) {
  const eventItem = getHistoricalEvent(BREAK_CAULDRONS_AI_EVENT_ID);
  const viewpoint = getBreakCauldronsViewpointProfile(request.viewpointId);

  const systemPrompt = [
    "你正在为历史互动小游戏生成正式游玩的线性脚本包。",
    `事件：${eventItem?.title ?? "破釜沉舟"}`,
    "这不是历史概述，不是巨鹿之战分析，也不是项羽功业总结。",
    "这是项羽第一视角正在经历的一段军前现场：刚渡河、船被毁、锅被砸、军中惊惧、项羽下令断绝退路、战鼓响起、全军被逼向前。",
    viewpoint.narrationRule,
    viewpoint.userGoal,
    "即使当前入口是项羽视角，也不要写成俯瞰全军的全知独白。每一幕都要落在河岸、军阵、断船、碎釜、军士反应和项羽军令这些看得见的现场上。",
    "不要写抽象历史评价，不要写成论文或战争分析。",
    "dialogue 只能是一名角色说话；narration 只能是空 speaker 的第一视角观察或判断。",
    "要体现军前压迫感，但不要写成夸张爽文。项羽说话要短而重，军士反应要让人感到惊惧被一点点压成决意。",
    "AI 只负责写线性脚本内容，不决定背景、立绘、页面结构或分支跳转。",
    "输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "脚本必须像一段完整的军前现场，而不是观点摘要或战争讲解。",
    "建议整体 line 数量在 18 到 24 条之间，每个 beat 都有基本展开空间。",
    "旁白要有现场感和心理压迫，但不要写成长篇散文；对话要像一句完整的人话。",
    "固定 beat 顺序如下：",
    serializeBeatBlueprints(),
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredBreakCauldronsScriptPackage(params: {
  request: BreakCauldronsAiStoryPackageRequest & {
    viewpointId: SupportedBreakCauldronsViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: BreakCauldronsAiScriptPackage;
  debug: BreakCauldronsAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createBreakCauldronsAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildBreakCauldronsStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = breakCauldronsBeatBlueprints.length;
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
          name: "break_cauldrons_linear_script_package",
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
                enum: [BREAK_CAULDRONS_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...BREAK_CAULDRONS_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: breakCauldronsBeatBlueprints.length,
                maxItems: breakCauldronsBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: breakCauldronsBeatBlueprints.map(
                        (beat) => beat.beatId,
                      ),
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

  debug.timings.upstreamRequestMs = Number(
    (performance.now() - upstreamStart).toFixed(1),
  );
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
  debug.timings.extractOutputMs = Number(
    (performance.now() - extractStart).toFixed(1),
  );

  if (!outputText) {
    throw new Error("AI response did not include structured script text.");
  }

  return {
    scriptPackage: JSON.parse(outputText) as BreakCauldronsAiScriptPackage,
    debug,
  };
}

function normalizeBreakCauldronsScriptLine(
  line: BreakCauldronsAiScriptLine,
): BreakCauldronsAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeBreakCauldronsScriptPackage(
  scriptPackage: BreakCauldronsAiScriptPackage,
): BreakCauldronsAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as BreakCauldronsBeatId,
      lines: beat.lines.map(normalizeBreakCauldronsScriptLine),
    })),
  };
}

function validateBreakCauldronsScriptPackage(
  scriptPackage: BreakCauldronsAiScriptPackage,
  viewpointId: SupportedBreakCauldronsViewpointId,
): BreakCauldronsScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (
    scriptPackage.protocolVersion !== BREAK_CAULDRONS_AI_SCRIPT_PROTOCOL_VERSION
  ) {
    errors.push(
      `protocolVersion 必须是 ${BREAK_CAULDRONS_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== breakCauldronsBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${breakCauldronsBeatBlueprints.length}。`);
  }

  breakCauldronsBeatBlueprints.forEach((blueprint, index) => {
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
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白里出现了引号对话，建议改成纯第一视角观察。`,
          );
        }
        if (line.text.length < 28) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议再补一点现场感或心理压迫。`,
          );
        }
        if (line.text.length > 110) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议拆成更像 AVG 的短幕。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 只能是 ${allowedSpeakerNames.join(" / ")}。`,
        );
      }
      if (line.text.length < 10) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏短，建议写成更完整的一句军前对话。`,
        );
      }
      if (line.text.length > 68) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏长，建议拆成两条。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.length,
    0,
  );
  if (totalLines < 18 || totalLines > 24) {
    warnings.push("总 line 数量偏离推荐范围 18-24。");
  }

  const xiangyuDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.filter((line) => line.speaker === "项羽").length,
    0,
  );
  if (xiangyuDialogueCount < 2) {
    warnings.push("项羽当前发言偏少，建议再补几句更能压住军心的军令。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatBreakCauldronsScriptValidation(
  result: BreakCauldronsScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatBreakCauldronsWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }
  return `调试信息：AI 输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }
  if (speaker === "项羽") {
    return {
      mode: "speaker",
      speakerId: "xiangyu",
      visualKey: "xiangyu",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    breakCauldronsSpeakerVisualKeyMap[
      speaker as keyof typeof breakCauldronsSpeakerVisualKeyMap
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

function adaptBreakCauldronsScriptPackageToPlayableContent(
  scriptPackage: BreakCauldronsAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getBreakCauldronsPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = breakCauldronsBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        breakCauldronsSpeakerVisualKeyMap[
          line.speaker as keyof typeof breakCauldronsSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: breakCauldronsAiBackdropMap[blueprint.backgroundTag],
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
    eventId: BREAK_CAULDRONS_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): BreakCauldronsAiScriptPackage {
  const profile = getBreakCauldronsViewpointProfile(
    BREAK_CAULDRONS_AI_DEFAULT_VIEWPOINT_ID,
  );

  return {
    packageId: "break-cauldrons-fallback-xiangyu",
    storyId: "break-cauldrons-sink-boats-xiangyu",
    protocolVersion: BREAK_CAULDRONS_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: BREAK_CAULDRONS_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isBreakCauldronsAiSupportedViewpoint(viewpointId)) {
    return getBreakCauldronsPlayableBase();
  }

  return adaptBreakCauldronsScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isBreakCauldronsAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedBreakCauldronsViewpointId {
  return (
    BREAK_CAULDRONS_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]
  ).includes(viewpointId);
}

export function shouldUseBreakCauldronsAiMode(
  eventId: string,
  viewpointId?: string,
) {
  const normalizedViewpointId =
    viewpointId?.trim() || BREAK_CAULDRONS_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === BREAK_CAULDRONS_AI_EVENT_ID &&
    isBreakCauldronsAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getBreakCauldronsAiInitialViewpointId() {
  return BREAK_CAULDRONS_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateBreakCauldronsAiStoryPackage(
  params: BreakCauldronsAiStoryPackageRequest,
): Promise<BreakCauldronsAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== BREAK_CAULDRONS_AI_EVENT_ID ||
    !isBreakCauldronsAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持破釜沉舟的项羽 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createBreakCauldronsAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredBreakCauldronsScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage =
      normalizeBreakCauldronsScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateBreakCauldronsScriptPackage(
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
        error: formatBreakCauldronsScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptBreakCauldronsScriptPackageToPlayableContent(normalizedPackage);
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
          ? formatBreakCauldronsWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createBreakCauldronsAiDebugInfo(getAiConfig());
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

    console.error(
      "[break-cauldrons-ai] linear script package request failed",
      {
        ...debug,
        error: errorMessage,
        viewpointId: params.viewpointId,
      },
    );

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
