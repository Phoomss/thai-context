# Search glass refinement — validation

## Architecture and focused changes

- `SearchExperience` still owns the reducer, request cancellation, request IDs and `/api/search` submission. Hero starts the request before playing the existing GSAP cinematic; the persistent composer updates results directly.
- `HeroSearch` and `PersistentSearchComposer` both remain mounted. The shared `SearchModeSwitcher` is placed 16px below the Hero input and 12px above the persistent composer.
- The existing Assistant drawer remains the source of Assistant mode state. Opening it selects AI Assistant in both switchers; closing it restores Context Search and focus. Its existing streaming endpoint is unchanged.
- AI Workspace remains navigation to `/workspace`, with the original workspace UI and `/api/v1/ai/workspace` behavior. A route link is used instead of pretending it is an inline search tab.
- Removed only the three feature controls from the primary Navbar. Standard links, branding, breakpoints, floating glass and morph behavior remain.
- Existing Word Scrambler was a separate anchor to the embedded word game, not semantic search. The game remains available in the page; Context Search uses the existing meaning search controller as required.
- Refined the shared switcher to a 390px maximum width and 42px desktop height (48px mobile for 40px touch targets). Its 220ms sliding pill uses translucent material, top-left reflection, outer elevation and upper/lower inner highlights. Focus-visible has a thin optical ring and soft spread; reduced motion removes the slide. No dependencies added.
- The persistent textarea now starts as one row, measures its content height up to 160px, becomes internally scrollable at the limit and shrinks back to 44px when cleared. The form is 60px in the one-line state, bottom-aligns its submit control and uses layered wide cool shadows with a slightly lifted focus state.
- One layout correction outside the search controls: the dictionary grid's fixed 360px minimum caused page overflow at 320px. Its minimum now fits the available width; its card design is unchanged.

## Verification

Production preview: http://localhost:3100

- `npm.cmd run build`: passed, including production TypeScript.
- `npm.cmd run typecheck`: passed.
- `npm.cmd test -- --maxWorkers=2 --testTimeout=15000`: 199/199 passed. Initial unrestricted parallel run timed out on three search-flow tests; all 12 search-flow tests also passed in isolation.
- `TEST_BASE_URL=http://localhost:3100 npm.cmd run test:browser -- search-modes.spec.ts navbar.spec.ts`: 13/13 passed on the final production build.
- Browser coverage: 320, 390, 768, 1024 and 1440px search interactions; 375 through 1920px Navbar morph. Tested real DOM, actual HTTP endpoints (no response interception), keyboard activation/focus return, Assistant streaming, Workspace submission, both Workspace entry points, reduced motion, touch-target size, overflow and cinematic non-replay.
- Visually inspected Chrome screenshots of Hero, one-line Results and multiline Results on desktop, tablet and mobile. Images are in `test-results/search-glass/`. Confirmed hierarchy, spacing, centering, readable labels, optical depth, wide soft shadow, auto-grow/shrink, stable bottom-aligned submit control and unchanged artwork/book.
- ESLint passed for the new switcher, search integration files and browser tests. Full-project lint still reports 9 existing errors and 2 warnings in ContextComparator, SentenceQuirkifier, DictionaryBrowser and EvolutionExplorer. The dictionary warning concerns an unchanged effect dependency.

## Existing environment limitations

- The local search API reports `mode: demo`. Assistant and Workspace have pre-existing fallback behavior when the upstream service is unavailable. End-to-end UI and local endpoint interaction passed; this does not certify a live AI backend. No new fake responses were introduced.
- The existing dialect mapping endpoint intentionally responds 404 for words missing from its local data (including ประสิทธิภาพ and วิจัย). Browser tests record those known 404s separately in attachments and assert there are no other console or runtime errors.
- The already-running development server at port 3000 showed a React Client Manifest error on `/workspace`; the fresh production server at port 3100 passed the complete flow. The existing dev process was not stopped.
- Build emits six pre-existing filesystem tracing warnings in search/evolution data loading.
