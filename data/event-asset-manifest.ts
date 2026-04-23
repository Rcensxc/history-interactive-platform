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
