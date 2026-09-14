# THAI CONTEXT — CODEX REDESIGN V3 INSTRUCTIONS

> Place this file in the project root together with `design-v3.md`.

## Role

You are acting as a Senior Frontend Product Designer + Frontend Engineer.

Your task is to REDESIGN and POLISH the existing THAI CONTEXT frontend based on `design-v3.md`.

`design-v3.md` is the Single Source of Truth for:
- visual direction
- layout
- color
- typography
- component hierarchy
- responsive behavior
- interaction
- motion
- product UX

Do not redesign against it.

---

# 0. BEFORE CODING

Before editing any code:

1. Read `design-v3.md` completely.
2. Audit the current project structure.
3. Inspect existing:
   - Hero
   - Hero Search
   - Search Results
   - cinematic transition
   - Morphing Navbar
   - Persistent Search Composer
   - Evidence Drawer
   - Comparator
   - Word Evolution
   - Dialect Explorer
   - API / Mock fallback
   - current state machine
4. Run the project and inspect the current UI in a real browser.
5. Preserve existing functionality that already works.
6. Do NOT rewrite the entire project unless absolutely necessary.

This is a REDESIGN + MOTION POLISH task, not a new unrelated landing page.

---

# 1. CORE DESIGN DIRECTION

Follow `design-v3.md`.

The final product should feel like:

Contemporary Thai Dictionary  
× Airy White Editorial  
× Soft Ice Blue  
× Deep Navy Typography  
× Selective Liquid Glass  
× Living Book Cinematic  
× Human-designed Product UI

The experience should feel:

- modern
- calm
- readable
- premium but approachable
- Thai-first
- editorial
- alive
- trustworthy
- intentional

Do NOT make it look like a generic AI SaaS product.

Avoid:
- purple AI gradients
- excessive gradients
- neon glow
- glowing borders
- AI sparkles
- magic-wand decoration
- random blobs
- random chrome 3D objects
- excessive glassmorphism
- decorative icons without function
- chatbot-style message bubbles
- heavy dashboard styling
- strong 3D card tilt
- bouncing / elastic motion

Use visual hierarchy from:
- typography
- whitespace
- alignment
- subtle borders
- soft shadows
- content hierarchy
- restrained motion

---

# 2. HERO REDESIGN

Hero is the most visually expressive part of the site.

Keep the Meaning-first Search as the primary focus.

Suggested composition:

## Left
- THAI CONTEXT brand / editorial identity
- headline:
  `ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน`
- supporting text

## Center / Main Focus
- large Meaning-first Search
- readable
- white / ice-blue surface
- soft rounded form
- restrained shadow
- no aggressive glow

## Background / Right
- Living Book cinematic visual

The Hero should feel like:

> entering a living world of Thai language and books

But Search usability must remain more important than decoration.

---

# 3. CINEMATIC HERO BACKGROUND

Create a subtle cinematic background for the first section.

The background should have gentle ambient movement even before searching.

Possible motion:

- book breathing movement
- subtle page movement
- paper ribbon drift
- slow foreground/background depth shift
- soft daylight movement
- a small number of Thai letter / paper elements drifting slowly
- optional subtle pointer parallax on desktop

Motion must be calm and low-amplitude.

Recommended ambient cycle:

`5–10 seconds`

Recommended movement range:

```text
translate: 2–10px
rotate: 0.3–1.5deg
scale: 0.995–1.01
```

Do not make objects float aggressively.

Do not create a particle show.

Do not make the Hero feel like a game scene or AI-generated abstract environment.

Use `transform` and `opacity` where possible.

---

# 4. POINTER PARALLAX

Desktop only.

Pointer movement may affect a few visual depth layers.

Example:

```text
pointer move
→ foreground paper: 4–6px
→ book: 2–4px
→ background: 1–2px
```

Use interpolation / spring smoothing.

Never attach objects directly to the cursor.

When pointer leaves Hero:

```text
all layers
→ smoothly return to neutral position
```

Disable pointer tracking on tablet/mobile.

---

# 5. HERO SEARCH CINEMATIC TRANSITION

Only searches submitted from the Hero may trigger the cinematic transition.

Keep the existing product rule:

```text
Hero Search
→ cinematic transition
→ Results
```

Start API request and cinematic animation at the same time.

Recommended sequence:

```text
submit
→ search button loading
→ Hero ambient movement slowly settles
→ Living Book responds
→ pages / book open
→ camera or visual depth moves toward the book/page
→ soft white / ice-blue paper bloom
→ when overlay reaches coverage:
     commit search results
     jump to #search-results with behavior:auto
     morph Navbar
     show Persistent Search Composer
→ overlay fades out
→ result workspace reveals
```

Target:

`1.4–1.8s`

Normal flow should not exceed `2s`.

Do NOT use an instantaneous pure-white flash.

Use a gradual paper-light bloom.

If the API is still loading:
- do not hold the bloom screen
- enter Results
- show semantic loading / skeleton state

Search functionality must never wait for the 3D asset.

---

# 6. NAVBAR — SMOOTH MORPH

Navbar has two states.

## HERO STATE

- near transparent
- full-width
- clean
- editorial
- subtle active navigation indicator
- minimal glass effect

## FLOATING STATE

After leaving Hero:

```text
full-width navbar
→ floating rounded navbar
```

Recommended target:

```text
width:
100%
→ min(94vw, 1180px)

border radius:
small / flat
→ 24–28px

background:
transparent
→ restrained translucent white

backdrop blur:
0
→ 18–22px

shadow:
none
→ soft shadow
```

Motion:

```text
420–600ms
cubic-bezier(0.22, 1, 0.36, 1)
```

Important:

- no position jump
- no flicker
- no sudden glass appearance
- no layout shift

---

# 7. NAVBAR REVERSE MOTION

When scrolling back into Hero:

Floating Navbar must smoothly reverse to Hero Navbar.

Do NOT instantly toggle using `display:none`.

Animate:

```text
width
position / transform
border-radius
background alpha
backdrop intensity
shadow
```

If any navbar element must disappear:

```text
opacity: 1 → 0
translateY: 0 → -8px
scale: 1 → .985
```

Disable pointer events only after the exit transition has visually completed.

---

# 8. PERSISTENT SEARCH COMPOSER

Keep this as a search composer, not a chatbot input.

Its purpose is:

> search for another word/context without returning to Hero

When leaving Hero:

```text
opacity: 0 → 1
translateY: 24–36px → 0
scale: .985 → 1
```

Recommended:

```text
duration: 380–520ms
ease: cubic-bezier(0.22, 1, 0.36, 1)
```

Desktop width:

```text
min(780px, calc(100vw - 48px))
```

Visual:

- white / ice-blue selective liquid glass
- subtle backdrop blur
- thin border
- soft shadow
- no neon
- no strong gradient

---

# 9. PERSISTENT SEARCH — SMOOTH EXIT

Polish the disappearing transition carefully.

When the composer should hide, for example:

- user returns to Hero
- an overlay/state conflicts with it
- it would overlap important footer content

Animate out instead of instantly hiding.

Recommended:

```text
opacity:
1 → 0

translateY:
0 → 24–36px

scale:
1 → .985

duration:
320–450ms
```

Optional:
- reduce background alpha slightly
- reduce blur slightly

Only after transition:
- `pointer-events: none`
- `visibility: hidden`

Avoid immediate `display:none`.

When it returns, reverse the animation smoothly.

---

# 10. SCROLL EXPERIENCE

Scrolling should feel smooth and continuous.

Do NOT use aggressive scroll-jacking.

Major sections may reveal with:

```text
opacity: 0 → 1
translateY: 12–24px → 0
duration: 420–600ms
```

Small stagger:

`40–80ms`

Do not animate every paragraph.

Animate only:
- major section
- primary cards
- important interactive blocks

Use IntersectionObserver or the motion solution already used by the project.

---

# 11. HOVER MICROINTERACTIONS

Add consistent low-amplitude hover motion to interactive elements.

## Buttons

```text
hover:
translateY(-1px)
slightly stronger shadow

active:
translateY(0)
scale(.985)
```

## Clickable Cards

```text
hover:
border contrast slightly increases
shadow slightly increases
translateY(-1px to -2px)
```

No exaggerated card lifting.

## Text Links

```text
text color transition
arrow translateX 2–4px
```

## Suggestion Chips

```text
subtle background tint
slightly stronger border
translateY(-1px)
```

## Navbar Items

Use a smooth sliding underline / active indicator.

## Speaker

Hover:
- soft blue surface tint

Playing:
- transition to pause / subtle waveform state

## Share

Hover:
- subtle surface tint
- tiny icon motion

Use consistent interaction timing:

`150–240ms`

Avoid hover effects that change layout.

---

# 12. SEARCH RESULTS — KNOWLEDGE WORKSPACE

On large desktop screens, redesign Search Results into a clearer knowledge workspace.

Recommended:

```text
LEFT
Candidate List

CENTER
Selected Word Detail

RIGHT
Context Guidance + Sources
```

Do not default to a generic AI card grid for the main desktop experience.

## Candidate List

Show:
- candidate word
- relevance / score when available
- context / register
- selected state

Selection transition should be subtle.

## Selected Word Detail

Prioritize:
- headword
- pronunciation
- part of speech
- definition
- usage example
- contexts
- related words

Place primary utilities near the headword:

- Speaker
- Bookmark if supported
- Share

## Right Side

Show:
- recommended context
- usage guidance
- source / evidence shortcut

Content hierarchy must always be clearer than decoration.

---

# 13. PRONUNCIATION

Add or polish pronunciation controls.

Speaker states:

```text
idle
loading
playing
paused
error
```

Rules:

- never autoplay
- play only one word/audio at a time
- stop current audio when a new search is submitted
- use `audio_url` when available
- use the project's existing TTS fallback when appropriate
- provide accessible `aria-label`

A tiny waveform is acceptable only while audio is actually playing.

Do not use decorative waveform animation elsewhere.

---

# 14. SHARE RESULT

Add Share near the selected headword.

Support where practical:

- Web Share API
- Copy Link
- Copy Meaning / Summary

Shared content may contain:

- word
- short meaning
- context
- source summary
- deep link

Desktop:
- compact popover

Mobile:
- bottom sheet

Do not use an oversized modal.

---

# 15. GLASS UI RULE

Use Liquid Glass only where a layer genuinely floats.

Good candidates:

- Floating Navbar
- Persistent Search Composer
- selected floating controls
- Hero Search shell in moderation
- drawer header

Do NOT use glass on every result card.

Evidence and reading-heavy content should generally use solid light surfaces.

---

# 16. ICON RULE

Prefer functional line icons already available in the project.

Examples:

- Search
- Volume
- Share
- Bookmark
- Chevron
- External Link
- Book
- Source
- Compare

Do NOT add decorative AI icons such as:

- sparkle
- magic wand
- AI star
- AI brain
- network nodes

unless a real functionality explicitly requires them.

---

# 17. RESPONSIVE

Test at minimum:

```text
375
430
768
1024
1280
1440+
```

## Mobile

- simplify Hero cinematic
- no pointer parallax
- Search remains easy to use
- compact Navbar
- Persistent Composer respects safe area
- Results stack vertically
- touch targets >= 44px
- Speaker / Share remain easy to tap
- no horizontal overflow

---

# 18. REDUCED MOTION

Respect `prefers-reduced-motion`.

When enabled:

- disable pointer parallax
- disable ambient floating
- skip aggressive book/camera cinematic
- use a simple Hero → Results fade
- target around `220–320ms`
- Navbar/Composer transitions become short opacity/position transitions

Core functionality must remain identical.

---

# 19. CENTRAL EXPERIENCE STATE

Preserve the existing central state model.

Expected states:

```ts
type AppExperienceState =
  | 'hero-idle'
  | 'hero-search-submitting'
  | 'hero-cinematic-transition'
  | 'results-active'
  | 'results-searching'
  | 'evidence-open';
```

Rules:

```text
Hero Search
→ hero-search-submitting
→ hero-cinematic-transition
→ results-active

Persistent Search
→ results-searching
→ results-active
```

Persistent Search MUST NOT replay Hero cinematic.

Avoid separate uncontrolled `setTimeout()` logic spread across components.

Use one orchestration layer / timeline for Hero → Results.

---

# 20. ANIMATION RESPONSIBILITY

Keep responsibilities separated.

Example:

```text
MorphingNavbar
→ navbar morph only

Hero / Cinematic Scene
→ cinematic visual state only

Hero Search Transition
→ orchestrates Hero → Results

SearchResults
→ result reveal / replace

PersistentSearchComposer
→ its own enter / exit / loading state

Evidence Drawer
→ drawer animation
```

Only one orchestrator should control the page jump into Results.

---

# 21. PERFORMANCE

The cinematic Hero must not damage product usability.

Requirements:

- lazy-load heavy cinematic/3D assets
- preload a lightweight poster/fallback
- keep Search interactive early
- use transform / opacity for animation
- pause ambient animation when tab is hidden
- use lower quality on mobile
- no layout shift
- no hydration errors
- core Search must work if cinematic asset fails

Do not make Search wait for WebGL / 3D initialization.

---

# 22. HUMAN-DESIGNED QUALITY CHECK

Before keeping an effect, ask:

```text
Does this improve:
- understanding?
- hierarchy?
- feedback?
- navigation?
- perceived continuity?
```

If the answer is no and it is only decorative:
remove it.

The UI should feel intentionally designed, not generated from a trend checklist.

---

# 23. DO NOT BREAK EXISTING PRODUCT FLOW

Preserve all working product capabilities:

```text
Hero Search
→ cinematic
→ Results

Persistent Search
→ direct results update
→ NO cinematic replay
```

Also preserve where implemented:

- Evidence Drawer
- Comparator
- Word Evolution
- Dialect Explorer
- Pronunciation
- Share
- API / Mock fallback

Do not remove useful product functionality merely to make the screen cleaner.

---

# 24. BROWSER QA

After implementation:

1. Run the project.
2. Test the actual UI in browser.
3. Do not stop after source-code inspection.

Test:

- first Hero load
- ambient cinematic background
- pointer parallax
- Hero Search
- cinematic transition
- Navbar Hero → Floating
- Navbar Floating → Hero
- Persistent Composer enter
- Persistent Composer exit
- Persistent Search
- result selection
- Speaker
- Share
- Evidence Drawer
- fast scroll up/down
- responsive breakpoints
- reduced motion
- API loading/error/fallback if available

Fix:

- runtime errors
- console errors
- hydration issues
- navbar flicker
- scroll jumps
- layout shifts
- z-index bugs
- composer overlap
- horizontal overflow
- animation state conflicts

---

# 25. FINAL QUALITY BAR

The final experience should communicate:

> “นี่คือพจนานุกรมไทยยุคใหม่ที่มีชีวิต”

not:

> “เว็บไซต์ AI ที่นำหนังสือมาตกแต่ง”

The Hero may be cinematic and memorable.

Once users reach Results, the experience should become calmer, clearer, more editorial, and easier to trust.

Every motion should feel:

```text
smooth
subtle
purposeful
consistent
```

---

# 26. FINAL REPORT

After completing the work, report:

1. Files changed
2. Components redesigned
3. Cinematic / motion system implemented
4. Existing functionality preserved
5. Responsive issues found and fixed
6. Browser/runtime issues found and fixed
7. Build status
8. Lint/type-check status
9. Any remaining limitations or TODOs

Do not claim something is working unless you actually ran and verified it.
