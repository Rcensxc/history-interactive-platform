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
          description="从人物进入历史。当前版本提供基础卡片、朝代筛选、身份筛选和详情展开，并把人物相关事件入口纳入同一条产品路径里。"
        />
      </section>

      <FigureGallery />
    </div>
  );
}
