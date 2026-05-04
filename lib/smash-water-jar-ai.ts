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
  SmashWaterJarAiScriptBeat,
  SmashWaterJarAiScriptLine,
  SmashWaterJarAiScriptPackage,
} from "@/types/content";

export const SMASH_WATER_JAR_AI_EVENT_ID = "smash-water-jar";
export const SMASH_WATER_JAR_AI_DEFAULT_VIEWPOINT_ID = "simaguang";
export const SMASH_WATER_JAR_AI_SUPPORTED_VIEWPOINT_IDS = ["simaguang"] as const;

type SupportedSmashWaterJarViewpointId =
  (typeof SMASH_WATER_JAR_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const SMASH_WATER_JAR_AI_DEFAULT_MODEL = "Qwen3Flash";
const SMASH_WATER_JAR_AI_SCRIPT_PROTOCOL_VERSION =
  "smash-water-jar-linear-script-v1" as const;

type SmashWaterJarBeatId =
  | "courtyard-play"
  | "child-climbs-jar"
  | "sudden-splash"
  | "children-panic"
  | "simaguang-observes"
  | "spots-the-stone"
  | "smash-the-jar"
  | "water-rushes-out"
  | "child-saved"
  | "aftertaste-courtyard";

type SmashWaterJarBeatBlueprint = {
  beatId: SmashWaterJarBeatId;
  title: string;
  backgroundTag: keyof typeof smashWaterJarAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type SmashWaterJarViewpointProfile = {
  id: SupportedSmashWaterJarViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<SmashWaterJarBeatId, string>;
  fallbackBeats: SmashWaterJarAiScriptBeat[];
};

type SmashWaterJarAiDebugInfo = {
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

export type SmashWaterJarAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type SmashWaterJarAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: SmashWaterJarAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: SmashWaterJarAiDebugInfo;
};

type SmashWaterJarScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const smashWaterJarAiBackdropMap = {
  "courtyard-play": {
    label: "庭院",
    tone: "jade",
    description:
      "背景占位图：院子里原本只有孩子追跑嬉闹的声音，靠墙的大水缸安静立着，危险还没有真正被任何人看见。",
    backgroundKey: "courtyard-children-play",
  },
  "water-jar-side": {
    label: "缸边",
    tone: "amber",
    description:
      "背景占位图：高缸、深水和缸口的高度把院中的慌乱一下拢到同一个点，所有目光都被迫挤向缸边。",
    backgroundKey: "courtyard-water-jar",
  },
  "after-rescue": {
    label: "得救",
    tone: "jade",
    description:
      "背景占位图：缸壁已经裂开，水沿着地面漫出去，方才那阵惊叫正在退下去，只留下劫后余悸。",
    backgroundKey: "courtyard-after-rescue",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const smashWaterJarSpeakerVisualKeyMap = {
  司马光: "simaguang",
  庭院玩伴: "child",
  落水孩子: "rescued",
  赶来的大人: "adult",
} as const;

const allowedSpeakerNames = ["司马光", "庭院玩伴", "落水孩子", "赶来的大人"] as const;
const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

const smashWaterJarBeatBlueprints: SmashWaterJarBeatBlueprint[] = [
  {
    beatId: "courtyard-play",
    title: "庭院中玩耍",
    backgroundTag: "courtyard-play",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "child-climbs-jar",
    title: "孩子爬上缸边",
    backgroundTag: "water-jar-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "sudden-splash",
    title: "突然落水",
    backgroundTag: "water-jar-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "children-panic",
    title: "众人惊慌",
    backgroundTag: "water-jar-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "simaguang-observes",
    title: "司马光观察水缸",
    backgroundTag: "water-jar-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "spots-the-stone",
    title: "看到石头",
    backgroundTag: "water-jar-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "smash-the-jar",
    title: "举石砸缸",
    backgroundTag: "water-jar-side",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "water-rushes-out",
    title: "水流冲出",
    backgroundTag: "after-rescue",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "child-saved",
    title: "孩子得救",
    backgroundTag: "after-rescue",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "aftertaste-courtyard",
    title: "余声收束",
    backgroundTag: "after-rescue",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const smashWaterJarViewpointProfiles: Record<
  SupportedSmashWaterJarViewpointId,
  SmashWaterJarViewpointProfile
> = {
  simaguang: {
    id: "simaguang",
    displayName: "司马光",
    title: "庭院主视角",
    narrationRule:
      "旁白只能写司马光第一视角当下亲眼看见、听见和瞬间判断到的东西：缸口的高度、孩子落水的声音、同伴慌乱的呼喊、水缸里的人够不到边沿、地上的石头，以及自己如何在很短的时间里决定先砸缸救人。不要写成品德教育，不要写成后见之明总结。",
    userGoal:
      "把司马光写成一个年纪不大、却在紧急时刻先看清楚问题落在哪里的人。他不是站住讲道理，而是边紧张边行动，靠观察和动作把人救出来。",
    voiceNotes: [
      "司马光说话要短、快、实用，像是在现场直接发出最有用的指令。",
      "庭院玩伴的对话要慌、短、自然，不要写成长篇议论。",
      "落水孩子和赶来的大人只需少量出声，用来增强现场感，不要喧宾夺主。",
      "重点是时间压力、缸边空间和几秒钟的判断，不要写成课文总结。",
    ],
    beatGoals: {
      "courtyard-play":
        "先让玩家落在庭院轻松的玩耍状态里，这样后面的落水才会显得突然。",
      "child-climbs-jar":
        "明确缸很高、水很深，让司马光先注意到危险条件，而不是事后总结聪明。",
      "sudden-splash":
        "把落水瞬间写得短而急，让院中的气氛一下拧紧。",
      "children-panic":
        "让其他孩子先用常规反应乱起来，衬出司马光后面那一步判断。",
      "simaguang-observes":
        "让司马光靠近缸边，迅速看清人为什么从上面拉不出来。",
      "spots-the-stone":
        "把“人出不来，就让水出来”这层判断落到石头这个具体动作之前。",
      "smash-the-jar":
        "重点写举石、砸下和缸裂这一连串动作，不要拖成抽象机智说明。",
      "water-rushes-out":
        "让水位下降、众人改为抢救的变化清楚可见。",
      "child-saved":
        "确认人已被扶起、能喘气，现场压力开始真正松动。",
      "aftertaste-courtyard":
        "收在司马光第一视角的余惊，不做品德口号总结。",
    },
    fallbackBeats: [
      {
        beatId: "courtyard-play",
        lines: [
          {
            speaker: "",
            text: "院子里原本只有孩子追跑的脚步声。你抬头时，还只是看见那口大水缸靠墙立着，谁也没觉得它会在下一刻把所有人都拽过去。",
          },
          {
            speaker: "庭院玩伴",
            text: "你来追我呀！别只站在那边看，我们这回比谁先碰到缸沿！",
          },
        ],
      },
      {
        beatId: "child-climbs-jar",
        lines: [
          {
            speaker: "",
            text: "有个孩子攀到缸边，笑得正高兴。你先注意到的不是他胆子大，而是缸口太高，缸里的水也比平日看着更深。",
          },
          {
            speaker: "司马光",
            text: "别再往上探了，那缸口滑，掉进去就不是闹着玩的。",
          },
        ],
      },
      {
        beatId: "sudden-splash",
        lines: [
          {
            speaker: "",
            text: "话还没说完，缸边的人脚下一滑，整个人栽了进去。水声一下拍开，院子里的笑闹也跟着断了。",
          },
          {
            speaker: "庭院玩伴",
            text: "掉下去了！他掉进缸里了！",
          },
        ],
      },
      {
        beatId: "children-panic",
        lines: [
          {
            speaker: "庭院玩伴",
            text: "快去叫大人！不对，先拉他！快把手给我，怎么够不到啊！",
          },
          {
            speaker: "",
            text: "几个孩子一下全挤到缸边，有人喊，有人伸手，有人已经急得快哭出来。可缸口太高，里面的人胡乱扑腾，就是碰不到外面。",
          },
        ],
      },
      {
        beatId: "simaguang-observes",
        lines: [
          {
            speaker: "",
            text: "你贴近缸口往下看，先看见的是孩子被水顶得起起落落，再看见缸沿离地太高。若只想着把人从上面拽出来，时间根本不够。",
          },
          {
            speaker: "司马光",
            text: "别全挤在这里，伸手没用，先让开一点！",
          },
        ],
      },
      {
        beatId: "spots-the-stone",
        lines: [
          {
            speaker: "",
            text: "你一偏头，看见墙边有块硬石。那一瞬间你先想到的不是把人拽上来，而是缸若裂开，水就会自己把人往下放出来。",
          },
          {
            speaker: "司马光",
            text: "人出不来，就让水出来。把那块石头递给我！",
          },
        ],
      },
      {
        beatId: "smash-the-jar",
        lines: [
          {
            speaker: "",
            text: "石头一到手，你没再犹豫，抡起来就朝缸壁砸下去。那一下很重，先是一声闷响，接着缸身立刻裂开了口子。",
          },
          {
            speaker: "庭院玩伴",
            text: "他在砸缸！快，缸裂了，水要出来了！",
          },
        ],
      },
      {
        beatId: "water-rushes-out",
        lines: [
          {
            speaker: "",
            text: "水猛地往外冲，沿着地面一下漫开。缸里的孩子跟着水位往下掉，原本够不着的地方终于被大家抓住了机会。",
          },
          {
            speaker: "庭院玩伴",
            text: "快扶住他！别让他再滑回去！",
          },
        ],
      },
      {
        beatId: "child-saved",
        lines: [
          {
            speaker: "赶来的大人",
            text: "让开！把人扶起来，先看他能不能喘气……好，还活着，还活着！",
          },
          {
            speaker: "",
            text: "听见这句话时，院里那阵乱喊才真正松开。方才只会惊叫的孩子们一下全围了上来，像直到这一刻才敢相信人真的救出来了。",
          },
        ],
      },
      {
        beatId: "aftertaste-courtyard",
        lines: [
          {
            speaker: "",
            text: "你低头看着脚边散开的水，心跳这时才重新撞回胸口。刚才那几步里，根本来不及想对不对，只能先把最有用的那件事做出来。",
          },
          {
            speaker: "庭院玩伴",
            text: "刚才若不是你先砸缸，我们真不知道还能怎么办。",
          },
        ],
      },
    ],
  },
};

function createSmashWaterJarAiRequestId() {
  return `smash-water-jar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSmashWaterJarPlayableBase() {
  const playableContent = getEventPlayableContent(SMASH_WATER_JAR_AI_EVENT_ID);
  const eventItem = getHistoricalEvent(SMASH_WATER_JAR_AI_EVENT_ID);
  if (!playableContent || !eventItem) {
    throw new Error("司马光砸缸的基础事件数据缺失，无法生成 AI 剧情包。");
  }
  return playableContent;
}

function getSmashWaterJarViewpointProfile(
  viewpointId: SupportedSmashWaterJarViewpointId,
) {
  return smashWaterJarViewpointProfiles[viewpointId];
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: SmashWaterJarAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      SMASH_WATER_JAR_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createSmashWaterJarAiDebugInfo(
  config = getAiConfig(),
): SmashWaterJarAiDebugInfo {
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

function extractResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const possible = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof possible.output_text === "string" && possible.output_text.trim()) {
    return possible.output_text.trim();
  }

  const text = possible.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && typeof content.text === "string")
    ?.text;

  return typeof text === "string" ? text.trim() : "";
}

function serializeBeatBlueprints() {
  return smashWaterJarBeatBlueprints
    .map(
      (beat, index) =>
        `${index + 1}. ${beat.beatId}\n标题：${beat.title}\n建议 line 数：${beat.minLines}-${beat.maxLines}`,
    )
    .join("\n\n");
}

function buildSmashWaterJarStoryPackagePrompt(params: {
  eventId: string;
  viewpointId: SupportedSmashWaterJarViewpointId;
}) {
  const viewpoint = getSmashWaterJarViewpointProfile(params.viewpointId);

  const systemPrompt = [
    "你正在为一个历史互动产品编写线性剧场脚本。",
    "这不是历史概述，不是人物品德教育，也不是课文改写。",
    `当前事件：司马光砸缸。当前第一视角：${viewpoint.displayName}${viewpoint.title}。`,
    viewpoint.narrationRule,
    `创作目标：${viewpoint.userGoal}`,
    ...viewpoint.voiceNotes.map((note) => `- ${note}`),
    "",
    "写作硬规则：",
    "- 每一幕都必须是具体现场：庭院、缸边、落水、惊叫、观察、找石头、砸缸、救人。",
    "- 不要写历史意义，不要写品德教育，不要写司马光很聪明的总结。",
    "- narration 只能是司马光第一视角的即时观察和判断。",
    "- dialogue 要短促自然，像孩子和现场大人真正会说的话。",
    "- 重点是时间压力：别人还在慌时，司马光必须先看清楚水缸和救人的办法。",
    "- 可以有少量庭院玩伴、落水孩子、赶来的大人出声，但不要喧宾夺主。",
    "- AI 只负责线性脚本内容，不决定背景、立绘、页面结构和分支。",
    "- 输出必须严格符合给定 JSON Schema。",
  ].join("\n");

  const userPrompt = [
    `请为 ${viewpoint.displayName}${viewpoint.title} 生成一整段线性脚本包。`,
    "这段脚本必须像一次几秒钟内发生的庭院救人现场，而不是把“司马光砸缸”讲成故事梗概。",
    "整体建议 20 到 26 条 line，保证落水、慌乱、判断、砸缸和得救这条线能完整展开。",
    "请严格按以下 beat 顺序生成：",
    serializeBeatBlueprints(),
    "",
    "各 beat 创作目标：",
    ...Object.entries(viewpoint.beatGoals).map(([beatId, goal]) => `- ${beatId}: ${goal}`),
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredSmashWaterJarScriptPackage(params: {
  request: SmashWaterJarAiStoryPackageRequest & {
    viewpointId: SupportedSmashWaterJarViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: SmashWaterJarAiScriptPackage;
  debug: SmashWaterJarAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createSmashWaterJarAiDebugInfo(config);

  if (!apiKey) {
    throw new Error("AI key 缺失，请先配置 AI_API_KEY 后再试。");
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildSmashWaterJarStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = smashWaterJarBeatBlueprints.length;
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
          name: "smash_water_jar_linear_script_package",
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
                enum: [SMASH_WATER_JAR_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...SMASH_WATER_JAR_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: smashWaterJarBeatBlueprints.length,
                maxItems: smashWaterJarBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: smashWaterJarBeatBlueprints.map((beat) => beat.beatId),
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
    scriptPackage: JSON.parse(outputText) as SmashWaterJarAiScriptPackage,
    debug,
  };
}

function normalizeSmashWaterJarScriptLine(
  line: SmashWaterJarAiScriptLine,
): SmashWaterJarAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: line.text.trim(),
  };
}

function normalizeSmashWaterJarScriptPackage(
  scriptPackage: SmashWaterJarAiScriptPackage,
): SmashWaterJarAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as SmashWaterJarBeatId,
      lines: beat.lines.map(normalizeSmashWaterJarScriptLine),
    })),
  };
}

function validateSmashWaterJarScriptPackage(
  scriptPackage: SmashWaterJarAiScriptPackage,
  viewpointId: SupportedSmashWaterJarViewpointId,
): SmashWaterJarScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== SMASH_WATER_JAR_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${SMASH_WATER_JAR_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== smashWaterJarBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${smashWaterJarBeatBlueprints.length}。`);
  }

  let narrationCount = 0;
  let simaguangDialogueCount = 0;
  let childDialogueCount = 0;

  smashWaterJarBeatBlueprints.forEach((blueprint, index) => {
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
        if (line.text.length < 20) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补一点缸边观察或时间压力。`,
          );
        }
        if (line.text.length > 100) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议再收紧一点。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 不在允许名单中：${line.speaker}`,
        );
      }

      if (line.speaker === "司马光") {
        simaguangDialogueCount += 1;
      } else {
        childDialogueCount += 1;
      }

      if (line.text.length < 8) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏短，容易像喊口号。`,
        );
      }
      if (line.text.length > 54) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条对话偏长，建议更像紧急现场短句。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce((sum, beat) => sum + beat.lines.length, 0);
  if (totalLines < 20 || totalLines > 26) {
    warnings.push("总 line 数量偏离推荐范围 20-26。");
  }
  if (simaguangDialogueCount < 2) {
    warnings.push("司马光直接发言偏少，建议再增强他当场发出判断和指令的存在感。");
  }
  if (childDialogueCount < 4) {
    warnings.push("现场其他孩子或大人的反应偏少，紧急感可能不够完整。");
  }
  if (narrationCount > smashWaterJarBeatBlueprints.length + 1) {
    warnings.push("旁白比重偏高，建议把更多紧张感交给现场短对话与动作。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatSmashWaterJarScriptValidation(
  result: SmashWaterJarScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return { mode: "hidden" };
  }

  const visualKey =
    smashWaterJarSpeakerVisualKeyMap[
      speaker as keyof typeof smashWaterJarSpeakerVisualKeyMap
    ];

  if (!visualKey) {
    return { mode: "hidden" };
  }

  if (speaker === "司马光") {
    return {
      mode: "speaker",
      speakerId: "simaguang",
      visualKey: "simaguang",
      hideForViewpoint: true,
    };
  }

  return { mode: "hidden" };
}

function adaptSmashWaterJarScriptPackageToPlayableContent(
  scriptPackage: SmashWaterJarAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getSmashWaterJarPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = smashWaterJarBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;
      const speakerId =
        smashWaterJarSpeakerVisualKeyMap[
          line.speaker as keyof typeof smashWaterJarSpeakerVisualKeyMap
        ] ?? (line.speaker ? undefined : "narration");

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId,
        text: line.text,
        background: smashWaterJarAiBackdropMap[blueprint.backgroundTag],
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
    eventId: SMASH_WATER_JAR_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(): SmashWaterJarAiScriptPackage {
  const profile = getSmashWaterJarViewpointProfile(
    SMASH_WATER_JAR_AI_DEFAULT_VIEWPOINT_ID,
  );

  return {
    packageId: "smash-water-jar-fallback-simaguang",
    storyId: "smash-water-jar-simaguang",
    protocolVersion: SMASH_WATER_JAR_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId: SMASH_WATER_JAR_AI_DEFAULT_VIEWPOINT_ID,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isSmashWaterJarAiSupportedViewpoint(viewpointId)) {
    return getSmashWaterJarPlayableBase();
  }

  return adaptSmashWaterJarScriptPackageToPlayableContent(
    createFallbackScriptPackage(),
    "local-scripted",
  );
}

function isSmashWaterJarAiSupportedViewpoint(
  viewpointId: string,
): viewpointId is SupportedSmashWaterJarViewpointId {
  return (SMASH_WATER_JAR_AI_SUPPORTED_VIEWPOINT_IDS as readonly string[]).includes(
    viewpointId,
  );
}

export function shouldUseSmashWaterJarAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || SMASH_WATER_JAR_AI_DEFAULT_VIEWPOINT_ID;

  return (
    eventId === SMASH_WATER_JAR_AI_EVENT_ID &&
    isSmashWaterJarAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getSmashWaterJarAiInitialViewpointId() {
  return SMASH_WATER_JAR_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateSmashWaterJarAiStoryPackage(
  params: SmashWaterJarAiStoryPackageRequest,
): Promise<SmashWaterJarAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== SMASH_WATER_JAR_AI_EVENT_ID ||
    !isSmashWaterJarAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error: "当前只支持司马光砸缸的司马光 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createSmashWaterJarAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredSmashWaterJarScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage =
      normalizeSmashWaterJarScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateSmashWaterJarScriptPackage(
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
        error: formatSmashWaterJarScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptSmashWaterJarScriptPackageToPlayableContent(normalizedPackage);
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
    const debug = createSmashWaterJarAiDebugInfo(getAiConfig());
    const errorMessage = error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[smash-water-jar-ai] linear script package request failed", {
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
