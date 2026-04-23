import type { PlaceholderAsset } from "@/types/content";

const sharedBackgroundImageMap: Record<string, string> = {
  "banquet-hall-night": "/assets/backgrounds/shared/banquet-hall-night.jpg",
  "camp-night": "/assets/backgrounds/shared/camp-night.jpg",
  "military-tent": "/assets/backgrounds/shared/military-tent.jpg",
  "council-chamber-night":
    "/assets/backgrounds/shared/council-chamber-night.jpg",
  "red-cliffs-river-night": "/assets/backgrounds/shared/camp-night.jpg",
  "red-cliffs-command-tent": "/assets/backgrounds/shared/military-tent.jpg",
  "red-cliffs-strategy-table":
    "/assets/backgrounds/shared/council-chamber-night.jpg",
  "red-cliffs-departure-dock": "/assets/backgrounds/shared/camp-night.jpg",
  "red-cliffs-embers": "/assets/backgrounds/shared/camp-night.jpg",
};

export function getSharedBackgroundImage(backgroundKey?: string) {
  if (!backgroundKey) {
    return undefined;
  }

  return sharedBackgroundImageMap[backgroundKey];
}

export function enrichSharedBackgroundAsset(
  background: PlaceholderAsset,
): PlaceholderAsset {
  const mappedImage = getSharedBackgroundImage(background.backgroundKey);
  if (!mappedImage) {
    return background;
  }

  return {
    ...background,
    image: mappedImage,
  };
}
