## Diagnosis
`/style-guide` is a 3700-line single-page doc that loads many heavy sections (CarnivalFlagsMarquee, image cards, live tickers, etc.). When the browser opens `…/style-guide#activation` it scrolls to the anchor on the first paint, but content above (fonts, images, dynamic components) keeps loading and layout-shifts downward, so the pinned section drifts off screen — matching the "shows the tab then jumps away" behavior.

`scroll-mt-24` is already on every `<Section>`, so the offset is fine — the problem is timing.

## Fix
Add a hash-honoring effect at the top of `StyleGuide` in `src/routes/style-guide.tsx`:

- On mount (and on `hashchange`), read `window.location.hash`.
- If present, resolve the element by id and call `scrollIntoView({ block: "start" })` at these checkpoints so late layout shifts don't drift the anchor:
  1. Immediately (next frame via `requestAnimationFrame`)
  2. After `200ms`
  3. After `800ms`
  4. Once `document.fonts.ready` resolves (guard for browsers that expose it)
- Cancel scheduled scrolls on unmount.
- Also mirror the current hash into the sticky sidebar `activeNav` when the effect resolves an id (nice-to-have — only if it fits without expanding scope).

No changes to router config (`scrollRestoration: true` stays — it only affects back/forward). No changes to any other route or component. No dependencies added.

## Files touched
- `src/routes/style-guide.tsx` — add ~25-line `useEffect` inside `StyleGuide` and nothing else.
