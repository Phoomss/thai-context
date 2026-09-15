# TASK: Match Hero Search UI with Bottom Composer + Auto-Grow

Analyze the current THAI CONTEXT implementation first.

This is a focused UI refinement.

Do NOT redesign the whole Hero.
Do NOT change search logic, API flow, cinematic transition, result flow, background artwork, 3D book, headline, or unrelated components.

---

## GOAL

Adjust the Hero Search UI so that its visual style matches the current Bottom / Persistent Search Composer more closely.

The two search inputs should feel like they belong to the same design system.

However:

- Hero Search remains the primary search on the landing page
- Bottom Composer remains the persistent search/chat input in results
- Do NOT merge them into one component unless the existing architecture already supports a clean shared base component

---

## HERO SEARCH VISUAL DIRECTION

Refine the Hero Search to use the same visual language as the Bottom Composer:

- soft white / translucent surface
- Liquid Glass / Glass UI treatment
- rounded capsule shape
- thin subtle border
- soft cool shadow
- subtle top highlight
- clean typography
- right-side circular submit button
- smooth focus state
- premium floating appearance

Do not make it look heavier than the Bottom Composer.

The Hero version may be slightly wider, but should feel clearly related.

---

## DEFAULT HEIGHT

The Hero Search should NOT be excessively tall when empty or when the user types only one line.

Target a compact single-line height similar to the Bottom Composer.

Suggested desktop starting point:

- total height around 58–66px
- comfortable vertical padding
- submit button vertically centered in the single-line state

Use the actual current layout to determine the best final value.

---

## AUTO-GROW BEHAVIOR

When the user types more content, the Hero Search must expand vertically.

Behavior:

1 line
→ compact height

2 lines
→ grow slightly

3+ lines
→ continue expanding

up to a reasonable maximum height.

After reaching max height:
→ textarea becomes internally scrollable

When text is deleted:
→ shrink back down automatically

Do NOT keep the input permanently expanded.

---

## IMPLEMENTATION

Use a textarea or existing auto-growing text input implementation.

Preferred logic:

- reset textarea height to auto
- measure scrollHeight
- set height to scrollHeight
- clamp to max height

Suggested max height:

approximately 140–180px

Use the actual Hero layout to avoid covering other content.

Do not hardcode multiple breakpoints for each line count.

---

## KEYBOARD BEHAVIOR

Preserve current keyboard behavior.

If current behavior is:

Enter = submit
Shift+Enter = new line

keep it.

Do not break:

- Enter submit
- Shift+Enter newline
- focus
- IME / Thai typing
- current search submission
- cinematic transition

---

## SUBMIT BUTTON

Keep the circular submit button on the right side.

Single-line state:
- vertically centered

Multi-line / expanded state:
- keep visually stable
- prefer bottom-right alignment with consistent inset if needed

Do not let the button jump awkwardly as the textarea grows.

Suggested inset:

right: 12–16px
bottom: 10–14px

Adjust according to the existing component.

---

## SHADOW

Match the Bottom Composer's refined floating shadow.

Use a wider, softer shadow so the Hero Search separates clearly from the background.

Prefer:

- larger blur radius
- larger spread footprint
- low opacity
- soft blue/cool tone

Do NOT use a dark black shadow.

Do NOT use neon glow.

The goal is:

floating glass search surface

not:

glowing AI bar

---

## FOCUS STATE

When focused:

- slightly clearer border
- slightly brighter glass surface
- slightly stronger/wider shadow
- smooth transition

Avoid aggressive blue rings.

Keep focus accessible and visible.

---

## BORDER / GLASS

Use the same glass tokens/styles as the Bottom Composer where possible.

Prefer reusing shared variables/components such as:

- glass background
- glass border
- glass shadow
- glass blur
- focus shadow

Do not duplicate lots of hardcoded rgba values if shared tokens already exist.

---

## RESPONSIVE

Desktop:
- compact single-line
- auto-grow vertically
- preserve current Hero composition

Tablet:
- maintain width balance
- no overlap with Hero art

Mobile:
- width fits viewport
- auto-grow still works
- no horizontal overflow
- submit button remains visible
- max-height should not cover most of the screen

---

## IMPORTANT

Hero Search and Bottom Composer should now look like the same product family.

But they still have different responsibilities:

Hero Search:
initial search + cinematic transition

Bottom Composer:
continued search + direct results update

Do NOT change that behavior.

---

## DO NOT MODIFY

Do not redesign:

- Hero headline
- Hero description
- background
- 3D book
- suggestion chips
- Navbar
- Results UI
- filters
- Evidence UI
- routes

Only adjust the Hero Search UI and any reusable shared search-input styling needed for consistency.

---

## VALIDATION

After implementation:

1. Open the Hero page.
2. Verify empty Hero Search is compact.
3. Type one short line.
4. Type 2–4 lines.
5. Confirm it grows smoothly.
6. Delete text.
7. Confirm it shrinks back.
8. Verify submit button stays aligned.
9. Verify Enter/Shift+Enter behavior.
10. Verify Thai IME input.
11. Verify cinematic search flow still works.
12. Verify desktop/tablet/mobile.
13. Verify no overlap with Hero content.
14. Verify no console/runtime errors.
15. Verify TypeScript/build/lint.

Fix any regression caused by this change.

---

## FINAL DESIGN TARGET

Hero Search should feel like:

the same Liquid Glass family as the Bottom Composer,
but slightly more prominent because it is the primary Hero CTA.

Default:
compact

Typing more:
auto-expand

Deleting text:
auto-shrink

Overall feel:
clean,
premium,
soft,
modern,
and consistent with THAI CONTEXT.