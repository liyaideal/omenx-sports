World Cup mobile has no bottom tab bar (`MobileChrome hideBottomNav`). The combo sticky bar is still offset by `bottom-16` to clear the now-removed tab bar, leaving a gap. Plan:

1. **`src/components/sports/promo/ComboChallengeSection.tsx`**
   - Change `MobileStickyBar` from `fixed bottom-16` to `fixed bottom-0` on mobile.
   - Reduce the mobile spacer below the bar from `h-28` to `h-20` since it no longer needs to clear the bottom nav.
   - Keep the safe-area padding and desktop behavior unchanged.

2. **`src/routes/style-guide.tsx`**
   - Update the `MobileStickyBar` documentation to reflect the two modes:
     - Default mobile routes: `bottom-16` to clear `MobileBottomNav`, spacer `h-28`.
     - Promo/campaign pages with `hideBottomNav` (e.g. `/promo/world-cup`): `bottom-0`, spacer `h-20`.

3. **Verify**
   - Preview `/promo/world-cup?tab=combo` at mobile width.
   - Confirm the combo bar sits flush against the bottom and no runtime errors appear.