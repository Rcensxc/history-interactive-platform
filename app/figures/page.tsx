import type { Metadata } from "next";
import { FigureGallery } from "@/components/figures/figure-gallery";
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
          description="先把人物浏览入口搭清楚。当前版本提供基础卡片、朝代筛选、身份筛选和详情展开，后续可以继续补充人物数量、真实头像和更完整档案。"
        />
      </section>

      <FigureGallery />
    </div>
  );
}
