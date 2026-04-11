export type Tone = "amber" | "jade" | "ink" | "crimson" | "bronze";

export type PlaceholderAsset = {
  label: string;
  tone: Tone;
  description?: string;
  subtitle?: string;
  image?: string;
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
};

export type EventChoice = {
  id: string;
  label: string;
  outcome: string;
  isHistorical?: boolean;
  nextSceneId?: string;
};

export type EventScene = {
  id: string;
  type: "narration" | "dialogue" | "decision";
  speaker: string;
  speakerId?: string;
  text: string;
  note?: string;
  background?: PlaceholderAsset;
  visualKey?: string;
  choices?: EventChoice[];
  nextSceneId?: string;
};

export type EventSpeakerVisual = {
  label: string;
  tone: Tone;
  subtitle: string;
  alignment: "left" | "center" | "right";
};

export type EventPlayableContent = {
  eventId?: string;
  initialSceneId?: string;
  defaultBackdrop?: PlaceholderAsset;
  viewpoints: EventViewpoint[];
  scenes: EventScene[];
  speakerVisuals: Record<string, EventSpeakerVisual>;
};

export type EventPreparationData = {
  event: HistoricalEvent;
  viewpoints: EventViewpoint[];
  recommendedViewpointIds: string[];
  hasPlayableStory: boolean;
};

export type HongmenRole = EventViewpoint;
export type HongmenChoice = EventChoice;
export type HongmenScene = EventScene;

export type TimeTheaterTopic = {
  id: string;
  title: string;
  description: string;
  requiredSpeakerIds: string[];
  opening: string;
};

export type TimeTheaterLine = {
  speakerId: string;
  text: string;
};
