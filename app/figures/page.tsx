import type { Metadata } from "next";
import { FigureGallery } from "@/components/figures/figure-gallery-refined";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = {
  title: "历史人物馆",
};

export default function FiguresPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
      <section className="mb-8">
        <SectionTitle
          eyebrow="History Figures"
          title="历史人物馆"
          description="从人物进入历史。"
        />
      </section>

      <FigureGallery />
    </div>
  );
}
