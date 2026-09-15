import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SearchModeSwitcher from "../src/components/search/SearchModeSwitcher";

describe("SearchModeSwitcher Component", () => {
  afterEach(cleanup);
  it("renders all 3 modes: Context Search, AI Assistant, and AI Workspace", () => {
    render(
      <SearchModeSwitcher
        mode="context-search"
        onContextSearch={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /context search/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /ai assistant/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /ai workspace/i })).toBeTruthy();
  });

  it("links AI Assistant to /ai-assistant page by default", () => {
    render(
      <SearchModeSwitcher
        mode="context-search"
        onContextSearch={() => {}}
      />
    );

    const assistantLink = screen.getByRole("button", { name: /ai assistant/i });
    expect(assistantLink.getAttribute("href")).toBe("/ai-assistant");
  });

  it("supports custom assistantHref with prefilled query/word", () => {
    render(
      <SearchModeSwitcher
        mode="context-search"
        onContextSearch={() => {}}
        assistantHref="/ai-assistant?word=%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E"
      />
    );

    const assistantLink = screen.getByRole("button", { name: /ai assistant/i });
    expect(assistantLink.getAttribute("href")).toContain("/ai-assistant?word=");
  });

  it("triggers onContextSearch callback when Context Search button is clicked", () => {
    const handleContextSearch = vi.fn();
    render(
      <SearchModeSwitcher
        mode="context-search"
        onContextSearch={handleContextSearch}
      />
    );

    const contextBtn = screen.getByRole("button", { name: /context search/i });
    fireEvent.click(contextBtn);
    expect(handleContextSearch).toHaveBeenCalledTimes(1);
  });
});
