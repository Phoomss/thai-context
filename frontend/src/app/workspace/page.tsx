import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import WorkspaceView from "@/components/workspace/WorkspaceView";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "AI Language Workspace — THAI CONTEXT",
  description:
    "พื้นที่ทำงานภาษาอัจฉริยะ ค้นพบ เปรียบเทียบ แต่งประโยค เรียบเรียง และตรวจทานภาษาไทยอย่างครบวงจร",
};

export default function WorkspacePage() {
  return (
    <div className="workspace-page-container">
      {/* Top Navigation Header matching THAI CONTEXT theme */}
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
                จาก “ค้นคำ” สู่ “เข้าใจภาษา”
              </span>
            </div>
            <span className="workspace-badge-tag">
              ✦ AI Language Workspace
            </span>
          </Link>

          <div className="workspace-nav-actions">
            <Link href="/ai-assistant" className="workspace-nav-btn font-thai-reading" style={{ color: "var(--accent)", fontWeight: 600 }}>
              ✨ ผู้ช่วย AI
            </Link>
            <Link href="/word-scrambler" className="workspace-nav-btn">
              🔀 สุ่มเปลี่ยนคำ
            </Link>
            <Link href="/#dictionary" className="workspace-nav-btn">
              📖 ค้นตามเล่ม
            </Link>
            <Link href="/" className="workspace-nav-btn" style={{ fontWeight: 600, color: "var(--accent)" }}>
              ← กลับหน้าค้นหาหลัก
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Interactive Canvas */}
      <main style={{ flex: 1 }}>
        <WorkspaceView />
      </main>

      <Footer />
    </div>
  );
}
