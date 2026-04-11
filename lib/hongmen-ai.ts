import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import { adaptAiStructuredStoryToPlayableContent } from "@/lib/ai-scene-adapter";
import { validateAiStructuredStoryOutput } from "@/lib/story-protocol-validation";
import type {
  AiStructuredSceneNode,
  AiStructuredStoryOutput,
  EventPlayableContent,
  EventScene,
  EventViewpoint,
  PlaceholderAsset,
} from "@/types/content";

export const HONGMEN_AI_EVENT_ID = "hongmen-banquet";
export const HONGMEN_AI_VIEWPOINT_ID = "liubang";
export const HONGMEN_AI_INITIAL_SCENE_ID = "arrival-1";

const HONGMEN_AI_DEFAULT_MODEL = "openai/gpt-4o-mini";
const HONGMEN_SCENE_ID_PATTERN =
  /^(arrival|opening-dialogue|decision-one|fan-kuai-entry|decision-two|ending)(?:-(\d+))?$/;
const HONGMEN_SCENE_RETRY_LIMIT = 2;

type HongmenBeatId =
  | "arrival"
  | "opening-dialogue"
  | "decision-one"
  | "fan-kuai-entry"
  | "decision-two"
  | "ending";

type HongmenBeatBlueprint = {
  beatId: HongmenBeatId;
  fallbackSceneId: string;
  sceneType: "narration" | "dialogue" | "decision";
  dramaticGoal: string;
  backgroundTag: keyof typeof hongmenAiBackdropMap;
  allowedSpeakers: string[];
  suggestedSpeaker: string;
  showStandee: boolean;
  suggestedStandeeKey: string;
  minScenes: number;
  maxScenes: number;
  nextBeatId?: HongmenBeatId;
  choiceBlueprints?: Array<{
    id: string;
    label: string;
    isHistorical?: boolean;
    nextBeatId: HongmenBeatId;
  }>;
};

type HongmenSceneTarget = {
  rawSceneId: string;
  beatId: HongmenBeatId;
  step: number;
  blueprint: HongmenBeatBlueprint;
};

type HongmenAiHistoryEntry = {
  sceneId: string;
  speaker: string;
  text: string;
  type: EventScene["type"];
  selectedChoiceId?: string;
  selectedChoiceLabel?: string;
};

type HongmenSceneValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type HongmenAiSceneRequest = {
  eventId: string;
  viewpointId: string;
  requestedSceneId: string;
  history: HongmenAiHistoryEntry[];
  clientRequestId?: string;
  triggerSource?: "initial" | "continue" | "choice" | "reset";
  clientTriggeredAtMs?: number;
  clientRequestCountForScene?: number;
};

export type HongmenAiSceneResponse = {
  ok: boolean;
  scene: EventScene;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: HongmenAiDebugInfo;
};

type HongmenAiDebugInfo = {
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
    clientRequestCountForScene?: number;
    triggerSource?: string;
  };
  upstreamStatus?: number;
  upstreamStatusText?: string;
  upstreamBody?: string;
};

const hongmenAiBackdropMap = {
  "camp-night": {
    label: "鸿门",
    tone: "crimson",
    description: "背景占位：夜色压在营地上，火光映在酒器与兵刃之间。",
  },
  "banquet-seat": {
    label: "宴席",
    tone: "crimson",
    description: "背景占位：主席前方灯火偏暗，礼数和试探同时压在席面上。",
  },
  "tent-entrance": {
    label: "帐门",
    tone: "bronze",
    description: "背景占位：帐门被掀开，席间气氛被更强硬的动作突然打断。",
  },
  "exit-shadow": {
    label: "退路",
    tone: "ink",
    description: "背景占位：营帐边缘与火光背后的阴影，退场与脱身都藏在缝隙里。",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const hongmenSpeakerKeyMap = {
  刘邦: "liubang",
  项羽: "xiangyu",
  项伯: "xiangbo",
  樊哙: "fan-kuai",
} as const;

const hongmenBeatBlueprints: Record<HongmenBeatId, HongmenBeatBlueprint> = {
  arrival: {
    beatId: "arrival",
    fallbackSceneId: "arrival",
    sceneType: "narration",
    dramaticGoal: "从刘邦第一视角建立入席前的警觉感，让玩家立刻感到这不是普通宴会。",
    backgroundTag: "camp-night",
    allowedSpeakers: [],
    suggestedSpeaker: "",
    showStandee: false,
    suggestedStandeeKey: "",
    minScenes: 1,
    maxScenes: 2,
    nextBeatId: "opening-dialogue",
  },
  "opening-dialogue": {
    beatId: "opening-dialogue",
    fallbackSceneId: "opening-dialogue",
    sceneType: "dialogue",
    dramaticGoal: "让开局的试探更慢一点展开，先压低声势，再把真正的压力送到席面中央。",
    backgroundTag: "banquet-seat",
    allowedSpeakers: ["项羽", "项伯"],
    suggestedSpeaker: "项羽",
    showStandee: true,
    suggestedStandeeKey: "xiangyu",
    minScenes: 2,
    maxScenes: 3,
    nextBeatId: "decision-one",
  },
  "decision-one": {
    beatId: "decision-one",
    fallbackSceneId: "decision-one",
    sceneType: "decision",
    dramaticGoal: "让刘邦在宴席刚开局时做第一次姿态选择。",
    backgroundTag: "banquet-seat",
    allowedSpeakers: ["关键抉择"],
    suggestedSpeaker: "关键抉择",
    showStandee: false,
    suggestedStandeeKey: "",
    minScenes: 1,
    maxScenes: 1,
    choiceBlueprints: [
      {
        id: "historic-humble",
        label: "主动示弱，把入关经过解释清楚",
        isHistorical: true,
        nextBeatId: "fan-kuai-entry",
      },
      {
        id: "assertive",
        label: "先稳住气势，强调自己并无二心",
        nextBeatId: "fan-kuai-entry",
      },
      {
        id: "silent",
        label: "尽量少说，先观察席间每个人的反应",
        nextBeatId: "fan-kuai-entry",
      },
    ],
  },
  "fan-kuai-entry": {
    beatId: "fan-kuai-entry",
    fallbackSceneId: "fan-kuai-entry",
    sceneType: "dialogue",
    dramaticGoal: "让樊哙闯入后的压迫感慢慢升高，不是一句就把局势带过。",
    backgroundTag: "tent-entrance",
    allowedSpeakers: ["樊哙", "项羽"],
    suggestedSpeaker: "樊哙",
    showStandee: true,
    suggestedStandeeKey: "fan-kuai",
    minScenes: 2,
    maxScenes: 3,
    nextBeatId: "decision-two",
  },
  "decision-two": {
    beatId: "decision-two",
    fallbackSceneId: "decision-two",
    sceneType: "decision",
    dramaticGoal: "在局势更重之后，逼刘邦做第二次生存判断。",
    backgroundTag: "exit-shadow",
    allowedSpeakers: ["关键抉择"],
    suggestedSpeaker: "关键抉择",
    showStandee: false,
    suggestedStandeeKey: "",
    minScenes: 1,
    maxScenes: 1,
    choiceBlueprints: [
      {
        id: "historic-exit",
        label: "借上厕所离席，抓住空档退出营地",
        isHistorical: true,
        nextBeatId: "ending",
      },
      {
        id: "stay",
        label: "继续留席，试着把危险拖成表面平静",
        nextBeatId: "ending",
      },
      {
        id: "confront",
        label: "把暗示挑明，逼对面先亮态度",
        nextBeatId: "ending",
      },
    ],
  },
  ending: {
    beatId: "ending",
    fallbackSceneId: "ending",
    sceneType: "narration",
    dramaticGoal: "用一小段收束，把鸿门宴最重要的危险感和试探感落下来。",
    backgroundTag: "exit-shadow",
    allowedSpeakers: [],
    suggestedSpeaker: "",
    showStandee: false,
    suggestedStandeeKey: "",
    minScenes: 1,
    maxScenes: 1,
  },
};

function getHongmenPlayableBase(): EventPlayableContent {
  const playableContent = getEventPlayableContent(HONGMEN_AI_EVENT_ID);
  if (!playableContent) {
    throw new Error("Missing hongmen playable content.");
  }

  return playableContent;
}

function getHongmenAiViewpoint(): EventViewpoint {
  const viewpoint = getHongmenPlayableBase().viewpoints.find(
    (item) => item.id === HONGMEN_AI_VIEWPOINT_ID,
  );

  if (!viewpoint) {
    throw new Error("Missing hongmen AI viewpoint.");
  }

  return viewpoint;
}

function createHongmenSceneId(beatId: HongmenBeatId, step: number) {
  return `${beatId}-${step}`;
}

function parseHongmenSceneTarget(sceneId: string): HongmenSceneTarget | null {
  const matched = HONGMEN_SCENE_ID_PATTERN.exec(sceneId.trim());
  if (!matched) {
    return null;
  }

  const beatId = matched[1] as HongmenBeatId;
  const step = Number(matched[2] ?? "1");
  if (!Number.isFinite(step) || step < 1) {
    return null;
  }

  return {
    rawSceneId: sceneId.trim(),
    beatId,
    step,
    blueprint: hongmenBeatBlueprints[beatId],
  };
}

function getFallbackSceneForTarget(target: HongmenSceneTarget): EventScene {
  const base = getHongmenPlayableBase();
  const fallbackScene = base.scenes.find(
    (scene) => scene.sceneId === target.blueprint.fallbackSceneId,
  );

  if (!fallbackScene) {
    throw new Error(`Missing fallback scene for ${target.blueprint.fallbackSceneId}.`);
  }

  return {
    ...fallbackScene,
    sceneId: target.rawSceneId,
  };
}

function getFallbackSceneForRequestedId(sceneId: string) {
  const target = parseHongmenSceneTarget(sceneId);
  if (!target) {
    return getFallbackSceneForTarget({
      rawSceneId: HONGMEN_AI_INITIAL_SCENE_ID,
      beatId: "arrival",
      step: 1,
      blueprint: hongmenBeatBlueprints.arrival,
    });
  }

  return getFallbackSceneForTarget(target);
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function createHongmenAiRequestId() {
  return `hongmen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getProgressionRules(target: HongmenSceneTarget) {
  const { blueprint, step } = target;
  if (blueprint.sceneType === "decision") {
    return {
      forcedNextSceneId: "",
      allowedNextSceneIds: [] as string[],
      choiceBlueprints:
        blueprint.choiceBlueprints?.map((choice) => ({
          ...choice,
          nextSceneId: createHongmenSceneId(choice.nextBeatId, 1),
        })) ?? [],
    };
  }

  const sameBeatNextSceneId =
    step < blueprint.maxScenes ? createHongmenSceneId(blueprint.beatId, step + 1) : null;
  const nextBeatSceneId = blueprint.nextBeatId
    ? createHongmenSceneId(blueprint.nextBeatId, 1)
    : "";

  if (step < blueprint.minScenes && sameBeatNextSceneId) {
    return {
      forcedNextSceneId: sameBeatNextSceneId,
      allowedNextSceneIds: [sameBeatNextSceneId],
      choiceBlueprints: [] as Array<{
        id: string;
        label: string;
        isHistorical?: boolean;
        nextBeatId: HongmenBeatId;
        nextSceneId: string;
      }>,
    };
  }

  if (step >= blueprint.maxScenes) {
    return {
      forcedNextSceneId: nextBeatSceneId,
      allowedNextSceneIds: nextBeatSceneId ? [nextBeatSceneId] : [],
      choiceBlueprints: [] as Array<{
        id: string;
        label: string;
        isHistorical?: boolean;
        nextBeatId: HongmenBeatId;
        nextSceneId: string;
      }>,
    };
  }

  return {
    forcedNextSceneId: null as string | null,
    allowedNextSceneIds: [sameBeatNextSceneId, nextBeatSceneId].filter(
      (value): value is string => Boolean(value),
    ),
    choiceBlueprints: [] as Array<{
      id: string;
      label: string;
      isHistorical?: boolean;
      nextBeatId: HongmenBeatId;
      nextSceneId: string;
    }>,
  };
}

function buildHistorySummary(history: HongmenAiHistoryEntry[]) {
  if (history.length === 0) {
    return "None. This is the opening scene.";
  }

  return history
    .slice(-6)
    .map((entry, index) => {
      const choiceText = entry.selectedChoiceLabel
        ? ` | selected choice: ${entry.selectedChoiceLabel}`
        : "";

      return `${index + 1}. [${entry.sceneId}] (${entry.type}) ${entry.speaker || "旁白"}: ${entry.text}${choiceText}`;
    })
    .join("\n");
}

function buildHongmenScenePrompt(
  params: HongmenAiSceneRequest,
  target: HongmenSceneTarget,
  correctionNote?: string,
) {
  const viewpoint = getHongmenAiViewpoint();
  const eventItem = getHistoricalEvent(HONGMEN_AI_EVENT_ID);
  if (!eventItem) {
    throw new Error("Missing hongmen event.");
  }

  const progression = getProgressionRules(target);
  const historySummary = buildHistorySummary(params.history);
  const systemPrompt = [
    "You generate one structured scene node for a Chinese historical AVG experience.",
    "Output only strict JSON that follows the provided schema.",
    "Write all scene text in Simplified Chinese.",
    "Do not output layout, UI, CSS, camera language, file paths, or asset filenames.",
    "This event is 鸿门宴 and the fixed first-person viewpoint is 刘邦.",
    "Keep the tone tense, restrained, and readable for general users.",
    "Narration rules:",
    "- narration is only Liu Bang's first-person observation or feeling.",
    "- no quoted dialogue in narration.",
    "- keep narration short, around 2 to 3 short lines.",
    "Dialogue rules:",
    "- dialogue contains only one character speaking.",
    "- no narration, no stage directions, no crowd reaction, no third-person description.",
    "- if the line would become too long, split the moment into another dialogue scene instead of stuffing everything into one box.",
    "Decision rules:",
    "- decision only explains the current situation briefly and then provides 3 choices.",
    "- do not include ending language or wrap-up text inside decision scenes.",
    "- top-level nextSceneId for decision must be an empty string.",
    "If the current speaker is Liu Bang himself, prefer showStandee=false to preserve first-person immersion.",
  ].join("\n");

  const progressionPrompt =
    target.blueprint.sceneType === "decision"
      ? progression.choiceBlueprints
          .map(
            (choice) =>
              `- id=${choice.id} | label=${choice.label} | isHistorical=${choice.isHistorical ? "true" : "false"} | nextSceneId=${choice.nextSceneId}`,
          )
          .join("\n")
      : progression.forcedNextSceneId
        ? `This scene must continue to nextSceneId=${progression.forcedNextSceneId}.`
        : `Allowed nextSceneId values: ${progression.allowedNextSceneIds.join(", ")}.`;

  const userPrompt = [
    `Event title: ${eventItem.title}`,
    `Event summary: ${eventItem.description}`,
    `Fixed viewpoint: ${viewpoint.name}`,
    `Viewpoint note: ${viewpoint.summary}`,
    `Requested sceneId: ${target.rawSceneId}`,
    `Current beatId: ${target.beatId}`,
    `Current beat step: ${target.step}`,
    `Beat target type: ${target.blueprint.sceneType}`,
    `Beat dramatic goal: ${target.blueprint.dramaticGoal}`,
    `Required backgroundTag: ${target.blueprint.backgroundTag}`,
    `Allowed speakers: ${target.blueprint.allowedSpeakers.join(" / ") || "(empty string only)"}`,
    `Suggested speaker: ${target.blueprint.suggestedSpeaker || "(empty string)"}`,
    `Suggested showStandee: ${target.blueprint.showStandee ? "true" : "false"}`,
    `Suggested standeeKey: ${target.blueprint.suggestedStandeeKey || "(empty string)"}`,
    `Beat pacing: minScenes=${target.blueprint.minScenes}, maxScenes=${target.blueprint.maxScenes}`,
    `Progression rule:\n${progressionPrompt}`,
    `Allowed backgroundTag values: ${Object.keys(hongmenAiBackdropMap).join(", ")}`,
    "Allowed standeeKey values: xiangyu, fan-kuai, xiangbo, liubang, narration, decision, ending, or empty string.",
    `Generated history so far:\n${historySummary}`,
    correctionNote ? `Correction note for this retry:\n${correctionNote}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    systemPrompt,
    userPrompt,
    historySummary,
  };
}

function getOpenAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = openRouterApiKey || openAiApiKey || "";
  const apiKeySource: HongmenAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      HONGMEN_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createHongmenAiDebugInfo(
  config: ReturnType<typeof getOpenAiConfig>,
): HongmenAiDebugInfo {
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

async function requestStructuredHongmenScene(params: {
  request: HongmenAiSceneRequest;
  target: HongmenSceneTarget;
  requestId: string;
  retryCount: number;
  correctionNote?: string;
}): Promise<{
  scene: AiStructuredSceneNode;
  debug: HongmenAiDebugInfo;
}> {
  const config = getOpenAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createHongmenAiDebugInfo(config);

  if (!apiKey) {
    throw new Error(
      "Missing API key. Please set OPENROUTER_API_KEY or OPENAI_API_KEY and restart the dev server.",
    );
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt, historySummary } = buildHongmenScenePrompt(
    params.request,
    params.target,
    params.correctionNote,
  );
  debug.requestId = params.requestId;
  debug.metrics.historyCount = params.request.history.length;
  debug.metrics.historySummaryLength = historySummary.length;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = params.retryCount;
  debug.metrics.upstreamCallCount = params.retryCount + 1;
  debug.metrics.clientRequestCountForScene = params.request.clientRequestCountForScene;
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
          content: [
            {
              type: "input_text",
              text: systemPrompt,
            },
          ],
        },
        {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: userPrompt,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "hongmen_scene_node",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "sceneId",
              "type",
              "speaker",
              "text",
              "backgroundTag",
              "showStandee",
              "standeeKey",
              "choices",
              "nextSceneId",
            ],
            properties: {
              sceneId: { type: "string" },
              type: {
                type: "string",
                enum: ["narration", "dialogue", "decision"],
              },
              speaker: { type: "string" },
              text: { type: "string" },
              backgroundTag: { type: "string" },
              showStandee: { type: "boolean" },
              standeeKey: { type: "string" },
              nextSceneId: { type: "string" },
              choices: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "id",
                    "label",
                    "outcome",
                    "isHistorical",
                    "nextSceneId",
                  ],
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    outcome: { type: "string" },
                    isHistorical: { type: "boolean" },
                    nextSceneId: { type: "string" },
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
      `Upstream request failed with status ${response.status} ${response.statusText}. Body: ${upstreamBody || "(empty body)"}`,
    );
  }

  debug.timings.upstreamRequestMs = Number((performance.now() - upstreamStart).toFixed(1));
  const extractStart = performance.now();
  const payload = (await response.json()) as unknown;
  const outputText = extractResponseText(payload);
  if (!outputText) {
    throw new Error("OpenAI returned empty structured output.");
  }
  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number((performance.now() - extractStart).toFixed(1));

  return {
    scene: JSON.parse(outputText) as AiStructuredSceneNode,
    debug,
  };
}

function normalizeHongmenAiScene(scene: AiStructuredSceneNode): AiStructuredSceneNode {
  const type = scene.type;
  const normalizedText =
    type === "dialogue"
      ? normalizeText(scene.text).replace(/\n+/g, " ")
      : normalizeText(scene.text);

  const normalizedChoices =
    type === "decision"
      ? (scene.choices ?? []).map((choice) => ({
          ...choice,
          id: choice.id.trim(),
          label: normalizeText(choice.label).replace(/\n+/g, " "),
          outcome: normalizeText(choice.outcome ?? "").replace(/\n+/g, " "),
          nextSceneId: choice.nextSceneId?.trim() ?? "",
        }))
      : [];

  return {
    sceneId: scene.sceneId.trim(),
    type,
    speaker: type === "narration" ? "" : scene.speaker.trim(),
    text: normalizedText,
    backgroundTag: scene.backgroundTag.trim(),
    showStandee: Boolean(scene.showStandee),
    standeeKey: scene.showStandee ? (scene.standeeKey?.trim() ?? "") : "",
    choices: normalizedChoices,
    nextSceneId: type === "decision" ? "" : scene.nextSceneId?.trim() ?? "",
  };
}

function validateStructuredShape(
  scene: AiStructuredSceneNode,
): HongmenSceneValidationResult {
  const output: AiStructuredStoryOutput = {
    protocolVersion: "ai-scene-v1",
    initialSceneId: scene.sceneId,
    scenes: [scene],
  };

  const report = validateAiStructuredStoryOutput(output, {
    target: HONGMEN_AI_EVENT_ID,
    backgrounds: hongmenAiBackdropMap,
    speakerVisuals: getHongmenPlayableBase().speakerVisuals,
    allowForwardReferences: true,
  });

  return {
    ok: report.ok,
    errors: report.errors.map((issue) => issue.message),
    warnings: report.warnings.map((issue) => issue.message),
  };
}

function validateBeatRules(
  scene: AiStructuredSceneNode,
  target: HongmenSceneTarget,
): HongmenSceneValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const progression = getProgressionRules(target);
  const quotePattern = /["“”‘’「」『』]/;
  const dialogueNarrationPattern =
    /(你看见|你听见|你察觉|席间|众人|周围|四下|空气里|火光|营帐里|有人|身后|此刻|这一瞬)/;
  const endingPattern = /(这一轮|体验已结束|结束了|落幕|收束|到此为止)/;

  if (scene.sceneId !== target.rawSceneId) {
    errors.push(`sceneId 必须等于请求的 ${target.rawSceneId}。`);
  }

  if (scene.type !== target.blueprint.sceneType) {
    errors.push(`scene.type 必须是 ${target.blueprint.sceneType}。`);
  }

  if (scene.backgroundTag !== target.blueprint.backgroundTag) {
    errors.push(`backgroundTag 必须是 ${target.blueprint.backgroundTag}。`);
  }

  if (target.blueprint.sceneType === "narration") {
    if (scene.speaker.trim().length > 0) {
      errors.push("narration 场景的 speaker 必须为空字符串。");
    }
    if (quotePattern.test(scene.text)) {
      errors.push("narration 不能出现引号对白。");
    }
    if (scene.text.length > 90 || scene.text.split("\n").length > 3) {
      errors.push("narration 需要更短，控制在 2 到 3 行内。");
    }
    if (scene.showStandee) {
      errors.push("narration 场景不应显示立绘。");
    }
    if (scene.choices && scene.choices.length > 0) {
      errors.push("narration 场景不应包含 choices。");
    }
  }

  if (target.blueprint.sceneType === "dialogue") {
    if (!target.blueprint.allowedSpeakers.includes(scene.speaker)) {
      errors.push(
        `dialogue 的 speaker 只能是 ${target.blueprint.allowedSpeakers.join(" / ")}。`,
      );
    }
    if (!scene.showStandee) {
      warnings.push("当前 dialogue 场景未显示立绘。");
    }
    if (scene.text.length > 56) {
      errors.push("dialogue 太长了，请拆成更短的单句或短句。");
    }
    if (scene.text.includes("\n")) {
      errors.push("dialogue 不能换行，应保持单人单框发言。");
    }
    if (quotePattern.test(scene.text)) {
      errors.push("dialogue 不要再嵌套引号对白。");
    }
    if (dialogueNarrationPattern.test(scene.text)) {
      errors.push("dialogue 混入了旁白、动作描写或群体信息，需要更干净。");
    }
    if (scene.choices && scene.choices.length > 0) {
      errors.push("dialogue 场景不应包含 choices。");
    }
  }

  if (target.blueprint.sceneType === "decision") {
    if (scene.speaker !== "关键抉择") {
      errors.push("decision 场景的 speaker 必须是关键抉择。");
    }
    if (endingPattern.test(scene.text)) {
      errors.push("decision 文本不能混入结束或收束文案。");
    }
    if ((scene.nextSceneId ?? "").trim().length > 0) {
      errors.push("decision 场景的顶层 nextSceneId 必须为空字符串。");
    }
    if ((scene.choices ?? []).length !== 3) {
      errors.push("decision 场景必须返回 3 个 choices。");
    }

    const expectedChoices = progression.choiceBlueprints;
    scene.choices?.forEach((choice, index) => {
      const expectedChoice = expectedChoices[index];
      if (!expectedChoice) {
        errors.push("decision 返回了超出预期的 choice。");
        return;
      }

      if (choice.id !== expectedChoice.id) {
        errors.push(`choice id 必须是 ${expectedChoice.id}。`);
      }
      if (choice.label !== expectedChoice.label) {
        errors.push(`choice label 必须是 ${expectedChoice.label}。`);
      }
      if (choice.nextSceneId !== expectedChoice.nextSceneId) {
        errors.push(`choice ${choice.id} 的 nextSceneId 必须是 ${expectedChoice.nextSceneId}。`);
      }
      if (typeof choice.outcome !== "string" || choice.outcome.trim().length === 0) {
        errors.push(`choice ${choice.id} 需要一句简短 outcome。`);
      }
      if ((choice.outcome ?? "").length > 40) {
        errors.push(`choice ${choice.id} 的 outcome 需要更短。`);
      }
      if (endingPattern.test(choice.outcome ?? "")) {
        errors.push(`choice ${choice.id} 的 outcome 不能提前宣告结束。`);
      }
    });
  }

  if (target.blueprint.sceneType !== "decision") {
    const nextSceneId = (scene.nextSceneId ?? "").trim();
    if (progression.forcedNextSceneId !== null) {
      if (nextSceneId !== progression.forcedNextSceneId) {
        errors.push(`nextSceneId 必须是 ${progression.forcedNextSceneId}。`);
      }
    } else if (!progression.allowedNextSceneIds.includes(nextSceneId)) {
      errors.push(
        `nextSceneId 必须是 ${progression.allowedNextSceneIds.join(" / ")} 之一。`,
      );
    }
  }

  if (scene.showStandee && (scene.standeeKey ?? "").trim().length === 0) {
    errors.push("showStandee 为 true 时，standeeKey 不能为空。");
  }

  if (target.blueprint.sceneType === "dialogue") {
    const expectedVisualKey =
      hongmenSpeakerKeyMap[scene.speaker as keyof typeof hongmenSpeakerKeyMap] ?? "";
    if (expectedVisualKey && scene.standeeKey !== expectedVisualKey) {
      errors.push(`当前 speaker 的 standeeKey 应为 ${expectedVisualKey}。`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function mergeValidationResults(
  ...results: HongmenSceneValidationResult[]
): HongmenSceneValidationResult {
  return {
    ok: results.every((result) => result.ok),
    errors: results.flatMap((result) => result.errors),
    warnings: results.flatMap((result) => result.warnings),
  };
}

function formatValidationMessages(result: HongmenSceneValidationResult) {
  return [...result.errors, ...result.warnings].join(" ");
}

async function requestValidatedHongmenScene(
  params: HongmenAiSceneRequest,
  target: HongmenSceneTarget,
) {
  const requestId = params.clientRequestId?.trim() || createHongmenAiRequestId();
  let lastDebug: HongmenAiDebugInfo | undefined;
  let lastValidation: HongmenSceneValidationResult | null = null;

  for (let attempt = 1; attempt <= HONGMEN_SCENE_RETRY_LIMIT; attempt += 1) {
    const correctionNote =
      attempt === 1 || !lastValidation
        ? undefined
        : `The previous output broke these rules: ${formatValidationMessages(lastValidation)} Rewrite the same requested scene with shorter, cleaner, rule-compliant content.`;

    const { scene, debug } = await requestStructuredHongmenScene({
      request: params,
      target,
      requestId,
      retryCount: attempt - 1,
      correctionNote,
    });
    lastDebug = debug;

    const normalizedScene = normalizeHongmenAiScene(scene);
    const validationStart = performance.now();
    const validation = mergeValidationResults(
      validateStructuredShape(normalizedScene),
      validateBeatRules(normalizedScene, target),
    );
    debug.timings.validationMs = Number((performance.now() - validationStart).toFixed(1));

    if (validation.ok) {
      return {
        scene: normalizedScene,
        debug,
        retryCount: attempt - 1,
        warning:
          attempt > 1 ? "AI 已自动重试一次，并收束为更干净的单幕输出。" : undefined,
      };
    }

    lastValidation = validation;
  }

  throw Object.assign(new Error("AI scene failed protocol validation."), {
    debug: lastDebug,
    validation: lastValidation,
  });
}

function adaptHongmenAiScene(scene: AiStructuredSceneNode) {
  const base = getHongmenPlayableBase();
  const adapted = adaptAiStructuredStoryToPlayableContent({
    eventId: HONGMEN_AI_EVENT_ID,
    output: {
      protocolVersion: "ai-scene-v1",
      initialSceneId: scene.sceneId,
      scenes: [scene],
    },
    defaultBackdrop: base.defaultBackdrop,
    backgrounds: hongmenAiBackdropMap,
    viewpoints: base.viewpoints,
    speakerVisuals: base.speakerVisuals,
  });

  return adapted.scenes[0];
}

export function shouldUseHongmenAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId = viewpointId?.trim() || HONGMEN_AI_VIEWPOINT_ID;
  return eventId === HONGMEN_AI_EVENT_ID && normalizedViewpointId === HONGMEN_AI_VIEWPOINT_ID;
}

export function getHongmenAiInitialViewpointId() {
  return HONGMEN_AI_VIEWPOINT_ID;
}

export async function generateHongmenAiScene(
  params: HongmenAiSceneRequest,
): Promise<HongmenAiSceneResponse> {
  const serviceStart = performance.now();
  const target = parseHongmenSceneTarget(params.requestedSceneId);

  if (
    params.eventId !== HONGMEN_AI_EVENT_ID ||
    params.viewpointId !== HONGMEN_AI_VIEWPOINT_ID ||
    !target
  ) {
    return {
      ok: false,
      source: "fallback-local",
      scene: getFallbackSceneForRequestedId(params.requestedSceneId || HONGMEN_AI_INITIAL_SCENE_ID),
      error: "当前只支持鸿门宴刘邦视角的 AI 单幕生成。",
    };
  }

  try {
    const { scene: generatedScene, debug, warning } =
      await requestValidatedHongmenScene(params, target);
    const adaptStart = performance.now();
    const adaptedScene = adaptHongmenAiScene(generatedScene);
    debug.timings.adaptMs = Number((performance.now() - adaptStart).toFixed(1));
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    return {
      ok: true,
      source: "ai",
      scene: adaptedScene,
      warning,
      debug,
    };
  } catch (error) {
    const debug =
      error instanceof Error && "debug" in error && error.debug
        ? (error.debug as HongmenAiDebugInfo)
        : createHongmenAiDebugInfo(getOpenAiConfig());
    const validation =
      error instanceof Error && "validation" in error && error.validation
        ? (error.validation as HongmenSceneValidationResult)
        : null;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);
    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }

    console.error("[hongmen-ai] upstream request failed", {
      ...debug,
      error: errorMessage,
      validation: validation ? formatValidationMessages(validation) : undefined,
    });
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    return {
      ok: false,
      source: "fallback-local",
      scene: getFallbackSceneForTarget(target),
      warning: "AI 当前一幕生成失败，已切回本地剧情。",
      error: validation ? formatValidationMessages(validation) : errorMessage,
      debug,
    };
  }
}
