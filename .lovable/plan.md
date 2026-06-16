# Fix share poster preview — remove decorative circles, show the whole poster

## Two issues from the screenshot

1. **绿框上的圆圈** — `PosterTicketFrame` currently draws 4 black-filled "die-cut notches" centered on each edge of the neon bracket. They look like random circles glued onto the border, not ticket-stub punch-outs. They add no information — kill them.
2. **海报展示不完整** — `ShareDialog`'s preview slot fixes the poster at `w-[240px]` and lets the surrounding column scroll. The 1080×1700 poster ends up ~378px tall, plus header/channel rows/URL row push total content past `max-h-[90vh]`, so the bottom (referral code + QR) gets clipped behind the channel buttons.

## Changes

### 1. `src/components/sports/promo/ComboChallengeSection.tsx` — `PosterTicketFrame`
- Delete the 4-notch block (the `[top, bottom, left, right]` map that renders the black circles).
- Keep the 2px neon outline + inner faint border. The bracket stays a clean neon-edged rectangle.
- Remove the now-unused `notchSize` prop; drop the prop from both `<PosterTicketFrame>` call sites.

### 2. `src/components/sports/share/ShareDialog.tsx` — poster preview slot (line 121–125)
- Switch the preview wrapper so the **whole poster fits inside the available dialog height with no internal scroll**:
  - Remove `overflow-y-auto` on the preview container.
  - Replace the fixed `w-[240px]` div with a height-driven box: `aspect-[1080/1700] h-full w-auto max-w-full` inside a flex container that has `min-h-0 flex-1` (already there). This keeps the poster's container-query typography intact while ensuring it never exceeds the panel height.
  - Bump dialog `max-h` from `90vh` to `min(92vh, 760px)` so on short desktop windows (e.g. 777px tall) the full poster plus header + channel + URL rows always fit.
- Mobile sheet: already has `overflow-y-auto`, so the user can scroll the whole sheet — leave behavior, just sync the same `aspect-[1080/1700]` sizing so on tall phones the poster doesn't get squeezed.

### 3. `/style-guide` mirror
- Update the `ShareCardPreview` showcase to reflect the cleaner frame (no notches). No new tokens.

## Out of scope
- No font/color/copy changes inside the poster.
- No new icons or borders — just removing the 4 circles.
