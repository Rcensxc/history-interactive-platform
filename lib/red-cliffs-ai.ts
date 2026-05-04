import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import type {
  EventPlayableContent,
  EventScene,
  EventSceneStandee,
  EventViewpoint,
  PlaceholderAsset,
  RedCliffsAiScriptBeat,
  RedCliffsAiScriptLine,
  RedCliffsAiScriptPackage,
} from "@/types/content";

export const RED_CLIFFS_AI_EVENT_ID = "battle-of-red-cliffs";
export const RED_CLIFFS_AI_DEFAULT_VIEWPOINT_ID = "zhuge-liang";
export const RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS = [
  "zhuge-liang",
  "zhouyu",
  "huang-gai",
] as const;

type SupportedRedCliffsViewpointId =
  (typeof RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS)[number];

const RED_CLIFFS_AI_DEFAULT_MODEL = "Qwen3Flash";
const RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION =
  "red-cliffs-linear-script-v1" as const;

type RedCliffsBeatId =
  | "cao-army-pressure"
  | "alliance-doubt"
  | "joint-decision"
  | "fire-plan-shaping"
  | "huang-gai-preparation"
  | "wind-and-timing"
  | "fire-attack-launch"
  | "battle-turning"
  | "aftermath-review";

type RedCliffsBeatBlueprint = {
  beatId: RedCliffsBeatId;
  title: string;
  backgroundTag: keyof typeof redCliffsAiBackdropMap;
  minLines: number;
  maxLines: number;
  allowNarration: boolean;
};

type RedCliffsViewpointProfile = {
  id: SupportedRedCliffsViewpointId;
  displayName: string;
  title: string;
  narrationRule: string;
  userGoal: string;
  voiceNotes: string[];
  beatGoals: Record<RedCliffsBeatId, string>;
  fallbackBeats: RedCliffsAiScriptBeat[];
};

type RedCliffsAiDebugInfo = {
  requestId: string;
  upstreamUrl: string;
  model: string;
  hasApiKey: boolean;
  apiKeySource: "OPENROUTER_API_KEY" | "API_KEY" | "missing";
  refererHeader: string;
  titleHeader: string;
  requestShape: {
    inputMode: "responses-message-array";
    schemaMode: "text.format.json_schema";
  };
  timings: {
    promptBuildMs?: number;
    upstreamRequestMs?: number;
    extractOutputMs?: number;
    validationMs?: number;
    adaptMs?: number;
    serviceTotalMs?: number;
    routePayloadParsedMs?: number;
    routeTotalMs?: number;
  };
  metrics: {
    historyCount: number;
    historySummaryLength: number;
    systemPromptLength: number;
    userPromptLength: number;
    upstreamOutputLength: number;
    retryCount: number;
    upstreamCallCount: number;
    packageRequestCount?: number;
    packageBeatCount?: number;
    packageLineCount?: number;
    triggerSource?: string;
  };
  upstreamStatus?: number;
  upstreamStatusText?: string;
  upstreamBody?: string;
};

export type RedCliffsAiStoryPackageRequest = {
  eventId: string;
  viewpointId: string;
  clientRequestId?: string;
  triggerSource?: "initial" | "reset";
  clientTriggeredAtMs?: number;
  packageRequestCount?: number;
};

export type RedCliffsAiStoryPackageResponse = {
  ok: boolean;
  scriptPackage?: RedCliffsAiScriptPackage;
  playableContent: EventPlayableContent;
  source: "ai" | "fallback-local";
  warning?: string;
  error?: string;
  debug?: RedCliffsAiDebugInfo;
};

type RedCliffsScriptValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

const redCliffsAiBackdropMap = {
  "river-night": {
    label: "赤壁",
    tone: "ink",
    description:
      "背景占位图：曹军南下后的江面夜色压得很低，真正的危险先落在风向、判断和联军信心上。",
  },
  "command-tent": {
    label: "联营",
    tone: "ink",
    description:
      "背景占位图：军帐、烛火与沙盘挤在同一室内，每一句商议都像在把局势往更窄的地方压。",
  },
  "strategy-table": {
    label: "谋局",
    tone: "amber",
    description:
      "背景占位图：军图摊开，风向、战船、诈降与联军信任被同时摆在案上，没有一步能单独成立。",
  },
  "departure-dock": {
    label: "江岸",
    tone: "crimson",
    description:
      "背景占位图：临行前的江岸安静得过分，真正危险的那一步已经不再是谋划，而是人能不能撑着走出去。",
  },
  "battle-firelight": {
    label: "火势",
    tone: "crimson",
    description:
      "背景占位图：火光沿战船铺开，水陆战局在极短时间里被点亮，也被彻底改写。",
  },
  "embers-aftermath": {
    label: "余烬",
    tone: "amber",
    description:
      "背景占位图：火势过去后，江面仍有余温，真正值得回看的却是火起之前那一连串不肯松手的判断。",
  },
} as const satisfies Record<string, PlaceholderAsset>;

const redCliffsSpeakerNameMap: Record<SupportedRedCliffsViewpointId, string> = {
  "zhuge-liang": "诸葛亮",
  zhouyu: "周瑜",
  "huang-gai": "黄盖",
};

const redCliffsSpeakerVisualKeyMap = {
  周瑜: "zhouyu",
  诸葛亮: "zhuge-liang",
  黄盖: "huang-gai",
} as const;

const allowedSpeakerNames = [
  "周瑜",
  "诸葛亮",
  "黄盖",
  "鲁肃",
  "孙权",
  "曹操",
] as const;

const redCliffsBeatBlueprints: RedCliffsBeatBlueprint[] = [
  {
    beatId: "cao-army-pressure",
    title: "曹军南下，局势压来",
    backgroundTag: "river-night",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "alliance-doubt",
    title: "联盟未稳，先做判断",
    backgroundTag: "command-tent",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "joint-decision",
    title: "孙刘合作与决断压力",
    backgroundTag: "command-tent",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "fire-plan-shaping",
    title: "火攻方案逐渐成形",
    backgroundTag: "strategy-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "huang-gai-preparation",
    title: "黄盖苦肉与执行准备",
    backgroundTag: "departure-dock",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "wind-and-timing",
    title: "时机、风向与真正悬念",
    backgroundTag: "strategy-table",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "fire-attack-launch",
    title: "火攻发动",
    backgroundTag: "battle-firelight",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "battle-turning",
    title: "水陆战局逆转",
    backgroundTag: "battle-firelight",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
  {
    beatId: "aftermath-review",
    title: "战后收束与回看",
    backgroundTag: "embers-aftermath",
    minLines: 2,
    maxLines: 3,
    allowNarration: true,
  },
];

const redCliffsViewpointProfiles: Record<
  SupportedRedCliffsViewpointId,
  RedCliffsViewpointProfile
> = {
  "zhuge-liang": {
    id: "zhuge-liang",
    displayName: "诸葛亮",
    title: "联盟谋臣视角",
    narrationRule:
      "旁白只能写诸葛亮第一视角的观察、判断和对联盟节奏的把握，不写旁观者总结，不写神机妙算式炫技口吻。",
    userGoal:
      "把诸葛亮写成一个始终在看大势、看联盟、看节奏的人，让他既在场，又总比别人先半步看见局势会往哪里压过去。",
    voiceNotes: [
      "更关注联盟关系能否稳住",
      "更关注风向、时机、节奏和全局变化",
      "说话克制、清楚，不夸张，不卖弄",
    ],
    beatGoals: {
      "cao-army-pressure":
        "先写曹军南下后的压迫感，诸葛亮要先从江面、船势和敌军自信里判断这场仗真正难在哪里。",
      "alliance-doubt":
        "把联盟未稳时的试探写出来，重点是诸葛亮如何观察东吴一侧的态度，而不是急着表现自己。",
      "joint-decision":
        "让诸葛亮感到孙刘合作正在成形，但真正的压力在于每一步都必须被彼此相信。",
      "fire-plan-shaping":
        "把火攻从一个点子写成逐渐成形的办法，突出诸葛亮对整体节奏和时机链条的判断。",
      "huang-gai-preparation":
        "让诸葛亮看见黄盖把最险的一步接过去，重点是他如何判断这一步对全局既危险又必要。",
      "wind-and-timing":
        "强化诸葛亮对风向、默契和临门一脚的判断感，让悬念来自时机能不能真的落到同一刻。",
      "fire-attack-launch":
        "写火攻发动时诸葛亮的冷静与压住呼吸的感觉，不要写成热血喊话。",
      "battle-turning":
        "让诸葛亮看到战局逆转时，注意力仍然放在局面变化和后续收口，而不是只看眼前火势。",
      "aftermath-review":
        "收束时要像回看一整段历史推进，强调真正决定赤壁的不是某一把火，而是之前每一步怎么被压成同一个结局。",
    },
    fallbackBeats: [
      {
        beatId: "cao-army-pressure",
        lines: [
          {
            speaker: "",
            text: "曹军南下的消息沿江一路压过来时，最令人不安的还不是敌军有多少船，而是这一场仗会不会逼得所有人都来不及把心思放到同一个地方。",
          },
          {
            speaker: "",
            text: "我站在江边看着夜色和水势，只觉得真正的难处，从来不在火起之后，而在火起之前有没有人先把局势看透。",
          },
        ],
      },
      {
        beatId: "alliance-doubt",
        lines: [
          {
            speaker: "鲁肃",
            text: "眼下最怕的不是不能联手，而是谁都知道该联，却谁都不肯先把心思交出来。",
          },
          {
            speaker: "",
            text: "我听着这句话，心里更清楚，赤壁的第一道关口根本不在江面，而在盟友彼此之间那层还没彻底落定的疑心。",
          },
        ],
      },
      {
        beatId: "joint-decision",
        lines: [
          {
            speaker: "周瑜",
            text: "若要打，就不能只凭一时血气。联军一旦出手，每一步都得像本来就该这样落下来。",
          },
          {
            speaker: "诸葛亮",
            text: "真正要稳的不是一句主张，而是让彼此都明白，这场合作必须在最紧的时候也不散。",
          },
        ],
      },
      {
        beatId: "fire-plan-shaping",
        lines: [
          {
            speaker: "",
            text: "火攻最初还只是桌上一种可能，可当船阵、风向和敌军的松懈被一层层连起来，它就慢慢不再像险招，而更像唯一能把局势翻转过来的路。",
          },
          {
            speaker: "诸葛亮",
            text: "计策从来不是一句话就能成，真正能成的是让每一环都在对的时候碰上下一环。",
          },
        ],
      },
      {
        beatId: "huang-gai-preparation",
        lines: [
          {
            speaker: "黄盖",
            text: "若这一步总要有人去做，那就让我去。只要我把险象做真，对面就会替我们把门打开。",
          },
          {
            speaker: "",
            text: "我看着他把最危险的话说得平稳，心里反而更紧，因为我知道从这一刻起，纸上的谋划已经开始往真人身上落。",
          },
        ],
      },
      {
        beatId: "wind-and-timing",
        lines: [
          {
            speaker: "",
            text: "越临近动手，越能感觉到真正的悬念不在敢不敢烧，而在风向、军心与船势能不能在同一刻替我们说话。",
          },
          {
            speaker: "诸葛亮",
            text: "只要有人早一步，或有人慢一步，这一场本能成的局，就会先在自己人手里散掉。",
          },
        ],
      },
      {
        beatId: "fire-attack-launch",
        lines: [
          {
            speaker: "",
            text: "江风转过来的那一瞬，我反而安静下来。之前所有分散的判断都在这一刻被压成同一个答案：现在，终于能动。",
          },
          {
            speaker: "周瑜",
            text: "到这里，犹豫才最伤局。既然各处都已落位，就让这一把火顺着势头直压过去。",
          },
        ],
      },
      {
        beatId: "battle-turning",
        lines: [
          {
            speaker: "",
            text: "火势一起，江面上原本还稳着的形势忽然像被撕开。船阵乱了，人的心也开始跟着乱，战局终于不再朝曹军那一边站着。",
          },
          {
            speaker: "曹操",
            text: "一夜之间，原本可控的水军竟先在自己脚下失了形，这比火本身更叫人心惊。",
          },
        ],
      },
      {
        beatId: "aftermath-review",
        lines: [
          {
            speaker: "",
            text: "等火光从眼前退下去，我反而更清楚地看见，赤壁最惊险的部分并不是燃烧的那一刻，而是之前每一步都不能松手的那段时间。",
          },
          {
            speaker: "诸葛亮",
            text: "真正决定胜负的，从来不是最后那一下看得见的响动，而是所有人愿不愿在它来之前，把判断一起压到同一个方向上。",
          },
        ],
      },
    ],
  },
  zhouyu: {
    id: "zhouyu",
    displayName: "周瑜",
    title: "联军主帅视角",
    narrationRule:
      "旁白只能写周瑜第一视角对军心、联盟、执行与成败压力的判断，不写旁观式解说，不写夸张英雄口吻。",
    userGoal:
      "把周瑜写成真正扛着整场胜负的人，让他每一段都更接近主导者、统帅和拍板者的压力感。",
    voiceNotes: [
      "更关注局面控制和成败责任",
      "更在意命令是否成立、军心是否跟上",
      "说话应带主导感，但仍然克制",
    ],
    beatGoals: {
      "cao-army-pressure":
        "先写周瑜如何看待曹军南下带来的压迫，不只看敌情，更要写他对己方军心和节奏的敏感。",
      "alliance-doubt":
        "让周瑜面对联盟未稳时的试探，突出他明知要合作，却不能先丢掉主导权的压力。",
      "joint-decision":
        "把周瑜拍板的压力写清楚，让合作不是空口同盟，而是一步步真的要由他负责落下去。",
      "fire-plan-shaping":
        "让周瑜看到火攻方案逐步成形时，更关注的是它能不能真正执行，而不是它听起来多漂亮。",
      "huang-gai-preparation":
        "写周瑜如何衡量黄盖以身入局这一步，重点是统帅必须承担让别人去赴险的压力。",
      "wind-and-timing":
        "强化周瑜对时机、军令和全军同步的焦虑，他不是在等一个传说中的天时，而是在等能下令的一刻。",
      "fire-attack-launch":
        "火攻发动时，周瑜要像一个终于把全局压到同一拍上的统帅，不要写成简单喝令。",
      "battle-turning":
        "战局逆转时，重点是周瑜如何继续盯住局面，不让刚到手的优势重新散掉。",
      "aftermath-review":
        "收束时让周瑜回看自己承担的整场压力，强调胜负不只是火成不成，而是联盟、军令和人心有没有先被压稳。",
    },
    fallbackBeats: [
      {
        beatId: "cao-army-pressure",
        lines: [
          {
            speaker: "",
            text: "曹军南下的消息像潮水一样压过来时，我最怕的不是敌军兵多，而是己方有人还把这场仗当成迟早要打的一战，没有意识到它已经逼到了眼前。",
          },
          {
            speaker: "",
            text: "身为主将，最先压到肩上的从来不是刀兵，而是所有人都等着看我会不会先乱了节奏。",
          },
        ],
      },
      {
        beatId: "alliance-doubt",
        lines: [
          {
            speaker: "鲁肃",
            text: "要联刘抗曹，眼下最难的是彼此都明白道理，却都不愿先把底牌亮得太彻底。",
          },
          {
            speaker: "",
            text: "我知道这话没错。要合作，但也不能让东吴的主导权在第一步就松掉，这才是眼下真正难拿捏的地方。",
          },
        ],
      },
      {
        beatId: "joint-decision",
        lines: [
          {
            speaker: "周瑜",
            text: "若要联手，就得把每一步都算到能落地为止。合作不是口头一句应承，而是之后所有命令都要真有人去接。",
          },
          {
            speaker: "诸葛亮",
            text: "只要有人肯把局面先压稳，后面的判断就不再只是冒险，而会慢慢变成顺势。",
          },
        ],
      },
      {
        beatId: "fire-plan-shaping",
        lines: [
          {
            speaker: "",
            text: "火攻不是谁灵光一闪的巧计。要让它成，就得让战船、江风、敌军的松懈和我军的配合，一层一层都落到实处。",
          },
          {
            speaker: "周瑜",
            text: "我宁愿把这局想慢一点，也不肯让一个听起来聪明、却走不完的法子把全军带进水里。",
          },
        ],
      },
      {
        beatId: "huang-gai-preparation",
        lines: [
          {
            speaker: "黄盖",
            text: "若这一步非得有人先走出去，那就让我去。只要对面真信了，后面的火才有地方落。",
          },
          {
            speaker: "",
            text: "我听着他请命，心里明白这不是一句慷慨之言，而是我要亲手点头、让别人拿命去补上的一环。",
          },
        ],
      },
      {
        beatId: "wind-and-timing",
        lines: [
          {
            speaker: "",
            text: "越临近动手，我越清楚这场仗最不能出错的不是胆气，而是节拍。风向若错，军心若散，连最好的谋划也只会烂在半路。",
          },
          {
            speaker: "周瑜",
            text: "不到所有人都能跟上同一条命令的那一刻，我宁可继续压着，也不会让这一步仓促落下去。",
          },
        ],
      },
      {
        beatId: "fire-attack-launch",
        lines: [
          {
            speaker: "",
            text: "风终于顺了，我反倒比先前更平静。等了这么久，真正需要的不是激烈，而是把这一声令下得没有丝毫迟疑。",
          },
          {
            speaker: "周瑜",
            text: "各船齐动，别给曹军留半口喘息的工夫。今天这把火，不是为了虚张声势，是为了把战局一次压过去。",
          },
        ],
      },
      {
        beatId: "battle-turning",
        lines: [
          {
            speaker: "",
            text: "火势铺开之后，江面很快就不再是先前那个局面。敌军的船阵乱了，原本压在我方头上的那股气，也终于被硬生生掀了过去。",
          },
          {
            speaker: "周瑜",
            text: "别只顾着看火，乘势追上去。真正的胜势，是在对面先乱的时候，把我们自己的人继续压稳。",
          },
        ],
      },
      {
        beatId: "aftermath-review",
        lines: [
          {
            speaker: "",
            text: "等火势渐远，我心里反而更清楚，这一战真正压人的地方，不是最后燃起来时有多壮观，而是之前每一步都不能松手的那口气。",
          },
          {
            speaker: "周瑜",
            text: "若没有先把联盟、军令和人心拧在一处，哪怕真的等到了东风，这把火也未必烧得成今天这个局面。",
          },
        ],
      },
    ],
  },
  "huang-gai": {
    id: "huang-gai",
    displayName: "黄盖",
    title: "火攻执行者视角",
    narrationRule:
      "旁白只能写黄盖第一视角的风险感、执行压力和临阵判断，不写外部总结，不写慷慨陈词式悲壮腔。",
    userGoal:
      "把黄盖写成真正要把最危险一步走出去的人，让他的故事重点落在执行风险、身体承受和撑到最后一刻的压力上。",
    voiceNotes: [
      "更关注自己是否会先露出破绽",
      "更关注行动能否真的走到最后一步",
      "语气要硬，但不是喊口号",
    ],
    beatGoals: {
      "cao-army-pressure":
        "先写黄盖对曹军南下和大战将近的直觉压力，他看到的不是抽象大势，而是越来越近的危险任务。",
      "alliance-doubt":
        "让黄盖在旁听联盟定调时，感到这场合作最后会怎么落到执行层面，重点是他开始意识到自己可能要被推到最前面。",
      "joint-decision":
        "写黄盖看着上层做判断时，对自己将来要承担哪一步产生越来越具体的预感。",
      "fire-plan-shaping":
        "让黄盖理解火攻方案不是纸面奇谋，而是一件一旦轮到执行就不能出一点差错的事。",
      "huang-gai-preparation":
        "这是黄盖的关键 beat，要真正写出他接下这一步，并把赴险说得稳，而不是只做工具人说明。",
      "wind-and-timing":
        "强化黄盖对细节、时机和破绽的紧绷感，悬念来自他知不知道自己只要错半步就会先死在局里。",
      "fire-attack-launch":
        "写黄盖真正把自己送进火攻链条时的压抑和决绝，不要写成空泛壮烈。",
      "battle-turning":
        "战局逆转时，黄盖首先感到的不是宏大战报，而是那一步真的没有白走，自己撑过去了。",
      "aftermath-review":
        "收束时让黄盖回看这场火攻，强调真正危险的不是计划听起来有多险，而是人能不能把它一步不差地做完。",
    },
    fallbackBeats: [
      {
        beatId: "cao-army-pressure",
        lines: [
          {
            speaker: "",
            text: "曹军还没压到眼前时，江上的风就已经让人不安。对我来说，这场仗最先逼过来的不是战报，而是那种迟早会轮到自己去做最险一环的直觉。",
          },
          {
            speaker: "",
            text: "越是大战将起，越不能拿胆气骗自己。真正会要命的，从来不是嘴上敢不敢，而是临到身上时能不能一寸不差地撑住。",
          },
        ],
      },
      {
        beatId: "alliance-doubt",
        lines: [
          {
            speaker: "鲁肃",
            text: "孙刘若不能先稳住彼此，后面就算真有办法，也只会卡在半路上。",
          },
          {
            speaker: "",
            text: "我站在一旁听着这些话，心里却越来越明白，等上面把合作定下来，最危险的那一步多半还是要有人亲自扛出去。",
          },
        ],
      },
      {
        beatId: "joint-decision",
        lines: [
          {
            speaker: "周瑜",
            text: "这场仗不是只靠一条计策撑起来的，真正难的是让每个环节都有人敢接，也有人能接住。",
          },
          {
            speaker: "",
            text: "我听着主将拍板，忽然更清楚自己在这局里的位置。上面每定下一步，离我要走出去的时候就更近一点。",
          },
        ],
      },
      {
        beatId: "fire-plan-shaping",
        lines: [
          {
            speaker: "",
            text: "火攻在旁人嘴里像是一招妙计，可落到我心里，它先是一长串不能出错的细节：船要怎么靠，话要怎么说，脸上不能露出哪一寸不稳。",
          },
          {
            speaker: "黄盖",
            text: "若只是会说这法子能成，那还不算本事。真本事是在轮到自己上船时，还能把该做的都做得像早想明白了一样。",
          },
        ],
      },
      {
        beatId: "huang-gai-preparation",
        lines: [
          {
            speaker: "黄盖",
            text: "既然这一步非得有人真去送上门，我就去。不是我看轻生死，是这局走到这里，总得有人先拿自己的身子去把门撞开。",
          },
          {
            speaker: "周瑜",
            text: "你若去了，就不是做做样子。要骗过曹军，就得先把自己压到连我们的人都挑不出破绽。",
          },
        ],
      },
      {
        beatId: "wind-and-timing",
        lines: [
          {
            speaker: "",
            text: "越到临行前，心反而越不能乱。风向、船距、对面的戒心，任何一样没踩准，我就会先死在还没起火的时候。",
          },
          {
            speaker: "黄盖",
            text: "这时候最怕的不是风不来，而是自己先在脸上露了怯。只要被对面多看出半分，这局就会先从我这里断掉。",
          },
        ],
      },
      {
        beatId: "fire-attack-launch",
        lines: [
          {
            speaker: "",
            text: "真到了登船那一刻，我反而不再去想之后能不能活着回来。人一旦把自己放进这局里，先顾着想退路，脚底就会先软。",
          },
          {
            speaker: "黄盖",
            text: "把船推过去。只要还能往前再撑半刻，这把火就有机会替我们把后面的路全烧开。",
          },
        ],
      },
      {
        beatId: "battle-turning",
        lines: [
          {
            speaker: "",
            text: "火势一起，最先撞上心口的不是痛快，而是一口终于松下来又不敢真松的气。那一步总算没有白走，江上的局也真的开始倒过去了。",
          },
          {
            speaker: "曹操",
            text: "原以为只是几只来降的船，没想到真正扑过来的，是整片来不及回身的火。",
          },
        ],
      },
      {
        beatId: "aftermath-review",
        lines: [
          {
            speaker: "",
            text: "等到战后再回看，我才更明白，赤壁最险的不是火起那刻有多烈，而是人在火起之前，能不能把每一步都忍着、熬着、做到底。",
          },
          {
            speaker: "黄盖",
            text: "纸上的谋划再好，也得有人把它一步一步走成真的。若临到最后先缩了手，再大的局也只会剩下一张空图。",
          },
        ],
      },
    ],
  },
};

const allowedSpeakerNameSet = new Set<string>(allowedSpeakerNames);

function isRedCliffsAiSupportedViewpoint(
  viewpointId?: string,
): viewpointId is SupportedRedCliffsViewpointId {
  return RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS.includes(
    viewpointId as SupportedRedCliffsViewpointId,
  );
}

function getRedCliffsPlayableBase(): EventPlayableContent {
  const playableContent = getEventPlayableContent(RED_CLIFFS_AI_EVENT_ID);
  if (!playableContent) {
    throw new Error("Missing red cliffs playable content.");
  }

  return playableContent;
}

function getRedCliffsAiViewpoint(
  viewpointId: SupportedRedCliffsViewpointId,
): EventViewpoint {
  const viewpoint = getRedCliffsPlayableBase().viewpoints.find(
    (item) => item.id === viewpointId,
  );

  if (!viewpoint) {
    throw new Error(`Missing red cliffs AI viewpoint: ${viewpointId}.`);
  }

  return viewpoint;
}

function getRedCliffsViewpointProfile(
  viewpointId: SupportedRedCliffsViewpointId,
) {
  return redCliffsViewpointProfiles[viewpointId];
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function createRedCliffsAiRequestId() {
  return `red-cliffs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAiConfig() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const aiApiKey = process.env.AI_API_KEY?.trim();
  const apiKey = openRouterApiKey || aiApiKey || "";
  const apiKeySource: RedCliffsAiDebugInfo["apiKeySource"] = openRouterApiKey
    ? "OPENROUTER_API_KEY"
    : aiApiKey
      ? "API_KEY"
      : "missing";

  return {
    apiKey,
    apiKeySource,
    model:
      process.env.OPENROUTER_MODEL?.trim() ||
      process.env.AI_MODEL?.trim() ||
      RED_CLIFFS_AI_DEFAULT_MODEL,
    upstreamUrl:
      process.env.OPENROUTER_RESPONSES_URL?.trim() ||
      "https://yunwu.ai/v1/responses",
    refererHeader:
      process.env.OPENROUTER_REFERER?.trim() || "http://localhost:3000",
    titleHeader:
      process.env.OPENROUTER_TITLE?.trim() || "History Interactive Platform",
  };
}

function createRedCliffsAiDebugInfo(config = getAiConfig()): RedCliffsAiDebugInfo {
  return {
    requestId: "",
    upstreamUrl: config.upstreamUrl,
    model: config.model,
    hasApiKey: !!config.apiKey,
    apiKeySource: config.apiKeySource,
    refererHeader: config.refererHeader,
    titleHeader: config.titleHeader,
    requestShape: {
      inputMode: "responses-message-array",
      schemaMode: "text.format.json_schema",
    },
    timings: {},
    metrics: {
      historyCount: 0,
      historySummaryLength: 0,
      systemPromptLength: 0,
      userPromptLength: 0,
      upstreamOutputLength: 0,
      retryCount: 0,
      upstreamCallCount: 0,
    },
  };
}

async function readResponseBody(response: Response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const response = payload as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const textFragments =
    response.output
      ?.flatMap((item) =>
        item.content
          ?.filter((content) => content.type === "output_text")
          .map((content) => content.text ?? "") ?? [],
      )
      .join("") ?? "";

  return textFragments.trim();
}

function serializeBeatBlueprints(viewpointId: SupportedRedCliffsViewpointId) {
  const profile = getRedCliffsViewpointProfile(viewpointId);

  return redCliffsBeatBlueprints
    .map((beat, index) =>
      [
        `${index + 1}. beatId=${beat.beatId}`,
        `title=${beat.title}`,
        `goal=${profile.beatGoals[beat.beatId]}`,
        `lineRange=${beat.minLines}-${beat.maxLines}`,
        `allowNarration=${beat.allowNarration ? "true" : "false"}`,
        `allowedDialogueSpeakers=${allowedSpeakerNames.join(" / ")}`,
        `backgroundHandledLocally=${beat.backgroundTag}`,
      ].join(" | "),
    )
    .join("\n");
}

function buildRedCliffsStoryPackagePrompt(
  params: RedCliffsAiStoryPackageRequest & {
    viewpointId: SupportedRedCliffsViewpointId;
  },
) {
  const viewpoint = getRedCliffsAiViewpoint(params.viewpointId);
  const eventItem = getHistoricalEvent(RED_CLIFFS_AI_EVENT_ID);
  const profile = getRedCliffsViewpointProfile(params.viewpointId);

  if (!eventItem) {
    throw new Error("Missing red cliffs event.");
  }

  const systemPrompt = [
    "You generate one fixed-route script package for a Chinese historical AVG experience.",
    "Output only strict JSON that follows the provided schema.",
    "Write all text in Simplified Chinese.",
    "Do not output layout, UI, CSS, camera language, file paths, asset filenames, choices, nextSceneId, backgroundTag, standeeKey, or state updates.",
    `The event is ${eventItem.title} and the fixed first-person viewpoint is ${profile.displayName}.`,
    "This is a single linear route with no player branching.",
    "The final result must read like a complete historical story with clear progression, not like a summary, outline, or recap.",
    "Each beat should feel like the next layer of the same event pressing forward.",
    "Keep the tone tense, restrained, natural, and readable for general users.",
    "You may let supporting historical figures appear briefly in dialogue if needed, but only from the allowed speaker list.",
    "Narration rules:",
    "- narration uses empty speaker.",
    `- ${profile.narrationRule}`,
    "- narration should feel like first-person observation, pressure, and judgment from this viewpoint.",
    "- no quoted dialogue in narration.",
    "- each narration line should be short but complete, with atmosphere and information, not a fragment.",
    "- a natural target is around 35 to 90 Chinese characters.",
    "Dialogue rules:",
    "- each line contains only one speaker talking.",
    "- dialogue should sound like a full spoken sentence or two linked short spoken sentences.",
    "- no action description, no crowd summary, no narrator explanation mixed into dialogue.",
    "- a natural target is around 18 to 48 Chinese characters.",
    "- if a speaker needs more words, split into multiple short lines.",
    `Characters allowed to speak are only ${allowedSpeakerNames.join("、")}。`,
    "Story rhythm rules:",
    "- return all beats in the fixed order exactly once.",
    "- let the story unfold gradually beat by beat.",
    "- avoid repeating the same sentence pattern in every beat.",
    "- avoid abstract slogans and empty summarizing lines.",
    `The viewpoint should keep these traits: ${profile.voiceNotes.join("；")}。`,
  ].join("\n");

  const userPrompt = [
    `Event title: ${eventItem.title}`,
    `Event summary: ${eventItem.description}`,
    `Fixed viewpoint: ${viewpoint.name}`,
    `Viewpoint role: ${viewpoint.title}`,
    `Viewpoint note: ${viewpoint.summary}`,
    `Story goal: ${profile.userGoal}`,
    `Required protocolVersion: ${RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION}`,
    `Required viewpointId: ${params.viewpointId}`,
    `Required beat plan:\n${serializeBeatBlueprints(params.viewpointId)}`,
    `Client trigger source: ${params.triggerSource ?? "initial"}`,
    "The program controls background switches, standee choice, scene progression, and ending locally.",
    "Do not omit any beat.",
    "This route should feel like reading a compact historical novella scene-by-scene, not like reading a product summary.",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function requestStructuredRedCliffsScriptPackage(params: {
  request: RedCliffsAiStoryPackageRequest & {
    viewpointId: SupportedRedCliffsViewpointId;
  };
  requestId: string;
}): Promise<{
  scriptPackage: RedCliffsAiScriptPackage;
  debug: RedCliffsAiDebugInfo;
}> {
  const config = getAiConfig();
  const { apiKey, model, upstreamUrl, refererHeader, titleHeader } = config;
  const debug = createRedCliffsAiDebugInfo(config);

  if (!apiKey) {
    throw new Error(
      "AIkey丢失，重新配置API_KEY 环境变量后再试。",
    );
  }

  const promptStart = performance.now();
  const { systemPrompt, userPrompt } = buildRedCliffsStoryPackagePrompt(
    params.request,
  );
  debug.requestId = params.requestId;
  debug.metrics.systemPromptLength = systemPrompt.length;
  debug.metrics.userPromptLength = userPrompt.length;
  debug.metrics.retryCount = 0;
  debug.metrics.upstreamCallCount = 1;
  debug.metrics.packageRequestCount = params.request.packageRequestCount;
  debug.metrics.packageBeatCount = redCliffsBeatBlueprints.length;
  debug.metrics.triggerSource = params.request.triggerSource;
  debug.timings.promptBuildMs = Number(
    (performance.now() - promptStart).toFixed(1),
  );

  const upstreamStart = performance.now();
  const response = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": refererHeader,
      "X-OpenRouter-Title": titleHeader,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          type: "message",
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "red_cliffs_linear_script_package",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "packageId",
              "storyId",
              "protocolVersion",
              "viewpointId",
              "beats",
            ],
            properties: {
              packageId: { type: "string" },
              storyId: { type: "string" },
              protocolVersion: {
                type: "string",
                enum: [RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION],
              },
              viewpointId: {
                type: "string",
                enum: [...RED_CLIFFS_AI_SUPPORTED_VIEWPOINT_IDS],
              },
              beats: {
                type: "array",
                minItems: redCliffsBeatBlueprints.length,
                maxItems: redCliffsBeatBlueprints.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["beatId", "lines"],
                  properties: {
                    beatId: {
                      type: "string",
                      enum: redCliffsBeatBlueprints.map((beat) => beat.beatId),
                    },
                    lines: {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["speaker", "text"],
                        properties: {
                          speaker: { type: "string" },
                          text: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const upstreamBody = await readResponseBody(response);
    debug.timings.upstreamRequestMs = Number(
      (performance.now() - upstreamStart).toFixed(1),
    );
    debug.upstreamStatus = response.status;
    debug.upstreamStatusText = response.statusText;
    debug.upstreamBody = upstreamBody;

    throw new Error(
      `Upstream request failed with status ${response.status} ${response.statusText}. Body: ${
        upstreamBody || "(empty body)"
      }`,
    );
  }

  debug.timings.upstreamRequestMs = Number(
    (performance.now() - upstreamStart).toFixed(1),
  );
  const extractStart = performance.now();
  const payload = (await response.json()) as unknown;
  const outputText = extractResponseText(payload);

  if (!outputText) {
    throw new Error("AI结构化输出为空。");
  }

  debug.metrics.upstreamOutputLength = outputText.length;
  debug.timings.extractOutputMs = Number(
    (performance.now() - extractStart).toFixed(1),
  );

  return {
    scriptPackage: JSON.parse(outputText) as RedCliffsAiScriptPackage,
    debug,
  };
}

function normalizeRedCliffsScriptLine(
  line: RedCliffsAiScriptLine,
): RedCliffsAiScriptLine {
  return {
    speaker: line.speaker.trim(),
    text: normalizeText(line.text),
  };
}

function normalizeRedCliffsScriptPackage(
  scriptPackage: RedCliffsAiScriptPackage,
): RedCliffsAiScriptPackage {
  return {
    packageId: scriptPackage.packageId.trim(),
    storyId: scriptPackage.storyId.trim(),
    protocolVersion: scriptPackage.protocolVersion,
    viewpointId: scriptPackage.viewpointId.trim(),
    beats: scriptPackage.beats.map((beat) => ({
      beatId: beat.beatId.trim() as RedCliffsBeatId,
      lines: beat.lines.map(normalizeRedCliffsScriptLine),
    })),
  };
}

function validateRedCliffsScriptPackage(
  scriptPackage: RedCliffsAiScriptPackage,
  viewpointId: SupportedRedCliffsViewpointId,
): RedCliffsScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const quotePattern = /["“”‘’「」『』]/;
  const dialogueNarrationPattern =
    /(你看见|你听见|你察觉|众人|周围|四下|江面|军帐里|身后|此刻|这一瞬|火光照亮|战局正在)/;

  if (!scriptPackage.packageId) {
    errors.push("packageId 不能为空。");
  }
  if (!scriptPackage.storyId) {
    errors.push("storyId 不能为空。");
  }
  if (scriptPackage.protocolVersion !== RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION) {
    errors.push(
      `protocolVersion 必须是 ${RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION}。`,
    );
  }
  if (scriptPackage.viewpointId !== viewpointId) {
    errors.push(`viewpointId 必须是 ${viewpointId}。`);
  }
  if (scriptPackage.beats.length !== redCliffsBeatBlueprints.length) {
    errors.push(`beat 数量必须是 ${redCliffsBeatBlueprints.length}。`);
  }

  redCliffsBeatBlueprints.forEach((blueprint, index) => {
    const beat = scriptPackage.beats[index];
    if (!beat) {
      errors.push(`缺少关键 beat：${blueprint.beatId}`);
      return;
    }

    if (beat.beatId !== blueprint.beatId) {
      errors.push(`第 ${index + 1} 个 beat 必须是 ${blueprint.beatId}。`);
    }

    if (beat.lines.length === 0) {
      errors.push(`${blueprint.beatId} 不能为空。`);
    } else if (
      beat.lines.length < blueprint.minLines ||
      beat.lines.length > blueprint.maxLines
    ) {
      warnings.push(
        `${blueprint.beatId} 的 line 数量偏离推荐范围 ${blueprint.minLines}-${blueprint.maxLines}。`,
      );
    }

    beat.lines.forEach((line, lineIndex) => {
      if (!line.text) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 text 不能为空。`,
        );
        return;
      }

      if (!line.speaker) {
        if (!blueprint.allowNarration) {
          errors.push(`${blueprint.beatId} 不允许使用空 speaker 旁白。`);
        }
        if (quotePattern.test(line.text)) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白里出现了引号对白，建议改成纯第一视角叙述。`,
          );
        }
        if (line.text.length < 28) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏短，建议补足一点局势感、环境感或心理感。`,
          );
        }
        if (line.text.length > 110) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白偏长，建议拆成更像 AVG 的两条短幕。`,
          );
        }
        if (line.text.split("\n").length > 3) {
          warnings.push(
            `${blueprint.beatId} 第 ${lineIndex + 1} 条旁白换行较多，建议收得更紧一些。`,
          );
        }
        return;
      }

      if (!allowedSpeakerNameSet.has(line.speaker)) {
        errors.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 line 的 speaker 只能是 ${allowedSpeakerNames.join(" / ")}。`,
        );
      }
      if (line.text.length < 12) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏短，建议写成更完整的一句人话。`,
        );
      }
      if (line.text.length > 60) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 偏长，建议拆成两条短 line。`,
        );
      }
      if (line.text.includes("\n")) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 出现了换行，建议收成单条对白。`,
        );
      }
      if (quotePattern.test(line.text)) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 内又嵌套了引号，建议改得更自然。`,
        );
      }
      if (dialogueNarrationPattern.test(line.text)) {
        warnings.push(
          `${blueprint.beatId} 第 ${lineIndex + 1} 条 dialogue 带有旁白或环境描述味道，建议收得更像人物说话。`,
        );
      }
    });
  });

  const totalLines = scriptPackage.beats.reduce(
    (sum, beat) => sum + beat.lines.length,
    0,
  );
  if (totalLines < 18 || totalLines > 24) {
    warnings.push("总 line 数量偏离推荐范围 18-24。");
  }

  const selectedSpeakerName = redCliffsSpeakerNameMap[viewpointId];
  const selectedViewpointDialogueCount = scriptPackage.beats.reduce(
    (sum, beat) =>
      sum +
      beat.lines.filter((line) => line.speaker === selectedSpeakerName).length,
    0,
  );

  if (selectedViewpointDialogueCount === 0) {
    warnings.push(
      `当前脚本里 ${selectedSpeakerName} 还没有明确发言，建议至少保留两条以上体现视角差异的对白。`,
    );
  } else if (selectedViewpointDialogueCount < 2) {
    warnings.push(
      `${selectedSpeakerName} 的发言仍然偏少，建议再补一两条更能体现其位置和压力的对白。`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function formatRedCliffsScriptValidation(
  result: RedCliffsScriptValidationResult,
) {
  return [...result.errors, ...result.warnings].join(" ");
}

function formatRedCliffsWarningSummary(warnings: string[]) {
  if (warnings.length === 0) {
    return undefined;
  }

  return `调试信息：AI输出存在 ${warnings.length} 条 warning`;
}

function createSceneStandee(speaker: string): EventSceneStandee {
  if (!speaker) {
    return {
      mode: "hidden",
      hideForViewpoint: true,
    };
  }

  const visualKey =
    redCliffsSpeakerVisualKeyMap[
      speaker as keyof typeof redCliffsSpeakerVisualKeyMap
    ];

  if (!visualKey) {
    return {
      mode: "hidden",
    };
  }

  return {
    mode: "speaker",
    visualKey,
    hideForViewpoint: true,
  };
}

function adaptRedCliffsScriptPackageToPlayableContent(
  scriptPackage: RedCliffsAiScriptPackage,
  contentSource: EventPlayableContent["contentSource"] = "ai-structured",
): EventPlayableContent {
  const base = getRedCliffsPlayableBase();
  const flattened = scriptPackage.beats.flatMap((beat, beatIndex) => {
    const blueprint = redCliffsBeatBlueprints[beatIndex];

    return beat.lines.map((line, lineIndex) => {
      const sceneId = `${blueprint.beatId}-${lineIndex + 1}`;

      return {
        sceneId,
        type: line.speaker ? "dialogue" : "narration",
        speaker: line.speaker,
        speakerId:
          redCliffsSpeakerVisualKeyMap[
            line.speaker as keyof typeof redCliffsSpeakerVisualKeyMap
          ] ?? (line.speaker ? undefined : "narration"),
        text: line.text,
        background: redCliffsAiBackdropMap[blueprint.backgroundTag],
        standee: createSceneStandee(line.speaker),
      } satisfies EventScene;
    });
  });

  const scenes = flattened.map((scene, index) => ({
    ...scene,
    nextSceneId: flattened[index + 1]?.sceneId,
  }));

  return {
    protocolVersion: "event-story-v1",
    contentSource,
    eventId: RED_CLIFFS_AI_EVENT_ID,
    initialSceneId: scenes[0]?.sceneId ?? base.initialSceneId,
    defaultBackdrop: base.defaultBackdrop,
    viewpoints: base.viewpoints,
    scenes,
    speakerVisuals: base.speakerVisuals,
  };
}

function createFallbackScriptPackage(
  viewpointId: SupportedRedCliffsViewpointId,
): RedCliffsAiScriptPackage {
  const profile = getRedCliffsViewpointProfile(viewpointId);

  return {
    packageId: `red-cliffs-fallback-${viewpointId}`,
    storyId: `red-cliffs-${viewpointId}`,
    protocolVersion: RED_CLIFFS_AI_SCRIPT_PROTOCOL_VERSION,
    viewpointId,
    beats: profile.fallbackBeats,
  };
}

function getFallbackPlayableContent(viewpointId: string) {
  if (!isRedCliffsAiSupportedViewpoint(viewpointId)) {
    return getRedCliffsPlayableBase();
  }

  return adaptRedCliffsScriptPackageToPlayableContent(
    createFallbackScriptPackage(viewpointId),
    "local-scripted",
  );
}

export function shouldUseRedCliffsAiMode(eventId: string, viewpointId?: string) {
  const normalizedViewpointId =
    viewpointId?.trim() || RED_CLIFFS_AI_DEFAULT_VIEWPOINT_ID;
  return (
    eventId === RED_CLIFFS_AI_EVENT_ID &&
    isRedCliffsAiSupportedViewpoint(normalizedViewpointId)
  );
}

export function getRedCliffsAiInitialViewpointId() {
  return RED_CLIFFS_AI_DEFAULT_VIEWPOINT_ID;
}

export async function generateRedCliffsAiStoryPackage(
  params: RedCliffsAiStoryPackageRequest,
): Promise<RedCliffsAiStoryPackageResponse> {
  const serviceStart = performance.now();
  const fallbackPlayableContent = getFallbackPlayableContent(params.viewpointId);

  if (
    params.eventId !== RED_CLIFFS_AI_EVENT_ID ||
    !isRedCliffsAiSupportedViewpoint(params.viewpointId)
  ) {
    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      error:
        "当前只支持赤壁之战的诸葛亮、周瑜、黄盖三条 AI 线性脚本主路径。",
    };
  }

  try {
    const requestId =
      params.clientRequestId?.trim() || createRedCliffsAiRequestId();
    const { scriptPackage, debug } =
      await requestStructuredRedCliffsScriptPackage({
        request: {
          ...params,
          viewpointId: params.viewpointId,
        },
        requestId,
      });

    const normalizedPackage = normalizeRedCliffsScriptPackage(scriptPackage);
    const validationStart = performance.now();
    const validation = validateRedCliffsScriptPackage(
      normalizedPackage,
      params.viewpointId,
    );
    debug.timings.validationMs = Number(
      (performance.now() - validationStart).toFixed(1),
    );

    if (!validation.ok) {
      debug.timings.serviceTotalMs = Number(
        (performance.now() - serviceStart).toFixed(1),
      );

      return {
        ok: false,
        source: "fallback-local",
        playableContent: fallbackPlayableContent,
        warning: "AI 线性脚本结构不合法，已切回本地静态剧情。",
        error: formatRedCliffsScriptValidation(validation),
        debug,
      };
    }

    const adaptStart = performance.now();
    const adaptedPlayableContent =
      adaptRedCliffsScriptPackageToPlayableContent(normalizedPackage);
    debug.metrics.packageLineCount = normalizedPackage.beats.reduce(
      (sum, beat) => sum + beat.lines.length,
      0,
    );
    debug.timings.adaptMs = Number((performance.now() - adaptStart).toFixed(1));
    debug.timings.serviceTotalMs = Number(
      (performance.now() - serviceStart).toFixed(1),
    );

    return {
      ok: true,
      source: "ai",
      scriptPackage: normalizedPackage,
      playableContent: adaptedPlayableContent,
      warning:
        validation.warnings.length > 0
          ? formatRedCliffsWarningSummary(validation.warnings)
          : undefined,
      debug,
    };
  } catch (error) {
    const debug = createRedCliffsAiDebugInfo(getAiConfig());
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI error.";
    const statusMatch = /status (\d+)\s+([^.]+)\. Body:([\s\S]*)$/i.exec(
      errorMessage,
    );

    if (statusMatch) {
      debug.upstreamStatus = Number(statusMatch[1]);
      debug.upstreamStatusText = statusMatch[2].trim();
      debug.upstreamBody = statusMatch[3].trim();
    }
    debug.timings.serviceTotalMs = Number(
      (performance.now() - serviceStart).toFixed(1),
    );

    console.error("[red-cliffs-ai] linear script package request failed", {
      ...debug,
      error: errorMessage,
      viewpointId: params.viewpointId,
    });

    return {
      ok: false,
      source: "fallback-local",
      playableContent: fallbackPlayableContent,
      warning: "AI 线性脚本生成失败，已切回本地静态剧情。",
      error: errorMessage,
      debug,
    };
  }
}
