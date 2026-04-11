import type { Metadata } from "next";
import { EventHall } from "@/components/events/event-hall";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = {
  title: "历史事件馆",
};

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <section className="mb-8">
        <SectionTitle
          eyebrow="History Events"
          title="历史事件馆"
          description="从事件进入体验。这里会逐步收纳不同历史事件，并统一汇合到同一套事件准备页与正式剧情页流程中。"
        />
      </section>

      <EventHall />
    </div>
  );
}
