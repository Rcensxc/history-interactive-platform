import type {
  AiStructuredSceneChoice,
  AiStructuredSceneNode,
  AiStructuredSceneProtocolDefinition,
  AiStructuredStoryOutput,
  EventChoice,
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  EventSpeakerVisual,
  EventStateUpdate,
  EventViewpoint,
  PlaceholderAsset,
} from "@/types/content";//引入所有类型定义

export const aiStructuredSceneProtocol: AiStructuredSceneProtocolDefinition = {
  protocolVersion: "ai-scene-v1",
  supportedSceneTypes: ["narration", "dialogue", "decision"],
  requiredSceneFields: [
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
  supportedBehaviors: [
    "structured scene-by-scene narration, dialogue, and decision output",
    "background selection through semantic backgroundTag values",
    "standee visibility through showStandee and standeeKey",
    "single-scene state updates through lightweight key-value patches",
    "choice-based branching via nextSceneId",
  ],
  unsupportedBehaviors: [
    "returning page layout or component markup",
    "returning concrete asset file names",
    "multi-standee choreography in one scene node",
    "timed choices or animation directives",
    "freeform prose that requires the player to infer structure",
  ],
};//定义了AI结构化场景协议
type AdaptAiStructuredStoryParams = {
  eventId: string;
  output: AiStructuredStoryOutput;
  defaultBackdrop: PlaceholderAsset;
  backgrounds: Record<string, PlaceholderAsset>;
  viewpoints: EventViewpoint[];
  speakerVisuals: Record<string, EventSpeakerVisual>;
};

function normalizeStateUpdate(stateUpdate?: EventStateUpdate) {
  if (!stateUpdate?.set || Object.keys(stateUpdate.set).length === 0) {
    return undefined;
  }

  return stateUpdate;
}//规范化状态更新，如果没有有效的状态更新则返回undefined

function normalizeChoice(choice: AiStructuredSceneChoice): EventChoice {
  return {
    id: choice.id,
    label: choice.label,
    outcome: choice.outcome ?? "",
    isHistorical: choice.isHistorical,
    nextSceneId: choice.nextSceneId,
    stateUpdate: normalizeStateUpdate(choice.stateUpdate),
  };//规范化选择，将AI结构化场景选择转换为事件选择
}

function normalizeStandee(scene: AiStructuredSceneNode): EventSceneStandee {
  if (!scene.showStandee || !scene.standeeKey) {
    return {
      mode: "hidden",
      speakerId: scene.standeeKey,
      visualKey: scene.standeeKey,
    };
  }

  return {
    mode: "speaker",
    speakerId: scene.standeeKey,
    visualKey: scene.standeeKey,
    hideForViewpoint: true,
  };
}

function normalizeScene(
  scene: AiStructuredSceneNode,
  defaultBackdrop: PlaceholderAsset,
  backgrounds: Record<string, PlaceholderAsset>,
): EventScene {
  return {
    sceneId: scene.sceneId,
    type: scene.type,
    speaker: scene.speaker,
    speakerId: scene.standeeKey,
    text: scene.text,
    background: backgrounds[scene.backgroundTag] ?? defaultBackdrop,
    standee: normalizeStandee(scene),
    choices: scene.choices?.map(normalizeChoice),
    nextSceneId: scene.nextSceneId,
    stateUpdate: normalizeStateUpdate(scene.stateUpdate),
  };
}

export function adaptAiStructuredStoryToPlayableContent(
  params: AdaptAiStructuredStoryParams,
): EventPlayableContent {
  const scenes = params.output.scenes.map((scene) =>
    normalizeScene(scene, params.defaultBackdrop, params.backgrounds),
  );

  return {
    protocolVersion: "event-story-v1",
    contentSource: "ai-structured",
    eventId: params.eventId,
    initialSceneId: params.output.initialSceneId || scenes[0]?.sceneId || "",
    defaultBackdrop: params.defaultBackdrop,
    viewpoints: params.viewpoints,
    scenes,
    speakerVisuals: params.speakerVisuals,
  };
}
