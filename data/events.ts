import {
  hongmenRoles,
  hongmenScenes,
  hongmenSpeakerVisuals,
} from "@/data/hongmen-banquet";
import type {
  EventPlayableContent,
  HistoricalEvent,
} from "@/types/content";

export const historicalEvents: HistoricalEvent[] = [
  {
    id: "hongmen-banquet",
    title: "鸿门宴",
    era: "秦末",
    category: "权谋博弈",
    summary: "一场包着礼数外壳的高压试探，真正危险的从来不只是酒席。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "刘邦入关后，局势骤然变得敏感。鸿门宴不是简单赴宴，而是一场所有人都知道危险存在、却还要维持表面体面的会面。",
    backdropLabel: "鸿门",
    backdropDescription:
      "背景占位图：夜色、营帐、火光与酒器，礼数与杀机在同一张席面上并排出现。",
    availableViewpointIds: ["liubang", "xiangbo", "fan-kuai"],
  },
  {
    id: "battle-of-red-cliffs",
    title: "赤壁之战",
    era: "三国",
    category: "战局转折",
    summary: "联盟、判断与时机交织在一起的一场大战，适合做多角色视角体验。",
    status: "coming-soon",
    statusLabel: "即将开放",
    description:
      "从对峙到火攻，这场战役里有太多适合做第一视角切入的关键节点，后续会作为重要事件扩展。",
    backdropLabel: "赤壁",
    backdropDescription:
      "背景占位图：江面夜火、战船与风向变化带来的压迫感。",
    availableViewpointIds: [],
  },
  {
    id: "reform-of-shang-yang",
    title: "商鞅变法",
    era: "战国",
    category: "制度抉择",
    summary: "不是所有历史事件都靠刀兵推进，有些真正改变时代的是制度决断。",
    status: "planned",
    statusLabel: "计划中",
    description:
      "制度改革类事件适合做成更偏判断与后果反馈的互动玩法，这一方向目前先保留结构位置。",
    backdropLabel: "变法",
    backdropDescription:
      "背景占位图：朝堂、法令与秩序重建的冷峻气氛。",
    availableViewpointIds: [],
  },
];

export const eventCategories = [
  "全部分类",
  ...new Set(historicalEvents.map((eventItem) => eventItem.category)),
];

export const eventStatuses = [
  "全部状态",
  ...new Set(historicalEvents.map((eventItem) => eventItem.statusLabel)),
];

export const eventPlayableContent: Record<string, EventPlayableContent> = {
  "hongmen-banquet": {
    viewpoints: hongmenRoles,
    scenes: hongmenScenes,
    speakerVisuals: hongmenSpeakerVisuals,
  },
};

export function getHistoricalEvent(eventId: string) {
  return historicalEvents.find((eventItem) => eventItem.id === eventId) ?? null;
}

export function getEventPlayableContent(eventId: string) {
  return eventPlayableContent[eventId] ?? null;
}
