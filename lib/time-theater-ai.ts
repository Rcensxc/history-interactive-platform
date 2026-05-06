import { historicalFigures } from "@/data/history-registry";
import { timeTheaterTopics } from "@/data/time-theater";
import type {
  HistoricalFigure,
  TimeTheaterAiScriptPackage,
  TimeTheaterTopic,
} from "@/types/content";

const TIME_THEATER_AI_DEFAULT_MODEL = "Qwen3FLash";
const TIME_THEATER_AI_PROTOCOL_VERSION = "time-theater-linear-v1" as const;

type TimeTheaterAiDebugInfo = {
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
    serviceTotalMs?: number;
    routePayloadParsedMs?: number;
    routeTotalMs?: number;
  };
  metrics: {
    systemPromptLength: number;
    userPromptLength: number;
    upstreamOutputLength: number;
    lineCount?: number;
    characterCount?: number;
    triggerSource?: string;
  };
  upstreamStatus?: number;
  upstreamStatusText?: string;
  upstreamBody?: string;
};

export type TimeTheaterAiScriptRequest = {
  characterIds: string[];
  viewpointId: string;
  topicId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
};

export type TimeTheaterAiScriptResponse = {
  ok: boolean;
  scriptPackage: TimeTheaterAiScriptPackage;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: TimeTheaterAiDebugInfo;
};

type TimeTheaterAiValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

function createRequestId() {
  return `time-theater-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeSpeakerToken(value: string) {
  return value.replace(/[\s·•・，。、；：“”"'（）()【】\-_]/g, "").toLowerCase();
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: TimeTheaterAiDebugInfo["apiKeySource"] = openRouterApiKey
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
      TIME_THEATER_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createDebugInfo(
  config: ReturnType<typeof getAiConfig>,
): TimeTheaterAiDebugInfo {
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
      systemPromptLength: 0,
      userPromptLength: 0,
      upstreamOutputLength: 0,
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

function getEligibleCast(characterIds: string[]) {
  return historicalFigures.filter(
    (figure) => figure.canJoinTimeTheater && characterIds.includes(figure.id),
  );
}

function getTopic(topicId: string) {
  return timeTheaterTopics.find((topic) => topic.id === topicId) ?? null;
}

function createFallbackScriptPackage(params: {
  characterIds: string[];
  viewpointId: string;
  topic: TimeTheaterTopic;
}): TimeTheaterAiScriptPackage {
  const { characterIds, viewpointId, topic } = params;
  const cast = getEligibleCast(characterIds);
  const viewpoint =
    cast.find((figure) => figure.id === viewpointId) ?? cast[0] ?? null;

  return {
    protocolVersion: TIME_THEATER_AI_PROTOCOL_VERSION,
    topicId: topic.id,
    viewpointId,
    characters: characterIds,
    lines: [
      {
        type: "narration",
        speakerId: "",
        text: topic.opening,
      },
      ...cast.flatMap((figure, index) => {
        const nextFigure = cast[(index + 1) % cast.length];
        return [
          {
            type: "dialogue" as const,
            speakerId: figure.id,
            text:
              index === 0
                ? `若把“${topic.title}”摆到我面前，我不会先急着亮态度，我会先看清局面里最先要稳住的究竟是什么。`
                : `若轮到我先表态，我会从${figure.role}的角度回答这个题，因为真正难的从来不是说得漂亮，而是判断能不能落下去。`,
          },
          {
            type: "dialogue" as const,
            speakerId: nextFigure.id,
            text: `你这话说得稳，可若只停在“先稳住”上，还是太空了。真到局面发紧的时候，谁来担那一步，才是讨论的分水岭。`,
          },
        ];
      }),
      {
        type: "narration",
        speakerId: "",
        text:
          viewpoint
            ? `${viewpoint.name}听到这里，已经能感觉到席间的气氛和一开始不同了。众人说的还是同一个主题，可真正碰撞的地方，已经慢慢落在“谁来承担”与“先做什么”上。`
            : "讨论走到这里，气氛已经不再只是轮流发言。众人说的是同一个主题，真正碰撞的却是判断背后的取舍与承担。",
      },
      {
        type: "dialogue",
        speakerId: viewpoint?.id ?? cast[0]?.id ?? "",
        text:
          "听到这里，我更在意的已经不是谁的话更好听，而是谁的判断真能在最难的时候先落到地上。",
      },
      {
        type: "narration",
        speakerId: "",
        text:
          viewpoint
            ? `${viewpoint.name}重新看向同席的人物，发现这场讨论留下来的并不是整齐答案，而是每个人面对同一主题时，真正看重的先后与分量。`
            : "这场跨时空讨论并没有得出唯一答案，但不同人物的判断方式，已经把主题的层次慢慢推开了。",
      },
    ],
  };
}

function serializeCharacters(characters: HistoricalFigure[]) {
  return characters
    .map(
      (figure) =>
        `- id=${figure.id} | name=${figure.name} | dynasty=${figure.dynasty} | role=${figure.role} | keywords=${figure.keywords.join("、")} | signatureEvent=${figure.signatureEvent} | introduction=${figure.introduction}`,
    )
    .join("\n");
}

function buildPrompt(params: {
  characterIds: string[];
  viewpointId: string;
  topic: TimeTheaterTopic;
  cast: HistoricalFigure[];
  viewpoint: HistoricalFigure;
  triggerSource?: string;
}) {
  const { characterIds, viewpointId, topic, cast, viewpoint, triggerSource } = params;

  const systemPrompt = [
    "You generate one linear script package for a Chinese cross-time historical discussion theater.",
    "Output only strict JSON that follows the provided schema.",
    "Write all text in Simplified Chinese.",
    "Do not output backgroundTag, standeeKey, nextSceneId, choices, page layout, UI, CSS, file paths, or asset filenames.",
    "The stage, background, progression, and visual rules are all controlled locally by the program.",
    "This is not a branching story. It is one stable, linear mini theater discussion.",
    "Any valid selected characters may appear together, regardless of dynasty. Do not assume a preset recommended combination.",
    "The result must feel like a small live discussion scene, not a list of viewpoints or a recap article.",
    "Narration rules:",
    "- narration uses type=narration and speakerId is an empty string.",
    "- narration means the chosen first-person viewpoint character observing the stage, feeling the atmosphere, or forming a judgment.",
    "- narration should stay short but complete, usually around 30 to 80 Chinese characters.",
    "- no quoted dialogue inside narration.",
    "Dialogue rules:",
    "- dialogue uses type=dialogue and exactly one speakerId from the selected characters.",
    "- each dialogue line should sound like one complete spoken sentence or two short linked clauses.",
    "- dialogue should usually stay around 18 to 55 Chinese characters.",
    "- no narration, no stage directions, no multiple speakers inside one line.",
    "Discussion rhythm rules:",
    "- opening: the chosen viewpoint observes the cast and atmosphere.",
    "- first round: each selected character gives an initial stance on the topic.",
    "- response round: at least 2 to 3 later lines must clearly respond to, question, correct, supplement, or rebut what another character just said.",
    "- collision round: let at least one real disagreement or追问 happen so the discussion moves, instead of everyone just stating positions.",
    "- ending: the chosen viewpoint forms one closing feeling or judgment about how the discussion changed.",
    "- major characters should usually speak at least twice if the full script length allows it.",
    "- keep the full script around 14 to 22 lines.",
    "Voice rules:",
    "- different characters should not all sound like short abstract opinion sentences.",
    "- let them differ in thinking style, pacing, and wording preference.",
    "- keep the language readable for general users, not too academic and not too archaic.",
  ].join("\n");

  const userPrompt = [
    `Topic id: ${topic.id}`,
    `Topic title: ${topic.title}`,
    `Topic description: ${topic.description}`,
    `Required protocolVersion: ${TIME_THEATER_AI_PROTOCOL_VERSION}`,
    `Required viewpointId: ${viewpointId}`,
    `Required characters: ${characterIds.join(", ")}`,
    `First-person viewpoint: ${viewpoint.name}`,
    `Selected cast:\n${serializeCharacters(cast)}`,
    `Trigger source: ${triggerSource ?? "initial"}`,
    "Build the discussion only from the currently selected characters, current viewpoint, and current topic.",
    "Let the characters answer each other, not just the topic itself.",
    "At least some later dialogue lines should clearly pick up another person's point and push back, question it, or extend it.",
    "The chosen viewpoint should matter not only in narration, but also in how the scene is read and concluded.",
    "Return characters using the exact selected ids in the characters array.",
    "For each dialogue line, speakerId must be one of the selected character ids.",
    "For each narration line, speakerId must be an empty string.",
    "Do not omit any selected character from the discussion.",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestScriptPackage(params: {
  request: TimeTheaterAiScriptRequest;
  cast: HistoricalFigure[];
  topic: TimeTheaterTopic;
  viewpoint: HistoricalFigure;
  requestId: string;
}): Promise<{
  scriptPackage: TimeTheaterAiScriptPackage;
  debug: TimeTheaterAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createDebugInfo(config);

  if (!apiKey) {
    throw new Error(
      "APIkey丢失，设置API_KEY并重启开发服务器。",
    );
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildPrompt({
    characterIds: params.request.characterIds,
    viewpointId: params.request.viewpointId,
    topic: params.topic,
    cast: params.cast,
    viewpoint: params.viewpoint,
    triggerSource: params.request.triggerSource,
  });
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.characterCount = params.request.characterIds.length;
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
          name: "time_theater_linear_script",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "protocolVersion",
              "topicId",
              "viewpointId",
              "characters",
              "lines",
            ],
            properties: {
              protocolVersion: {
                type: "string",
                enum: [TIME_THEATER_AI_PROTOCOL_VERSION],
              },
              topicId: { type: "string" },
              viewpointId: { type: "string" },
              characters: {
                type: "array",
                minItems: params.request.characterIds.length,
                maxItems: params.request.characterIds.length,
                items: {
                  type: "string",
                  enum: params.request.characterIds,
                },
              },
              lines: {
                type: "array",
                minItems: 8,
                maxItems: 18,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["type", "speakerId", "text"],
                  properties: {
                    type: {
                      type: "string",
                      enum: ["narration", "dialogue"],
                    },
                    speakerId: { type: "string" },
                    text: { type: "string" },
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
    throw new Error("AI返回的是空结构化结果");
  }
  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number((performance.now() - extractStart).toFixed(1));

  return {
    scriptPackage: JSON.parse(outputText) as TimeTheaterAiScriptPackage,
    debug,
  };
}

function normalizePackage(
  scriptPackage: TimeTheaterAiScriptPackage,
): TimeTheaterAiScriptPackage {
  const knownAliases = new Map<string, string>();
  const selectedCast = historicalFigures.filter((figure) =>
    scriptPackage.characters.includes(figure.id),
  );

  selectedCast.forEach((figure) => {
    knownAliases.set(figure.id, figure.id);
    knownAliases.set(normalizeSpeakerToken(figure.id), figure.id);
    knownAliases.set(normalizeSpeakerToken(figure.name), figure.id);
  });

  return {
    protocolVersion: scriptPackage.protocolVersion,
    topicId: scriptPackage.topicId.trim(),
    viewpointId: scriptPackage.viewpointId.trim(),
    characters: scriptPackage.characters.map((item) => item.trim()),
    lines: scriptPackage.lines.map((line) => ({
      type: line.type,
      speakerId:
        line.type === "narration"
          ? ""
          : knownAliases.get(line.speakerId.trim()) ??
            knownAliases.get(normalizeSpeakerToken(line.speakerId.trim())) ??
            line.speakerId.trim(),
      text: normalizeText(line.text),
    })),
  };
}

function validatePackage(params: {
  scriptPackage: TimeTheaterAiScriptPackage;
  request: TimeTheaterAiScriptRequest;
  cast: HistoricalFigure[];
}): TimeTheaterAiValidationResult {
  const { scriptPackage, request, cast } = params;
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;
  const responsePattern =
    /(你刚才|你说得|你这话|照你这意思|若照你这么说|可若|但若|可你忽略了|我倒想追问|我不同意|我更在意|你只看到|你说得对|我同意你刚才|接着你这句|正因为你这么说)/;

  if (scriptPackage.protocolVersion !== TIME_THEATER_AI_PROTOCOL_VERSION) {
    errors.push(`protocolVersion 必须是 ${TIME_THEATER_AI_PROTOCOL_VERSION}。`);
  }
  if (scriptPackage.topicId !== request.topicId) {
    errors.push(`topicId 必须是 ${request.topicId}。`);
  }
  if (scriptPackage.viewpointId !== request.viewpointId) {
    errors.push(`viewpointId 必须是 ${request.viewpointId}。`);
  }

  const normalizedCharacters = [...scriptPackage.characters].sort().join("|");
  const requestedCharacters = [...request.characterIds].sort().join("|");
  if (normalizedCharacters !== requestedCharacters) {
    errors.push("characters 必须与当前选择的人物完全一致。");
  }

  if (scriptPackage.lines.length < 10 || scriptPackage.lines.length > 24) {
    errors.push("lines 数量需要控制在 10 到 24 条之间。");
  }

  if (scriptPackage.lines[0]?.type !== "narration") {
    errors.push("第一条 line 必须是 narration。");
  }
  if (scriptPackage.lines[scriptPackage.lines.length - 1]?.type !== "narration") {
    errors.push("最后一条 line 必须是 narration。");
  }

  scriptPackage.lines.forEach((line, index) => {
    if (!line.text) {
      errors.push(`第 ${index + 1} 条 line 的 text 不能为空。`);
      return;
    }

    if (line.type === "narration") {
      if (line.speakerId.trim().length > 0) {
        errors.push(`第 ${index + 1} 条 narration 的 speakerId 必须为空。`);
      }
      if (quotePattern.test(line.text)) {
        warnings.push(`第 ${index + 1} 条 narration 出现了引号对白。`);
      }
      if (line.text.length > 100) {
        warnings.push(`第 ${index + 1} 条 narration 偏长。`);
      }
      if (line.text.length < 18) {
        warnings.push(`第 ${index + 1} 条 narration 偏短。`);
      }
      return;
    }

    if (!request.characterIds.includes(line.speakerId)) {
      errors.push(`第 ${index + 1} 条 dialogue 的 speakerId 必须来自已选人物。`);
    }
    if (line.text.includes("\n")) {
      warnings.push(`第 ${index + 1} 条 dialogue 不应换行。`);
    }
    if (line.text.length > 60) {
      warnings.push(`第 ${index + 1} 条 dialogue 偏长。`);
    }
    if (line.text.length < 10) {
      warnings.push(`第 ${index + 1} 条 dialogue 偏短。`);
    }
  });

  cast.forEach((figure) => {
    const dialogueCount = scriptPackage.lines.filter(
      (line) => line.type === "dialogue" && line.speakerId === figure.id,
    ).length;
    if (dialogueCount === 0) {
      warnings.push(`${figure.name} 当前没有明确 dialogue。`);
    } else if (dialogueCount < 2) {
      warnings.push(`${figure.name} 当前只有一条 dialogue。`);
    }
  });

  const dialogueLines = scriptPackage.lines.filter((line) => line.type === "dialogue");
  const narrationLines = scriptPackage.lines.filter((line) => line.type === "narration");
  if (dialogueLines.length < 10) {
    warnings.push("调试信息：当前剧本总量偏少");
  }
  if (narrationLines.length > 4) {
    warnings.push("调试信息：当前旁白偏多");
  }

  const responseLikeCount = dialogueLines.filter((line) =>
    responsePattern.test(line.text),
  ).length;
  if (responseLikeCount < 2) {
    warnings.push("调试信息：当前脚本里角色之间的明确回应与讨论偏少");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatValidation(result: TimeTheaterAiValidationResult) {
  return [...result.errors, ...result.warnings].join(" ");
}

export function createTimeTheaterFallbackPackage(params: {
  characterIds: string[];
  viewpointId: string;
  topicId: string;
}) {
  const topic = getTopic(params.topicId) ?? timeTheaterTopics[0];
  return createFallbackScriptPackage({
    characterIds: params.characterIds,
    viewpointId: params.viewpointId,
    topic,
  });
}

export async function generateTimeTheaterAiScriptPackage(
  request: TimeTheaterAiScriptRequest,
): Promise<TimeTheaterAiScriptResponse> {
  const serviceStart = performance.now();
  const cast = getEligibleCast(request.characterIds);
  const viewpoint = cast.find((figure) => figure.id === request.viewpointId) ?? null;
  const topic = getTopic(request.topicId);

  const fallbackPackage = createTimeTheaterFallbackPackage({
    characterIds: request.characterIds,
    viewpointId: request.viewpointId,
    topicId: request.topicId,
  });

  if (
    request.characterIds.length < 2 ||
    request.characterIds.length > 3 ||
    cast.length !== request.characterIds.length ||
    !viewpoint ||
    !topic
  ) {
    return {
      ok: false,
      source: "fallback-local",
      scriptPackage: fallbackPackage,
      error: "当前跨时空剧场只支持 2 到 3 位已收录人物、一个有效主题和一个有效第一视角。",
    };
  }

  try {
    const requestId = request.clientRequestId?.trim() || createRequestId();
    const { scriptPackage, debug } = await requestScriptPackage({
      request,
      cast,
      topic,
      viewpoint,
      requestId,
    });

    const normalized = normalizePackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validatePackage({
      scriptPackage: normalized,
      request,
      cast,
    });
    debug.timings.validationMs = Number((performance.now() - validationStart).toFixed(1));
    debug.metrics.lineCount = normalized.lines.length;

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));
      return {
        ok: false,
        source: "fallback-local",
        scriptPackage: fallbackPackage,
        warning: "AI 讨论脚本结构不合法，已切回本地预设试玩内容。",
        error: formatValidation(validation),
        debug,
      };
    }

    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    return {
      ok: true,
      source: "ai",
      scriptPackage: normalized,
      warning:
        validation.warnings.length > 0
          ? formatValidation({
              ok: true,
              errors: [],
              warnings: validation.warnings,
            })
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createDebugInfo(getAiConfig());
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(errorMessage);
    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number((performance.now() - serviceStart).toFixed(1));

    console.error("[time-theater-ai] script package request failed", {
      ...debug,
      error: errorMessage,
    });

    return {
      ok: false,
      source: "fallback-local",
      scriptPackage: fallbackPackage,
      warning: "AI 讨论脚本生成失败，已切回本地预设试玩内容。",
      error: errorMessage,
      debug,
    };
  }
}
