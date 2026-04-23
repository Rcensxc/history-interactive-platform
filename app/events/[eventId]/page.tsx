import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPreparation } from "@/components/events/event-preparation";
import {
  getEventPreparationData,
  getHistoricalFigure,
  getHistoricalEvent,
} from "@/data/history-registry";

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

  const preparationData = getEventPreparationData(eventId);
  const preferredFigure =
    (query.fromFigure ? getHistoricalFigure(query.fromFigure) : null) ??
    (query.viewpoint ? getHistoricalFigure(query.viewpoint) : null);
  const preferredFigureSelectable =
    !!query.viewpoint &&
    !!preparationData?.viewpoints.some(
      (viewpoint) =>
        viewpoint.id === query.viewpoint && viewpoint.isPlayable !== false,
    );

  return (
    <EventPreparation
      preparationData={preparationData}
      initialViewpointId={query.viewpoint}
      preferredFigureName={preferredFigure?.name}
      preferredFigureSelectable={preferredFigureSelectable}
    />
  );
}
