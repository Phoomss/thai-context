# THAI CONTEXT — SEARCH EXPERIENCE REFINEMENT
## Glass UI / Liquid Glass Mode Switcher + Dual Search Experience

You are working on the existing THAI CONTEXT frontend project.

Your task is to ANALYZE the current implementation first, then carefully improve ONLY the search interaction area and related navigation controls.

Do NOT redesign the entire website.

The existing Hero, background artwork, 3D book, typography, color direction, search flow, results system, and overall visual identity are already approved.

The goal is to refine the current experience into a premium:

Glass UI + Liquid Glass + Minimal Clean Tech

visual system.

---

# 1. FIRST: ANALYZE THE EXISTING PROJECT

Before editing code, inspect the actual implementation.

Identify:

1. Navbar component
2. Hero component
3. Hero Search component
4. Persistent / Bottom Search Composer
5. Search state management
6. Search API submission flow
7. Hero cinematic transition
8. Search results state
9. AI Assistant implementation
10. AI Workspace implementation
11. Navbar morph / floating behavior
12. Existing glass UI styles
13. Existing animation library
14. Existing design tokens
15. Responsive layout behavior

Do not assume the architecture.

Understand it first.

Reuse existing logic whenever possible.

---

# 2. IMPORTANT PRODUCT STRUCTURE

The project intentionally has TWO visible search/chat inputs.

These are NOT duplicate components that should be removed.

KEEP BOTH.

They represent two different product states.

---

# SEARCH ENTRY POINT 01 — HERO SEARCH

The Hero Search is the primary search input shown on the landing page.

Its purpose:

User enters website
→ types initial search
→ submits query
→ API starts
→ cinematic transition plays
→ search results become active

This search must remain.

Do NOT remove it.

Do NOT replace it with the second composer.

Do NOT merge both visible inputs together.

---

# SEARCH ENTRY POINT 02 — PERSISTENT COMPOSER

The second search/chat composer appears after the user reaches the results experience.

It is positioned around the bottom-center area.

Its purpose:

- search again
- refine query
- describe another meaning
- continue interaction
- ask another question
- interact with different search modes

This component must ALSO remain.

Persistent Composer should NOT replay the Hero cinematic animation.

Its flow should be approximately:

results-active
→ user submits new query
→ results-searching
→ results update directly

---

# 3. FINAL VISUAL STRUCTURE

The Hero and Results areas intentionally use different placement.

This is important.

---

## HERO LAYOUT

The Hero Search comes FIRST.

The Glass Mode Switcher comes UNDER the Hero Search.

Approximate structure:

        ┌───────────────────────────────────────────────┐
        │ Search / Ask text                          ↑ │
        └───────────────────────────────────────────────┘

                    ╭──────────────────────────╮
                    │ Context Search           │
                    │ AI Assistant             │
                    │ AI Workspace             │
                    ╰──────────────────────────╯

In actual implementation the mode selector is horizontal:

[ Context Search | AI Assistant | AI Workspace ]

The selector must sit BELOW the Hero Search.

Do NOT place it above the Hero Search.

This Hero layout is intentional.

---

## RESULTS / PERSISTENT LAYOUT

In the search results state, reverse the relationship.

The Glass Mode Switcher comes FIRST.

The Persistent Composer comes UNDER it.

Approximate structure:

                ╭────────────────────────────────────────────╮
                │ Context Search | AI Assistant | AI Workspace│
                ╰────────────────────────────────────────────╯

        ┌──────────────────────────────────────────────────────┐
        │ Continue Search / Ask                            ↑ │
        └──────────────────────────────────────────────────────┘

This entire interaction cluster stays around the bottom-center area.

---

# 4. SAME COMPONENT, DIFFERENT PLACEMENT

Create or refine ONE reusable component for the mode selector.

Example naming:

SearchModeSwitcher

or follow the existing naming conventions.

Use the SAME component in:

Hero
and
Results / Persistent Composer

But render it at different locations.

Conceptually:

Hero:

<HeroSearch />
<SearchModeSwitcher />


Results:

<SearchModeSwitcher />
<PersistentSearchComposer />

Do not create two visually different switcher implementations.

The style, state, animation, and semantics should stay consistent.

---

# 5. MODES

Use exactly these 3 labels:

Context Search
AI Assistant
AI Workspace

Default:

Context Search

Remove the old feature labels from the Navbar:

- Word Scrambler
- ผู้ช่วย AI
- AI Workspace

Do NOT leave duplicates in the Navbar.

Map the existing functionality:

Word Scrambler
→ Context Search

ผู้ช่วย AI
→ AI Assistant

AI Workspace
→ AI Workspace

Do not create fake functionality.

Reuse the existing routes, handlers, states, panels, or components already implemented.

---

# 6. NAVBAR

Only remove these three feature controls:

- Word Scrambler
- ผู้ช่วย AI
- AI Workspace

Preserve normal navigation.

Examples:

- หน้าหลัก
- เปรียบเทียบคำ
- สำรวจคำ
- ภาษาถิ่น
- other existing standard navigation items

Preserve:

- THAI CONTEXT logo
- Navbar height
- Navbar layout
- existing scroll behavior
- floating Navbar
- morph animation
- glass style
- typography
- responsive behavior

Do NOT redesign the entire Navbar.

The Navbar should simply become cleaner.

---

# 7. MASTER VISUAL DIRECTION

Design language:

Premium Glass UI
+
Liquid Glass
+
Minimal Clean Tech
+
Soft Thai Digital Editorial

The interface should feel:

- modern
- premium
- lightweight
- calm
- intelligent
- trustworthy
- refined
- smooth
- slightly futuristic

But NOT:

- cyberpunk
- gaming UI
- neon
- RGB
- excessively glowing
- gradient-heavy
- generic AI-generated design

The project should still feel clearly like THAI CONTEXT.

---

# 8. GLASS UI PRINCIPLES

Do not simulate glass only with opacity.

The glass should have real visual depth through a combination of:

- transparency
- backdrop blur
- subtle surface tint
- border highlight
- inner highlight
- soft shadow
- layered depth
- controlled contrast

Use the existing background behind the element to create the glass effect.

---

# 9. OUTER MODE SWITCHER

The outer container should look like a floating Liquid Glass capsule.

Shape:

- pill / capsule
- radius around 999px
- compact height
- visually lightweight

Suggested starting values:

height:
approximately 48–56px desktop

padding:
4–6px

border-radius:
999px

background:
rgba(255,255,255,0.22–0.42)

backdrop-filter:
blur(16px–24px)
saturate(120%–140%)

border:
1px solid rgba(255,255,255,0.35–0.55)

Use values that visually match the actual page rather than blindly copying exact numbers.

---

# 10. LIQUID GLASS DEPTH

Add subtle depth.

Potential composition:

box-shadow:

0 8px 28px rgba(30, 70, 120, 0.08)

plus:

inset 0 1px 0 rgba(255,255,255,0.5)

Optionally:

inset 0 -1px 0 rgba(100,150,220,0.08)

The component should feel like thin optical glass.

Not frosted plastic.

Do NOT make the shadow dark or heavy.

---

# 11. GLASS HIGHLIGHT

Use a subtle highlight near the upper edge.

This may be achieved using:

- inset shadow
- ::before pseudo-element
- very subtle white overlay

Example concept:

top surface catches light
bottom surface becomes slightly denser

Do not create a visible white stripe.

The effect should be almost subconscious.

---

# 12. ACTIVE SEGMENT

The active item is a smaller pill moving inside the outer glass container.

Example:

╭──────────────────────────────────────────────────╮
│ ╭───────────────╮                                │
│ │ Context Search│   AI Assistant   AI Workspace │
│ ╰───────────────╯                                │
╰──────────────────────────────────────────────────╯

Active state should have:

- slightly higher opacity
- stronger glass surface
- subtle blue-white tint
- clearer border
- stronger text
- subtle soft shadow
- subtle inner highlight

Suggested direction:

background:
rgba(255,255,255,0.58–0.76)

border:
1px solid rgba(255,255,255,0.65)

shadow:
very soft

Do not make it look like a solid blue Bootstrap button.

It should still look like glass.

---

# 13. INACTIVE SEGMENTS

Inactive segments:

- mostly transparent
- readable
- visually quieter than active state
- no heavy background

Hover:

- slightly increase surface opacity
- subtle border response
- small text contrast increase

Do not make all three segments visually equally strong.

---

# 14. ACTIVE PILL MOTION

The active glass pill should MOVE between modes.

Do not simply change text color.

Preferred effect:

Context Search
→ click AI Assistant
→ inner active pill smoothly slides to AI Assistant

If Framer Motion already exists:

consider using layoutId.

If not:

use CSS transform / transitions.

Do not introduce a large dependency only for this effect.

---

# 15. MOTION STYLE

All animation should be smooth and controlled.

Target duration:

180ms–280ms

Use easing similar to:

cubic-bezier(0.22, 1, 0.36, 1)

or the project's existing easing tokens.

Avoid:

- excessive bounce
- elastic animation
- strong spring overshoot
- distracting floating motion

Liquid Glass should feel physically smooth, not cartoonish.

---

# 16. HOVER

Hover interaction should be subtle.

Possible effects:

- surface opacity +5–10%
- translateY(-1px)
- slightly brighter border
- small text contrast increase

Do NOT scale aggressively.

Do NOT add a large glow.

---

# 17. PRESS / ACTIVE FEEDBACK

On mouse/touch press:

- translateY(0)
or
- scale around 0.98–0.99

Very subtle.

The UI should feel responsive but stable.

---

# 18. TYPOGRAPHY

Use the existing THAI CONTEXT typography system.

Do not introduce a new font.

For English mode labels:

- clean
- medium weight
- readable
- not oversized

Suggested:

font-size:
14–16px desktop

font-weight:
500–600

Text must remain crisp.

Do not use extremely light font weight over transparent glass.

---

# 19. COLOR

Stay within the current THAI CONTEXT visual system.

Primary direction:

- white
- soft blue
- cool light gray
- deep navy text

Do not introduce:

- purple neon
- pink neon
- orange glow
- rainbow borders

Glass depth should come primarily from light, transparency, blur, and shadow.

Not from saturated colors.

---

# 20. HERO SEARCH

Do NOT radically redesign the existing Hero Search.

Preserve:

- current overall dimensions
- layout
- current main input
- current search icon
- submit button
- suggestion chips
- typography
- current visual hierarchy
- relationship to Hero headline
- current background
- 3D book
- cinematic experience

Only refine it where necessary so it visually works with the new Liquid Glass mode selector.

---

# 21. HERO MODE SWITCHER POSITION

The Mode Switcher must be BELOW the Hero Search.

This is the intended hierarchy:

Hero headline

↓

Description

↓

Hero Search

↓

Mode Switcher

↓

suggestions / surrounding Hero elements where appropriate

The Hero Search remains the primary visual CTA.

The mode selector is secondary.

---

# 22. HERO SPACING

Maintain clear breathing room.

Suggested starting relationship:

Hero Search
↓
16–24px
↓
SearchModeSwitcher

Do not place them so far apart that they feel unrelated.

Do not place them so close that they visually merge.

Adjust based on current composition.

---

# 23. RESULTS PERSISTENT COMPOSER

Keep the current Persistent Search / Chat Composer.

It should continue to appear around the bottom-center area.

Do not remove it.

Do not replace it with the Hero Search.

---

# 24. RESULTS MODE SWITCHER POSITION

In Results mode:

SearchModeSwitcher
↓
12–18px
↓
Persistent Composer

They should visually feel like one control cluster.

But remain separate components.

---

# 25. PERSISTENT COMPOSER — LIQUID GLASS REFINEMENT

Improve the persistent composer visually so it belongs to the same glass family.

Use:

- translucent white surface
- subtle blur
- soft border
- rounded large capsule
- light blue shadow
- subtle top highlight
- clean submit button

Avoid making the input completely transparent.

Text readability is more important than the glass effect.

---

# 26. SUBMIT BUTTON

The circular submit control should remain on the right side.

Use the existing behavior.

Visual direction:

- circular
- slightly denser surface than composer
- clear ArrowUp / Search icon
- premium blue / glass-blue treatment
- subtle highlight
- subtle depth

Avoid strong gradients.

Hover:

small elevation / brightness increase.

Press:

small tactile response.

---

# 27. CONTEXT SEARCH MODE

Default mode:

Context Search

This is the core THAI CONTEXT experience.

Meaning:

Search by Meaning, Not Just by Word

Hero placeholder can continue using the current production copy.

If dynamic placeholders are appropriate:

Context Search:

"อธิบายความหมายหรือสิ่งที่คุณกำลังนึกถึง..."

Persistent Composer:

"เล่าความหมายอื่นที่คุณกำลังคิด..."

Do not replace better existing copy without reason.

---

# 28. AI ASSISTANT MODE

AI Assistant should reuse the existing assistant functionality.

Potential placeholder:

"ถามเกี่ยวกับคำ ความหมาย หรือการใช้ภาษาไทย..."

Do not create another disconnected chatbot.

---

# 29. AI WORKSPACE MODE

AI Workspace should reuse the current implementation.

If Workspace is route-based:

keep navigation behavior.

If it opens another interface:

reuse that interface.

Do not force Workspace into the Context Search results architecture if it was intentionally designed as another workspace.

---

# 30. MODE STATE

Inspect how the app currently stores state.

Prefer one clear mode model:

"context-search"
"ai-assistant"
"ai-workspace"

Avoid duplicate independent state if possible.

The mode state may live in:

- existing global store
- context
- route
- URL state
- component state

Choose based on the existing architecture.

Do not perform unnecessary architectural rewrites.

---

# 31. TWO SEARCH COMPONENTS — SHARED LOGIC

Hero Search and Persistent Composer may use the same API.

If appropriate, reuse shared search logic.

Concept:

                    Search Controller
                     /            \
                    /              \
             Hero Search      Persistent Composer

But their UI and transitions differ.

Hero Search:

submit
→ cinematic transition
→ results

Persistent Composer:

submit
→ update results directly

Do not replay Hero cinematic animation.

---

# 32. HERO CINEMATIC TRANSITION

Preserve the current transition.

Hero Search should still be the entry point that triggers it.

Do not break:

- overlay
- timing
- navbar morph
- jump/scroll behavior
- result reveal
- result cards
- loading state

---

# 33. NAVBAR MORPH

The current Navbar may transform when scrolling or entering search results.

Preserve this.

Removing the three feature controls must not break:

- width calculation
- alignment
- scroll animation
- floating glass behavior
- responsive navigation

After removing the three controls, rebalance spacing cleanly.

---

# 34. RESPONSIVE — DESKTOP

Desktop:

Hero:

[ Large Hero Search ]

        [ Context Search | AI Assistant | AI Workspace ]


Results:

        [ Context Search | AI Assistant | AI Workspace ]

[ Persistent Composer                              ↑ ]

Keep spacing clean.

---

# 35. RESPONSIVE — TABLET

Keep the 3 modes visible if possible.

Reduce:

- horizontal padding
- gap
- font size slightly

Do not wrap the segmented control into two rows unless absolutely required.

---

# 36. RESPONSIVE — MOBILE

The selector must not cause horizontal page scrolling.

Use:

- full available width if necessary
- equal-width tabs
- reduced gap
- smaller horizontal padding
- slightly smaller text

Keep all 3 labels readable.

Prefer:

Context Search
AI Assistant
AI Workspace

Do not replace labels with unexplained icons.

---

# 37. TOUCH TARGETS

Interactive controls should remain comfortable on touch devices.

Minimum practical target:

approximately 40–44px height.

Do not shrink the mode selector excessively on mobile.

---

# 38. ACCESSIBILITY

Use appropriate interaction semantics.

Depending on behavior:

button + aria-pressed

or

role="tablist"
role="tab"
aria-selected

Use whichever best matches the actual UX.

Requirements:

- keyboard accessible
- focus-visible states
- readable contrast
- active state not dependent only on color
- reasonable screen-reader labels

---

# 39. REDUCED MOTION

Respect:

prefers-reduced-motion

If enabled:

- remove sliding spring animation
- use instant or short fade/state transition

Functionality must remain unchanged.

---

# 40. PERFORMANCE

Avoid expensive full-screen backdrop blur layers.

Blur only the relevant glass elements.

Avoid large animated filter areas.

Do not degrade scroll performance.

Do not add heavy dependencies.

---

# 41. GLASS FALLBACK

If backdrop-filter is unsupported:

the component should still look acceptable using:

- semi-opaque surface
- border
- shadow

Do not make content unreadable without backdrop blur.

---

# 42. DESIGN CONSISTENCY

Create reusable styling/tokens where useful.

Examples conceptually:

--glass-bg
--glass-border
--glass-highlight
--glass-shadow
--glass-blur
--glass-active-bg

Only if consistent with the current project architecture.

Avoid scattering arbitrary rgba values throughout many components.

---

# 43. DO NOT OVER-GLASS THE PAGE

Glass should be used strategically.

Main targets:

- SearchModeSwitcher
- Persistent Composer refinement
- relevant submit/action controls
- existing Navbar glass style where already present

Do NOT turn every card, result, filter, and panel into glass.

The page needs solid areas for readability.

---

# 44. DO NOT MODIFY

Do not redesign or replace:

- Hero background image
- Hero artwork
- 3D book
- main Hero headline
- logo
- overall page structure
- search result cards
- evidence architecture
- filters
- unrelated routes
- footer

Unless a tiny spacing change is required by this task.

---

# 45. DESIGN TARGET

The finished search experience should feel similar in philosophy to:

- premium modern OS interface
- Apple-inspired optical glass
- high-end AI product composer
- clean editorial interface

BUT it must remain original to THAI CONTEXT.

Do not copy any specific product UI exactly.

---

# 46. FINAL HERO VISUAL

Expected approximate structure:

THAI CONTEXT HERO

ไม่ต้องรู้คำ
ก็รู้ว่าควรใช้คำไหน

supporting copy


┌────────────────────────────────────────────────────┐
│ Search / Ask                                   ● │
└────────────────────────────────────────────────────┘

          ╭────────────────────────────────────────────╮
          │ [Context Search] AI Assistant AI Workspace │
          ╰────────────────────────────────────────────╯


suggestion chips

---

# 47. FINAL RESULTS VISUAL

Search Results
Filters
Word Results
Evidence
etc.


              ╭────────────────────────────────────────────╮
              │ [Context Search] AI Assistant AI Workspace │
              ╰────────────────────────────────────────────╯

      ┌──────────────────────────────────────────────────────┐
      │ Continue Search / Ask                            ● │
      └──────────────────────────────────────────────────────┘

The bottom interaction cluster should feel visually floating and premium.

---

# 48. VALIDATION

After implementation:

Run the project and test the actual UI.

Verify:

1. Hero Search still exists
2. Persistent Composer still exists
3. Neither input was removed
4. Hero Mode Switcher is BELOW Hero Search
5. Results Mode Switcher is ABOVE Persistent Composer
6. Both switchers use the same reusable component
7. Default mode is Context Search
8. Active glass pill animates smoothly
9. AI Assistant still works
10. AI Workspace still works
11. Navbar no longer shows duplicated feature controls
12. Hero cinematic flow still works
13. Persistent searches do not replay Hero cinematic
14. Navbar morph still works
15. Desktop layout looks balanced
16. Tablet works
17. Mobile works
18. No horizontal overflow
19. No hydration errors
20. No runtime errors
21. No console errors introduced
22. TypeScript passes
23. lint/build/tests pass where available

Fix issues caused by this change.

---

# 49. IMPLEMENTATION APPROACH

Do not immediately start rewriting large files.

Use this order:

1. Analyze existing components.
2. Locate duplicate search logic.
3. Locate current feature navigation behavior.
4. Create/refine shared SearchModeSwitcher.
5. Remove 3 mode controls from Navbar.
6. Integrate switcher below Hero Search.
7. Integrate switcher above Persistent Composer.
8. Connect existing behavior.
9. Refine Liquid Glass styling.
10. Add responsive behavior.
11. Test actual interactions.
12. Fix regressions.

Keep the diff focused.

---

# 50. FINAL DESIGN PRINCIPLE

The visual hierarchy must remain:

SEARCH FIRST
MODE SECOND

on the Hero.

And:

MODE FIRST
CONTINUED SEARCH SECOND

on the Results page.

The two search boxes are intentional product entry points.

Do not remove either one.

The final design should make THAI CONTEXT feel:

cleaner,
more premium,
more cohesive,
more interactive,
and more modern,

without making the interface visually noisy or overly AI-styled.