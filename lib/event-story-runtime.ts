import type {
  AiStructuredStoryOutput,
  EventChoice,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  EventStateUpdate,
  EventSceneType,
  EventSpeakerVisual,
  EventStoryPlayerCapabilities,
  EventViewpoint,
  PlaceholderAsset,
} from "@/types/content";
import { adaptAiStructuredStoryToPlayableContent } from "@/lib/ai-scene-adapter";
import { getCharacterStandeeImage } from "@/data/character-asset-manifest";

export const eventStoryPlayerCapabilities: EventStoryPlayerCapabilities = {
  protocolVersion: "event-story-v1",
  supportedSceneTypes: ["narration", "dialogue", "decision"],
  supportedBehaviors: [
    "single-active-scene-rendering",
    "click-to-advance narration and dialogue",
    "structured branching via nextSceneId",
    "structured decision choices with per-choice nextSceneId",
    "per-scene background metadata",
    "per-scene standee visibility and first-person hiding rules",
    "speaker name display that hides during narration",
  ],
  unsupportedBehaviors: [
    "freeform text parsing in the player",
    "timed choices",
    "multiple standees on screen at once",
    "variable state or inventory systems",
    "save slots or persistent branch history",
    "animation, audio, or camera directives in scene data",
    "AI-generated raw prose without structured scene nodes",
  ],
};//定义了事件故事播放器的能力

type LegacyEventSceneInput = {
  id: string;
  type: EventSceneType;
  speaker: string;
  speakerId?: string;
  text: string;
  note?: string;
  background?: PlaceholderAsset;
  visualKey?: string;
  choices?: EventChoice[];
  nextSceneId?: string;
  stateUpdate?: EventStateUpdate;
};//定义了传统事件场景输入的类型

type BaseEventPlayableContentInput = Omit<
  EventPlayableContent,
  "protocolVersion" | "contentSource" | "scenes"
>;

type LocalEventPlayableContentInput = BaseEventPlayableContentInput & {
  scenes: LegacyEventSceneInput[];
  aiOutput?: never;
  backgrounds?: never;
};

type AiEventPlayableContentInput = BaseEventPlayableContentInput & {
  scenes?: LegacyEventSceneInput[];
  aiOutput: AiStructuredStoryOutput;
  backgrounds: Record<string, PlaceholderAsset>;
};

type EventPlayableContentInput =
  | LocalEventPlayableContentInput
  | AiEventPlayableContentInput;

function normalizeSceneStandee(scene: LegacyEventSceneInput): EventSceneStandee {
  if (scene.type !== "dialogue") {
    return {
      mode: "hidden",
      speakerId: scene.speakerId,
      visualKey: scene.visualKey,
    };
  }

  return {
    mode: "speaker",
    speakerId: scene.speakerId,
    visualKey: scene.visualKey ?? scene.speakerId,
    hideForViewpoint: true,
  };
}

function normalizeEventScene(
  scene: LegacyEventSceneInput,
  defaultBackdrop: PlaceholderAsset,
): EventScene {
  return {
    sceneId: scene.id,
    type: scene.type,
    speaker: scene.speaker,
    speakerId: scene.speakerId,
    text: scene.text,
    note: scene.note,
    background: scene.background ?? defaultBackdrop,
    standee: normalizeSceneStandee(scene),
    choices: scene.choices,
    nextSceneId: scene.nextSceneId,
    stateUpdate: scene.stateUpdate,
  };
}//将传统事件场景输入规范化为事件场景

export function createEventPlayableContent(
  input: EventPlayableContentInput,
): EventPlayableContent {
  if ("aiOutput" in input && input.aiOutput) {
    return adaptAiStructuredStoryToPlayableContent({
      eventId: input.eventId,
      output: input.aiOutput,
      defaultBackdrop: input.defaultBackdrop,
      backgrounds: input.backgrounds,
      viewpoints: input.viewpoints,
      speakerVisuals: input.speakerVisuals,
    });
  }

  return {
    protocolVersion: "event-story-v1",
    contentSource: "local-scripted",
    eventId: input.eventId,
    initialSceneId: input.initialSceneId,
    defaultBackdrop: input.defaultBackdrop,
    viewpoints: input.viewpoints,
    speakerVisuals: input.speakerVisuals,
    scenes: input.scenes.map((scene) =>
      normalizeEventScene(scene, input.defaultBackdrop),
    ),
  };
}

export function createEventSceneMap(scenes: EventScene[]) {
  return Object.fromEntries(
    scenes.map((scene) => [scene.sceneId, scene]),
  ) as Record<string, EventScene>;
}//创建一个事件场景映射表，方便通过场景ID快速访问场景数据

export function resolveSceneBackground(
  playableContent: EventPlayableContent,
  scene: EventScene,
): PlaceholderAsset {
  return scene.background ?? playableContent.defaultBackdrop;
}//解析场景背景，如果场景没有指定背景则使用可播放内容的默认背景

export function resolveSceneStandee(params: {
  scene: EventScene;
  selectedViewpoint: EventViewpoint;
  speakerVisuals: Record<string, EventSpeakerVisual>;
}) {
  const { scene, selectedViewpoint, speakerVisuals } = params;
  const standee = scene.standee;

  if (!standee || standee.mode === "hidden") {
    return null;
  }

  const standeeSpeakerId = standee.speakerId ?? scene.speakerId;
  if (standee.hideForViewpoint && standeeSpeakerId === selectedViewpoint.id) {
    return null;
  }

  const visualKey = standee.visualKey ?? standeeSpeakerId ?? scene.speaker;
  const visual =
    speakerVisuals[visualKey] ?? {
      label: selectedViewpoint.portraitLabel,
      tone: selectedViewpoint.portraitTone,
      subtitle: selectedViewpoint.title,
      alignment: "center" as const,
    };

  // Temporary roles may speak, but should not be promoted into stage standees
  // unless they have a real shared standee asset or an explicit image mapping.
  if (!visual.image && !getCharacterStandeeImage(visualKey)) {
    return null;
  }

  return {
    visualKey,
    visual,
  };
}

export function shouldShowSpeakerName(scene: EventScene) {
  return scene.type !== "narration" && scene.speaker.trim().length > 0;
}

export function resolveSceneNextId(
  scene: EventScene,
  currentChoice?: EventChoice,
) {
  return currentChoice?.nextSceneId ?? scene.nextSceneId ?? null;
}

export function canContinueScene(scene: EventScene, currentChoice?: EventChoice) {
  return scene.type !== "decision" || !!currentChoice;
}
