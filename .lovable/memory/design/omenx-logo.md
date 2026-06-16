---
name: OMENX logo usage
description: Always use the official SVG wordmark for OMENX, never render the brand name in a display font
type: design
---
Wherever the OMENX wordmark appears (top bars, share posters, promo headers, emails, OG cards, splash screens), import `@/assets/omenx-logo.svg` and render it as an `<img>` (or inline SVG when filter color changes are needed).

Never re-type "OMENX" in Audiowide, Orbitron, Sora, or any other display font as a substitute for the logo. The font-set wordmark is NOT the brand mark — only the SVG at `src/assets/omenx-logo.svg` is.

Color: white on dark surfaces; invert (`filter: invert(1)`) on light surfaces. Don't recolor or re-trace the path.

Demo lives in `/style-guide` → "Stadium Neon / Official wordmark" block.