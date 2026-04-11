import type { HongmenRole, HongmenScene, Tone } from "@/types/content";

export const hongmenRoles: HongmenRole[] = [
  {
    id: "liubang",
    name: "刘邦",
    title: "主角视角",
    summary: "你刚入关中，声势渐起，但真正危险的并不是战场，而是宴席上的气氛。",
    perspective: "你要在示弱、观察和保命之间找到平衡。",
    pressure: "每一句话都会被放大，每一次停顿都可能被解读。",
    portraitLabel: "汉",
    portraitTone: "bronze",
  },
  {
    id: "xiangbo",
    name: "项伯",
    title: "中间人视角",
    summary: "你站在项羽阵营内部，却知道这场宴席稍有失衡就会把局面推向失控。",
    perspective: "你既要顾住项氏情面，也想尽量避免事情走到最坏。",
    pressure: "你的一次提醒，也许就能改变很多人的命运。",
    portraitLabel: "项",
    portraitTone: "jade",
  },
  {
    id: "fan-kuai",
    name: "樊哙",
    title: "护卫视角",
    summary: "你不是来讲道理的，你最在意的是刘邦是否能平安走出这场鸿门宴。",
    perspective: "你会从最直接的生存判断出发，必要时硬闯也要护主。",
    pressure: "当场面失控时，你必须第一时间站出来。",
    portraitLabel: "卫",
    portraitTone: "crimson",
  },
];

export const hongmenStageMeta = {
  title: "鸿门宴互动试玩",
  preparationDescription:
    "先选择你要扮演的角色，再进入正式剧情。当前阶段先专注把沉浸式 AVG 界面结构做对，剧情内容仍使用假数据。",
  backdropLabel: "鸿门",
  backdropDescription:
    "背景占位图：夜色、营帐、火光与酒器，所有礼数都包着一层危险的试探。",
};

export const hongmenSpeakerVisuals: Record<
  string,
  {
    label: string;
    tone: Tone;
    subtitle: string;
    alignment: "left" | "center" | "right";
  }
> = {
  旁白: {
    label: "夜",
    tone: "ink",
    subtitle: "旁白视角",
    alignment: "center",
  },
  项羽: {
    label: "楚",
    tone: "crimson",
    subtitle: "宴席主人",
    alignment: "right",
  },
  樊哙: {
    label: "卫",
    tone: "crimson",
    subtitle: "强势闯入",
    alignment: "left",
  },
  关键抉择: {
    label: "择",
    tone: "amber",
    subtitle: "关键节点",
    alignment: "center",
  },
  收束: {
    label: "局",
    tone: "jade",
    subtitle: "阶段收束",
    alignment: "center",
  },
  刘邦: {
    label: "汉",
    tone: "bronze",
    subtitle: "第一视角",
    alignment: "left",
  },
  项伯: {
    label: "项",
    tone: "jade",
    subtitle: "中间协调者",
    alignment: "left",
  },
};

export const hongmenScenes: HongmenScene[] = [
  {
    id: "arrival",
    type: "narration",
    speaker: "旁白",
    text:
      "夜色压在营地上，火光映着酒器和兵甲。你知道这不是普通宴席，而是一场带着试探意味的会面。",
    note: "先用低风险的方式进入剧情，让试玩节奏明确。",
  },
  {
    id: "opening-dialogue",
    type: "dialogue",
    speaker: "项羽",
    text: "沛公远来，不必拘束。今夜只当叙旧，但谁都明白，席间没有一句是真正轻松的。",
  },
  {
    id: "decision-one",
    type: "decision",
    speaker: "关键抉择",
    text: "宴席刚开，你要先把自己的姿态放在哪一边？",
    choices: [
      {
        id: "historic-humble",
        label: "主动示弱，把关中与入关经过解释清楚",
        outcome: "你先把锋芒收住，给自己争取到继续留在席间观察的空间。",
        isHistorical: true,
      },
      {
        id: "assertive",
        label: "直接强调自己的战功，抢先占住气势",
        outcome: "气氛立刻变紧，周围人的目光都更警惕了。",
      },
      {
        id: "silent",
        label: "尽量少说，让其他人替你周旋",
        outcome: "你保住了谨慎，但也让自己显得更难被判断。",
      },
    ],
  },
  {
    id: "fan-kuai-entry",
    type: "dialogue",
    speaker: "樊哙",
    text: "主上身在险地，不能只等别人发话。若局势再压下去，总要有人出来把桌面掀开一点。",
  },
  {
    id: "decision-two",
    type: "decision",
    speaker: "关键抉择",
    text: "席间暗流越来越重，这时你会怎么做？",
    choices: [
      {
        id: "historic-exit",
        label: "借上厕所离席，抓住空档撤出营地",
        outcome: "这是最稳妥的保命路线，也是历史走向里最关键的一步。",
        isHistorical: true,
      },
      {
        id: "stay",
        label: "继续留在席上，试着把气氛圆过去",
        outcome: "你赢得了一点表面体面，但风险还在持续积累。",
      },
      {
        id: "confront",
        label: "直接把暗示摊开，逼对方表态",
        outcome: "局面会迅速失控，宴席有可能立刻变成冲突现场。",
      },
    ],
  },
  {
    id: "ending",
    type: "narration",
    speaker: "收束",
    text:
      "鸿门宴真正迷人的地方，不在刀剑有没有出鞘，而在所有人都知道危险存在，却只能用礼数和话语一点点试探彼此的底线。",
    note: "下一阶段可以在这里接入更多分支和 AI 生成对白。",
  },
];
