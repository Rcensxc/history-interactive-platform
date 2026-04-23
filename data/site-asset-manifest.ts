const siteHeroImageMap = {
  "home-hero": "/assets/site/homepage/hero-cover.jpg",
} as const;

const eventCoverImageMap: Partial<Record<string, string>> = {
  "hongmen-banquet": "/assets/events/hongmen-banquet/cover.jpg",
  "battle-of-red-cliffs": "/assets/events/battle-of-red-cliffs/cover.jpg",
  "reform-of-shang-yang": "/assets/events/reform-of-shang-yang/cover.jpg",
};

export function getSiteHeroImage() {
  return siteHeroImageMap["home-hero"];
}

export function getEventCoverImage(eventId?: string) {
  if (!eventId) {
    return undefined;
  }

  return eventCoverImageMap[eventId];
}
