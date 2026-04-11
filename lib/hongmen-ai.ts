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
const HONGMEN_AI_DEFAULT_MODEL = "gpt-4o-mini";

type HongmenSceneBlueprint = {
  sceneId: string;
  sceneType: "narration" | "dialogue" | "decision";
  dramaticGoal: string;
  backgroundTag: keyof typeof hongmenAiBackdropMap;
  allowedSpeakers: string[];
  suggestedSpeaker: string;
  showStandee: boolean;
  suggestedStandeeKey: string;
  nextSceneId: string;
  choiceBlueprints?: Array<{
    id: string;
    label: string;
    isHistorical?: boolean;
    nextSceneId: string;
  }>;
};

type HongmenAiHistoryEntry = {
  sceneId: string;
  speaker: string;
  text: string;
  type: EventScene["type"];
  selectedChoiceId?: string;
  selectedChoiceLabel?: string;
};

export type HongmenAiSceneRequest = {
  eventId: string;
  viewpointId: string;
  requestedSceneId: string;
  history: HongmenAiHistoryEntry[];
};

export type HongmenAiSceneResponse = {
  ok: boolean;
  scene: EventScene;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
};

const hongmenAiBackdropMap = {
  "camp-night": {
    label: "鸿门",
    tone: "crimson",
    description: "背景占位图：夜色、营帐、火光与酒器同时压住席间气氛。",
  },
  "banquet-seat": {
    label: "宴席",
    tone: "crimson",
    description: "背景占位图：宴席正中、灯火偏暗，所有人的目光都停在席间应对上。",
  },
  "tent-entrance": {
    label: "帐门",
    tone: "bronze",
    description: "背景占位图：帐门被掀开，场内气氛被更强硬的动作突然打断。",
  },
  "exit-shadow": {
    label: "退路",
    tone: "ink",
    description: "背景占位图：营帐边缘与火光背后的阴影，退场与脱身都藏在缝隙里。",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const hongmenSceneBlueprints: Record<string, HongmenSceneBlueprint> = {
  arrival: {
    sceneId: "arrival",
    sceneType: "narration",
    dramaticGoal: "用刘邦第一视角建立入席前的警觉感，强调这不是普通宴会。",
    backgroundTag: "camp-night",
    allowedSpeakers: [""],
    suggestedSpeaker: "",
    showStandee: false,
    suggestedStandeeKey: "",
    nextSceneId: "opening-dialogue",
  },
  "opening-dialogue": {
    sceneId: "opening-dialogue",
    sceneType: "dialogue",
    dramaticGoal: "由项羽开口，表面叙旧，实际上让席间压力落地。",
    backgroundTag: "banquet-seat",
    allowedSpeakers: ["项羽"],
    suggestedSpeaker: "项羽",
    showStandee: true,
    suggestedStandeeKey: "xiangyu",
    nextSceneId: "decision-one",
  },
  "decision-one": {
    sceneId: "decision-one",
    sceneType: "decision",
    dramaticGoal: "让刘邦在宴席刚开始时做第一次姿态选择。",
    backgroundTag: "banquet-seat",
    allowedSpeakers: ["关键抉择"],
    suggestedSpeaker: "关键抉择",
    showStandee: false,
    suggestedStandeeKey: "",
    nextSceneId: "",
    choiceBlueprints: [
      {
        id: "historic-humble",
        label: "主动示弱，把入关经过解释清楚",
        isHistorical: true,
        nextSceneId: "fan-kuai-entry",
      },
      {
        id: "assertive",
        label: "直接强调自己的战功，抢先稳住气势",
        nextSceneId: "fan-kuai-entry",
      },
      {
        id: "silent",
        label: "尽量少说，让他人先替你周旋",
        nextSceneId: "fan-kuai-entry",
      },
    ],
  },
  "fan-kuai-entry": {
    sceneId: "fan-kuai-entry",
    sceneType: "dialogue",
    dramaticGoal: "通过樊哙入场打断气氛，把危险感再推进一层。",
    backgroundTag: "tent-entrance",
    allowedSpeakers: ["樊哙"],
    suggestedSpeaker: "樊哙",
    showStandee: true,
    suggestedStandeeKey: "fan-kuai",
    nextSceneId: "decision-two",
  },
  "decision-two": {
    sceneId: "decision-two",
    sceneType: "decision",
    dramaticGoal: "让刘邦在局面加重后做第二次生存判断。",
    backgroundTag: "exit-shadow",
    allowedSpeakers: ["关键抉择"],
    suggestedSpeaker: "关键抉择",
    showStandee: false,
    suggestedStandeeKey: "",
    nextSceneId: "",
    choiceBlueprints: [
      {
        id: "historic-exit",
        label: "借上厕所离席，抓住空档撤出营地",
        isHistorical: true,
        nextSceneId: "ending",
      },
      {
        id: "stay",
        label: "继续留在席上，试着把气氛圆过去",
        nextSceneId: "ending",
      },
      {
        id: "confront",
        label: "直接把暗示挑开，逼对方表态",
        nextSceneId: "ending",
      },
    ],
  },
  ending: {
    sceneId: "ending",
    sceneType: "narration",
    dramaticGoal: "用一段收束，把鸿门宴的压力感和试探本质总结出来。",
    backgroundTag: "exit-shadow",
    allowedSpeakers: [""],
    suggestedSpeaker: "",
    showStandee: false,
    suggestedStandeeKey: "",
    nextSceneId: "",
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

function getHongmenFallbackScene(sceneId: string): EventScene {
  const playableContent = getHongmenPlayableBase();
  const scene = playableContent.scenes.find((item) => item.sceneId === sceneId);

  if (!scene) {
    throw new Error(`Missing fallback scene for ${sceneId}.`);
  }

  return scene;
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

function buildHistorySummary(history: HongmenAiHistoryEntry[]) {
  if (history.length === 0) {
    return "尚未生成前序场景，这是开场第一幕。";
  }

  return history
    .map((entry, index) => {
      const choiceText = entry.selectedChoiceLabel
        ? ` 用户选择：${entry.selectedChoiceLabel}`
        : "";

      return `${index + 1}. [${entry.sceneId}] (${entry.type}) ${entry.speaker || "旁白"}：${entry.text}${choiceText}`;
    })
    .join("\n");
}

function buildHongmenScenePrompt(params: HongmenAiSceneRequest) {
  const blueprint = hongmenSceneBlueprints[params.requestedSceneId];
  const viewpoint = getHongmenAiViewpoint();
  const eventItem = getHistoricalEvent(HONGMEN_AI_EVENT_ID);

  if (!blueprint || !eventItem) {
    throw new Error("Missing hongmen scene blueprint.");
  }

  const choiceRules = blueprint.choiceBlueprints
    ? blueprint.choiceBlueprints
        .map(
          (choice) =>
            `- id=${choice.id} label=${choice.label} isHistorical=${choice.isHistorical ? "true" : "false"} nextSceneId=${choice.nextSceneId}`,
        )
        .join("\n")
    : "本幕不是 decision，不要返回 choices。";

  const systemPrompt = [
    "你在为历史互动网页生成一个单幕结构化场景节点。",
    "你只能输出严格 JSON，不得输出解释、markdown、代码块或页面布局。",
    "不要返回任何素材文件名、图片路径、CSS、镜头说明或组件结构。",
    "你生成的是《鸿门宴》事件中的一幕，第一视角固定为刘邦。",
    "场景语气要自然、紧张、易读，避免学术腔和过度古文。",
    "如果是 narration，请让 speaker 为空字符串。",
    "如果当前发言者就是刘邦本人，请优先把 showStandee 设为 false，保持第一视角沉浸感。",
    "如果是 decision，必须返回 3 个 choices，并严格使用给定的 choice id、label 和 nextSceneId。",
  ].join("\n");

  const userPrompt = [
    `事件：${eventItem.title}`,
    `事件简介：${eventItem.description}`,
    `当前固定视角：${viewpoint.name}`,
    `视角摘要：${viewpoint.summary}`,
    `当前要生成的 sceneId：${blueprint.sceneId}`,
    `当前幕类型：${blueprint.sceneType}`,
    `本幕戏剧目标：${blueprint.dramaticGoal}`,
    `推荐 backgroundTag：${blueprint.backgroundTag}`,
    `允许 speaker：${blueprint.allowedSpeakers.join(" / ") || "空字符串"}`,
    `建议 speaker：${blueprint.suggestedSpeaker || "空字符串"}`,
    `建议 showStandee：${blueprint.showStandee ? "true" : "false"}`,
    `建议 standeeKey：${blueprint.suggestedStandeeKey || "空字符串"}`,
    `本幕结束后的固定 nextSceneId：${blueprint.nextSceneId || "空字符串（如果本幕结束）"}`,
    `如果本幕为 decision，请严格使用这些 choices：\n${choiceRules}`,
    `可用 backgroundTag 只能从这些值中选择：${Object.keys(hongmenAiBackdropMap).join(", ")}`,
    "可用 standeeKey 只能从这些值中选择：xiangyu, fan-kuai, xiangbo, liubang, narration, decision, ending，或者空字符串。",
    `前序已生成历史：\n${buildHistorySummary(params.history)}`,
    "请只返回一个场景节点的 JSON 对象。",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
    blueprint,
  };
}

function getOpenAiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL ?? HONGMEN_AI_DEFAULT_MODEL,
  };
}

async function requestStructuredHongmenScene(
  params: HongmenAiSceneRequest,
): Promise<AiStructuredSceneNode> {
  const { apiKey, model } = getOpenAiConfig();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const { systemPrompt, userPrompt } = buildHongmenScenePrompt(params);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
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
              "stateUpdate",
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
              stateUpdate: {
                type: "object",
                additionalProperties: false,
                required: ["set"],
                properties: {
                  set: {
                    type: "object",
                    additionalProperties: {
                      type: ["string", "number", "boolean"],
                    },
                  },
                },
              },
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
                    "stateUpdate",
                  ],
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    outcome: { type: "string" },
                    isHistorical: { type: "boolean" },
                    nextSceneId: { type: "string" },
                    stateUpdate: {
                      type: "object",
                      additionalProperties: false,
                      required: ["set"],
                      properties: {
                        set: {
                          type: "object",
                          additionalProperties: {
                            type: ["string", "number", "boolean"],
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

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as unknown;
  const outputText = extractResponseText(payload);
  if (!outputText) {
    throw new Error("OpenAI returned empty structured output.");
  }

  return JSON.parse(outputText) as AiStructuredSceneNode;
}

function validateHongmenAiScene(scene: AiStructuredSceneNode) {
  const output: AiStructuredStoryOutput = {
    protocolVersion: "ai-scene-v1",
    initialSceneId: scene.sceneId,
    scenes: [scene],
  };

  return validateAiStructuredStoryOutput(output, {
    target: HONGMEN_AI_EVENT_ID,
    backgrounds: hongmenAiBackdropMap,
    speakerVisuals: getHongmenPlayableBase().speakerVisuals,
    allowForwardReferences: true,
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

function formatReportErrors(report: ReturnType<typeof validateHongmenAiScene>) {
  return [...report.errors, ...report.warnings]
    .map((issue) => issue.message)
    .join(" ");
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
  const blueprint = hongmenSceneBlueprints[params.requestedSceneId];
  if (
    params.eventId !== HONGMEN_AI_EVENT_ID ||
    params.viewpointId !== HONGMEN_AI_VIEWPOINT_ID ||
    !blueprint
  ) {
    return {
      ok: false,
      source: "fallback-local",
      scene: getHongmenFallbackScene(params.requestedSceneId || "arrival"),
      error: "当前只支持鸿门宴刘邦视角的 AI 剧情。",
    };
  }

  try {
    const generatedScene = await requestStructuredHongmenScene(params);
    if (generatedScene.sceneId !== params.requestedSceneId) {
      throw new Error("AI returned a sceneId that does not match the requested scene.");
    }

    const report = validateHongmenAiScene(generatedScene);
    if (!report.ok) {
      return {
        ok: false,
        source: "fallback-local",
        scene: getHongmenFallbackScene(params.requestedSceneId),
        warning: "AI 返回结构不合法，已切回本地剧情。",
        error: formatReportErrors(report),
      };
    }

    return {
      ok: true,
      source: "ai",
      scene: adaptHongmenAiScene(generatedScene),
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback-local",
      scene: getHongmenFallbackScene(params.requestedSceneId),
      warning: "AI 生成失败，已切回本地剧情。",
      error: error instanceof Error ? error.message : "Unknown AI error.",
    };
  }
}
