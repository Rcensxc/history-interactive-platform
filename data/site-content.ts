import type { HomeEntry, NavigationItem } from "@/types/content";

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "首页", summary: "启动试玩" },
  { href: "/figures", label: "历史人物馆", summary: "浏览人物卡" },
  { href: "/hongmen-banquet", label: "鸿门宴试玩", summary: "重回历史现场" },
  { href: "/time-theater", label: "跨时空剧场", summary: "多角色同台互动" },
];

export const homeEntries: HomeEntry[] = [
  {
    href: "/figures",
    eyebrow: "人物馆",
    title: "先认识角色，再决定你想靠近谁",
    description:
      "用卡片和筛选快速浏览人物，了解他们所处的时代、身份和关键事件。",
    cta: "进入历史人物馆",
    highlight: "6 位首批人物已就位",
    tone: "bronze",
  },
  {
    href: "/hongmen-banquet",
    eyebrow: "互动试玩",
    title: "以第一视角进入鸿门宴，感受每一步的压力",
    description:
      "从扮演角色开始，沿着对话和关键抉择推进故事，先搭出可试玩骨架。",
    cta: "开始鸿门宴试玩",
    highlight: "含角色选择与关键决策",
    tone: "crimson",
  },
  {
    href: "/time-theater",
    eyebrow: "跨时空互动",
    title: "让不同时代的人同台说话，看看他们如何碰撞",
    description:
      "自由挑选人物、设定视角和讨论主题，体验未来 AI 互动剧场的雏形。",
    cta: "进入跨时空剧场",
    highlight: "支持多人物与主题切换",
    tone: "jade",
  },
];

export const homeHighlights = [
  "沉浸式首页主视觉",
  "统一的深色展陈风格",
  "四个页面基础骨架已规划",
];
