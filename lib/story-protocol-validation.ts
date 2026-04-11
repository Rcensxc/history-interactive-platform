import { eventStoryPlayerCapabilities, resolveSceneBackground, resolveSceneStandee } from "@/lib/event-story-runtime";
import { aiStructuredSceneProtocol } from "@/lib/ai-scene-adapter";
import type {
  AiStructuredStoryOutput,
  EventPlayableContent,
  EventScene,
  EventSceneType,
  EventSpeakerVisual,
  PlaceholderAsset,
} from "@/types/content";

export type StoryProtocolIssue = {
  severity: "error" | "warning";
  protocol: "event-playable" | "ai-structured";
  target: string;
  sceneId?: string;
  message: string;
};

export type StoryProtocolReport = {
  ok: boolean;
  errors: StoryProtocolIssue[];
  warnings: StoryProtocolIssue[];
};

type AiStructuredValidationOptions = {
  target: string;
  backgrounds: Record<string, PlaceholderAsset>;
  speakerVisuals: Record<string, EventSpeakerVisual>;
  allowForwardReferences?: boolean;
};

const EVENT_SCENE_TYPES = new Set<EventSceneType>(
  eventStoryPlayerCapabilities.supportedSceneTypes,
);
const AI_SCENE_TYPES = new Set<EventSceneType>(
  aiStructuredSceneProtocol.supportedSceneTypes,
);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function createIssue(
  issue: StoryProtocolIssue,
  collector: StoryProtocolIssue[],
) {
  collector.push(issue);
}

function splitIssues(issues: StoryProtocolIssue[]): StoryProtocolReport {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function validateCommonNextSceneIds(
  params: {
    protocol: "event-playable" | "ai-structured";
    target: string;
    sceneId: string;
    nextSceneId?: string;
    knownSceneIds: Set<string>;
    allowForwardReferences?: boolean;
  },
  issues: StoryProtocolIssue[],
) {
  const { protocol, target, sceneId, nextSceneId, knownSceneIds } = params;

  if (nextSceneId && !knownSceneIds.has(nextSceneId)) {
    if (
      params.protocol === "ai-structured" &&
      "allowForwardReferences" in params &&
      params.allowForwardReferences
    ) {
      return;
    }

    createIssue(
      {
        severity: "error",
        protocol,
        target,
        sceneId,
        message: `nextSceneId 指向了不存在的场景：${nextSceneId}`,
      },
      issues,
    );
  }
}

export function validateEventPlayableContent(
  playableContent: EventPlayableContent,
): StoryProtocolReport {
  const issues: StoryProtocolIssue[] = [];
  const seenSceneIds = new Set<string>();

  if (!isNonEmptyString(playableContent.initialSceneId)) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        message: "initialSceneId 不能为空。",
      },
      issues,
    );
  }

  if (playableContent.viewpoints.length === 0) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        message: "至少需要一个可选第一视角。",
      },
      issues,
    );
  }

  if (!isNonEmptyString(playableContent.defaultBackdrop.label)) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        message: "defaultBackdrop.label 不能为空。",
      },
      issues,
    );
  }

  for (const scene of playableContent.scenes) {
    if (!isNonEmptyString(scene.sceneId)) {
      createIssue(
        {
          severity: "error",
          protocol: "event-playable",
          target: playableContent.eventId,
          message: "存在 sceneId 为空的场景。",
        },
        issues,
      );
      continue;
    }

    if (seenSceneIds.has(scene.sceneId)) {
      createIssue(
        {
          severity: "error",
          protocol: "event-playable",
          target: playableContent.eventId,
          sceneId: scene.sceneId,
          message: "sceneId 重复。",
        },
        issues,
      );
    }

    seenSceneIds.add(scene.sceneId);
  }

  if (playableContent.initialSceneId && !seenSceneIds.has(playableContent.initialSceneId)) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        message: `initialSceneId 指向了不存在的场景：${playableContent.initialSceneId}`,
      },
      issues,
    );
  }

  for (const scene of playableContent.scenes) {
    validateEventPlayableScene(playableContent, scene, seenSceneIds, issues);
  }

  return splitIssues(issues);
}

function validateEventPlayableScene(
  playableContent: EventPlayableContent,
  scene: EventScene,
  knownSceneIds: Set<string>,
  issues: StoryProtocolIssue[],
) {
  if (!EVENT_SCENE_TYPES.has(scene.type)) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        sceneId: scene.sceneId,
        message: `不支持的 scene.type：${String(scene.type)}`,
      },
      issues,
    );
  }

  if (!isNonEmptyString(scene.text)) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        sceneId: scene.sceneId,
        message: "text 不能为空。",
      },
      issues,
    );
  }

  if (scene.type === "dialogue" && !isNonEmptyString(scene.speaker)) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        sceneId: scene.sceneId,
        message: "dialogue 场景必须有 speaker。",
      },
      issues,
    );
  }

  if (scene.type === "decision" && (!scene.choices || scene.choices.length === 0)) {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        sceneId: scene.sceneId,
        message: "decision 场景必须包含 choices。",
      },
      issues,
    );
  }

  validateCommonNextSceneIds(
    {
      protocol: "event-playable",
      target: playableContent.eventId,
      sceneId: scene.sceneId,
      nextSceneId: scene.nextSceneId,
      knownSceneIds,
    },
    issues,
  );

  for (const choice of scene.choices ?? []) {
    if (!isNonEmptyString(choice.id)) {
      createIssue(
        {
          severity: "error",
          protocol: "event-playable",
          target: playableContent.eventId,
          sceneId: scene.sceneId,
          message: "存在 id 为空的 choice。",
        },
        issues,
      );
    }

    if (!isNonEmptyString(choice.label)) {
      createIssue(
        {
          severity: "error",
          protocol: "event-playable",
          target: playableContent.eventId,
          sceneId: scene.sceneId,
          message: `choice ${choice.id || "(unknown)"} 的 label 不能为空。`,
        },
        issues,
      );
    }

    validateCommonNextSceneIds(
      {
        protocol: "event-playable",
        target: playableContent.eventId,
        sceneId: scene.sceneId,
        nextSceneId: choice.nextSceneId,
        knownSceneIds,
      },
      issues,
    );
  }

  try {
    const background = resolveSceneBackground(playableContent, scene);
    if (!background || !isNonEmptyString(background.label)) {
      createIssue(
        {
          severity: "error",
          protocol: "event-playable",
          target: playableContent.eventId,
          sceneId: scene.sceneId,
          message: "background 无法正常解析为可用占位资源。",
        },
        issues,
      );
    }
  } catch {
    createIssue(
      {
        severity: "error",
        protocol: "event-playable",
        target: playableContent.eventId,
        sceneId: scene.sceneId,
        message: "background 解析失败。",
      },
      issues,
    );
  }

  if (scene.standee?.mode === "speaker") {
    if (!isNonEmptyString(scene.standee.speakerId) && !isNonEmptyString(scene.standee.visualKey)) {
      createIssue(
        {
          severity: "error",
          protocol: "event-playable",
          target: playableContent.eventId,
          sceneId: scene.sceneId,
          message: "standee.mode 为 speaker 时，需要至少提供 speakerId 或 visualKey。",
        },
        issues,
      );
    }

    if (
      scene.standee.visualKey &&
      !playableContent.speakerVisuals[scene.standee.visualKey]
    ) {
      createIssue(
        {
          severity: "warning",
          protocol: "event-playable",
          target: playableContent.eventId,
          sceneId: scene.sceneId,
          message: `standee.visualKey 未命中 speakerVisuals：${scene.standee.visualKey}，当前会回退到默认立绘。`,
        },
        issues,
      );
    }

    try {
      const viewpoint = playableContent.viewpoints[0];
      if (!viewpoint) {
        throw new Error("missing-viewpoint");
      }

      resolveSceneStandee({
        scene,
        selectedViewpoint: viewpoint,
        speakerVisuals: playableContent.speakerVisuals,
      });
    } catch {
      createIssue(
        {
          severity: "error",
          protocol: "event-playable",
          target: playableContent.eventId,
          sceneId: scene.sceneId,
          message: "standee 无法正常解析。",
        },
        issues,
      );
    }
  }
}

export function validateAiStructuredStoryOutput(
  output: AiStructuredStoryOutput,
  options: AiStructuredValidationOptions,
): StoryProtocolReport {
  const issues: StoryProtocolIssue[] = [];
  const seenSceneIds = new Set<string>();

  if (output.protocolVersion !== aiStructuredSceneProtocol.protocolVersion) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        message: `protocolVersion 不匹配：${output.protocolVersion}`,
      },
      issues,
    );
  }

  if (!isNonEmptyString(output.initialSceneId)) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        message: "initialSceneId 不能为空。",
      },
      issues,
    );
  }

  for (const scene of output.scenes) {
    if (!isNonEmptyString(scene.sceneId)) {
      createIssue(
        {
          severity: "error",
          protocol: "ai-structured",
          target: options.target,
          message: "存在 sceneId 为空的 AI 场景。",
        },
        issues,
      );
      continue;
    }

    if (seenSceneIds.has(scene.sceneId)) {
      createIssue(
        {
          severity: "error",
          protocol: "ai-structured",
          target: options.target,
          sceneId: scene.sceneId,
          message: "sceneId 重复。",
        },
        issues,
      );
    }

    seenSceneIds.add(scene.sceneId);
  }

  if (output.initialSceneId && !seenSceneIds.has(output.initialSceneId)) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        message: `initialSceneId 指向了不存在的场景：${output.initialSceneId}`,
      },
      issues,
    );
  }

  for (const scene of output.scenes) {
    validateAiStructuredScene(scene, seenSceneIds, options, issues);
  }

  return splitIssues(issues);
}

function validateAiStructuredScene(
  scene: AiStructuredStoryOutput["scenes"][number],
  knownSceneIds: Set<string>,
  options: AiStructuredValidationOptions,
  issues: StoryProtocolIssue[],
) {
  if (!AI_SCENE_TYPES.has(scene.type)) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        message: `不支持的 scene.type：${String(scene.type)}`,
      },
      issues,
    );
  }

  if (!isNonEmptyString(scene.text)) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        message: "text 不能为空。",
      },
      issues,
    );
  }

  if (scene.type !== "narration" && !isNonEmptyString(scene.speaker)) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        message: `${scene.type} 场景必须有 speaker。`,
      },
      issues,
    );
  }

  if (!isNonEmptyString(scene.backgroundTag)) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        message: "backgroundTag 不能为空。",
      },
      issues,
    );
  } else if (!options.backgrounds[scene.backgroundTag]) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        message: `backgroundTag 未命中本地背景映射：${scene.backgroundTag}`,
      },
      issues,
    );
  }

  if (scene.type === "decision" && (!scene.choices || scene.choices.length === 0)) {
    createIssue(
      {
        severity: "error",
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        message: "decision 场景必须包含 choices。",
      },
      issues,
    );
  }

  if (scene.showStandee) {
    const standeeKey = scene.standeeKey;

    if (!isNonEmptyString(standeeKey)) {
      createIssue(
        {
          severity: "error",
          protocol: "ai-structured",
          target: options.target,
          sceneId: scene.sceneId,
          message: "showStandee 为 true 时，standeeKey 不能为空。",
        },
        issues,
      );
    } else if (!options.speakerVisuals[standeeKey]) {
      createIssue(
        {
          severity: "error",
          protocol: "ai-structured",
          target: options.target,
          sceneId: scene.sceneId,
          message: `standeeKey 未命中本地立绘映射：${standeeKey}`,
        },
        issues,
      );
    }
  } else if (scene.standeeKey) {
    createIssue(
      {
        severity: "warning",
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        message: "showStandee 为 false，但仍然提供了 standeeKey；当前会忽略它。",
      },
      issues,
    );
  }

  validateCommonNextSceneIds(
    {
      protocol: "ai-structured",
      target: options.target,
      sceneId: scene.sceneId,
      nextSceneId: scene.nextSceneId,
      knownSceneIds,
      allowForwardReferences: options.allowForwardReferences,
    },
    issues,
  );

  for (const choice of scene.choices ?? []) {
    if (!isNonEmptyString(choice.id)) {
      createIssue(
        {
          severity: "error",
          protocol: "ai-structured",
          target: options.target,
          sceneId: scene.sceneId,
          message: "存在 id 为空的 AI choice。",
        },
        issues,
      );
    }

    if (!isNonEmptyString(choice.label)) {
      createIssue(
        {
          severity: "error",
          protocol: "ai-structured",
          target: options.target,
          sceneId: scene.sceneId,
          message: `AI choice ${choice.id || "(unknown)"} 的 label 不能为空。`,
        },
        issues,
      );
    }

    validateCommonNextSceneIds(
      {
        protocol: "ai-structured",
        target: options.target,
        sceneId: scene.sceneId,
        nextSceneId: choice.nextSceneId,
        knownSceneIds,
        allowForwardReferences: options.allowForwardReferences,
      },
      issues,
    );
  }
}
