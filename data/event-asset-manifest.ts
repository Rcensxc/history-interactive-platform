import type { EventSpeakerVisual, PlaceholderAsset } from "@/types/content";
import { enrichSharedBackgroundAsset } from "@/data/background-asset-manifest";
import { getCharacterStandeeImage } from "@/data/character-asset-manifest";

type EventStageAssetManifest = {
  backgrounds?: {
    defaultBackgroundKey?: string;
    sceneBackgroundKeys?: Record<string, string>;
    scenePrefixBackgroundKeys?: Record<string, string>;
  };
  standees?: Record<string, string>;
};

const eventAssetManifest: Record<string, EventStageAssetManifest> = {
  "hongmen-banquet": {
    backgrounds: {
      defaultBackgroundKey: "banquet-hall-night",
      sceneBackgroundKeys: {
        arrival: "camp-night",
        "opening-dialogue": "banquet-hall-night",
        "decision-one": "banquet-hall-night",
        "fan-kuai-entry": "military-tent",
        "decision-two": "camp-night",
        ending: "camp-night",
      },
      scenePrefixBackgroundKeys: {
        "arrival-": "camp-night",
        "banquet-probe-": "banquet-hall-night",
        "pressure-rise-": "banquet-hall-night",
        "fan-kuai-entry-": "military-tent",
        "exit-": "camp-night",
        "ending-": "camp-night",
      },
    },
  },
  "battle-of-red-cliffs": {
    backgrounds: {
      defaultBackgroundKey: "red-cliffs-river-night",
      sceneBackgroundKeys: {
        "river-night": "red-cliffs-river-night",
        "zhouyu-briefing": "red-cliffs-command-tent",
        "zhuge-liang-response": "red-cliffs-strategy-table",
        "pressure-window": "red-cliffs-strategy-table",
        "huang-gai-execution": "red-cliffs-departure-dock",
        "launch-window": "red-cliffs-departure-dock",
        "red-cliffs-ending": "red-cliffs-embers",
      },
      scenePrefixBackgroundKeys: {
        "river-watch-": "red-cliffs-river-night",
        "alliance-briefing-": "red-cliffs-command-tent",
        "timing-pressure-": "red-cliffs-strategy-table",
        "huang-gai-commitment-": "red-cliffs-departure-dock",
        "launch-": "red-cliffs-departure-dock",
        "aftermath-": "red-cliffs-embers",
      },
    },
  },
  "shenlong-coup-eve": {
    backgrounds: {
      defaultBackgroundKey: "palace-night-chamber",
      sceneBackgroundKeys: {
        "sickbed-night": "palace-night-chamber",
        "strange-report": "palace-night-chamber",
        "guard-question": "palace-inner-corridor",
        "waner-enters": "palace-night-chamber",
        "report-names": "palace-night-chamber",
        "midnight-footsteps": "palace-inner-corridor",
        "attendant-talk": "palace-night-chamber",
        "next-morning-sound": "palace-gate-dawn",
        "request-for-audience": "palace-gate-dawn",
        "dress-and-rise": "palace-night-chamber",
        "doors-open": "palace-hall-threshold",
        "aftermath-whisper": "palace-hall-threshold",
      },
      scenePrefixBackgroundKeys: {
        "sickbed-night-": "palace-night-chamber",
        "strange-report-": "palace-night-chamber",
        "guard-question-": "palace-inner-corridor",
        "waner-enters-": "palace-night-chamber",
        "report-names-": "palace-night-chamber",
        "midnight-footsteps-": "palace-inner-corridor",
        "attendant-talk-": "palace-night-chamber",
        "next-morning-sound-": "palace-gate-dawn",
        "request-for-audience-": "palace-gate-dawn",
        "dress-and-rise-": "palace-night-chamber",
        "doors-open-": "palace-hall-threshold",
        "aftermath-whisper-": "palace-hall-threshold",
      },
    },
  },
  "jingke-assassinates-qin": {
    backgrounds: {
      defaultBackgroundKey: "qin-throne-hall",
      sceneBackgroundKeys: {
        "palace-waiting": "qin-palace-antehall",
        "qinwuyang-falters": "qin-palace-antehall",
        "offer-map": "qin-throne-hall",
        "map-unfolds": "qin-throne-hall",
        "dagger-revealed": "qin-throne-hall",
        "king-rises": "qin-chaos-hall",
        "pillar-chase": "qin-chaos-hall",
        "dagger-thrown": "qin-chaos-hall",
        "jingke-seized": "qin-chaos-hall",
        "failed-coda": "qin-chaos-hall",
      },
      scenePrefixBackgroundKeys: {
        "palace-waiting-": "qin-palace-antehall",
        "qinwuyang-falters-": "qin-palace-antehall",
        "offer-map-": "qin-throne-hall",
        "map-unfolds-": "qin-throne-hall",
        "dagger-revealed-": "qin-throne-hall",
        "king-rises-": "qin-chaos-hall",
        "pillar-chase-": "qin-chaos-hall",
        "dagger-thrown-": "qin-chaos-hall",
        "jingke-seized-": "qin-chaos-hall",
        "failed-coda-": "qin-chaos-hall",
      },
    },
  },
  "heroes-over-wine": {
    backgrounds: {
      defaultBackgroundKey: "heroes-banquet-hall",
      sceneBackgroundKeys: {
        "invited-to-seat": "heroes-rain-pavilion",
        "cao-opens-topic": "heroes-banquet-hall",
        "ask-for-heroes": "heroes-banquet-hall",
        "cao-rejects-names": "heroes-banquet-hall",
        "line-turns-to-liubei": "heroes-banquet-hall",
        "thunder-and-dropped-chopsticks": "heroes-rain-pavilion",
        "liubei-covers": "heroes-banquet-hall",
        "after-seat": "heroes-courtyard-after-rain",
      },
      scenePrefixBackgroundKeys: {
        "invited-to-seat-": "heroes-rain-pavilion",
        "cao-opens-topic-": "heroes-banquet-hall",
        "ask-for-heroes-": "heroes-banquet-hall",
        "cao-rejects-names-": "heroes-banquet-hall",
        "line-turns-to-liubei-": "heroes-banquet-hall",
        "thunder-and-dropped-chopsticks-": "heroes-rain-pavilion",
        "liubei-covers-": "heroes-banquet-hall",
        "after-seat-": "heroes-courtyard-after-rain",
      },
    },
  },
  "break-cauldrons-sink-boats": {
    backgrounds: {
      defaultBackgroundKey: "battle-riverbank-crossing",
      sceneBackgroundKeys: {
        "after-crossing": "battle-riverbank-crossing",
        "boats-destroyed": "battle-retreat-cut",
        "cauldrons-broken": "battle-retreat-cut",
        "xiangyu-appears": "battle-frontline-muster",
        "no-retreat-order": "battle-frontline-muster",
        "ranks-react": "battle-frontline-muster",
        "war-drums-sound": "battle-frontline-muster",
        "dust-of-qin-army": "battle-before-clash",
        "forward-without-return": "battle-before-clash",
      },
      scenePrefixBackgroundKeys: {
        "after-crossing-": "battle-riverbank-crossing",
        "boats-destroyed-": "battle-retreat-cut",
        "cauldrons-broken-": "battle-retreat-cut",
        "xiangyu-appears-": "battle-frontline-muster",
        "no-retreat-order-": "battle-frontline-muster",
        "ranks-react-": "battle-frontline-muster",
        "war-drums-sound-": "battle-frontline-muster",
        "dust-of-qin-army-": "battle-before-clash",
        "forward-without-return-": "battle-before-clash",
      },
    },
  },
  "bearing-thorns-apology": {
    backgrounds: {
      defaultBackgroundKey: "zhao-manor-courtyard",
      sceneBackgroundKeys: {
        "courtyard-interrupted": "zhao-manor-courtyard",
        "retainer-reports-lianpo": "zhao-manor-gate",
        "ask-about-posture": "zhao-manor-courtyard",
        "whether-to-admit": "zhao-manor-courtyard",
        "lianpo-enters": "zhao-manor-gate",
        "lianpo-apologizes": "zhao-manor-hall",
        "linxiangru-responds": "zhao-manor-hall",
        "lianpo-bows-lower": "zhao-manor-hall",
        "step-forward-and-lift": "zhao-manor-hall",
        "reconciliation-in-hall": "zhao-manor-hall",
        "courtyard-after-silence": "zhao-manor-courtyard",
      },
      scenePrefixBackgroundKeys: {
        "courtyard-interrupted-": "zhao-manor-courtyard",
        "retainer-reports-lianpo-": "zhao-manor-gate",
        "ask-about-posture-": "zhao-manor-courtyard",
        "whether-to-admit-": "zhao-manor-courtyard",
        "lianpo-enters-": "zhao-manor-gate",
        "lianpo-apologizes-": "zhao-manor-hall",
        "linxiangru-responds-": "zhao-manor-hall",
        "lianpo-bows-lower-": "zhao-manor-hall",
        "step-forward-and-lift-": "zhao-manor-hall",
        "reconciliation-in-hall-": "zhao-manor-hall",
        "courtyard-after-silence-": "zhao-manor-courtyard",
      },
    },
  },
  "cup-wine-release-power": {
    backgrounds: {
      defaultBackgroundKey: "song-banquet-hall",
      sceneBackgroundKeys: {
        "banquet-begins": "song-banquet-hall",
        "wine-rounds": "song-banquet-hall",
        "emperor-sighs": "song-palace-interior",
        "testing-the-mood": "song-palace-interior",
        "hidden-concern": "song-palace-interior",
        "silence-around-cups": "song-palace-interior",
        "retreat-offered": "song-palace-interior",
        "generals-respond": "song-palace-interior",
        "shishouxin-bows": "song-palace-interior",
        "toast-returns": "song-banquet-hall",
        "night-gate-after": "song-palace-gate-night",
      },
      scenePrefixBackgroundKeys: {
        "banquet-begins-": "song-banquet-hall",
        "wine-rounds-": "song-banquet-hall",
        "emperor-sighs-": "song-palace-interior",
        "testing-the-mood-": "song-palace-interior",
        "hidden-concern-": "song-palace-interior",
        "silence-around-cups-": "song-palace-interior",
        "retreat-offered-": "song-palace-interior",
        "generals-respond-": "song-palace-interior",
        "shishouxin-bows-": "song-palace-interior",
        "toast-returns-": "song-banquet-hall",
        "night-gate-after-": "song-palace-gate-night",
      },
    },
  },
  "boil-beans-burn-stalks": {
    backgrounds: {
      defaultBackgroundKey: "wei-palace-hall",
      sceneBackgroundKeys: {
        "summoned-into-hall": "wei-palace-hall",
        "seven-step-decree": "wei-palace-hall",
        "first-step-silence": "wei-palace-dais",
        "second-third-steps": "wei-palace-dais",
        "first-couplet": "wei-palace-dais",
        "fourth-fifth-steps": "wei-palace-dais",
        "middle-couplet": "wei-palace-dais",
        "sixth-seventh-steps": "wei-palace-dais",
        "final-couplet": "wei-palace-dais",
        "hall-falls-silent": "wei-palace-after-audience",
        "pressure-eases": "wei-palace-after-audience",
        "cold-aftertaste": "wei-palace-after-audience",
      },
      scenePrefixBackgroundKeys: {
        "summoned-into-hall-": "wei-palace-hall",
        "seven-step-decree-": "wei-palace-hall",
        "first-step-silence-": "wei-palace-dais",
        "second-third-steps-": "wei-palace-dais",
        "first-couplet-": "wei-palace-dais",
        "fourth-fifth-steps-": "wei-palace-dais",
        "middle-couplet-": "wei-palace-dais",
        "sixth-seventh-steps-": "wei-palace-dais",
        "final-couplet-": "wei-palace-dais",
        "hall-falls-silent-": "wei-palace-after-audience",
        "pressure-eases-": "wei-palace-after-audience",
        "cold-aftertaste-": "wei-palace-after-audience",
      },
    },
  },
  "empty-city-stratagem": {
    backgrounds: {
      defaultBackgroundKey: "empty-city-watchtower",
      sceneBackgroundKeys: {
        "urgent-report": "empty-city-gate",
        "city-panics": "empty-city-gate",
        "open-the-gates": "empty-city-gate",
        "ascend-the-tower": "empty-city-watchtower",
        "wei-army-arrives": "empty-city-below",
        "tower-stillness": "empty-city-watchtower",
        "simayi-hesitates": "empty-city-below",
        "wei-army-withdraws": "empty-city-gate",
        "aftermath-breath": "empty-city-watchtower",
      },
      scenePrefixBackgroundKeys: {
        "urgent-report-": "empty-city-gate",
        "city-panics-": "empty-city-gate",
        "open-the-gates-": "empty-city-gate",
        "ascend-the-tower-": "empty-city-watchtower",
        "wei-army-arrives-": "empty-city-below",
        "tower-stillness-": "empty-city-watchtower",
        "simayi-hesitates-": "empty-city-below",
        "wei-army-withdraws-": "empty-city-gate",
        "aftermath-breath-": "empty-city-watchtower",
      },
    },
  },
  "tianji-horse-race": {
    backgrounds: {
      defaultBackgroundKey: "horse-race-course",
      sceneBackgroundKeys: {
        "racecourse-side": "horse-race-course",
        "sunbin-observes": "horse-race-viewing-stand",
        "switch-order": "horse-race-viewing-stand",
        "first-round-given": "horse-race-course",
        "tianji-uneasy": "horse-race-viewing-stand",
        "second-round-turns": "horse-race-course",
        "third-round-locks": "horse-race-course",
        "king-and-crowd-react": "horse-race-finish-lane",
        "after-race": "horse-race-finish-lane",
      },
      scenePrefixBackgroundKeys: {
        "racecourse-side-": "horse-race-course",
        "sunbin-observes-": "horse-race-viewing-stand",
        "switch-order-": "horse-race-viewing-stand",
        "first-round-given-": "horse-race-course",
        "tianji-uneasy-": "horse-race-viewing-stand",
        "second-round-turns-": "horse-race-course",
        "third-round-locks-": "horse-race-course",
        "king-and-crowd-react-": "horse-race-finish-lane",
        "after-race-": "horse-race-finish-lane",
      },
    },
  },
  "scrape-bone-healing": {
    backgrounds: {
      defaultBackgroundKey: "war-tent-healing",
      sceneBackgroundKeys: {
        "injury-in-tent": "war-tent-healing",
        "huatuo-examines": "war-tent-healing",
        "guanyu-accepts": "war-tent-healing",
        "tools-prepared": "war-tent-surgery",
        "first-cut": "war-tent-surgery",
        "scraping-bone": "war-tent-surgery",
        "guanyu-keeps-composure": "war-tent-surgery",
        "huatuo-continues": "war-tent-surgery",
        "bandage-wrapped": "war-tent-recovery",
        "treatment-complete": "war-tent-recovery",
        "aftertaste-in-tent": "war-tent-recovery",
      },
      scenePrefixBackgroundKeys: {
        "injury-in-tent-": "war-tent-healing",
        "huatuo-examines-": "war-tent-healing",
        "guanyu-accepts-": "war-tent-healing",
        "tools-prepared-": "war-tent-surgery",
        "first-cut-": "war-tent-surgery",
        "scraping-bone-": "war-tent-surgery",
        "guanyu-keeps-composure-": "war-tent-surgery",
        "huatuo-continues-": "war-tent-surgery",
        "bandage-wrapped-": "war-tent-recovery",
        "treatment-complete-": "war-tent-recovery",
        "aftertaste-in-tent-": "war-tent-recovery",
      },
    },
  },
  "smash-water-jar": {
    backgrounds: {
      defaultBackgroundKey: "courtyard-children-play",
      sceneBackgroundKeys: {
        "courtyard-play": "courtyard-children-play",
        "child-climbs-jar": "courtyard-water-jar",
        "sudden-splash": "courtyard-water-jar",
        "children-panic": "courtyard-water-jar",
        "simaguang-observes": "courtyard-water-jar",
        "spots-the-stone": "courtyard-water-jar",
        "smash-the-jar": "courtyard-water-jar",
        "water-rushes-out": "courtyard-after-rescue",
        "child-saved": "courtyard-after-rescue",
        "aftertaste-courtyard": "courtyard-after-rescue",
      },
      scenePrefixBackgroundKeys: {
        "courtyard-play-": "courtyard-children-play",
        "child-climbs-jar-": "courtyard-water-jar",
        "sudden-splash-": "courtyard-water-jar",
        "children-panic-": "courtyard-water-jar",
        "simaguang-observes-": "courtyard-water-jar",
        "spots-the-stone-": "courtyard-water-jar",
        "smash-the-jar-": "courtyard-water-jar",
        "water-rushes-out-": "courtyard-after-rescue",
        "child-saved-": "courtyard-after-rescue",
        "aftertaste-courtyard-": "courtyard-after-rescue",
      },
    },
  },
  "humen-destroy-opium": {
    backgrounds: {
      defaultBackgroundKey: "humen-seaside-morning",
      sceneBackgroundKeys: {
        "seaside-morning": "humen-seaside-morning",
        "crates-carried-in": "humen-opium-yard",
        "linzexu-arrives": "humen-opium-yard",
        "checking-registers": "humen-opium-yard",
        "dump-into-pit": "humen-destruction-pit",
        "crowd-watches": "humen-crowd-edge",
        "foreign-eyes": "humen-crowd-edge",
        "order-to-continue": "humen-destruction-pit",
        "destruction-continues": "humen-destruction-pit",
        "day-settles": "humen-crowd-edge",
        "aftertaste-humen": "humen-seaside-morning",
      },
      scenePrefixBackgroundKeys: {
        "seaside-morning-": "humen-seaside-morning",
        "crates-carried-in-": "humen-opium-yard",
        "linzexu-arrives-": "humen-opium-yard",
        "checking-registers-": "humen-opium-yard",
        "dump-into-pit-": "humen-destruction-pit",
        "crowd-watches-": "humen-crowd-edge",
        "foreign-eyes-": "humen-crowd-edge",
        "order-to-continue-": "humen-destruction-pit",
        "destruction-continues-": "humen-destruction-pit",
        "day-settles-": "humen-crowd-edge",
        "aftertaste-humen-": "humen-seaside-morning",
      },
    },
  },
  "debate-with-wu-scholars": {
    backgrounds: {
      defaultBackgroundKey: "wu-court-hall",
      sceneBackgroundKeys: {
        "enter-wu-hall": "wu-court-approach",
        "courtiers-open": "wu-court-hall",
        "zhangzhao-challenges": "wu-court-hall",
        "zhuge-initial-answer": "wu-court-dais",
        "courtiers-press": "wu-court-hall",
        "zhuge-counter-question": "wu-court-dais",
        "zhangzhao-argues-again": "wu-court-hall",
        "zhuge-reveals-stakes": "wu-court-dais",
        "sunquan-observes": "wu-court-dais",
        "resistance-softens": "wu-court-hall",
        "final-stance": "wu-court-dais",
        "hall-after-echo": "wu-court-after",
      },
      scenePrefixBackgroundKeys: {
        "enter-wu-hall-": "wu-court-approach",
        "courtiers-open-": "wu-court-hall",
        "zhangzhao-challenges-": "wu-court-hall",
        "zhuge-initial-answer-": "wu-court-dais",
        "courtiers-press-": "wu-court-hall",
        "zhuge-counter-question-": "wu-court-dais",
        "zhangzhao-argues-again-": "wu-court-hall",
        "zhuge-reveals-stakes-": "wu-court-dais",
        "sunquan-observes-": "wu-court-dais",
        "resistance-softens-": "wu-court-hall",
        "final-stance-": "wu-court-dais",
        "hall-after-echo-": "wu-court-after",
      },
    },
  },
};

export function enrichEventBackgroundAsset(params: {
  eventId: string;
  sceneId: string;
  background: PlaceholderAsset;
}): PlaceholderAsset {
  const { eventId, sceneId, background } = params;
  const manifest = eventAssetManifest[eventId];
  const backgroundKey =
    manifest?.backgrounds?.sceneBackgroundKeys?.[sceneId] ??
    Object.entries(manifest?.backgrounds?.scenePrefixBackgroundKeys ?? {}).find(
      ([prefix]) => sceneId.startsWith(prefix),
    )?.[1] ??
    manifest?.backgrounds?.defaultBackgroundKey;

  return enrichSharedBackgroundAsset({
    ...background,
    backgroundKey: background.backgroundKey ?? backgroundKey,
  });
}

export function enrichEventSpeakerVisual(params: {
  eventId: string;
  visualKey?: string;
  visual: EventSpeakerVisual;
}): EventSpeakerVisual {
  const { eventId, visualKey, visual } = params;
  if (!visualKey) {
    return visual;
  }

  const mappedImage =
    getCharacterStandeeImage(visualKey) ??
    eventAssetManifest[eventId]?.standees?.[visualKey];
  if (!mappedImage) {
    return visual;
  }

  return {
    ...visual,
    image: mappedImage,
  };
}
