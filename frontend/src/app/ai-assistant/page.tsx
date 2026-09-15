import type { Metadata } from "next";
import AIAssistantPageView from "@/components/ai/AIAssistantPageView";

export const metadata: Metadata = {
  title: "✨ ผู้ช่วย AI ภาษาไทย — AI Agent Workspace | THAI CONTEXT",
  description:
    "ศูนย์ปฏิบัติการตัวแทนอัจฉริยะ (Multi-Agent System) สำหรับงานภาษาไทย ร่างข้อความ ขัดเกลาสำนวน เปรียบเทียบความหมาย และตรวจทานหลักภาษา",
};

export default function AIAssistantPage() {
  return <AIAssistantPageView />;
}
