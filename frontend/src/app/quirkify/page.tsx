import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SentenceQuirkifier from "@/components/quirkify/SentenceQuirkifier";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Word Scrambler — สุ่มเปลี่ยนคำในประโยค | THAI CONTEXT",
  description:
    "เครื่องมือสุ่มเปลี่ยนเฉพาะคำในประโยคภาษาไทย พร้อมนิยามทางการจากพจนานุกรมราชบัณฑิตยสภา ๗๗,๐๐๐+ รายการ",
};

export default function QuirkifyPage() {
  return (
    <div className="workspace-page-container">
      {/* Top Navigation Header matching THAI CONTEXT design system */}
      <header className="workspace-navbar" role="banner">
        <div className="workspace-navbar-inner">
          <Link href="/" className="workspace-navbar-brand" aria-label="THAI CONTEXT หน้าแรก">
            <Image
              src="/assets/thai-context-logo.png"
              width={42}
              height={36}
              alt="THAI CONTEXT Logo"
              priority
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className="brand" style={{ fontSize: "20px", lineHeight: 1 }}>
                <span className="brand-thai">THAI</span>
                <span className="brand-context">CONTEXT</span>
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>
                คลังคำและเครื่องมือภาษาไทย
              </span>
            </div>
            <span
              className="workspace-badge-tag"
              style={{ background: "#fef3c7", color: "#b45309", borderColor: "#fde68a" }}
            >
              ✦ Word Scrambler
            </span>
          </Link>

          <div className="workspace-nav-actions">
            <Link href="/workspace" className="workspace-nav-btn">
              ⚡ AI Workspace
            </Link>
            <Link href="/#dictionary" className="workspace-nav-btn">
              📖 ค้นตามเล่ม
            </Link>
            <Link href="/" className="workspace-nav-btn" style={{ fontWeight: 600, color: "var(--accent)" }}>
              ← กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <SentenceQuirkifier embedded={false} />
      </main>

      <Footer />
    </div>
  );
}
