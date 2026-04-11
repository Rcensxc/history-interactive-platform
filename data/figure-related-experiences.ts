import type { FigureExperienceOption } from "@/types/content";

export const figureRelatedExperiences: Record<string, FigureExperienceOption[]> = {
  liubang: [
    {
      id: "liubang-hongmen-banquet",
      kind: "event",
      title: "鸿门宴",
      description:
        "从鸿门宴进入刘邦最关键的一次险局。进入事件准备页后，会直接为你预选刘邦视角。",
      note: "推荐从刘邦视角进入",
      ctaLabel: "进入事件准备页",
      href: "/events/hongmen-banquet?viewpoint=liubang&fromFigure=liubang",
    },
    {
      id: "liubang-time-theater",
      kind: "time-theater",
      title: "跨时空互动剧场",
      description:
        "把刘邦带入跨时代讨论，观察他如何判断局势、调动人心，以及在关键时刻如何做选择。",
      note: "可在互动页中继续设为第一视角",
      ctaLabel: "进入跨时空互动",
      href: "/time-theater",
    },
  ],
  xiangyu: [
    {
      id: "xiangyu-hongmen-banquet",
      kind: "event",
      title: "鸿门宴",
      description:
        "从鸿门宴查看项羽所处的决断现场。人物馆会直接带你进入同一事件准备页，再查看当前可选视角。",
      note: "可先从事件准备页进入这一事件",
      ctaLabel: "进入事件准备页",
      href: "/events/hongmen-banquet?fromFigure=xiangyu",
    },
    {
      id: "xiangyu-time-theater",
      kind: "time-theater",
      title: "跨时空互动剧场",
      description:
        "更适合通过跨时空互动观察项羽的气势、判断与压迫感，这一人物位当前还未纳入剧场阵容。",
      ctaLabel: "当前人物暂不在剧场阵容中",
    },
  ],
  "zhuge-liang": [
    {
      id: "zhuge-liang-related-event",
      kind: "event",
      title: "隆中对与北伐",
      description:
        "人物馆已经收录诸葛亮的核心事件线索。当前更适合先通过跨时空互动感受他的表达方式，再等待事件馆补上对应入口。",
      ctaLabel: "当前先浏览人物档案",
    },
    {
      id: "zhuge-liang-time-theater",
      kind: "time-theater",
      title: "跨时空互动剧场",
      description:
        "把诸葛亮带进跨时代讨论，观察他如何组织观点、稳住局面，并在复杂问题里给出判断。",
      note: "可设为第一视角",
      ctaLabel: "进入跨时空互动",
      href: "/time-theater",
    },
  ],
  wuzetian: [
    {
      id: "wuzetian-related-event",
      kind: "event",
      title: "临朝称制与武周建立",
      description:
        "围绕武则天的核心事件会继续放入事件馆。当前人物馆先保留这条事件线索，帮助你从人物档案进入后续体验路径。",
      ctaLabel: "当前先浏览人物档案",
    },
    {
      id: "wuzetian-time-theater",
      kind: "time-theater",
      title: "跨时空互动剧场",
      description:
        "把武则天带入跨时代讨论，观察她如何谈秩序、权力和治理，感受强势而清晰的表达方式。",
      note: "可设为第一视角",
      ctaLabel: "进入跨时空互动",
      href: "/time-theater",
    },
  ],
  liqingzhao: [
    {
      id: "liqingzhao-related-event",
      kind: "event",
      title: "南渡词作与金石收藏",
      description:
        "人物馆已经收录李清照的代表事件线索。相比单一事件推进，她当前更适合从跨时空互动里展现观察与表达的力量。",
      ctaLabel: "当前先浏览人物档案",
    },
    {
      id: "liqingzhao-time-theater",
      kind: "time-theater",
      title: "跨时空互动剧场",
      description:
        "把李清照放进跨时代讨论，让她从个人感受与时代记忆出发，回应“历史如何被记住”这类问题。",
      note: "可设为第一视角",
      ctaLabel: "进入跨时空互动",
      href: "/time-theater",
    },
  ],
  wangyangming: [
    {
      id: "wangyangming-related-event",
      kind: "event",
      title: "龙场悟道与宁王之乱",
      description:
        "王阳明的代表事件会继续放进事件馆。当前人物馆先把这条线索留在这里，方便你从人物继续进入更完整的体验。",
      ctaLabel: "当前先浏览人物档案",
    },
    {
      id: "wangyangming-time-theater",
      kind: "time-theater",
      title: "跨时空互动剧场",
      description:
        "把王阳明带进跨时代讨论，观察他如何把判断、行动与心性放到同一个问题里回答。",
      note: "可设为第一视角",
      ctaLabel: "进入跨时空互动",
      href: "/time-theater",
    },
  ],
};
