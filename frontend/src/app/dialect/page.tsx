import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Scale, Sparkles, Compass } from "lucide-react";
import DialectDiscoveryView from "@/components/dialect/DialectDiscoveryView";
import DialectExplorer from "@/components/dialect/DialectExplorer";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "คลังคำภาษาถิ่น ๔ ภาค (Dialect Intelligence) — THAI CONTEXT",
  description:
    "ค้นพบคำภาษาถิ่นจากความหมาย เปรียบเทียบความแตกต่างระหว่าง 4 ภูมิภาค พร้อมหลักฐานอ้างอิงและคำอธิบายเชิงวัฒนธรรมโดย AI",
};

export default function DialectPage() {
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
            <Link
              href="/modern-vocabulary"
              style={{
                color: "#475569",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>คำศัพท์สมัยใหม่</span>
            </Link>
            <span
              style={{
                color: "#059669",
                fontWeight: 600,
                backgroundColor: "#ecfdf5",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>ภาษาถิ่น ๔ ภาค</span>
            </span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dialect Intelligence & Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            นวัตกรรมค้นพบภาษาถิ่นจากความหมาย
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            &quot;ไม่ต้องรู้คำถิ่น ก็สามารถค้นพบคำที่คนในแต่ละพื้นที่ใช้จากความหมายเดียวกันได้&quot;
            <br />
            สืบค้น เชื่อมโยง เปรียบเทียบ ๔ ภูมิภาค พร้อมหลักฐานทางภาษาศาสตร์ที่พิสูจน์ได้
          </p>
        </div>
      </section>

      {/* Main Interactive Dialect Discovery View */}
      <main style={{ flex: 1 }} className="py-6">
        <DialectDiscoveryView />

        {/* Traditional Dialect Category Explorer */}
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-12 border-t border-slate-200">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              หมวดหมู่คำภาษาถิ่นยอดนิยม (สำรวจแบบคลาสสิก)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              หมวดสนทนายอดนิยม, หมวดเครือญาติ, และหมวดอวัยวะร่างกาย จากคลังข้อมูลภาษาถิ่น ๓ ภาค
            </p>
          </div>
          <DialectExplorer />
        </div>
      </main>

      <Footer />
    </div>
  );
}
