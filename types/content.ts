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

export type FigureExperienceStatus =
  | "playable"
  | "candidate"
  | "coming-soon";

export type FigureExperienceOption = {
  id: string;
  title: string;
  description: string;
  status: FigureExperienceStatus;
  statusLabel: string;
  ctaLabel: string;
  href?: string;
};

export type HongmenRole = {
  id: string;
  name: string;
  title: string;
  summary: string;
  perspective: string;
  pressure: string;
  portraitLabel: string;
  portraitTone: Tone;
};

export type HongmenChoice = {
  id: string;
  label: string;
  outcome: string;
  isHistorical?: boolean;
};

export type HongmenScene = {
  id: string;
  type: "narration" | "dialogue" | "decision";
  speaker: string;
  text: string;
  note?: string;
  choices?: HongmenChoice[];
};

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
