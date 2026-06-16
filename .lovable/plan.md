## Problem

On `/style-guide`, the **World Cup Carnival** section renders full viewport width while every other section sits inside the page's max-w-7xl column. The cause is the page-level grid:

```
src/routes/style-guide.tsx:282
<div className="mx-auto grid max-w-7xl grid-cols-[200px_1fr] gap-10 px-6 py-10">
```

CSS grid's `1fr` track is shorthand for `minmax(auto, 1fr)`. The `auto` minimum means a child with very wide intrinsic content can push the track wider than the viewport. The Carnival demos contain exactly that:

- `ScoreboardHero` embeds `CarnivalFlagsMarquee`, whose inner track is `w-max` with ~192 duplicated flag `<img>`s (~7,000+ px wide). The marquee uses `overflow-hidden` to clip visually, but the intrinsic min-width still propagates up through `w-full` chains into the grid track.
- `ScoreboardTicker` and the bottom Marquee demo (line 1897-1899) do the same.

Result: the right grid column resolves to ~7000px, the page scrolls horizontally, and the hero looks "ultra-wide" — exactly what the screenshot shows.

Other sections aren't affected because their content has bounded intrinsic widths.

## Fix

Single-character grid-track change. No component edits.

**src/routes/style-guide.tsx (line 282)**

```diff
- <div className="mx-auto grid max-w-7xl grid-cols-[200px_1fr] gap-10 px-6 py-10">
+ <div className="mx-auto grid max-w-7xl grid-cols-[200px_minmax(0,1fr)] gap-10 px-6 py-10">
```

`minmax(0, 1fr)` forces the right track's minimum to 0, so wide intrinsic content is contained by the track instead of expanding it. The marquee's `overflow-hidden` then actually clips, and the Carnival hero sits at the same column width as every other section.

## Why not patch the marquee instead

The marquee is intentionally `w-max` so the `translateX(-50%)` loop is seamless. Constraining it would break the animation, and the real `/promo/world-cup` page renders it correctly today because that page's containers aren't placed inside an `auto`-min grid track. The root cause is the playground's grid definition, so that's where the fix belongs.

## Verification

After the change:
- WC Carnival hero matches the column width of neighboring sections.
- No horizontal page scroll on `/style-guide`.
- `ScoreboardTicker` and `CarnivalFlagsMarquee` demos clip cleanly inside their cards.
- Sticky left TOC remains 200px and unaffected.
