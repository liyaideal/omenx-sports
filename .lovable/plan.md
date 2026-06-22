## Goal
Remove the bottom tab bar (Events / Fans / Me) on the `/promo/world-cup` mobile page only. Keep it everywhere else (Events, Fans, League).

## Changes

1. **`src/components/sports/mobile/MobileChrome.tsx`**
   - Add optional prop `hideBottomNav?: boolean` (default `false`).
   - When `true`: skip rendering `<MobileBottomNav />` and reduce the `<main>` bottom padding from `pb-24` to `pb-8` (no fixed bar to clear).
   - `MeSheet` stays mounted so the top-bar avatar still opens it.

2. **`src/routes/promo.world-cup.tsx`**
   - Pass `hideBottomNav` to `<MobileChrome>`.

3. **`src/routes/style-guide.tsx`** (per project rule: mirror component changes in the style guide)
   - In the MobileChrome / mobile-shell section, add a short note + a variant example showing `hideBottomNav` (used by campaign/promo pages like World Cup).

No other routes change. No business logic, no data model.