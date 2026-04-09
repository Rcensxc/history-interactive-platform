import type { Metadata } from "next";
import { HongmenDemo } from "@/components/play/hongmen-demo";

export const metadata: Metadata = {
  title: "鸿门宴试玩",
};

export default function HongmenBanquetPage() {
  return <HongmenDemo />;
}
