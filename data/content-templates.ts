import type {
  EventPlayableContent,
  EventScene,
  EventSpeakerVisual,
  EventViewpoint,
  FigureEventRelation,
  HistoricalEvent,
  HistoricalFigure,
  PlaceholderAsset,
  Tone,
} from "@/types/content";

export type CharacterAssetTemplate = {
  standeePath: string;
  portraitPath: string;
};

export type EventPreparationTemplate = {
  eventId: string;
  overview: string;
  viewpointIds: string[];
  recommendedViewpointIds: string[];
  status: HistoricalEvent["status"];
};

export type EventSupportTemplate = {
  contentMode: "local-scripted" | "ai-generated";
  backgroundKeys: string[];
  speakerStandeeIds: string[];
  notes: string[];
};

export const sharedPlaceholderBackgroundTemplate: PlaceholderAsset = {
  label: "背景占位",
  tone: "ink",
  description: "如果真实背景素材还没有补齐，正式游玩界面会先回退到这一层占位背景。",
  backgroundKey: "shared-background-key",
};

export const sharedSpeakerVisualTemplate: EventSpeakerVisual = {
  label: "角色立绘",
  tone: "bronze",
  subtitle: "正式素材缺失时回退到占位立绘卡",
  alignment: "center",
};

export const historicalFigureTemplate: Omit<HistoricalFigure, "experienceOptions"> = {
  id: "new-figure-id",
  name: "人物姓名",
  title: "人物称号",
  dynasty: "所属朝代",
  role: "身份 / 职业",
  introduction:
    "用 1 到 2 句说清这个人物为什么重要、性格气质是什么、适合从什么角度进入体验。",
  signatureEvent: "代表事件 A、代表事件 B",
  keywords: ["关键词一", "关键词二", "关键词三"],
  portraitLabel: "简称",
  portraitTone: "ink",
  relatedEventIds: ["related-event-id"],
  canJoinTimeTheater: false,
};

export const characterAssetTemplate: CharacterAssetTemplate = {
  standeePath: "/assets/characters/standees/new-figure-id.png",
  portraitPath: "/assets/characters/portraits/new-figure-id.jpg",
};

export const figureEventRelationTemplate: FigureEventRelation = {
  id: "new-figure-id-event-id",
  figureId: "new-figure-id",
  eventId: "event-id",
  eventTitle: "事件名称",
  summary:
    "说明这个人物为什么和该事件有关，以及从人物馆进入时用户会被带到哪条体验路径。",
  canBeViewpoint: false,
  isRecommendedViewpoint: false,
};

export const historicalEventTemplate: HistoricalEvent = {
  id: "new-event-id",
  title: "历史事件名",
  era: "所属时代",
  category: "事件类型",
  summary: "一句话说明事件的冲突核心。",
  status: "planned",
  statusLabel: "计划中",
  description:
    "用 1 到 2 句说明事件背景、为什么值得做成交互体验，以及玩家大致会面对什么局势。",
  backdropLabel: "事件背景简称",
  backdropDescription: "用于准备页和正式游玩页的背景氛围说明。",
  availableViewpointIds: ["figure-a", "figure-b"],
  recommendedViewpointIds: ["figure-a"],
  hasPlayableStory: false,
  backdropTone: "crimson",
};

export const eventPreparationTemplate: EventPreparationTemplate = {
  eventId: "new-event-id",
  overview: "事件准备页里给玩家看的简短事件介绍。",
  viewpointIds: ["figure-a", "figure-b"],
  recommendedViewpointIds: ["figure-a"],
  status: "planned",
};

export const eventViewpointTemplate: EventViewpoint = {
  id: "figure-a",
  figureId: "figure-a",
  name: "人物姓名",
  title: "事件内视角定位",
  summary: "这个视角当前处在什么位置、面对什么压力。",
  perspective: "玩家进入该视角后主要会观察什么、判断什么。",
  pressure: "这一视角最核心的风险或张力是什么。",
  portraitLabel: "简称",
  portraitTone: "jade",
  isRecommended: false,
};

export const eventSceneTemplate: EventScene = {
  sceneId: "opening-1",
  type: "narration",
  speaker: "",
  speakerId: "narration",
  text: "这里放一条正式游玩中的单幕文本。",
  background: sharedPlaceholderBackgroundTemplate,
  standee: {
    mode: "hidden",
  },
  nextSceneId: "opening-2",
};

export const eventPlayableContentTemplate: EventPlayableContent = {
  protocolVersion: "event-story-v1",
  contentSource: "local-scripted",
  eventId: "new-event-id",
  initialSceneId: "opening-1",
  defaultBackdrop: sharedPlaceholderBackgroundTemplate,
  viewpoints: [eventViewpointTemplate],
  scenes: [eventSceneTemplate],
  speakerVisuals: {
    narration: {
      label: "旁白",
      tone: "ink",
      subtitle: "旁白或第一视角内心",
      alignment: "center",
    },
    "figure-a": sharedSpeakerVisualTemplate,
  },
};

export const eventSupportTemplate: EventSupportTemplate = {
  contentMode: "local-scripted",
  backgroundKeys: ["shared-background-key"],
  speakerStandeeIds: ["figure-a", "figure-b"],
  notes: [
    "如果事件先做静态剧情，需要在 history-registry 里补 viewpoints、speakerVisuals 和 scenes。",
    "如果事件后续走 AI 路线，也先补主数据、准备页视角、背景 key 和角色立绘映射，再补 AI 服务层。",
  ],
};

export const contentExpansionChecklists = {
  character: [
    "补人物主数据：id、姓名、朝代、身份/职业、简介、关键词、关联事件、是否可加入跨时空互动。",
    "补人物与事件关系：FigureEventRelation，明确是否能作为某事件第一视角。",
    "补共享人物素材映射：standee 和 portrait。",
    "如果该人物要进入事件准备页，还要补对应的 EventViewpoint。",
  ],
  event: [
    "补事件主数据：id、事件名、时代、类型、简介、可选视角、推荐视角、状态。",
    "补事件准备页所需视角数据：EventViewpoint。",
    "补正式游玩支持：本地剧情 scenes 或 AI 规则入口。",
    "补素材映射：共享背景 key、角色 standee 调用关系。",
  ],
} satisfies Record<"character" | "event", string[]>;

export const toneReference: Tone[] = ["amber", "jade", "ink", "crimson", "bronze"];
