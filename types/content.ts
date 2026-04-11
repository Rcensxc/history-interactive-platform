export type Tone = "amber" | "jade" | "ink" | "crimson" | "bronze";

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
  name: string;
  title: string;
  summary: string;
  perspective: string;
  pressure: string;
  portraitLabel: string;
  portraitTone: Tone;
};

export type EventChoice = {
  id: string;
  label: string;
  outcome: string;
  isHistorical?: boolean;
};

export type EventScene = {
  id: string;
  type: "narration" | "dialogue" | "decision";
  speaker: string;
  text: string;
  note?: string;
  choices?: EventChoice[];
};

export type EventSpeakerVisual = {
  label: string;
  tone: Tone;
  subtitle: string;
  alignment: "left" | "center" | "right";
};

export type EventPlayableContent = {
  viewpoints: EventViewpoint[];
  scenes: EventScene[];
  speakerVisuals: Record<string, EventSpeakerVisual>;
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
