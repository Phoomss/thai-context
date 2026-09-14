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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {/* Top Simple Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-100 hover:text-sky-400 transition-colors"
          >
            <Image
              src="/assets/thai-context-logo.png"
              width={34}
              height={30}
              alt="THAI CONTEXT Logo"
            />
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-sm">
                <span className="text-white">THAI </span>
                <span className="text-sky-400">CONTEXT</span>
              </span>
              <span className="text-[10px] text-slate-400">
                AI Language Workspace
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            >
              ← กลับหน้าแรก (Search)
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Interactive Canvas */}
      <main className="flex-1">
        <WorkspaceView />
      </main>

      <Footer />
    </div>
  );
}
