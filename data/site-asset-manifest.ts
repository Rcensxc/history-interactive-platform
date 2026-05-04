const siteHeroImageMap = {
  "home-hero": "/assets/site/homepage/hero-cover.jpg",
} as const;

const eventCoverImageMap: Partial<Record<string, string>> = {
  "hongmen-banquet": "/assets/events/hongmen-banquet/cover.jpg",
  "battle-of-red-cliffs": "/assets/events/battle-of-red-cliffs/cover.jpg",
  "shenlong-coup-eve": "/assets/events/shenlong-coup-eve/cover.jpg",
  "reform-of-shang-yang": "/assets/events/reform-of-shang-yang/cover.jpg",
  "empty-city-stratagem": "/assets/events/empty-city-stratagem/cover.jpg",
  "heroes-over-wine": "/assets/events/heroes-over-wine/cover.jpg",
  "cup-wine-release-power": "/assets/events/cup-wine-release-power/cover.jpg",
  "jingke-assassinates-qin": "/assets/events/jingke-assassinates-qin/cover.jpg",
  "tianji-horse-race": "/assets/events/tianji-horse-race/cover.jpg",
  "break-cauldrons-sink-boats": "/assets/events/break-cauldrons-sink-boats/cover.jpg",
  "debate-with-wu-scholars": "/assets/events/debate-with-wu-scholars/cover.jpg",
  "scrape-bone-healing": "/assets/events/scrape-bone-healing/cover.jpg",
  "boil-beans-burn-stalks": "/assets/events/boil-beans-burn-stalks/cover.jpg",
  "humen-destroy-opium": "/assets/events/humen-destroy-opium/cover.jpg",
  "bearing-thorns-apology": "/assets/events/bearing-thorns-apology/cover.jpg",
  "smash-water-jar": "/assets/events/smash-water-jar/cover.jpg",
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
