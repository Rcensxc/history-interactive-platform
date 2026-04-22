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
          description="正式体验历史事件，从不同视角进入现场。"
        />
      </section>

      <EventHall />
    </div>
  );
}
