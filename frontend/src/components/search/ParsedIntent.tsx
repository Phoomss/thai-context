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
  return (
    <div className="intent" data-reveal>
      <span>คุณกำลังมองหาคำที่สื่อถึง</span>
      <p>“{loading ? query : (intent?.detected_meaning ?? query)}”</p>
      <div className="intent-details">
        {intent?.context && <small>บริบท: {intent.context}</small>}
        {!!intent?.excluded_words?.length && (
          <small>ไม่รวม: {intent.excluded_words.join(" · ")}</small>
        )}
      </div>
    </div>
  );
}

