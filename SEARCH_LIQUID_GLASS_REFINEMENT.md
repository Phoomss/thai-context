# THAI CONTEXT — LIQUID GLASS REFINEMENT PASS
## Compact Mode Switcher + Apple-like Active Glass + Auto-Growing Bottom Composer

Read the existing design/spec file first:

@SEARCH_LIQUID_GLASS_REFACTOR.md

Treat that file as the main source of truth.

This task is NOT a redesign.

This is a focused refinement pass on the already-implemented search mode switcher and persistent bottom search composer.

Analyze the current implementation first, then improve only the areas described below.

Do not modify unrelated parts of the website.

---

# PRIMARY GOALS

Improve these 3 areas:

1. Make the Search Mode Switcher noticeably smaller and more refined.
2. Make the selected/focused mode feel like Apple-style Liquid Glass.
3. Reduce the default height of the bottom search composer, but allow it to grow automatically when the user types multiple lines.
4. Increase the bottom composer's shadow size/spread so the floating control is easier to visually distinguish from the page.

---

# 1. MODE SWITCHER IS CURRENTLY TOO LARGE

Current component:

[ Context Search | AI Assistant | AI Workspace ]

The current overall size feels too large and visually competes with the search field.

The mode switcher must be a SECONDARY control.

The search field remains the primary interaction.

Make the switcher:

- smaller
- tighter
- lighter
- more elegant
- more compact
- more like a premium OS control

Do NOT make it tiny or hard to click.

---

# 2. TARGET SIZE — DESKTOP

Use these as design targets, not rigid hard-coded requirements:

Outer switcher height:
approximately 40–46px

Outer padding:
approximately 3–4px

Individual segment height:
approximately 34–40px

Horizontal segment padding:
approximately 12–18px

Label font size:
approximately 13–14px

Font weight:
500–600

Gap:
very small, approximately 2–4px

Border radius:
999px

The final component should feel compact and sophisticated.

It should no longer look like a large navigation bar.

---

# 3. VISUAL PRIORITY

Visual hierarchy must be:

Search Input
↓
Mode Switcher

NOT:

Mode Switcher ≈ Search Input

The switcher must feel subordinate to the input.

On Hero:

[ Large Hero Search ]

       [ compact mode switcher ]

On Results:

       [ compact mode switcher ]

[ bottom persistent composer ]

---

# 4. ACTIVE / SELECTED MODE — APPLE-LIKE LIQUID GLASS

The selected mode should feel like a floating optical glass layer.

Do not make the active state a flat blue button.

Do not make it a simple white pill.

The active state should visually feel like:

- translucent glass
- layered depth
- soft refraction
- top-edge light reflection
- subtle inner highlight
- slightly brighter center
- very soft blue/white tint
- floating above the outer glass rail

Use a refined Apple-like Liquid Glass philosophy.

Do NOT copy Apple UI literally.

Use the concept:
optical depth + transparency + soft reflections + subtle material movement.

---

# 5. ACTIVE PILL MATERIAL

Suggested direction:

background:
semi-transparent white with very subtle blue tint

backdrop-filter:
blur + slight saturation

border:
very subtle white translucent border

box-shadow:
a combination of:
- subtle outer soft shadow
- top inner white highlight
- lower inner cool-blue depth

Example conceptual composition:

background:
rgba(255, 255, 255, 0.48–0.68)

border:
1px solid rgba(255,255,255,0.6)

box-shadow:
0 4px 14px rgba(30, 80, 140, 0.08),
inset 0 1px 0 rgba(255,255,255,0.75),
inset 0 -1px 0 rgba(70,120,190,0.08)

Use values appropriate to the actual page.

Do not blindly paste these numbers if existing tokens already provide better equivalents.

---

# 6. ACTIVE PILL REFLECTION

Add a very subtle optical highlight.

Possible implementation:

::before pseudo-element

with:

- soft translucent highlight
- concentrated near top-left / upper region
- very low opacity
- pointer-events: none

The reflection must be subtle.

Do NOT make it look like a glossy Web 2.0 button.

Do NOT use a visible diagonal shine animation.

---

# 7. ACTIVE PILL MOVEMENT

The selected glass pill should slide smoothly between modes.

Example:

Context Search
→ AI Assistant

The inner glass pill should visually move into the new position.

If Framer Motion already exists:

use shared `layoutId` or the project's existing layout animation system.

If not:

use lightweight CSS transform/layout transitions.

Do not install another dependency only for this effect.

---

# 8. ACTIVE PILL ANIMATION

Target:

duration:
approximately 180–240ms

easing:
smooth, premium, controlled

Recommended feel:

cubic-bezier(0.22, 1, 0.36, 1)

or reuse the current motion tokens.

Avoid:

- bounce
- overshoot
- elastic motion
- exaggerated spring animation

---

# 9. FOCUS STATE

Keyboard focus must also look polished.

For `:focus-visible`:

Use:

- thin translucent blue/white focus ring
- soft glow/spread
- visible but elegant

Do NOT use the default browser outline if it conflicts visually.

But accessibility must remain clear.

Focus should NOT rely only on a color change.

---

# 10. OUTER SWITCHER GLASS

The outer rail should be visually quieter than the active pill.

Use:

- translucent white
- lower opacity than active segment
- soft backdrop blur
- thin border
- very subtle shadow

Suggested direction:

background:
rgba(255,255,255,0.18–0.32)

backdrop-filter:
blur(14px–20px)
saturate(120%–135%)

border:
1px solid rgba(255,255,255,0.28–0.42)

The active pill must clearly sit ABOVE the outer rail.

---

# 11. REMOVE EXCESS VISUAL BULK

Reduce any unnecessary:

- padding
- oversized gaps
- oversized icons
- excessive height
- thick borders
- strong shadow

The mode switcher should feel like a compact toolbar / segmented control.

Not like another major card.

---

# 12. HERO SWITCHER

Preserve the existing required position:

Hero Search

↓

Mode Switcher

Do NOT move the Hero mode switcher above the Hero Search.

It should now feel smaller and less dominant.

Recommended spacing:

Hero Search
↓
12–18px
↓
Compact Mode Switcher

Adjust based on the actual Hero layout.

---

# 13. RESULTS SWITCHER

Preserve:

Mode Switcher

↓

Persistent Bottom Composer

Recommended spacing:

Compact Mode Switcher
↓
10–14px
↓
Persistent Composer

The two should feel like one floating interaction cluster.

---

# 14. BOTTOM SEARCH COMPOSER — CURRENT ISSUE

The persistent bottom search/chat composer currently feels too tall when empty or when the user enters a short one-line query.

Reduce its default height.

The composer should initially feel compact.

But it must expand automatically when the input becomes multi-line.

---

# 15. BOTTOM COMPOSER TARGET SIZE

Desktop default / single-line state:

approximately 56–64px total height

Do not make it excessively thin.

It must still feel premium and easy to interact with.

Suggested vertical internal padding:

approximately 10–14px

Submit button should remain properly centered.

---

# 16. AUTO-GROW INPUT

Use a textarea or the project's existing auto-growing text input implementation.

Behavior:

1 line:
compact height

2 lines:
grow slightly

3+ lines:
continue growing until maximum height

After max-height:
textarea becomes internally scrollable.

Suggested behavior:

min-height:
approximately one-line composer height

max input height:
approximately 140–180px

Use the actual layout to determine the best value.

---

# 17. AUTO-GROW IMPLEMENTATION

Do not use a hardcoded fixed height.

Preferred behavior:

textarea height:
auto

Then resize to:

scrollHeight

up to configured max-height.

When text is deleted:

the input must shrink back down.

Expected behavior:

empty
→ compact

type multiple lines
→ grows

delete content
→ shrinks

Do not leave the composer permanently expanded.

---

# 18. TEXTAREA UX

The input should support:

Enter behavior according to the current product behavior.

Preserve existing submit logic.

If current behavior is:

Enter = submit
Shift+Enter = newline

keep it.

If another behavior already exists, preserve that architecture.

Do not accidentally break keyboard interaction.

---

# 19. SUBMIT BUTTON ALIGNMENT

The submit button remains on the right.

When the composer grows vertically:

Do NOT vertically center the button in the entire tall textarea if that feels awkward.

Prefer:

bottom aligned with appropriate inset

or use the current product convention.

For example:

right:
12–16px

bottom:
10–14px

The submit button should remain easy to reach and visually stable.

---

# 20. BOTTOM COMPOSER SHADOW — IMPORTANT

Increase the shadow presence.

Current shadow is not visually distinct enough from the background.

The composer is a floating persistent control and should be immediately visible.

Increase:

- shadow blur radius
- shadow spread
- overall shadow footprint

But keep opacity controlled.

The goal is a WIDER soft shadow.

Not a darker shadow.

---

# 21. SHADOW DIRECTION

Use layered shadows.

Suggested conceptual structure:

box-shadow:

0 12px 30px rgba(35, 80, 130, 0.10),
0 24px 70px rgba(35, 80, 130, 0.10),
0 0 50px rgba(80, 140, 210, 0.06)

plus a subtle glass border/highlight.

This gives:

- local elevation
- wide floating separation
- soft ambient depth

Do not create a black drop shadow.

Do not create a strong neon blue glow.

---

# 22. SHADOW GOAL

The bottom composer should be identifiable even over:

- white cards
- light backgrounds
- result areas
- very pale blue surfaces

The shadow should visually separate it from the content behind it.

Think:

"floating command surface"

not:

"glowing neon bar"

---

# 23. BOTTOM COMPOSER GLASS MATERIAL

Keep/refine the composer with:

- semi-transparent white
- blur
- thin translucent border
- subtle top highlight
- soft cool shadow

But text readability must remain high.

Suggested background opacity:

around 0.70–0.88

The persistent composer should be more opaque than the mode switcher because it contains text.

---

# 24. COMPOSER BORDER

Use a subtle boundary.

Possible direction:

1px rgba(110,160,220,0.20–0.35)

or existing design token.

On focus:

slightly increase border contrast.

Do not use a saturated blue 2px border.

---

# 25. COMPOSER FOCUS STATE

When the textarea is focused:

increase:

- border clarity
- glass brightness slightly
- shadow footprint slightly

Example:

idle:
wide soft shadow

focus:
slightly larger / clearer ambient shadow

This should help the user immediately understand where input is active.

Do not animate aggressively.

---

# 26. FOCUS SHADOW

Focus should feel like the composer becomes optically lifted.

Possible focus effect:

- +10–15% border contrast
- +5–10% background opacity
- slightly larger ambient shadow
- subtle cool halo

Avoid glowing rings.

---

# 27. MOBILE

Mobile requires special attention.

Mode Switcher:

- compact
- all 3 labels remain readable
- no horizontal page overflow
- minimum touch height roughly 40px
- reduce horizontal padding if required

Bottom Composer:

- width adapts to viewport
- default height remains compact
- auto-grow works
- submit button remains visible
- no content overlap
- respect safe-area inset

Use:

padding-bottom:
calc(base + env(safe-area-inset-bottom))

if the component is fixed near the bottom.

---

# 28. RESPONSIVE WIDTH

Do not let the Persistent Composer become excessively wide.

Use the project's existing responsive constraints.

Conceptually:

width:
min(90–94vw, existing max-width)

The mode switcher should be narrower than the composer.

This visual difference is intentional.

---

# 29. VISUAL HIERARCHY

Final visual hierarchy:

HERO

[ Primary Hero Search ]
      ↓
[ compact Liquid Glass Mode Switcher ]


RESULTS

[ compact Liquid Glass Mode Switcher ]
      ↓
[ Floating auto-growing Persistent Composer ]

The switcher must no longer compete visually with the search inputs.

---

# 30. DO NOT CHANGE

Do not redesign:

- Hero artwork
- Hero 3D book
- background
- headline
- result cards
- filters
- evidence UI
- unrelated navigation
- footer
- search API
- overall route structure

Do not remove either search component.

Do not modify unrelated animation.

---

# 31. KEEP EXISTING MODE ARCHITECTURE

Modes remain exactly:

Context Search
AI Assistant
AI Workspace

Default:

Context Search

Keep current behavior and routing.

This pass is primarily visual and interaction refinement.

---

# 32. REUSE COMPONENTS

The Hero mode switcher and Results mode switcher must continue to share the same reusable component.

Do not duplicate markup/styling.

Support differences via props only where necessary.

Example concept:

<SearchModeSwitcher variant="hero" />

<SearchModeSwitcher variant="persistent" />

But avoid adding variants if placement alone is enough.

---

# 33. PERFORMANCE

Avoid expensive constantly animated blur effects.

Do not animate `backdrop-filter` continuously.

Prefer animating:

- transform
- opacity
- layout position
- shadow within reasonable limits

Keep interaction smooth.

---

# 34. PREFERS REDUCED MOTION

Respect:

prefers-reduced-motion

When enabled:

- remove sliding animation
- keep state change clear
- avoid unnecessary transform effects

---

# 35. VALIDATION

After implementation, run and visually inspect the actual application.

Verify:

1. Mode switcher is clearly smaller than before.
2. It no longer competes with the search input.
3. Active mode looks like premium Liquid Glass.
4. Active glass pill moves smoothly.
5. Focus-visible is accessible.
6. Hero Search remains unchanged in purpose.
7. Hero switcher remains BELOW Hero Search.
8. Results switcher remains ABOVE Persistent Composer.
9. Bottom composer is shorter in the one-line state.
10. Composer expands smoothly on multiline input.
11. Composer shrinks when text is deleted.
12. Submit button remains aligned during expansion.
13. Bottom composer shadow is wider and easier to see.
14. Shadow remains soft, not dark.
15. Focus state increases visibility.
16. Desktop works.
17. Tablet works.
18. Mobile works.
19. No horizontal overflow.
20. No layout jumping.
21. No hydration errors.
22. No console errors.
23. TypeScript/build/lint remain valid.

Fix any regression caused by the changes.

---

# FINAL DESIGN INTENT

The mode selector should feel:

small,
refined,
optical,
premium,
liquid,
and secondary.

The bottom composer should feel:

compact when idle,
comfortable while typing,
automatically expandable,
clearly floating,
and visually easy to locate.

Use Apple-like Liquid Glass principles:

transparency
+ reflection
+ optical depth
+ soft elevation
+ restrained motion

without directly copying Apple's interface and without making the THAI CONTEXT UI feel generic or overly AI-generated.