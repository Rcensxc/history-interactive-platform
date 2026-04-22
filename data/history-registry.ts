import type {
  EventPlayableContent,
  EventPreparationData,
  EventSpeakerVisual,
  EventViewpoint,
  FigureEventRelation,
  FigureExperienceOption,
  HistoricalEvent,
  HistoricalFigure,
} from "@/types/content";
import { createEventPlayableContent } from "@/lib/event-story-runtime";
import { redCliffsMockAiStoryOutput } from "@/data/mock-ai-scene-output";

const historicalFigureCatalog: Array<Omit<HistoricalFigure, "experienceOptions">> = [
  {
    id: "liubang",
    name: "刘邦",
    title: "汉高祖",
    dynasty: "西汉",
    role: "君主",
    introduction:
      "出身平民，却一路从乱世中站上最高位置，善于识人、用人，也很懂得什么时候该退一步。",
    signatureEvent: "楚汉相争、建立汉朝",
    keywords: ["谋局", "用人", "逆转局势"],
    portraitLabel: "汉",
    portraitTone: "bronze",
    relatedEventIds: ["hongmen-banquet"],
    canJoinTimeTheater: true,
  },
  {
    id: "xiangyu",
    name: "项羽",
    title: "西楚霸王",
    dynasty: "秦",
    role: "统帅",
    introduction:
      "以强烈的战场压迫感闻名，气势无双，但也常在情势和判断之间陷入迟疑。",
    signatureEvent: "巨鹿之战、鸿门宴",
    keywords: ["强攻", "威势", "抉择压力"],
    portraitLabel: "楚",
    portraitTone: "crimson",
    relatedEventIds: ["hongmen-banquet"],
    canJoinTimeTheater: false,
  },
  {
    id: "zhuge-liang",
    name: "诸葛亮",
    title: "蜀汉丞相",
    dynasty: "三国",
    role: "谋臣",
    introduction:
      "擅长统筹与长线布局，给人的感觉不是张扬，而是始终把局面往可控方向推进。",
    signatureEvent: "隆中对、赤壁之战、北伐",
    keywords: ["全局", "筹谋", "稳定节奏"],
    portraitLabel: "蜀",
    portraitTone: "ink",
    relatedEventIds: [
      "battle-of-red-cliffs",
      "longzhong-plan",
      "northern-expeditions",
    ],
    canJoinTimeTheater: true,
  },
  {
    id: "wuzetian",
    name: "武则天",
    title: "大周皇帝",
    dynasty: "唐周",
    role: "君主",
    introduction:
      "在复杂权力结构中完成上位与治理，做事强势直接，同时非常清楚制度如何塑造秩序。",
    signatureEvent: "临朝称制、建立武周",
    keywords: ["权力", "秩序", "执行力"],
    portraitLabel: "周",
    portraitTone: "jade",
    relatedEventIds: ["establish-zhou", "imperial-court-reform"],
    canJoinTimeTheater: true,
  },
  {
    id: "liqingzhao",
    name: "李清照",
    title: "词人",
    dynasty: "宋",
    role: "文人",
    introduction:
      "她的作品把个人感受与时代风雨连接在一起，柔和不代表脆弱，反而非常有穿透力。",
    signatureEvent: "南渡词作、金石收藏",
    keywords: ["表达", "观察", "时代感"],
    portraitLabel: "宋",
    portraitTone: "amber",
    relatedEventIds: ["southern-song-migration", "jinshi-legacy"],
    canJoinTimeTheater: true,
  },
  {
    id: "wangyangming",
    name: "王阳明",
    title: "思想家",
    dynasty: "明",
    role: "思想家",
    introduction:
      "既能讲理念，也能在现实局面中解决问题，强调行动和判断要能真正落地。",
    signatureEvent: "龙场悟道、平定宁王之乱",
    keywords: ["行动", "判断", "心学"],
    portraitLabel: "明",
    portraitTone: "ink",
    relatedEventIds: ["longchang-enlightenment", "prince-ning-rebellion"],
    canJoinTimeTheater: true,
  },
];

const historicalEventCatalog: HistoricalEvent[] = [
  {
    id: "hongmen-banquet",
    title: "鸿门宴",
    era: "秦",
    category: "权谋博弈",
    summary: "一场包着礼数外壳的高压试探，真正危险的从来不只是酒席。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "刘邦入关后，局势骤然变得敏感。鸿门宴不是简单赴宴，而是一场所有人都知道危险存在、却还要维持表面体面的会面。",
    backdropLabel: "鸿门",
    backdropDescription:
      "背景占位图：夜色、营帐、火光与酒器，礼数与杀机在同一张席面上并排出现。",
    availableViewpointIds: ["liubang", "xiangyu"],
    recommendedViewpointIds: ["liubang"],
    hasPlayableStory: true,
    backdropTone: "crimson",
  },
  {
    id: "battle-of-red-cliffs",
    title: "赤壁之战",
    era: "三国",
    category: "战局转折",
    summary: "联盟、判断与时机交织在一起的一场大战，真正决定成败的往往是那一瞬间的判断。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "曹军南下后，孙刘联盟必须在极短时间内完成判断、布局与执行。赤壁并不只是大战开打的那一刻，更是火攻成形之前每一步试探与决断的累积。",
    backdropLabel: "赤壁",
    backdropDescription:
      "背景占位图：江面夜色、联军战船、风向变化与火光未起前的压迫感。",
    availableViewpointIds: ["zhouyu", "zhuge-liang", "huang-gai"],
    recommendedViewpointIds: ["zhouyu", "zhuge-liang"],
    hasPlayableStory: true,
    backdropTone: "ink",
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
    recommendedViewpointIds: [],
    hasPlayableStory: false,
    backdropTone: "ink",
  },
];

const figureEventRelations: FigureEventRelation[] = [
  {
    id: "liubang-hongmen-banquet",
    figureId: "liubang",
    eventId: "hongmen-banquet",
    eventTitle: "鸿门宴",
    summary:
      "从鸿门宴进入刘邦最关键的一次险局。进入事件准备页后，会直接为你预选刘邦视角。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "xiangyu-hongmen-banquet",
    figureId: "xiangyu",
    eventId: "hongmen-banquet",
    eventTitle: "鸿门宴",
    summary:
      "从鸿门宴进入项羽所处的决断现场。人物馆会直接带你进入同一事件准备页，并预选项羽视角。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "zhuge-liang-red-cliffs",
    figureId: "zhuge-liang",
    eventId: "battle-of-red-cliffs",
    eventTitle: "赤壁之战",
    summary:
      "从赤壁之战进入联盟成形后的关键决断现场。进入事件准备页后，会直接为你预选诸葛亮视角。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "zhuge-liang-longzhong",
    figureId: "zhuge-liang",
    eventTitle: "隆中对与北伐",
    summary:
      "除了赤壁之战，诸葛亮后续最适合补成个人主线的，就是从隆中对到北伐这一整条长期布局。这里先把关系线补齐，后续再进入事件馆。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "wuzetian-establish-zhou",
    figureId: "wuzetian",
    eventTitle: "临朝称制与武周建立",
    summary:
      "这是武则天最适合先补成事件体验的一条主线。当前先在人物馆里把入口关系和未来第一视角候选补齐，后续再放入事件馆。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "wuzetian-court-reform",
    figureId: "wuzetian",
    eventTitle: "用人与秩序重建",
    summary:
      "除了上位过程，武则天更适合再补一条围绕制度、用人与秩序重建的事件线，让人物路径不只停在权力争夺。",
    canBeViewpoint: false,
    isRecommendedViewpoint: false,
  },
  {
    id: "liqingzhao-southern-song-migration",
    figureId: "liqingzhao",
    eventTitle: "南渡词作与时代失序",
    summary:
      "李清照的代表事件更适合从个人感受与时代变局的交界处进入。当前先把这条主线补成关系基础，后续可以发展成可体验视角。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "liqingzhao-jinshi-legacy",
    figureId: "liqingzhao",
    eventTitle: "金石收藏与记忆保存",
    summary:
      "这条线更适合补充她如何面对失去、保存与记录，也能和跨时空剧场里的表达主题自然连起来。",
    canBeViewpoint: false,
    isRecommendedViewpoint: false,
  },
  {
    id: "wangyangming-longchang-enlightenment",
    figureId: "wangyangming",
    eventTitle: "龙场悟道",
    summary:
      "王阳明最适合先补成事件体验的，是他如何在极端处境中完成判断转变。当前先补关系基础，后续可作为正式第一视角候选。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "wangyangming-prince-ning-rebellion",
    figureId: "wangyangming",
    eventTitle: "平定宁王之乱",
    summary:
      "这条线更适合补他如何把理念落到行动和执行上，和龙场悟道形成前后呼应，但不需要这次就把完整事件做出来。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
];

const hongmenViewpoints: EventViewpoint[] = [
  {
    id: "liubang",
    figureId: "liubang",
    name: "刘邦",
    title: "主角视角",
    summary: "你刚入关中，声势渐起，但真正危险的并不是战场，而是宴席之上的分寸与眼色。",
    perspective: "你要在示弱、观察和保命之间找到平衡，不能让任何一句话暴露真实意图。",
    pressure: "席上每一次停顿都可能被放大，你得一边稳住气息，一边判断谁真正站在你这边。",
    portraitLabel: "汉",
    portraitTone: "bronze",
    isRecommended: true,
  },
  {
    id: "xiangyu",
    figureId: "xiangyu",
    name: "项羽",
    title: "宴席主人视角",
    summary: "你手握军势与主动，但真正考验你的不是兵锋，而是这场宴席里每个人的态度与分量。",
    perspective: "你要在威压、试探和顾全名望之间拿捏分寸，判断刘邦到底该留、该压，还是该放。",
    pressure: "帐中众人的每一句劝说都在推着局势变化，你既不能显得迟疑，也不能让场面失去控制。",
    portraitLabel: "楚",
    portraitTone: "crimson",
  },
];

const redCliffsViewpoints: EventViewpoint[] = [
  {
    id: "zhouyu",
    name: "周瑜",
    title: "统帅视角",
    summary: "你要把联盟、军心和战术压到同一个时间点上，任何一步失衡都会让整场布局失去意义。",
    perspective: "你关心的不是单一奇谋，而是如何让每个环节在同一刻成立。",
    pressure: "风向、军心和对手的误判都必须同时落位。",
    portraitLabel: "吴",
    portraitTone: "jade",
    isRecommended: true,
  },
  {
    id: "zhuge-liang",
    figureId: "zhuge-liang",
    name: "诸葛亮",
    title: "联盟谋臣视角",
    summary: "你站在联盟一侧，更在意的是如何稳住合作关系，并让关键判断在正确的时机被接受。",
    perspective: "你要让布局显得自然，又不能让任何一步暴露得太早。",
    pressure: "若判断太慢，战机会消失；若判断太快，也可能让联盟先起疑心。",
    portraitLabel: "蜀",
    portraitTone: "ink",
    isRecommended: true,
  },
  {
    id: "huang-gai",
    name: "黄盖",
    title: "执行者视角",
    summary: "你知道这场胜负最后会落到执行上，真正危险的不是计谋本身，而是自己能否撑到最后一步。",
    perspective: "你的任务是把最危险的一步做成最像真的一幕。",
    pressure: "只要你露出一点破绽，整场火攻都会提前崩掉。",
    portraitLabel: "火",
    portraitTone: "crimson",
  },
];

const hongmenSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "夜",
    tone: "ink",
    subtitle: "旁白视角",
    alignment: "center",
  },
  xiangyu: {
    label: "楚",
    tone: "crimson",
    subtitle: "宴席主人",
    alignment: "right",
  },
  "fan-kuai": {
    label: "卫",
    tone: "crimson",
    subtitle: "强势闯入",
    alignment: "left",
  },
  decision: {
    label: "择",
    tone: "amber",
    subtitle: "关键节点",
    alignment: "center",
  },
  ending: {
    label: "局",
    tone: "jade",
    subtitle: "阶段收束",
    alignment: "center",
  },
  liubang: {
    label: "汉",
    tone: "bronze",
    subtitle: "第一视角",
    alignment: "left",
  },
  xiangbo: {
    label: "项",
    tone: "jade",
    subtitle: "中间协调者",
    alignment: "left",
  },
};

const redCliffsSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "夜",
    tone: "ink",
    subtitle: "江面旁白",
    alignment: "center",
  },
  zhouyu: {
    label: "吴",
    tone: "jade",
    subtitle: "联军主将",
    alignment: "right",
  },
  "zhuge-liang": {
    label: "蜀",
    tone: "ink",
    subtitle: "联盟谋臣",
    alignment: "left",
  },
  "huang-gai": {
    label: "火",
    tone: "crimson",
    subtitle: "火攻执行者",
    alignment: "center",
  },
  decision: {
    label: "择",
    tone: "amber",
    subtitle: "关键节点",
    alignment: "center",
  },
  ending: {
    label: "焰",
    tone: "amber",
    subtitle: "阶段收束",
    alignment: "center",
  },
};

const redCliffsAiBackdropMap = {
  "river-night": {
    label: "赤壁",
    tone: "ink",
    description:
      "背景占位图：江面夜色、联军战船与风向未定时的压迫感。",
  },
  "command-tent": {
    label: "联营",
    tone: "ink",
    description:
      "背景占位图：江边军帐、沙盘和烛火下不断调整的布局。",
  },
  "strategy-table": {
    label: "谋局",
    tone: "amber",
    description:
      "背景占位图：军图、风向、联盟信任与执行时机同时被摆在案上。",
  },
  "departure-dock": {
    label: "出发",
    tone: "crimson",
    description:
      "背景占位图：江边登船点、暗处待发的战船，以及行动前的短暂压抑。",
  },
  "embers-aftermath": {
    label: "火光",
    tone: "amber",
    description:
      "背景占位图：火光后的江面余温，大局已成，但真正决定胜负的是更前面的判断。",
  },
} as const;

const eventStoryCatalog: Record<string, EventPlayableContent> = {
  "hongmen-banquet": createEventPlayableContent({
    eventId: "hongmen-banquet",
    initialSceneId: "arrival",
    defaultBackdrop: {
      label: "鸿门",
      tone: "crimson",
      description:
        "背景占位图：夜色、营帐、火光与酒器，礼数与杀机在同一张席面上并排出现。",
    },
    viewpoints: hongmenViewpoints,
    speakerVisuals: hongmenSpeakerVisualMap,
    scenes: [
      {
        id: "arrival",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "鸿门",
          tone: "crimson",
          description:
            "背景占位图：夜色、营帐、火光与酒器，礼数与杀机在同一张席面上并排出现。",
        },
        text:
          "夜色压在营地上，火光映着酒器和兵刃。你知道这不是普通宴席，而是一场带着试探意味的会面。",
        note: "先用低风险的方式进入剧情，让试玩节奏明确。",
        nextSceneId: "opening-dialogue",
      },
      {
        id: "opening-dialogue",
        type: "dialogue",
        speaker: "项羽",
        speakerId: "xiangyu",
        visualKey: "xiangyu",
        text: "沛公远来，不必拘束。今夜只当叙旧。",
        nextSceneId: "decision-one",
      },
      {
        id: "decision-one",
        type: "decision",
        speaker: "关键抉择",
        speakerId: "decision",
        visualKey: "decision",
        text: "宴席刚开，你要先把自己的姿态放在哪一边？",
        choices: [
          {
            id: "historic-humble",
            label: "主动示弱，把入关经过解释清楚",
            outcome: "你先把锋芒收住，给自己争取到继续留在席间观察的空间。",
            isHistorical: true,
            nextSceneId: "fan-kuai-entry",
          },
          {
            id: "assertive",
            label: "直接强调自己的战功，抢先占住气势",
            outcome: "气氛立刻变紧，周围人的目光都更警惕了。",
            nextSceneId: "fan-kuai-entry",
          },
          {
            id: "silent",
            label: "尽量少说，让其他人替你周旋",
            outcome: "你保住了谨慎，但也让自己显得更难被判断。",
            nextSceneId: "fan-kuai-entry",
          },
        ],
      },
      {
        id: "fan-kuai-entry",
        type: "dialogue",
        speaker: "樊哙",
        speakerId: "fan-kuai",
        visualKey: "fan-kuai",
        text: "主上身在险地，不能只等别人发话。若局势再压下去，总要有人出来把桌面掀开一点。",
        nextSceneId: "decision-two",
      },
      {
        id: "decision-two",
        type: "decision",
        speaker: "关键抉择",
        speakerId: "decision",
        visualKey: "decision",
        text: "席间暗流越来越重，这时你会怎么做？",
        choices: [
          {
            id: "historic-exit",
            label: "借上厕所离席，抓住空档撤出营地",
            outcome: "这是最稳妥的保命路线，也是历史走向里最关键的一步。",
            isHistorical: true,
            nextSceneId: "ending",
          },
          {
            id: "stay",
            label: "继续留在席上，试着把气氛圆过去",
            outcome: "你赢得了一点表面体面，但风险还在持续积累。",
            nextSceneId: "ending",
          },
          {
            id: "confront",
            label: "直接把暗示揭开，逼对方表态",
            outcome: "局面会迅速失控，宴席有可能立刻变成冲突现场。",
            nextSceneId: "ending",
          },
        ],
      },
      {
        id: "ending",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        text:
          "鸿门宴真正迷人的地方，不在刀剑有没有出鞘，而在所有人都知道危险存在，却只能用礼数和话语一点点试探彼此的底线。",
        note: "下一阶段可以在这里接入更多分支和 AI 生成对话。",
      },
    ],
  }),
  "battle-of-red-cliffs": createEventPlayableContent({
    eventId: "battle-of-red-cliffs",
    initialSceneId: "river-night",
    aiOutput: redCliffsMockAiStoryOutput,
    backgrounds: redCliffsAiBackdropMap,
    defaultBackdrop: {
      label: "赤壁",
      tone: "ink",
      description: "背景占位图：江面夜色、联军战船与风向未定时的压迫感。",
    },
    viewpoints: redCliffsViewpoints,
    speakerVisuals: redCliffsSpeakerVisualMap,
    scenes: [
      {
        id: "river-night",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "赤壁",
          tone: "ink",
          description: "背景占位图：江面夜色、联军战船与风向未定时的压迫感。",
        },
        text:
          "江面暂时还很安静，但每个人都知道，真正决定胜负的不是明天会不会开战，而是今夜有没有把火攻前的每一步都安排妥当。",
        nextSceneId: "zhouyu-briefing",
      },
      {
        id: "zhouyu-briefing",
        type: "dialogue",
        speaker: "周瑜",
        speakerId: "zhouyu",
        visualKey: "zhouyu",
        text:
          "曹军船多、人众、气势正盛，但正因为如此，他们更相信自己不会输。只要判断准确，越笃定的对手，越容易在关键时刻出错。",
        nextSceneId: "zhuge-liang-response",
      },
      {
        id: "zhuge-liang-response",
        type: "dialogue",
        speaker: "诸葛亮",
        speakerId: "zhuge-liang",
        visualKey: "zhuge-liang",
        text:
          "真正要抓住的，不只是敌军松懈的一刻，而是风向、军心和联盟内部的信任能否在同一刻站到我们这边。",
        nextSceneId: "fire-attack-choice",
      },
      {
        id: "fire-attack-choice",
        type: "decision",
        speaker: "关键抉择",
        speakerId: "decision",
        visualKey: "decision",
        text: "火攻前夜，你会先把哪一步放到最前面？",
        choices: [
          {
            id: "historic-timing",
            label: "优先等风向彻底稳定，再推进火攻",
            outcome: "你把所有动作都压到最稳的时机上，虽然更慢，但更接近历史中的关键判断。",
            isHistorical: true,
            nextSceneId: "huang-gai-execution",
          },
          {
            id: "alliance-first",
            label: "先把联盟内部口径完全统一，再推进执行",
            outcome: "你让局面更稳了，但也把战机往后推了一步。",
            nextSceneId: "huang-gai-execution",
          },
          {
            id: "strike-early",
            label: "趁对手松懈，提前把计划推到最前",
            outcome: "你抢到了速度，但任何环节露出破绽，代价都会被放大。",
            nextSceneId: "huang-gai-execution",
          },
        ],
      },
      {
        id: "huang-gai-execution",
        type: "dialogue",
        speaker: "黄盖",
        speakerId: "huang-gai",
        visualKey: "huang-gai",
        text:
          "计策再好，最后也得有人把最危险的一步真的走出去。只要我这一步不像真的，整场火攻就会在点燃之前先被看穿。",
        nextSceneId: "red-cliffs-ending",
      },
      {
        id: "red-cliffs-ending",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        text:
          "赤壁之战最迷人的地方，不只是大火烧船的那一幕，而是所有关键判断都必须在火光亮起之前就完成。真正的胜负，往往先决定于看不见的那一段时间。",
      },
    ],
  }),
};

export function getHistoricalFigure(figureId: string) {
  return historicalFigureCatalog.find((figure) => figure.id === figureId) ?? null;
}

export function getHistoricalEvent(eventId: string) {
  return historicalEventCatalog.find((eventItem) => eventItem.id === eventId) ?? null;
}

export function getFigureEventRelations(figureId: string) {
  return figureEventRelations.filter((relation) => relation.figureId === figureId);
}

export function getEventRelations(eventId: string) {
  return figureEventRelations.filter((relation) => relation.eventId === eventId);
}

export function getEventPlayableContent(eventId: string) {
  return eventStoryCatalog[eventId] ?? null;
}

export function getEventPreparationData(eventId: string): EventPreparationData | null {
  const event = getHistoricalEvent(eventId);
  if (!event) {
    return null;
  }

  const playableContent = getEventPlayableContent(eventId);
  const viewpoints = playableContent?.viewpoints ?? [];

  return {
    event,
    viewpoints,
    recommendedViewpointIds: event.recommendedViewpointIds ?? [],
    hasPlayableStory: !!event.hasPlayableStory && !!playableContent,
  };
}

export function getFigureRelatedExperiences(figureId: string): FigureExperienceOption[] {
  const relations = getFigureEventRelations(figureId);
  const figure = getHistoricalFigure(figureId);

  const eventEntries = relations.map((relation) => {
    const eventItem = relation.eventId ? getHistoricalEvent(relation.eventId) : null;
    const viewpointNames =
      eventItem?.recommendedViewpointIds?.map(
        (viewpointId) =>
          eventStoryCatalog[relation.eventId ?? ""]?.viewpoints.find(
            (viewpoint) => viewpoint.id === viewpointId,
          )?.name ?? viewpointId,
      ) ?? [];
    const href = relation.eventId
      ? relation.canBeViewpoint
        ? `/events/${relation.eventId}?viewpoint=${figureId}&fromFigure=${figureId}`
        : `/events/${relation.eventId}?fromFigure=${figureId}`
      : undefined;

    return {
      id: relation.id,
      kind: "event" as const,
      title: relation.eventTitle,
      description: relation.summary,
      note: relation.isRecommendedViewpoint
        ? `推荐从${figure?.name ?? "该人物"}视角进入`
        : viewpointNames.length > 0
          ? `当前事件推荐视角：${viewpointNames.join("、")}`
          : undefined,
      ctaLabel: href ? "进入事件准备页" : "当前先浏览人物档案",
      href,
    };
  });

  const timeTheaterEntry: FigureExperienceOption = figure?.canJoinTimeTheater
    ? {
        id: `${figureId}-time-theater`,
        kind: "time-theater",
        title: "跨时空互动剧场",
        description:
          "把这个人物带入跨时代讨论，在另一种玩法里观察他会如何表达、如何判断、如何回应问题。",
        note: "可在互动页中继续设为第一视角",
        ctaLabel: "进入跨时空互动",
        href: "/time-theater",
      }
    : {
        id: `${figureId}-time-theater`,
        kind: "time-theater",
        title: "跨时空互动剧场",
        description:
          "这个人物暂时不在当前跨时空剧场阵容中，但这条入口结构已经保留，后续可以继续扩展。",
        ctaLabel: "当前人物暂不在剧场阵容中",
      };

  return [...eventEntries, timeTheaterEntry];
}

export const figureRelatedExperiences = Object.fromEntries(
  historicalFigureCatalog.map((figure) => [
    figure.id,
    getFigureRelatedExperiences(figure.id),
  ]),
) as Record<string, FigureExperienceOption[]>;

export const historicalFigures: HistoricalFigure[] = historicalFigureCatalog.map(
  (figure) => ({
    ...figure,
    experienceOptions: getFigureRelatedExperiences(figure.id),
  }),
);

export const historicalEvents = historicalEventCatalog;

export const eventCategories = [
  "全部分类",
  ...new Set(historicalEventCatalog.map((eventItem) => eventItem.category)),
];

export const eventStatuses = [
  "全部状态",
  ...new Set(historicalEventCatalog.map((eventItem) => eventItem.statusLabel)),
];

export const timeTheaterEligibleFigureIds = historicalFigureCatalog
  .filter((figure) => figure.canJoinTimeTheater)
  .map((figure) => figure.id);

const hongmenEvent = historicalEventCatalog.find(
  (eventItem) => eventItem.id === "hongmen-banquet",
);

const hongmenPlayableContent = eventStoryCatalog["hongmen-banquet"];

export const eventPlayableContent = eventStoryCatalog;
export const aiStructuredStoryFixtures = {
  "battle-of-red-cliffs": {
    output: redCliffsMockAiStoryOutput,
    backgrounds: redCliffsAiBackdropMap,
    speakerVisuals: redCliffsSpeakerVisualMap,
  },
} as const;

export const hongmenRoles = hongmenPlayableContent?.viewpoints ?? [];

export const hongmenScenes = hongmenPlayableContent?.scenes ?? [];

export const hongmenSpeakerVisuals = hongmenPlayableContent?.speakerVisuals ?? {};

export const hongmenStageMeta = {
  title: hongmenEvent?.title ?? "楦块棬瀹?",
  preparationDescription: hongmenEvent?.description ?? "",
  backdropLabel: hongmenEvent?.backdropLabel ?? "楦块棬",
  backdropDescription: hongmenEvent?.backdropDescription ?? "",
};
