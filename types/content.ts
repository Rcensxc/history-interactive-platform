export type Tone = "amber" | "jade" | "ink" | "crimson" | "bronze";

export type PlaceholderAsset = {
  label: string;
  tone: Tone;
  description?: string;
  subtitle?: string;
  image?: string;
  backgroundKey?: string;
  alignment?: "left" | "center" | "right";
};

export type NavigationItem = {
  href: string;
  label: string;
  summary: string;
};

export type HomeEntry = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  highlight: string;
  tone: Tone;
};

export type HistoricalFigure = {
  id: string;
  name: string;
  title: string;
  dynasty: string;
  role: string;
  introduction: string;
  signatureEvent: string;
  keywords: string[];
  portraitLabel: string;
  portraitTone: Tone;
  experienceOptions: FigureExperienceOption[];
  relatedEventIds?: string[];
  canJoinTimeTheater?: boolean;
  image?: string;
};

export type EventStatus = "playable" | "coming-soon" | "planned";

export type HistoricalEvent = {
  id: string;
  title: string;
  era: string;
  category: string;
  summary: string;
  status: EventStatus;
  statusLabel: string;
  description: string;
  backdropLabel: string;
  backdropDescription: string;
  availableViewpointIds: string[];
  recommendedViewpointIds?: string[];
  hasPlayableStory?: boolean;
  backdropTone?: Tone;
};

export type FigureEventRelation = {
  id: string;
  figureId: string;
  eventId?: string;
  eventTitle: string;
  summary: string;
  canBeViewpoint: boolean;
  isRecommendedViewpoint: boolean;
};

export type FigureExperienceKind = "event" | "time-theater";
export type FigureExperienceStatus =
  | "playable"
  | "candidate"
  | "coming-soon";

export type FigureExperienceOption = {
  id: string;
  kind?: FigureExperienceKind;
  title: string;
  description: string;
  note?: string;
  status?: FigureExperienceStatus;
  statusLabel?: string;
  ctaLabel: string;
  href?: string;
};

export type EventViewpoint = {
  id: string;
  figureId?: string;
  name: string;
  title: string;
  summary: string;
  perspective: string;
  pressure: string;
  portraitLabel: string;
  portraitTone: Tone;
  isRecommended?: boolean;
  isPlayable?: boolean;
  availabilityLabel?: string;
  availabilityNote?: string;
};

export type EventStateValue = string | number | boolean;

export type EventStateUpdate = {
  set?: Record<string, EventStateValue>;
};

export type EventChoice = {
  id: string;
  label: string;
  outcome: string;
  isHistorical?: boolean;
  nextSceneId?: string;
  stateUpdate?: EventStateUpdate;
};

export type EventSceneType = "narration" | "dialogue" | "decision";

export type EventSceneStandee = {
  mode: "hidden" | "speaker";
  speakerId?: string;
  visualKey?: string;
  hideForViewpoint?: boolean;
};

export type EventScene = {
  sceneId: string;
  type: EventSceneType;
  speaker: string;
  speakerId?: string;
  text: string;
  note?: string;
  background?: PlaceholderAsset;
  standee?: EventSceneStandee;
  choices?: EventChoice[];
  nextSceneId?: string;
  stateUpdate?: EventStateUpdate;
};

export type EventSpeakerVisual = {
  label: string;
  tone: Tone;
  subtitle: string;
  alignment: "left" | "center" | "right";
  image?: string;
};

export type EventStoryProtocolVersion = "event-story-v1";
export type EventPlayableContentSource = "local-scripted" | "ai-structured";

export type EventPlayableContent = {
  protocolVersion: EventStoryProtocolVersion;
  contentSource: EventPlayableContentSource;
  eventId: string;
  initialSceneId: string;
  defaultBackdrop: PlaceholderAsset;
  viewpoints: EventViewpoint[];
  scenes: EventScene[];
  speakerVisuals: Record<string, EventSpeakerVisual>;
};

export type EventStoryPlayerCapabilities = {
  protocolVersion: EventStoryProtocolVersion;
  supportedSceneTypes: EventSceneType[];
  supportedBehaviors: string[];
  unsupportedBehaviors: string[];
};

export type EventPreparationData = {
  event: HistoricalEvent;
  viewpoints: EventViewpoint[];
  recommendedViewpointIds: string[];
  hasPlayableStory: boolean;
};

export type AiStructuredSceneChoice = {
  id: string;
  label: string;
  outcome?: string;
  isHistorical?: boolean;
  nextSceneId?: string;
  stateUpdate?: EventStateUpdate;
};

export type AiStructuredSceneNode = {
  sceneId: string;
  type: EventSceneType;
  speaker: string;
  text: string;
  backgroundTag: string;
  showStandee: boolean;
  standeeKey?: string;
  choices?: AiStructuredSceneChoice[];
  nextSceneId?: string;
  stateUpdate?: EventStateUpdate;
};

export type AiStructuredStoryProtocolVersion = "ai-scene-v1";

export type AiStructuredStoryOutput = {
  protocolVersion: AiStructuredStoryProtocolVersion;
  initialSceneId: string;
  scenes: AiStructuredSceneNode[];
};

export type AiStructuredStoryPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: AiStructuredStoryProtocolVersion;
  viewpointId: string;
  initialSceneId: string;
  scenes: AiStructuredSceneNode[];
};

export type HongmenAiScriptProtocolVersion = "hongmen-linear-script-v1";

export type HongmenAiScriptLine = {
  speaker: string;
  text: string;
};

export type HongmenAiScriptBeat = {
  beatId: string;
  lines: HongmenAiScriptLine[];
};

export type HongmenAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: HongmenAiScriptProtocolVersion;
  viewpointId: string;
  beats: HongmenAiScriptBeat[];
};

export type RedCliffsAiScriptProtocolVersion = "red-cliffs-linear-script-v1";

export type RedCliffsAiScriptLine = {
  speaker: string;
  text: string;
};

export type RedCliffsAiScriptBeat = {
  beatId: string;
  lines: RedCliffsAiScriptLine[];
};

export type RedCliffsAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: RedCliffsAiScriptProtocolVersion;
  viewpointId: string;
  beats: RedCliffsAiScriptBeat[];
};

export type AiStructuredSceneProtocolDefinition = {
  protocolVersion: AiStructuredStoryProtocolVersion;
  supportedSceneTypes: EventSceneType[];
  requiredSceneFields: string[];
  supportedBehaviors: string[];
  unsupportedBehaviors: string[];
};

export type HongmenRole = EventViewpoint;
export type HongmenChoice = EventChoice;
export type HongmenScene = EventScene;

export type TimeTheaterTopic = {
  id: string;
  title: string;
  description: string;
  opening: string;
};

export type TimeTheaterLine = {
  speakerId: string;
  text: string;
};

export type TimeTheaterAiScriptProtocolVersion = "time-theater-linear-v1";

export type TimeTheaterAiScriptLine = {
  type: "narration" | "dialogue";
  speakerId: string;
  text: string;
};

export type TimeTheaterAiScriptPackage = {
  protocolVersion: TimeTheaterAiScriptProtocolVersion;
  topicId: string;
  viewpointId: string;
  characters: string[];
  lines: TimeTheaterAiScriptLine[];
};
