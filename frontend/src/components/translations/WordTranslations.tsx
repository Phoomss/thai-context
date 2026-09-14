"use client";

import { useEffect, useState } from "react";
import type { TranslationItem } from "@/lib/accessibility-types";
import { sortTranslations } from "@/lib/accessibility-types";
import { fetchTranslations } from "@/lib/api-client";
import ProvenanceBadge from "./ProvenanceBadge";

export interface WordTranslationsProps {
  headword: string;
  initialTranslations?: TranslationItem[];
  className?: string;
}

export default function WordTranslations({
  headword,
  initialTranslations,
  className = "",
}: WordTranslationsProps) {
  const [translations, setTranslations] = useState<TranslationItem[]>(() =>
    initialTranslations !== undefined
      ? sortTranslations(initialTranslations)
      : []
  );
  const [loading, setLoading] = useState(initialTranslations === undefined);

  useEffect(() => {
    if (!headword) {
      setTranslations([]);
      setLoading(false);
      return;
    }

    if (initialTranslations !== undefined) {
      setTranslations(sortTranslations(initialTranslations));
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetchTranslations(headword, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setTranslations(sortTranslations(data));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTranslations([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [headword, initialTranslations]);

  return (
    <section
      className={`word-translations-section ${className}`.trim()}
      aria-labelledby="translations-heading"
    >
      <div className="translations-header">
        <h4 id="translations-heading">
          คำแปล &amp; ศัพท์บัญญัติ / คำทับศัพท์ (Translations)
        </h4>
        {translations.length > 0 && !loading && (
          <span className="translations-count" role="status">
            {translations.length} รายการ
          </span>
        )}
      </div>

      {loading ? (
        <div
          className="translations-loading"
          role="status"
          aria-busy="true"
          aria-label="กำลังโหลดข้อมูลคำแปล"
        >
          <div className="translations-skeleton" />
          <div className="translations-skeleton" />
        </div>
      ) : translations.length === 0 ? (
        <div className="translations-empty font-thai-reading" role="status">
          <p>ยังไม่มีข้อมูลคำแปลหรือศัพท์บัญญัติสำหรับคำนี้</p>
          <small className="font-thai-reading">
            ระบบยังไม่พบคำแปลทางการหรือคำแปลที่แนะนำในคลังข้อมูลสำหรับ &ldquo;{headword}&rdquo;
          </small>
        </div>
      ) : (
        <ul className="translations-list" aria-label="รายการคำแปล">
          {translations.map((item, index) => (
            <li
              key={`${item.translatedWord}-${item.provenance}-${index}`}
              className="translation-card"
            >
              <div className="translation-main-row">
                <div className="translation-term-wrap">
                  <span className="translation-term">{item.translatedWord}</span>
                  {item.languageCode && (
                    <span className="language-tag" aria-label={`ภาษา ${item.languageCode.toUpperCase()}`}>
                      {item.languageCode.toUpperCase()}
                    </span>
                  )}
                </div>
                <ProvenanceBadge provenance={item.provenance} />
              </div>

              {item.secondaryTranslations && item.secondaryTranslations.length > 0 && (
                <div className="secondary-translations font-thai-reading">
                  <span className="secondary-label">คำแปลเทียบเคียง:</span>{" "}
                  <span className="secondary-words">
                    {item.secondaryTranslations.join(", ")}
                  </span>
                </div>
              )}

              {item.contextualExplanation && (
                <p className="translation-explanation font-thai-reading">
                  {item.contextualExplanation}
                </p>
              )}

              {item.usageNuance && (
                <small className="translation-nuance font-thai-reading">
                  <strong>ข้อสังเกตการใช้:</strong> {item.usageNuance}
                </small>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
