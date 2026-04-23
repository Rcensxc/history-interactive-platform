import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HongmenAiStoryPlayer } from "@/components/events/hongmen-ai-story-player";
import { RedCliffsAiStoryPlayer } from "@/components/events/red-cliffs-ai-story-player";
import { EventStoryPlayer } from "@/components/events/event-story-player";
import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";
import {
  getHongmenAiInitialViewpointId,
  shouldUseHongmenAiMode,
} from "@/lib/hongmen-ai";
import {
  getRedCliffsAiInitialViewpointId,
  shouldUseRedCliffsAiMode,
} from "@/lib/red-cliffs-ai";

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

  if (shouldUseRedCliffsAiMode(eventId, initialViewpointId)) {
    return (
      <RedCliffsAiStoryPlayer
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
