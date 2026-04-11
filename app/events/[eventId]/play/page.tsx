import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventStoryPlayer } from "@/components/events/event-story-player";
import {
  getEventPlayableContent,
  getHistoricalEvent,
} from "@/data/history-registry";

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

  return (
    <EventStoryPlayer
      eventItem={eventItem}
      playableContent={playableContent}
      initialViewpointId={query.viewpoint}
    />
  );
}
