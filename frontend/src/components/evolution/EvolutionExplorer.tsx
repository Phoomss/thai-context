"use client";
import { useState } from "react";
import { evolutionEras } from "@/lib/explorer-data";

export default function EvolutionExplorer({ word }: { word: string }) {
  const [active, setActive] = useState(1);
  const era = evolutionEras[active];
  return (
    <section id="evolution" className="feature-section evolution" aria-labelledby="evolution-title">
      <header className="section-heading">
        <p>ภาษาเดินทางไปพร้อมกับสังคม</p>
        <h2 id="evolution-title">วิวัฒนาการคำศัพท์ตามยุคสมัย</h2>
        <span>สำรวจสถานะของ “{word || "คำที่เลือก"}” ในชุดข้อมูลแต่ละยุค</span>
      </header>
      <div className="evolution-card">
        <div className="era-tabs" role="tablist" aria-label="เลือกยุคของคำศัพท์">
          {evolutionEras.map((item, index) => (
            <button
              key={item.year}
              role="tab"
              id={`era-tab-${index}`}
              aria-controls="era-panel"
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={e => {
                const next = e.key === "ArrowRight" ? (index + 1) % 3 : e.key === "ArrowLeft" ? (index + 2) % 3 : e.key === "Home" ? 0 : e.key === "End" ? 2 : -1;
                if (next >= 0) { e.preventDefault(); setActive(next); document.getElementById(`era-tab-${next}`)?.focus(); }
              }}
            >
              <span>พ.ศ.</span> {item.year}
            </button>
          ))}
        </div>
        <article
          key={era.year}
          id="era-panel"
          role="tabpanel"
          aria-labelledby={`era-tab-${active}`}
          className="era-content"
          data-era-state={era.state}
        >
          <div>
            <span className="era-status">{era.label} · {era.state}</span>
            <h3>{word || "คำที่กำลังสำรวจ"}</h3>
          </div>
          <div>
            <p>{era.definition}</p>
            <small>{era.note}</small>
          </div>
        </article>
      </div>
    </section>
  );
}
