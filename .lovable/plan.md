# Use the official OMENX logo everywhere

## Problem
The share poster (`ShareCardPreview` in `src/components/sports/promo/ComboChallengeSection.tsx`) renders "OMENX" as plain Audiowide text. The project already has the official wordmark at `src/assets/omenx-logo.svg` (same path used by `AppTopBar`), and that's what every "OMENX" surface should use.

## Changes

1. **Share poster wordmark → official SVG**
   - In `ShareCardPreview`, replace the `<div>OMENX</div>` text block (around line 1221–1230) with `<img src={omenxLogo} alt="OMENX" />`.
   - Keep the same visual slot: full-width centered, white, ~16% of canvas height. Use container-query sizing (`h-[12cqw]` ish, `w-auto`, `mx-auto`) so it scales with the poster like the rest of the layout.
   - Import: `import omenxLogo from "@/assets/omenx-logo.svg"` at the top of the file.

2. **Style-guide mirror**
   - Add a small "Brand / Logo" demo block in `src/routes/style-guide.tsx` showing the official wordmark on dark + on light surfaces, with a one-line rule: *Always use `@/assets/omenx-logo.svg` for the OMENX wordmark — never re-type "OMENX" in a display font.*

3. **Lock the rule in memory**
   - New memory file `mem://design/omenx-logo`: *Wherever the OMENX wordmark appears (top bars, share posters, promo headers, emails, OG cards), import `@/assets/omenx-logo.svg`. Never render "OMENX" as Audiowide/Orbitron text and never recreate the wordmark from a font.*
   - Add a one-liner to `mem://index.md` Core so it applies to every future action.

## Out of scope
No changes to other surfaces that already use `omenx-logo.svg` (AppTopBar, MobileTopBar, etc.). No new logo variants — single source file only.
