import type { TimeTheaterLine, TimeTheaterTopic, Tone } from "@/types/content";
import { timeTheaterEligibleFigureIds } from "@/data/history-registry";

export const timeTheaterCastIds = timeTheaterEligibleFigureIds;

export const defaultTimeTheaterSelection = [
  "liubang",
  "wuzetian",
  "wangyangming",
];

export const timeTheaterTopics: TimeTheaterTopic[] = [
  {
    id: "crisis-command",
    title: "危机来临时，领导者该先稳人心还是先稳制度？",
    description: "更偏策略与执行的讨论，适合观察不同人物在危机来临时会先抓什么、先稳什么。",
    opening: "灯光刚落在长桌中央，话题已经直接切进危机处理。不同朝代的人物同时落座，谁先开口，几乎就等于先暴露了自己的判断方式。",
  },
  {
    id: "long-game",
    title: "真正难的不是赢下一阵，而是把局面长期维持住",
    description: "更偏全局思考与节奏控制，适合看不同人物如何理解长期布局、代价与耐心。",
    opening: "这一次的讨论没有急着争高下，气氛反而更安静。可越安静，越能听出每个人对“长期”二字的理解并不相同。",
  },
  {
    id: "memory-and-expression",
    title: "一个时代如何被记住，靠的是胜负，还是留下来的表达？",
    description: "更偏人物气质与表达方式，适合感受不同历史人物如何理解“被时代记住”这件事。",
    opening: "话题从历史记忆展开，桌上的气氛也慢慢从权力与成败，转向了表达、感受与留下痕迹的方式。",
  },
];

export const timeTheaterStageMeta = {
  title: "跨时空人物互动剧场试玩页",
  preparationDescription:
    "先决定谁要同台、谁是你的第一视角、他们正在讨论什么，再进入正式互动场景。当前使用固定舞台和线性播放逻辑，重点是把跨时空讨论的成品体验做稳定。",
  backdropLabel: "剧场",
  backdropKey: "council-chamber-night",
  backdropDescription:
    "背景占位图：深色长桌、低光舞台、跨时代人物同席而坐，气氛更像一场被刻意安排的历史会谈。",
};

export const timeTheaterSpeakerVisuals: Record<
  string,
  {
    label: string;
    tone: Tone;
    subtitle: string;
  }
> = {
  narrator: {
    label: "幕",
    tone: "ink",
    subtitle: "舞台旁白",
  },
  liubang: {
    label: "汉",
    tone: "bronze",
    subtitle: "局势掌控者",
  },
  "zhuge-liang": {
    label: "蜀",
    tone: "ink",
    subtitle: "长线筹谋者",
  },
  wuzetian: {
    label: "周",
    tone: "jade",
    subtitle: "秩序塑造者",
  },
  liqingzhao: {
    label: "宋",
    tone: "amber",
    subtitle: "表达与感受",
  },
  wangyangming: {
    label: "明",
    tone: "ink",
    subtitle: "判断与行动",
  },
};

export const timeTheaterScripts: Record<string, TimeTheaterLine[]> = {
  "crisis-command": [
    {
      speakerId: "wuzetian",
      text: "局势一乱，先要让所有人知道秩序还在。没有秩序，再好的主意也落不到地上。",
    },
    {
      speakerId: "liubang",
      text: "秩序重要，但真到危险的时候，人先得愿意跟你走。能不能把人稳住，很多时候比名义更快见效。",
    },
    {
      speakerId: "wangyangming",
      text: "两位说的是同一件事的前后手。判断不能只停在脑子里，要立刻转成能执行的动作。",
    },
    {
      speakerId: "wuzetian",
      text: "所以我更在意谁来做、怎么做，而不是一句漂亮话能不能说服人。",
    },
    {
      speakerId: "liubang",
      text: "那就有意思了。若眼前只能先保住局面，我会先留住人，再慢慢补制度。",
    },
  ],
  "long-game": [
    {
      speakerId: "zhuge-liang",
      text: "短期胜负很醒目，但真正决定走向的，往往是资源、节奏和能否持续推进。",
    },
    {
      speakerId: "liubang",
      text: "我同意。很多时候不是最强的人赢，而是能熬到最后、还肯把人聚在一起的人赢。",
    },
    {
      speakerId: "wangyangming",
      text: "如果知道方向，就不要只盯着眼前那一步。行动和心气要一起往前推。",
    },
    {
      speakerId: "zhuge-liang",
      text: "所以长线布局不是拖慢节奏，而是让每一次推进都更可预期。",
    },
  ],
  "memory-and-expression": [
    {
      speakerId: "liqingzhao",
      text: "很多人以为历史只记得成败，但真正能留下人的，常常是那些让人感同身受的表达。",
    },
    {
      speakerId: "wuzetian",
      text: "表达当然重要，但如果没有真正改变过现实，再动人的文字也容易被风吹散。",
    },
    {
      speakerId: "wangyangming",
      text: "我更愿意把两者连在一起。能留下来的表达，往往也是某种行动留下的回声。",
    },
    {
      speakerId: "liqingzhao",
      text: "那就说明，人们记住的并不只是结果，而是那个时代曾经如何被感受过。",
    },
  ],
};
