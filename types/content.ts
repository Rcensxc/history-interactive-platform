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

export type ShenlongAiScriptProtocolVersion = "shenlong-linear-script-v1";

export type ShenlongAiScriptLine = {
  speaker: string;
  text: string;
};

export type ShenlongAiScriptBeat = {
  beatId: string;
  lines: ShenlongAiScriptLine[];
};

export type ShenlongAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: ShenlongAiScriptProtocolVersion;
  viewpointId: string;
  beats: ShenlongAiScriptBeat[];
};

export type JingkeAiScriptProtocolVersion = "jingke-linear-script-v1";

export type JingkeAiScriptLine = {
  speaker: string;
  text: string;
};

export type JingkeAiScriptBeat = {
  beatId: string;
  lines: JingkeAiScriptLine[];
};

export type JingkeAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: JingkeAiScriptProtocolVersion;
  viewpointId: string;
  beats: JingkeAiScriptBeat[];
};

export type HeroesOverWineAiScriptProtocolVersion =
  "heroes-over-wine-linear-script-v1";

export type HeroesOverWineAiScriptLine = {
  speaker: string;
  text: string;
};

export type HeroesOverWineAiScriptBeat = {
  beatId: string;
  lines: HeroesOverWineAiScriptLine[];
};

export type HeroesOverWineAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: HeroesOverWineAiScriptProtocolVersion;
  viewpointId: string;
  beats: HeroesOverWineAiScriptBeat[];
};

export type EmptyCityAiScriptProtocolVersion = "empty-city-linear-script-v1";

export type EmptyCityAiScriptLine = {
  speaker: string;
  text: string;
};

export type EmptyCityAiScriptBeat = {
  beatId: string;
  lines: EmptyCityAiScriptLine[];
};

export type EmptyCityAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: EmptyCityAiScriptProtocolVersion;
  viewpointId: string;
  beats: EmptyCityAiScriptBeat[];
};

export type BreakCauldronsAiScriptProtocolVersion =
  "break-cauldrons-linear-script-v1";

export type BreakCauldronsAiScriptLine = {
  speaker: string;
  text: string;
};

export type BreakCauldronsAiScriptBeat = {
  beatId: string;
  lines: BreakCauldronsAiScriptLine[];
};

export type BreakCauldronsAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: BreakCauldronsAiScriptProtocolVersion;
  viewpointId: string;
  beats: BreakCauldronsAiScriptBeat[];
};

export type BearingThornsAiScriptProtocolVersion =
  "bearing-thorns-linear-script-v1";

export type BearingThornsAiScriptLine = {
  speaker: string;
  text: string;
};

export type BearingThornsAiScriptBeat = {
  beatId: string;
  lines: BearingThornsAiScriptLine[];
};

export type BearingThornsAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: BearingThornsAiScriptProtocolVersion;
  viewpointId: string;
  beats: BearingThornsAiScriptBeat[];
};

export type CupWineAiScriptProtocolVersion = "cup-wine-linear-script-v1";

export type CupWineAiScriptLine = {
  speaker: string;
  text: string;
};

export type CupWineAiScriptBeat = {
  beatId: string;
  lines: CupWineAiScriptLine[];
};

export type CupWineAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: CupWineAiScriptProtocolVersion;
  viewpointId: string;
  beats: CupWineAiScriptBeat[];
};

export type TianjiHorseRaceAiScriptProtocolVersion =
  "tianji-horse-race-linear-script-v1";

export type TianjiHorseRaceAiScriptLine = {
  speaker: string;
  text: string;
};

export type TianjiHorseRaceAiScriptBeat = {
  beatId: string;
  lines: TianjiHorseRaceAiScriptLine[];
};

export type TianjiHorseRaceAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: TianjiHorseRaceAiScriptProtocolVersion;
  viewpointId: string;
  beats: TianjiHorseRaceAiScriptBeat[];
};

export type ScrapeBoneAiScriptProtocolVersion =
  "scrape-bone-linear-script-v1";

export type ScrapeBoneAiScriptLine = {
  speaker: string;
  text: string;
};

export type ScrapeBoneAiScriptBeat = {
  beatId: string;
  lines: ScrapeBoneAiScriptLine[];
};

export type ScrapeBoneAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: ScrapeBoneAiScriptProtocolVersion;
  viewpointId: string;
  beats: ScrapeBoneAiScriptBeat[];
};

export type SmashWaterJarAiScriptProtocolVersion =
  "smash-water-jar-linear-script-v1";

export type SmashWaterJarAiScriptLine = {
  speaker: string;
  text: string;
};

export type SmashWaterJarAiScriptBeat = {
  beatId: string;
  lines: SmashWaterJarAiScriptLine[];
};

export type SmashWaterJarAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: SmashWaterJarAiScriptProtocolVersion;
  viewpointId: string;
  beats: SmashWaterJarAiScriptBeat[];
};

export type DebateWithWuScholarsAiScriptProtocolVersion =
  "debate-with-wu-scholars-linear-script-v1";

export type DebateWithWuScholarsAiScriptLine = {
  speaker: string;
  text: string;
};

export type DebateWithWuScholarsAiScriptBeat = {
  beatId: string;
  lines: DebateWithWuScholarsAiScriptLine[];
};

export type DebateWithWuScholarsAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: DebateWithWuScholarsAiScriptProtocolVersion;
  viewpointId: string;
  beats: DebateWithWuScholarsAiScriptBeat[];
};

export type HumenDestroyOpiumAiScriptProtocolVersion =
  "humen-destroy-opium-linear-script-v1";

export type HumenDestroyOpiumAiScriptLine = {
  speaker: string;
  text: string;
};

export type HumenDestroyOpiumAiScriptBeat = {
  beatId: string;
  lines: HumenDestroyOpiumAiScriptLine[];
};

export type HumenDestroyOpiumAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: HumenDestroyOpiumAiScriptProtocolVersion;
  viewpointId: string;
  beats: HumenDestroyOpiumAiScriptBeat[];
};

export type BoilBeansAiScriptProtocolVersion =
  "boil-beans-linear-script-v1";

export type BoilBeansAiScriptLine = {
  speaker: string;
  text: string;
};

export type BoilBeansAiScriptBeat = {
  beatId: string;
  lines: BoilBeansAiScriptLine[];
};

export type BoilBeansAiScriptPackage = {
  packageId: string;
  storyId: string;
  protocolVersion: BoilBeansAiScriptProtocolVersion;
  viewpointId: string;
  beats: BoilBeansAiScriptBeat[];
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
