import type { Metadata } from "next";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/sarabun/400.css";
import "@fontsource/sarabun/500.css";
import "@fontsource/sarabun/600.css";
import "@fontsource/sarabun/700.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "THAI CONTEXT — โลกของคำ เริ่มที่ความหมาย",
  description:
    "พจนานุกรมไทยร่วมสมัย ค้นจากความหมาย เข้าใจบริบท เปรียบเทียบคำ และตรวจสอบแหล่งที่มา",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
