import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Scale, Sparkles } from "lucide-react";
import ModernVocabularyExplorer from "@/components/modern-vocabulary/ModernVocabularyExplorer";
import Footer from "@/components/layout/Footer";
import { filterModernTerms } from "@/lib/modern-vocabulary-store";

export const metadata = {
  title: "คลังคำศัพท์ภาษาไทยร่วมสมัย — THAI CONTEXT",
  description:
    "สำรวจคำศัพท์สมัยใหม่ คำศัพท์ AI เทคโนโลยี สื่อสังคม และสแลง พร้อมแหล่งอ้างอิงและระดับความเป็นทางการ",
};

export default function ModernVocabularyPage() {
  const initialData = filterModernTerms({ limit: 100 });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header
        style={{
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          padding: "12px 24px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Image
              src="/assets/thai-context-logo.png"
              width={36}
              height={32}
              alt="THAI CONTEXT"
            />
            <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.01em" }}>
              <span style={{ color: "#0f172a" }}>THAI </span>
              <span style={{ color: "#2563eb" }}>CONTEXT</span>
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13.5px" }}>
            <Link
              href="/"
              style={{
                color: "#475569",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>หน้าแรก (ค้นหาความหมาย)</span>
            </Link>
            <Link
              href="/#compare"
              style={{
                color: "#475569",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              <span>เปรียบเทียบคำ</span>
            </Link>
            <span
              style={{
                color: "#2563eb",
                fontWeight: 600,
                backgroundColor: "#eff6ff",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>คำศัพท์สมัยใหม่</span>
            </span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <ModernVocabularyExplorer initialTerms={initialData.items} />
      </main>

      <Footer />
    </div>
  );
}
