## Diagnosis

`/style-guide` renders one 3,900-line component tree with every section (dozens of heavy demos: motion tickers, marquees, image cards, charts, NeonRing, coach-mark stages, live-stream demos, chart position overlays, etc.) up-front, all inside a single route file. What the user sees:

1. SSR delivers full HTML → browser paints it → looks ready.
2. React starts hydrating the giant tree on the main thread → **input is blocked for ~500ms–2s** ("卡一下").
3. Hydration finishes → attaches handlers → page becomes interactive ("闪一下，就能操作了").

The console also shows a hydration mismatch on `data-tsd-source` line/column attributes across many components (dev-tool source annotations), which forces React to patch subtrees during hydration — adding to the jank and producing the visible flash.

## Fix

Style-guide is an internal playground / reference page — no SEO value, and no reason to pay the SSR + full-tree hydration cost on first paint. Make it client-rendered with progressive mount:

1. In `src/routes/style-guide.tsx`, gate the entire page body behind a `mounted` flag set in `useEffect`. During SSR and first client paint, render only a lightweight header + skeleton (or `null`). This drops the hydration tree to near-zero → the "lag" window disappears.
2. Progressively mount below-the-fold sections using `requestIdleCallback` (falling back to `setTimeout`), so the first visible section shows immediately after mount and the rest fill in during idle time without blocking input.
3. Keep the existing anchor-scroll stabilizer, but trigger it after the full tree is mounted (not on the initial render), so `/style-guide#activation` still lands on the correct section.

No changes to other routes, no changes to `LiveStreamProvider`, no changes to individual demo components. Purely a mount-strategy change scoped to `style-guide.tsx`.

### Technical notes

- Stage 1 mount: header + sidebar + `activeNav` state + one skeleton block.
- Stage 2 mount (idle): the `<main>` sections array. Render them in one shot once idle — no need for per-section IntersectionObserver, since the cost we're avoiding is *hydration*, not render.
- Anchor scroll: run the scroll stabilizer inside a `useEffect` that depends on `mounted` so it fires after sections exist in the DOM.