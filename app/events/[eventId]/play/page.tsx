import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HongmenAiStoryPlayer } from "@/components/events/hongmen-ai-story-player";
import { BreakCauldronsAiStoryPlayer } from "@/components/events/break-cauldrons-ai-story-player";
import { ScrapeBoneAiStoryPlayer } from "@/components/events/scrape-bone-ai-story-player";
import { SmashWaterJarAiStoryPlayer } from "@/components/events/smash-water-jar-ai-story-player";
import { CupWineAiStoryPlayer } from "@/components/events/cup-wine-ai-story-player";
import { EmptyCityAiStoryPlayer } from "@/components/events/empty-city-ai-story-player";
import { HeroesOverWineAiStoryPlayer } from "@/components/events/heroes-over-wine-ai-story-player";
import { JingkeAiStoryPlayer } from "@/components/events/jingke-ai-story-player";
import { BoilBeansAiStoryPlayer } from "@/components/events/boil-beans-ai-story-player";
import { RedCliffsAiStoryPlayer } from "@/components/events/red-cliffs-ai-story-player";
import { ShenlongAiStoryPlayer } from "@/components/events/shenlong-ai-story-player";
import { BearingThornsAiStoryPlayer } from "@/components/events/bearing-thorns-ai-story-player";
import { TianjiHorseRaceAiStoryPlayer } from "@/components/events/tianji-horse-race-ai-story-player";
import { HumenDestroyOpiumAiStoryPlayer } from "@/components/events/humen-destroy-opium-ai-story-player";
import { DebateWithWuAiStoryPlayer } from "@/components/events/debate-with-wu-ai-story-player";
import { EventStoryPlayer } from "@/components/events/event-story-player";
import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import {
  getBreakCauldronsAiInitialViewpointId,
  shouldUseBreakCauldronsAiMode,
} from "@/lib/break-cauldrons-ai";
import {
  getScrapeBoneAiInitialViewpointId,
  shouldUseScrapeBoneAiMode,
} from "@/lib/scrape-bone-ai";
import {
  getSmashWaterJarAiInitialViewpointId,
  shouldUseSmashWaterJarAiMode,
} from "@/lib/smash-water-jar-ai";
import {
  getCupWineAiInitialViewpointId,
  shouldUseCupWineAiMode,
} from "@/lib/cup-wine-ai";
import {
  getBoilBeansAiInitialViewpointId,
  shouldUseBoilBeansAiMode,
} from "@/lib/boil-beans-ai";
import {
  getEmptyCityAiInitialViewpointId,
  shouldUseEmptyCityAiMode,
} from "@/lib/empty-city-ai";
import {
  getHongmenAiInitialViewpointId,
  shouldUseHongmenAiMode,
} from "@/lib/hongmen-ai";
import {
  getHeroesOverWineAiInitialViewpointId,
  shouldUseHeroesOverWineAiMode,
} from "@/lib/heroes-over-wine-ai";
import {
  getJingkeAiInitialViewpointId,
  shouldUseJingkeAiMode,
} from "@/lib/jingke-ai";
import {
  getTianjiHorseRaceAiInitialViewpointId,
  shouldUseTianjiHorseRaceAiMode,
} from "@/lib/tianji-horse-race-ai";
import {
  getRedCliffsAiInitialViewpointId,
  shouldUseRedCliffsAiMode,
} from "@/lib/red-cliffs-ai";
import {
  getShenlongAiInitialViewpointId,
  shouldUseShenlongAiMode,
} from "@/lib/shenlong-ai";
import {
  getBearingThornsAiInitialViewpointId,
  shouldUseBearingThornsAiMode,
} from "@/lib/bearing-thorns-ai";
import {
  getHumenDestroyOpiumAiInitialViewpointId,
  shouldUseHumenDestroyOpiumAiMode,
} from "@/lib/humen-destroy-opium-ai";
import {
  getDebateWithWuAiInitialViewpointId,
  shouldUseDebateWithWuAiMode,
} from "@/lib/debate-with-wu-ai";

type PageProps = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    viewpoint?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const eventItem = getHistoricalEvent(eventId);

  return {
    title: eventItem ? `${eventItem.title} · 正式剧情页` : "正式剧情页",
  };
}

export default async function EventPlayPage({
  params,
  searchParams,
}: PageProps) {
  const { eventId } = await params;
  const query = await searchParams;
  const eventItem = getHistoricalEvent(eventId);
  const playableContent = getEventPlayableContent(eventId);

  if (!eventItem || !eventItem.hasPlayableStory || !playableContent) {
    notFound();
  }

  const requestedViewpointId = query.viewpoint?.trim();
  const defaultPlayableViewpointId =
    playableContent.viewpoints.find((viewpoint) => viewpoint.isPlayable !== false)?.id ??
    playableContent.viewpoints[0]?.id ??
    (eventId === "hongmen-banquet"
      ? getHongmenAiInitialViewpointId()
      : eventId === "break-cauldrons-sink-boats"
      ? getBreakCauldronsAiInitialViewpointId()
      : eventId === "cup-wine-release-power"
        ? getCupWineAiInitialViewpointId()
      : eventId === "boil-beans-burn-stalks"
      ? getBoilBeansAiInitialViewpointId()
      : eventId === "scrape-bone-healing"
        ? getScrapeBoneAiInitialViewpointId()
      : eventId === "smash-water-jar"
        ? getSmashWaterJarAiInitialViewpointId()
      : eventId === "empty-city-stratagem"
        ? getEmptyCityAiInitialViewpointId()
      : eventId === "heroes-over-wine"
        ? getHeroesOverWineAiInitialViewpointId()
      : eventId === "jingke-assassinates-qin"
        ? getJingkeAiInitialViewpointId()
      : eventId === "bearing-thorns-apology"
        ? getBearingThornsAiInitialViewpointId()
      : eventId === "tianji-horse-race"
        ? getTianjiHorseRaceAiInitialViewpointId()
      : eventId === "shenlong-coup-eve"
        ? getShenlongAiInitialViewpointId()
      : eventId === "humen-destroy-opium"
        ? getHumenDestroyOpiumAiInitialViewpointId()
      : eventId === "debate-with-wu-scholars"
        ? getDebateWithWuAiInitialViewpointId()
      : getRedCliffsAiInitialViewpointId());
  const initialViewpointId = requestedViewpointId || defaultPlayableViewpointId;
  const requestedViewpoint = playableContent.viewpoints.find(
    (viewpoint) => viewpoint.id === initialViewpointId,
  );

  if (requestedViewpoint && requestedViewpoint.isPlayable === false) {
    notFound();
  }

  if (shouldUseHongmenAiMode(eventId, initialViewpointId)) {
    return (
      <HongmenAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseBreakCauldronsAiMode(eventId, initialViewpointId)) {
    return (
      <BreakCauldronsAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseScrapeBoneAiMode(eventId, initialViewpointId)) {
    return (
      <ScrapeBoneAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseSmashWaterJarAiMode(eventId, initialViewpointId)) {
    return (
      <SmashWaterJarAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseCupWineAiMode(eventId, initialViewpointId)) {
    return (
      <CupWineAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseBoilBeansAiMode(eventId, initialViewpointId)) {
    return (
      <BoilBeansAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseEmptyCityAiMode(eventId, initialViewpointId)) {
    return (
      <EmptyCityAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseHeroesOverWineAiMode(eventId, initialViewpointId)) {
    return (
      <HeroesOverWineAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseJingkeAiMode(eventId, initialViewpointId)) {
    return (
      <JingkeAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseTianjiHorseRaceAiMode(eventId, initialViewpointId)) {
    return (
      <TianjiHorseRaceAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseBearingThornsAiMode(eventId, initialViewpointId)) {
    return (
      <BearingThornsAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseRedCliffsAiMode(eventId, initialViewpointId)) {
    return (
      <RedCliffsAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseShenlongAiMode(eventId, initialViewpointId)) {
    return (
      <ShenlongAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseHumenDestroyOpiumAiMode(eventId, initialViewpointId)) {
    return (
      <HumenDestroyOpiumAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  if (shouldUseDebateWithWuAiMode(eventId, initialViewpointId)) {
    return (
      <DebateWithWuAiStoryPlayer
        eventItem={eventItem}
        playableContent={playableContent}
        initialViewpointId={initialViewpointId}
      />
    );
  }

  return (
    <EventStoryPlayer
      eventItem={eventItem}
      playableContent={playableContent}
      initialViewpointId={initialViewpointId}
    />
  );
}
