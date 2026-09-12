import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THAI CONTEXT — ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน',
  description: 'Semantic Thai Language Exploration Platform for Contextual Word Discovery, Lexical Evolution & Grounded AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
