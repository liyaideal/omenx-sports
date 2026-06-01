## Goal
Let users drag the bottom-right live stream mini player anywhere on screen so it doesn't cover important UI.

## Changes
**`src/components/sports/live/GlobalStreamMiniPlayer.tsx`**
- Replace the fixed `bottom-4 right-4` wrapper with a position-controlled container driven by local state `{ x, y }` (px, anchored top-left). Initial value computed on mount from viewport size to match the current bottom-right placement.
- Add a small drag handle bar at the top of the card (thin grip strip with `cursor-grab` / `cursor-grabbing`, a centered grip icon, tooltip "Drag to move"). Only this strip starts a drag — the poster keeps its click-to-fullscreen behavior, and the action bar buttons stay clickable.
- Implement drag via pointer events (`pointerdown` on handle → `pointermove`/`pointerup` on window). Clamp position within viewport (8px padding) and re-clamp on `window resize`.
- Persist the last position to `localStorage` (`omenx.miniPlayer.pos`) so it survives navigation/reload. Fall back to default bottom-right if no stored value or stored value is off-screen.
- Snap-to-edge on release: if released within 24px of left/right viewport edge, snap to that edge (keeps the "docked" feel). Vertical position is free.
- Keep the existing `hidden sm:block` (desktop only); mobile is out of scope per prior direction.

## Out of scope
- Resizing the mini player.
- Mobile drag behavior.
- Multi-monitor / cross-tab sync.

## QA
- Drag from handle works; clicking poster still opens fullscreen; Trade / Fullscreen / Open event / Close buttons still work.
- Position persists after route change and reload.
- Resizing the browser keeps the player on-screen.
