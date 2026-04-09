import type { Metadata } from "next";
import { TimeTheaterDemo } from "@/components/play/time-theater-demo";

export const metadata: Metadata = {
  title: "跨时空人物互动剧场",
};

export default function TimeTheaterPage() {
  return <TimeTheaterDemo />;
}
