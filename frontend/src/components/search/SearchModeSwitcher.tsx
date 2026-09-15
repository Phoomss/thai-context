import type { CSSProperties } from "react";
import Link from "next/link";

export type SearchMode = "context-search" | "ai-assistant" | "ai-workspace";

export default function SearchModeSwitcher({
  mode = "context-search",
  onContextSearch,
  onAssistant,
  assistantHref = "/ai-assistant",
  searchHref = "/",
  workspaceHref = "/workspace",
  disabled = false,
}: {
  mode: SearchMode;
  onContextSearch?: () => void;
  onAssistant?: () => void;
  assistantHref?: string;
  searchHref?: string;
  workspaceHref?: string;
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
      {onContextSearch ? (
        <button
          type="button"
          aria-pressed={mode === "context-search"}
          aria-current={mode === "context-search" ? "page" : undefined}
          onClick={onContextSearch}
          disabled={disabled}
        >
          Context Search
        </button>
      ) : (
        <Link
          href={searchHref}
          aria-current={mode === "context-search" ? "page" : undefined}
        >
          Context Search
        </Link>
      )}
      <Link
        href={assistantHref}
        role="button"
        aria-pressed={mode === "ai-assistant"}
        aria-current={mode === "ai-assistant" ? "page" : undefined}
        onClick={() => {
          if (onAssistant) {
            onAssistant();
          }
        }}
      >
        AI Assistant
      </Link>
      <Link
        href={workspaceHref}
        aria-current={mode === "ai-workspace" ? "page" : undefined}
      >
        AI Workspace
      </Link>
    </div>
  );
}
