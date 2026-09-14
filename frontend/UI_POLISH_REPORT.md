# UI polish verification

Implemented against `UI_POLISH_AND_MOTION.md`, preserving the existing blue/ice palette, Thai typography, logo, book artwork, glass surfaces and cinematic search sequence.

## Issues fixed

- Mobile hero copy was absolutely positioned within a clipped, fixed-height surface. It now participates in normal flow, with reserved artwork space and a footer that follows the content. Enlarged Thai text remains inside the hero.
- At 768px, the canvas width excluded the scrollbar gutter and selected the mobile 3D composition while CSS used the tablet layout. The scene now uses the same viewport media query as CSS. Tablet artwork is sized to clear the search form; mobile artwork stays at a fixed visual position as copy grows.
- Navbar width, height, top and padding previously animated together. Controls now retain their geometry while the existing glass surface fades in over 380ms.
- Mobile menu now closes on outside pointer interaction, focus leaving the navbar, and the brand shortcut.
- Spacing uses shared page-gutter/section-space tokens. Grid tracks can shrink around long content; word details, comparison content, era content and toast messages wrap safely.
- Mobile result cards no longer impose unnecessary minimum height. Mobile filters/selects use 16px text, and suggestions/source notes are more legible. Share sheets remain scrollable on short viewports.

## Motion and performance

- Added reusable viewport section reveal with GSAP and IntersectionObserver: 24px fade-up, 600ms duration, 65ms stagger, once per section.
- Off-screen content becomes visible immediately when keyboard focus enters it. Reduced-motion changes remove pending movement and restore content visibility.
- Refined search-result panel reveal to 600ms / 24px with the existing 55ms stagger. Inline animation properties are cleared after completion.
- Added restrained 4px card hover lift and consistent 200–240ms button/input feedback.
- Reused existing GSAP; added no animation dependency or scroll listener. Observers stop observing revealed groups and clean up on unmount. Navbar geometry no longer animates. No quantitative frame-rate benchmark was performed.

## Files changed in this task

- `src/app/globals.css`
- `src/components/SearchExperience.tsx`
- `src/components/hero/Hero3DScene.tsx`
- `src/components/layout/MorphingNavbar.tsx`
- `src/components/search/SearchResults.tsx`
- `src/components/ui/useSectionReveal.ts` (new)
- `tests/browser/ui-motion.spec.ts` (new)
- `playwright.config.ts` (separate browser traces from saved screenshots)

Existing modifications in other source files were not intentionally changed. Browser runs regenerated the existing `v3-*.png` screenshots and saved new captures under `test-results/ui-audit/`.

## Verification

- TypeScript, ESLint, production build and diff whitespace checks pass.
- Existing unit suite: 24 tests pass.
- Full Chrome browser suite: 20 tests passed against production before the final 3D positioning correction.
- After that correction: viewport audits at 375, 390, 768, 1024, 1440 and 1920px, enlarged mobile text, reduced motion, existing cinematic/audio/share tests passed. Final tablet sizing and input/filter/hover checks were rerun: 3/3 pass. Production build and lint were rerun successfully.
- One new focus test initially attempted to focus the intentionally disabled pre-hydration input. It now waits for the input to become editable; the rerun passes.
- Browser checks cover search, replacement search, filters, candidate selection, comparison, era keyboard navigation, dialect selection, share/copy, recorded audio, evidence dialogs, menu dismissal, reverse scrolling, footer behavior, WebGL fallback, slow/empty/failed search and reduced motion.
- No page overflow or runtime/React/hydration errors were reported by the viewport audits. Screenshots were inspected, including the tablet overlap that DOM overflow checks alone did not detect.
- Production HTTP checks pass for static assets, 0/1/2/3/5-result responses, delayed upstream, malformed/error fallbacks and input validation. These checks use a controlled local upstream, not an external production API.

## Preserved application behavior

API requests, routing, query handling, reducer/state machine, request cancellation, response staging, existing cinematic transition, loading/error states, audio handling and evidence provenance were preserved. No live data behavior or visual identity was redesigned.
