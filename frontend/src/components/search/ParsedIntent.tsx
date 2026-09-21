import type { SearchResponse } from "@/lib/search-types";

export default function ParsedIntent({
  result,
  query,
  loading,
}: {
  result: SearchResponse | null;
  query: string;
  loading: boolean;
}) {
  const intent = result?.query_understanding;
  const recommendations = result?.recommendations ?? [];
  const wordsWithComparison = recommendations.filter((r) => r.comparison);

  return (
    <div className="intent" data-reveal>
      <span>คุณกำลังมองหาคำที่สื่อถึง</span>
      <p className="font-thai-reading">“{loading ? query : (intent?.detected_meaning ?? query)}”</p>
      <div className="intent-details font-thai-reading">
        {intent?.context && <small>บริบท: {intent.context}</small>}
        {!!intent?.excluded_words?.length && (
          <small>ไม่รวม: {intent.excluded_words.join(" · ")}</small>
        )}
      </div>

      {/* Context Guidance & Disambiguation Box */}
      {!loading && wordsWithComparison.length >= 2 && (
        <div
          className="intent-guidance-box"
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "rgba(240, 249, 255, 0.9)",
            border: "1px solid #bae6fd",
            borderRadius: "12px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
              color: "#0369a1",
              fontWeight: 700,
              fontSize: "12.5px",
            }}
          >
            <span>💡 คำแนะนำแยกแยะบริบท เพื่อเลือกคำให้ตรงกับสิ่งที่คุณต้องการสื่อ:</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {wordsWithComparison.slice(0, 3).map((w) => (
              <div
                key={w.headword}
                style={{
                  background: "#ffffff",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e0f2fe",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <strong style={{ color: "#0284c7", fontSize: "13px" }}>{w.headword}</strong>
                  <span style={{ fontSize: "10.5px", color: "#64748b" }}>{w.pos}</span>
                </div>
                {w.comparison?.emphasis && (
                  <p style={{ margin: 0, color: "#334155", lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>จุดเน้น: </span>
                    {w.comparison.emphasis}
                  </p>
                )}
                {w.comparison?.use_when && (
                  <p style={{ margin: 0, color: "#059669", fontSize: "11px", lineHeight: 1.4 }}>
                    ✓ {w.comparison.use_when}
                  </p>
                )}
                {w.comparison?.sentence_pattern && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "11px",
                      background: "#f8fafc",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      color: "#475569",
                      fontFamily: "monospace",
                    }}
                  >
                    📐 {w.comparison.sentence_pattern}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
