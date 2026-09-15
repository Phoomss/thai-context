import type { CSSProperties } from "react";

export type SearchMode = "context-search" | "ai-assistant" | "ai-workspace";

export default function SearchModeSwitcher({
  mode,
  onContextSearch,
  onAssistant,
  disabled = false,
}: {
  mode: SearchMode;
  onContextSearch: () => void;
  onAssistant: () => void;
  disabled?: boolean;
}) {
  const activeIndex = mode === "context-search" ? 0 : mode === "ai-assistant" ? 1 : 2;
  return (
    <div
      className="search-mode-switcher"
      role="group"
      aria-label="Search mode"
      inert={disabled}
      style={{ "--active-mode": activeIndex } as CSSProperties}
    >
      <span className="search-mode-pill" aria-hidden="true" />
      <button type="button" aria-pressed={mode === "context-search"} onClick={onContextSearch} disabled={disabled}>
        Context Search
      </button>
      <button type="button" aria-pressed={mode === "ai-assistant"} aria-haspopup="dialog" onClick={onAssistant} disabled={disabled}>
        AI Assistant
      </button>
      <a href="/workspace" aria-current={mode === "ai-workspace" ? "page" : undefined}>
        AI Workspace
      </a>
    </div>
  );
}
