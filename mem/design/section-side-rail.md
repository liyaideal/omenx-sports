---
name: Section side-rail height contract
description: Sticky side panels (Spotlight etc.) must use h-fit + lg:self-start, never h-full; long left columns wrap to xl:grid-cols-2
type: design
---
When a section has a main column + side rail (e.g. Season Events with Spotlight):

- Side rail container: `lg:sticky lg:top-4 lg:self-start`. Inner panel uses
  `h-fit`, NOT `h-full`. `h-full` makes the rail track the main column's
  height and leak whitespace below its own content.
- Main column with many stacked cards: wrap in `grid gap-5 xl:grid-cols-2`
  so 6+ cards flow into 2 columns at ≥1280px instead of one tall stack.
- At <xl the main column stays single-column; the rail still doesn't stretch
  because of `self-start`.

Applies to: Season Events (`src/routes/index.tsx`), any future section with
a Spotlight / filter rail next to a long list.