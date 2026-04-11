import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPreparation } from "@/components/events/event-preparation";
import { getHistoricalEvent, getEventPlayableContent } from "@/data/events";
import { historicalFigures } from "@/data/historical-figures";

type PageProps = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    viewpoint?: string;
    fromFigure?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const eventItem = getHistoricalEvent(eventId);

  return {
    title: eventItem ? `${eventItem.title} · 事件准备页` : "事件准备页",
  };
}

export default async function EventPreparationPage({
  params,
  searchParams,
}: PageProps) {
  const { eventId } = await params;
  const query = await searchParams;
  const eventItem = getHistoricalEvent(eventId);

  if (!eventItem) {
    notFound();
  }

  const playableContent = getEventPlayableContent(eventId);
  const preferredFigure =
    historicalFigures.find((figure) => figure.id === query.fromFigure) ??
    historicalFigures.find((figure) => figure.id === query.viewpoint) ??
    null;
  const preferredFigureSelectable =
    !!query.viewpoint &&
    !!playableContent?.viewpoints.some(
      (viewpoint) => viewpoint.id === query.viewpoint,
    );

  return (
    <EventPreparation
      eventItem={eventItem}
      playableContent={playableContent}
      initialViewpointId={query.viewpoint}
      preferredFigureName={preferredFigure?.name}
      preferredFigureSelectable={preferredFigureSelectable}
    />
  );
}
