import type { AiStructuredStoryOutput } from "@/types/content";

export const redCliffsMockAiStoryOutput: AiStructuredStoryOutput = {
  protocolVersion: "ai-scene-v1",
  initialSceneId: "river-night",
  scenes: [
    {
      sceneId: "river-night",
      type: "narration",
      speaker: "",
      text:
        "江面暂时还很安静，但每个人都知道，真正决定胜负的不是明天会不会开战，而是今夜能不能把火攻之前的每一步都安排妥当。",
      backgroundTag: "river-night",
      showStandee: false,
      nextSceneId: "zhouyu-briefing",
      stateUpdate: {
        set: {
          allianceMood: "tense",
        },
      },
    },
    {
      sceneId: "zhouyu-briefing",
      type: "dialogue",
      speaker: "周瑜",
      text:
        "曹军船多、人众、气势正盛，但正因为如此，他们更相信自己不会输。只要判断准确，越笃定的对手，越容易在关键时刻出错。",
      backgroundTag: "command-tent",
      showStandee: true,
      standeeKey: "zhouyu",
      nextSceneId: "zhuge-liang-response",
      stateUpdate: {
        set: {
          commanderFocus: "timing",
        },
      },
    },
    {
      sceneId: "zhuge-liang-response",
      type: "dialogue",
      speaker: "诸葛亮",
      text:
        "真正要抓住的，不只是敌军松懈的一刻，而是风向、军心和联盟内部的信任，能否在同一刻站到我们这边。",
      backgroundTag: "command-tent",
      showStandee: true,
      standeeKey: "zhuge-liang",
      nextSceneId: "fire-attack-choice",
      stateUpdate: {
        set: {
          allianceTrust: "stabilizing",
        },
      },
    },
    {
      sceneId: "fire-attack-choice",
      type: "decision",
      speaker: "关键抉择",
      text: "火攻前夜，你会先把哪一步放到最前面？",
      backgroundTag: "strategy-table",
      showStandee: false,
      choices: [
        {
          id: "historic-timing",
          label: "优先等风向彻底稳定，再推进火攻",
          outcome:
            "你把所有动作都压到最稳的时机上，虽然更慢，但更接近历史中真正决定胜负的判断。",
          isHistorical: true,
          nextSceneId: "huang-gai-execution",
          stateUpdate: {
            set: {
              fireAttackDecision: "historic-timing",
            },
          },
        },
        {
          id: "alliance-first",
          label: "先把联盟内部口径完全统一，再推进执行",
          outcome:
            "你让局面更稳了一层，但也把战机往后推了一步，整个布局需要更强的耐心。",
          nextSceneId: "huang-gai-execution",
          stateUpdate: {
            set: {
              fireAttackDecision: "alliance-first",
            },
          },
        },
        {
          id: "strike-early",
          label: "趁对手松懈，提前把计划推到最前",
          outcome:
            "你抢到了速度，但任何环节露出破绽，代价都会被立刻放大。",
          nextSceneId: "huang-gai-execution",
          stateUpdate: {
            set: {
              fireAttackDecision: "strike-early",
            },
          },
        },
      ],
    },
    {
      sceneId: "huang-gai-execution",
      type: "dialogue",
      speaker: "黄盖",
      text:
        "计策再好，最后也得有人把最危险的一步真的走出去。只要我这一幕不像真的，整场火攻就会在点燃之前先被看穿。",
      backgroundTag: "departure-dock",
      showStandee: true,
      standeeKey: "huang-gai",
      nextSceneId: "red-cliffs-ending",
      stateUpdate: {
        set: {
          executionPhase: "armed",
        },
      },
    },
    {
      sceneId: "red-cliffs-ending",
      type: "narration",
      speaker: "",
      text:
        "赤壁之战最迷人的地方，不只是一场大火，而是所有关键判断都必须在火光亮起之前就完成。真正的胜负，往往先决定于看不见的那一段时间。",
      backgroundTag: "embers-aftermath",
      showStandee: false,
      stateUpdate: {
        set: {
          outcomeWindow: "resolved",
        },
      },
    },
  ],
};
