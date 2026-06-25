## Bug
Opening the event dropdown in the sidebar renders the popover panel detached from the trigger — it appears far below, overlapping/sitting beneath the MARKET card instead of directly under the "Switch event" button.

Root cause: the popover uses `absolute top-full` inside the EventSelector wrapper. Sibling cards (MARKET, BET SIZE, …) sit in normal flow, and the `z-30` overlay anchoring depends on the wrapper's box being exactly the button height. Any layout shift or sibling overlap leaves the popover misaligned and visually disconnected from the trigger.

## Fix
Reimplement the dropdown using a **fixed-position portal** anchored to the trigger's bounding rect:

1. In `src/features/pinpoint/EventSelector.tsx`:
   - On open, measure the trigger button via `getBoundingClientRect()` and render the panel through `createPortal(..., document.body)` with `position: fixed`, left/top/width derived from the trigger rect (so it always sits flush under the button).
   - Recompute position on `resize` / `scroll` while open.
   - Use `z-index: 60` so it floats above every sidebar card.
   - Keep outside-click + Escape close logic; broaden the outside test to ignore clicks inside the portal node.
2. Add a small max-height (e.g. `max-h-[60vh]`) with `overflow-y-auto` so long event lists scroll instead of overflowing the viewport.
3. Keep existing styling (pp-card, chips, score, live clock, open-count badges) unchanged — purely a positioning fix.

No business logic, no other files touched.