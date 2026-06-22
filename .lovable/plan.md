Goal: make `/promo/world-cup` actually usable on a 390-wide mobile screen, and document every mobile-specific behavior inside `/style-guide` so the rules don't drift. All product fixes stay in presentation code under `src/components/sports/promo/*`.

The plan is scoped tab by tab so each change can be reviewed in isolation.

### 1. ScoreboardHero — stop the LED slab from overflowing

`src/components/sports/promo/ScoreboardHero.tsx`

- Big number: drop mobile size from `text-6xl` to `text-[2.5rem] leading-none`, keep `md:text-8xl`. Wrap the number+`U` group in `min-w-0` so the number can never exceed the card.
- Header strip (LIVE PRIZE POOL + ENDS IN countdown):
  - Switch from `flex justify-between` to `flex flex-wrap gap-y-1` so the countdown wraps under the label on narrow screens instead of being clipped.
  - On mobile reduce countdown to `HH : MM : SS` (drop the days segment); restore the full `DD : HH : MM : SS` from `sm:` up. Saves ~25% width.
  - Reduce tracking from `0.25em`/`0.3em` to `0.18em` on mobile via responsive class.
- Inner padding: `p-4 sm:p-6` so the left/right rails don't crowd the number.
- "Jackpot accumulating · World Cup 2026 edition" pill: `text-center whitespace-normal` so it stops being clipped.
- Flag marquee strips: no change.

### 2. CarnivalTabs — horizontal snap row on mobile

`src/components/sports/promo/CarnivalTabs.tsx`

- Replace `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5` with:
  - Mobile: horizontal scroller `flex gap-2 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1` with scrollbar hidden; each tab `min-w-[44%] snap-start shrink-0`.
  - From `md:` up: keep the 5-column grid.
- This restores the "swipe through sections" pattern that the 2-2-1 grid currently breaks.

### 3. LuckyBox — fix VolumeLadder collisions & caption

`src/components/sports/promo/LuckyBoxSection.tsx` (`VolumeLadder` and `TierCard`)

- Track inset: `px-5` and node label `top-[18px]` so labels never sit on the rail.
- Label collision: alternate node-label placement so adjacent thresholds (100U / 1,000U on a 5,000U scale) don't collide — even-index labels below the track, odd-index above.
- Right-edge clipping: the last node (5,000U) keeps `translate-x-0 right-0` for its label so it never overflows.
- Token hex: on mobile `h-6 w-14 text-[9px]`; restore current size from `sm:` up. When `tokenPct > 92`, anchor the hex with `right-2 translate-x-0` so the pill cannot spill past the right inset.
- Caption: separator dots become `<br className="sm:hidden" />` between segments so each phrase gets its own line on mobile, single line from `sm:` up.
- TierCard header (line 332): add `min-w-0 flex-wrap gap-y-1`, allow heading to truncate, keep pool label `whitespace-nowrap`.
- Reel and spin button: no change.

### 4. ComboChallengeSection — filter bar, match cards & mobile sticky bar

`src/components/sports/promo/ComboChallengeSection.tsx`

`FilterBar`:
- Restructure on mobile into three vertical rows: stage chips · matchday chips (horizontal scroll `flex gap-1.5 overflow-x-auto -mx-1 px-1`) · final row with `Available only` + search input each `w-1/2`.
- From `sm:` up keep the current `flex-wrap` row.
- Search input width `w-full sm:w-32` so it stops being clipped.

`CampaignHero`:
- "ENTRIES LEFT THIS PERIOD" block: `text-left sm:text-right` so it doesn't look stranded on mobile.

`MatchCard`:
- `LineStepper`: `text-[10px] sm:text-[11px]` and `gap-0.5 sm:gap-1`.
- `Locked` pill: `shrink-0`; wrap title with `min-w-0` and `truncate sm:whitespace-normal`.

`MobileStickyBar`:
- Remove the inner `<StakeDisplay compact />` — the row above already shows `filled · stake · odds → payout`. Halves the bar height.
- Spacer becomes `h-28 lg:hidden`.
- Keep `bottom-16` to clear `MobileBottomNav`.
- CTA button: `shrink-0 whitespace-nowrap`.

### 5. NewbieRewardsSection — invite row wrap

`src/components/sports/promo/NewbieRewardsSection.tsx`

- `InvitePanel` Copy button: `w-full sm:w-auto`.
- TaskCard layout: no change.

### 6. Route shell

`src/routes/promo.world-cup.tsx` — no change. `MobileChrome` already gates mobile vs desktop.

### 7. Style-guide documentation (mandatory mirror)

`src/routes/style-guide.tsx` — inside the existing `world-cup-carnival` Section, append a **"Mobile behavior"** subsection that:

- For every component touched above (`ScoreboardHero`, `CarnivalTabs`, `LuckyBoxSection.VolumeLadder + TierCard`, `ComboChallengeSection.FilterBar / CampaignHero / MatchCard / MobileStickyBar`, `NewbieRewardsSection.InvitePanel`) lists the mobile rule as a single bullet.
- For each component, renders the actual component inside a `max-w-[390px] mx-auto` framed mobile viewport so a desktop reviewer can see the mobile state without opening DevTools. Use a labeled wrapper card (`border border-dashed border-white/15 p-3` with a `Mobile · 390w` chip).
- Where the mobile interaction matches desktop exactly (e.g. tier card spin, share triggers, modal flows), say so explicitly: a bullet like *"Spin / share / modals — identical to desktop, no mobile-specific changes"* so future agents don't reintroduce divergence.
- Add a top-level rule line in the Rules box: *"Every Carnival component must have both desktop AND mobile (390w) coverage in this style guide. If a mobile rule isn't visible here, it doesn't exist."*

### Verification

After all edits, re-screenshot all five tabs at 390×1800 via Playwright and confirm:
- No content clipped on the right edge of the hero.
- Tabs swipe horizontally with snap and the active one is visible.
- Volume ladder labels never overlap; 5,000U label stays visible.
- Combo filter bar reads top-to-bottom on mobile without overflowing chips.
- Mobile sticky bar sits above the bottom nav and doesn't double-render the stake.
- No horizontal page scroll on mobile (`document.documentElement.scrollWidth === clientWidth`).
- `/style-guide#world-cup-carnival` shows the new Mobile behavior subsection with every component rendered inside a 390w frame.

No new dependencies. No data-model or business-logic changes.