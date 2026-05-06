import type { TimeTheaterTopic } from "@/types/content";
import { timeTheaterEligibleFigureIds } from "@/data/history-registry";

export const timeTheaterCastIds = timeTheaterEligibleFigureIds;

export const defaultTimeTheaterSelection = timeTheaterCastIds.slice(0, 3);

export const timeTheaterTopics: TimeTheaterTopic[] = [
  {
    id: "crisis-command",
    title: "当可预见的危机即将到来时，领导者应该选择先稳定人心还是先保证制度？",
    description:
      "偏策略与执行的讨论，适合观察不同人物在危机来临时的应对策略。",
    opening:
      "灯光刚落在长桌中央，话题已经直接切进危机处理。不同朝代的人物同时落座，谁先开口，几乎就等于先暴露了自己的判断方式。",
  },
  {
    id: "long-game",
    title: "短期速胜和长期布局哪个更可靠？",
    description:
      "全局思考与节奏控制方面的讨论，看不同人物如何思考长期布局、代价与耐心间的平衡。",
    opening:
      "这一次的讨论没有急着争高下，气氛反而更安静。可越安静，越能听出每个人对“长期”二字的理解并不相同。",
  },
  {
    id: "memory-and-expression",
    title: "一个时代如何被记住，靠的是胜负与功名，还是留下来的作品与表达？",
    description:
      "从人物气质与表达方式，理解不同历史人物如何看待“被时代记住”这件事。",
    opening:
      "话题从历史记忆展开，桌上的气氛也慢慢从权力与成败，转向了表达、感受与留下痕迹的方式。",
  },
];

export const timeTheaterStageMeta = {
  title: "跨时空人物互动剧场试玩页",
  preparationDescription:
    "在这里，你可以先了解剧场的基本设定和参与角色，然后直接进入剧场体验不同人物的思维碰撞。",
  backdropLabel: "剧场",
  backdropKey: "council-chamber-night",
  backdropDescription:
    "",
};
