## Goal
Remove all `/pinpoint` content from the project so the route and feature no longer exist.

## Changes

1. **Delete the route**
   - `rm src/routes/pinpoint.tsx` (TanStack Router will regenerate `routeTree.gen.ts` automatically — do not hand-edit it).

2. **Delete the entire feature directory**
   - `rm -rf src/features/pinpoint/` (covers `Grid.tsx`, `Sidebar.tsx`, `AccountBlock.tsx`, `DepositSheet.tsx`, `EventSelector.tsx`, `PriceCapsule.tsx`, `StreakPill.tsx`, `amm.ts`, `constants.ts`, `sounds.ts`, `wallet-bridge.ts`, `pp-theme.css`, `effects/`, `hooks/`, `lib/`).

3. **Clean `src/routes/style-guide.tsx`**
   - Remove the `import "@/features/pinpoint/pp-theme.css";` line (3).
   - Remove the `["pinpoint-cartridge", "Pinpoint Cartridge"]` entry from the section index (184).
   - Remove the entire `<Section id="pinpoint-cartridge">…</Section>` block (lines 3504–3723).

4. **Clean `DESIGN.md`**
   - Remove the "## 8. Pinpoint (`/pinpoint`) — scoped sub-theme" section and any pinpoint references that follow it (around lines 530–587 and any other mentions).

## Verification
- Run a build/typecheck — expect no broken imports.
- Confirm `rg -i pinpoint .` returns nothing (besides node_modules).
- Confirm `/pinpoint` route 404s.
