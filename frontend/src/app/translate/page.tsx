import type { Metadata } from "next";
import ForeignerTranslatorView from "@/components/translate/ForeignerTranslatorView";

export const metadata: Metadata = {
  title: "🌐 แปลภาษาสำหรับชาวต่างชาติ (Thai-English Translator & Cultural Bridge) | THAI CONTEXT",
  description:
    "คู่มือแปลภาษาและสะพานเชื่อมวัฒนธรรมไทยสำหรับชาวต่างชาติและนักท่องเที่ยว ออกเสียงถูกต้องตามหลัก RTGS, ถอดรหัส 5 วรรณยุกต์ไทย, ฟังเสียงเจ้าของภาษา และเรียนรู้มารยาททางสังคมไทย",
  keywords: [
    "Thai translator for foreigners",
    "Thai culture etiquette",
    "Thai pronunciation RTGS",
    "Thai tones guide",
    "แปลภาษาสำหรับชาวต่างชาติ",
    "คู่มือวัฒนธรรมไทย",
  ],
};

export default function TranslatePage() {
  return <ForeignerTranslatorView />;
}
