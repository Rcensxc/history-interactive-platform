import type { EventSpeakerVisual, PlaceholderAsset } from "@/types/content";

type EventStageAssetManifest = {
  backgrounds?: {
    defaultImage?: string;
    sceneImages?: Record<string, string>;
    scenePrefixImages?: Record<string, string>;
  };
  standees?: Record<string, string>;
};

const eventAssetManifest: Record<string, EventStageAssetManifest> = {
  "hongmen-banquet": {
    backgrounds: {
      defaultImage:
        "/assets/events/hongmen-banquet/backgrounds/banquet-main.jpg",
      sceneImages: {
        arrival:
          "/assets/events/hongmen-banquet/backgrounds/arrival-camp.jpg",
        "opening-dialogue":
          "/assets/events/hongmen-banquet/backgrounds/banquet-main.jpg",
        "decision-one":
          "/assets/events/hongmen-banquet/backgrounds/banquet-main.jpg",
        "fan-kuai-entry":
          "/assets/events/hongmen-banquet/backgrounds/fan-kuai-entry.jpg",
        "decision-two":
          "/assets/events/hongmen-banquet/backgrounds/withdrawal-path.jpg",
        ending:
          "/assets/events/hongmen-banquet/backgrounds/withdrawal-path.jpg",
      },
      scenePrefixImages: {
        "arrival-":
          "/assets/events/hongmen-banquet/backgrounds/arrival-camp.jpg",
        "banquet-probe-":
          "/assets/events/hongmen-banquet/backgrounds/banquet-main.jpg",
        "pressure-rise-":
          "/assets/events/hongmen-banquet/backgrounds/banquet-main.jpg",
        "fan-kuai-entry-":
          "/assets/events/hongmen-banquet/backgrounds/fan-kuai-entry.jpg",
        "exit-":
          "/assets/events/hongmen-banquet/backgrounds/withdrawal-path.jpg",
        "ending-":
          "/assets/events/hongmen-banquet/backgrounds/withdrawal-path.jpg",
      },
    },
    standees: {
      liubang: "/assets/events/hongmen-banquet/standees/liubang.png",
      xiangyu: "/assets/events/hongmen-banquet/standees/xiangyu.png",
      xiangbo: "/assets/events/hongmen-banquet/standees/xiangbo.png",
      "fan-kuai": "/assets/events/hongmen-banquet/standees/fan-kuai.png",
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
  const mappedImage =
    manifest?.backgrounds?.sceneImages?.[sceneId] ??
    Object.entries(manifest?.backgrounds?.scenePrefixImages ?? {}).find(
      ([prefix]) => sceneId.startsWith(prefix),
    )?.[1] ??
    manifest?.backgrounds?.defaultImage;

  if (!mappedImage) {
    return background;
  }

  return {
    ...background,
    image: mappedImage,
  };
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

  const mappedImage = eventAssetManifest[eventId]?.standees?.[visualKey];
  if (!mappedImage) {
    return visual;
  }

  return {
    ...visual,
    image: mappedImage,
  };
}
