"use client";
import { useState } from "react";
import { dialectEntries } from "@/lib/explorer-data";

export default function DialectExplorer() {
  const [selected, setSelected] = useState("กลาง");
  return (
    <section id="dialects" className="feature-section dialect" aria-labelledby="dialect-title">
      <header className="section-heading">
        <p>หนึ่งความหมาย หลายเสียงของภาษา</p>
        <h2 id="dialect-title">สำรวจคลังคำภาษาถิ่น 4 ภาค</h2>
        <span>คำมาตรฐาน: คิดถึง — แตะการ์ดเพื่อดูที่มาของข้อมูล</span>
      </header>
      <div className="dialect-grid">
        {dialectEntries.map((entry) => {
          const active = selected === entry.region;
          return (
            <button
              type="button"
              key={entry.region}
              className="dialect-card"
              aria-pressed={active}
              onClick={() => setSelected(entry.region)}
            >
              <span className="region">{entry.region}</span>
              <strong>{entry.word}</strong>
              <span className="dialect-meaning">{entry.meaning}</span>
              <span className={`provenance ${entry.provenance}`}>
                {entry.provenance === "official" ? "ชุดข้อมูลสาธิต · ยังไม่รับรอง" : "◌ ยังไม่มีหลักฐานทางการเพียงพอ"}
              </span>
              <span className="dialect-source">{entry.source}</span>
            </button>
          );
        })}
      </div>
      <p className="data-caveat">ข้อมูลภาษาถิ่นในหน้านี้เป็นข้อมูลสาธิต โปรดตรวจสอบกับแหล่งภาษาศาสตร์ก่อนนำไปใช้อ้างอิง</p>
    </section>
  );
}
