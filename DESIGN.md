# Stadium Neon — DESIGN.md

> Single source of truth for the visual system of this sports prediction app.
> Agents read this BEFORE any UI change. Tokens live in `src/styles.css`,
> rendered demos live in `src/routes/style-guide.tsx`. The three documents must
> agree. New locked rules go in §4, §5, or §7 and are mirrored to the style guide.

---

## 1. Visual Theme & Atmosphere

Dark-first, single theme. Match-day energy distilled into pixels: deep
purple-black canvas, soft lavender for ambient UI, magenta neon reserved for
the moment of decision. Numbers read like a scoreboard — monospace, tabular,
precise. Editorial italic serif used as a tonal accent only (section title
suffixes, "vs"). Generous negative space around price; density is allowed in
meta rows and order books. No second accent color.

## 2. Color Palette & Roles

All tokens defined in `src/styles.css` as oklch under `:root`. Reference via
Tailwind semantic classes (`bg-surface`, `text-foreground`, …) — never write
hex or raw oklch in components.

### Surfaces

| Token | oklch | Role |
|---|---|---|
| `--background` | `0.14 0.03 295` | Page canvas (deep purple-black) |
| `--surface` | `0.19 0.035 295` | Card / panel default |
| `--surface-elevated` | `0.23 0.04 295` | Hovered / featured surfaces |
| `--sidebar` | `0.16 0.03 295` | Left rail |

### Text

| Token | oklch | Role |
|---|---|---|
| `--foreground` | `0.98 0.005 285` | Body / primary text |
| `--muted-foreground` | `0.68 0.025 285` | Meta, labels, eyebrow |
| `--muted` | `0.27 0.03 290` | Muted fills |

### Brand & accent

| Token | oklch | Role |
|---|---|---|
| `--primary` | `0.82 0.10 305` | Soft lavender — brand, focus ring, default CTAs |
| `--primary-foreground` | `0.18 0.04 295` | Text on lavender |
| `--neon` | `0.70 0.28 340` | Magenta neon — signature accent, used sparingly (active day pill, "events" suffix, primary glow) |
| `--neon-foreground` | `0.98 0.005 285` | Text on neon |

### Sport result semantics

| Token | oklch | Role |
|---|---|---|
| `--win` | `0.78 0.18 155` | Green — bought / up / yes |
| `--loss` | `0.70 0.22 25` | Red — sold / down / no / live dot |
| `--draw` | `0.85 0.17 85` | Amber — draw / neutral |

### Lines

| Token | Value | Role |
|---|---|---|
| `--border` | `oklch(1 0 0 / 8%)` | All hairlines, dividers |
| `--input` | `oklch(1 0 0 / 10%)` | Input borders |
| `--ring` | `0.82 0.10 305` | Focus ring (= primary) |

### Signature gradients & glows

- `--gradient-neon` — lavender → magenta → deep violet, 135°. For brand
  surfaces and `text-gradient-neon`.
- `--gradient-vote` — blue → lavender, 90°. For sentiment / vote bars.
- `--shadow-glow` — magenta + lavender halo. For primary CTAs only.
- `--shadow-card` — top inset highlight + soft bottom drop. Default card shadow.
- `bg-ambient` — radial purple + magenta wash. Used on the hero shell only.

## 3. Typography Rules

Four families, defined under `@theme inline`:

- `--font-display` → Sora (titles, big numbers)
- `--font-sans` → Inter (body — default `body`)
- `--font-mono` → JetBrains Mono (meta, prices, scoreboard)
- `--font-serif` → Instrument Serif (editorial italic accents only)

Global: `h1–h4` use `font-display` with `letter-spacing: -0.02em` (set in
`@layer base`). Do not override per-component.

| Role | Class recipe | Notes |
|---|---|---|
| Hero H1 | `font-display text-5xl font-bold leading-[1.05]` | Style guide §01 only |
| Section H1/H2 | `font-display text-2xl font-semibold leading-9` | Cross-column baseline — see §4 |
| Card title | `font-display text-base font-semibold leading-tight` | Event tile, fan post |
| Stat numeral | `font-display text-3xl font-semibold leading-none` | Outcome prices |
| Body | default `font-sans text-sm` | |
| Meta / eyebrow | `font-mono text-[10px] uppercase tracking-widest text-muted-foreground` | Pills, league chips, timestamps |
| Editorial accent | `font-serif-display italic` | Section title suffix ("events", "markets"), "vs" |

## 4. Component Stylings

### Section header (CROSS-COLUMN CONTRACT)

Every section header on the home dashboard MUST align on the same baseline
regardless of column. Locked contract:

- Container: `flex min-h-9 items-center …` (`flex-wrap` allowed if stats meta
  is present)
- Title element: `font-display text-2xl font-semibold leading-9`
- Optional suffix: `font-serif-display italic text-neon` (only the suffix is
  neon, never the whole title)
- Optional live dot: `h-2 w-2 rounded-full bg-loss shadow-[0_0_8px_var(--loss)] animate-pulse`
- Optional stats meta: `font-mono text-[11px] uppercase tracking-wider text-muted-foreground`

Never set `leading-none` on a section h2 — it breaks the baseline.

### Card (event / market tile) — EQUAL-HEIGHT CONTRACT

Any grid row of cards stretches to the tallest sibling. Locked contract:

- Anchor / root: `flex h-full flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:border-white/15`
- Outcomes block: `flex-1` (binary grid or three-way column)
- Footer: `mt-auto` with `border-t border-border pt-3`
- Any wrapper between the grid and the card MUST pass `h-full` through. If you
  add `<div>` wrappers for visibility toggles, write `className="h-full …"`.
- Never set a fixed pixel height on cards. Three-way (1·X·2) and binary cards
  have different intrinsic content — row-stretch is what unifies them.

### Events grid — DEFAULT 1-ROW CONTRACT

The middle-column events grid keeps a fixed default height so the modules
below (Season markets, fans-zone tail) stay first-screen visible:

- Grid: `grid gap-3 md:grid-cols-2 xl:grid-cols-3`
- Default collapsed = exactly 1 row at each breakpoint. Extra cards use
  `hidden md:block` (2nd), `hidden xl:block` (3rd), `hidden` (4th+).
- Expansion control: full-width dashed ghost button
  (`ShowMoreEventsButton`) below the grid. Shown only when
  `visibleMarkets.length > 1`. Labels: `Show all {N} events` / `Show less`.
- Switching the day strip (incl. ALL) auto-resets to collapsed.
- Empty state: dashed surface — `No events scheduled for {dayLabel}.`

### Day strip calendar

- Container: `rounded-2xl border border-border bg-surface p-2`
- 7 days SUN→SAT, plus a leading ALL pill
- Active cell: `bg-neon text-primary-foreground` + 8px neon glow
- Inactive cell: `text-muted-foreground`, dot indicator when day has events
- Fixed 7-day window, no horizontal scroll

### Pills & chips

- Default pill: `rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground`
- League badge: pill + leading `grid h-3.5 w-3.5 rounded-full bg-gradient-neon` "L" mark
- Price pill: dedicated `PricePill` component, mono numerals, semantic
  win/loss color via delta
- Status pill: use `--win`/`--loss`/`--draw` tints (`bg-win/15 text-win` etc.)

### Price pill delta — SELF-DESCRIBING

The delta beside the price MUST be readable without the arrow. Locked format:

- Signed and unit-bearing: `+3¢`, `−1¢`, `0¢` — never bare `3`
- Underlying field is `delta24h`; always include `title="24h change"` on the
  delta span and `aria-label` on the whole pill (`"42 cents, up 3 cents in
  24 hours"`)
- Surfaces with horizontal room (outcome blocks, hero) print `· 24h` inline
  via `showTimeframe`
- Colored arrow stays as a redundant visual cue, never the only signal
- Once per page, show the legend `Prices in ¢ (0–100) · arrows show 24h change`
  next to the first price-bearing section header so new users learn the unit

### League chip (card header) — SINGLE SOURCE

There is exactly one way to name a league in a card header: `<LeagueChip>`
from `src/components/sports/LeagueBadge.tsx`. Never render
`{market.league.short}` as bare mono text — that path is a regression.

Spec (locked):

- Container: `inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground`
- Leading crest: real league logo (PNG, ESPN CDN) inside a
  `h-3.5 w-3.5 rounded-full bg-white/[0.06] ring-1 ring-white/10` well,
  rendered with `object-contain` at 78% of the circle. Registered in
  `PRESETS` in `LeagueBadge.tsx` — never an emoji or a colored "L" stub.
- Fallback when no logo is registered: gradient monogram (first 3 chars)
  from the same preset. Only used for new leagues — add a real logo ASAP.

Variants of the same identity system:

| Component | Use |
|---|---|
| `<LeagueChip short="EPL">` | Card-header eyebrow — the canonical chip |
| `<LeagueBadge league="epl">` | Inline rows: crest + label, no background pill |
| `<LeagueBadge league="epl" showLabel={false}>` | Crest-only, dense tables / mini cards |

### Market-type eyebrow — FIXED VOCABULARY

Eyebrow format is always `{LeagueChip} · {TYPE}` where TYPE comes from this
vocabulary. No trading-desk jargon ("FUTURES", "1X2", "outright", "moneyline")
is allowed on user-facing surfaces.

| Internal market kind | User-facing TYPE |
|---|---|
| 1X2 / binary on a fixture | `MATCH` |
| league winner | `SEASON WINNER` |
| top scorer | `TOP SCORER` |
| generic event tile | `EVENT` |

The `· TYPE` text uses the default pill typography
(`font-mono text-[10px] uppercase tracking-widest text-muted-foreground`) and
sits directly to the right of the chip with `gap-2`.

### Buttons

- Primary: `bg-gradient-neon text-white shadow-glow hover:opacity-90`
- Ghost / dashed: `rounded-2xl border border-dashed border-border bg-surface/40 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface/70`
- Pill action (top bar): `rounded-full bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/10`

### Fans zone header

- Container: `flex min-h-9 items-center justify-between gap-3`
- Title: same recipe as section h2 (`text-2xl font-semibold leading-9`)
- Trailing pill: `2 teams` / `Add team` with `Users` icon, no decorative suffix
- Title never gets a serif italic suffix here — only the editorial sections do

### Page footer — NONE on product surfaces

Product / dashboard surfaces (home, event, trade, fans zone, positions, settings)
do not have a page-level footer. Bottom padding is the visual end-of-page.
Footers are reserved for SEO / content pages (Insights, About, FAQ,
Methodology, Privacy, Glossary, marketing landings), matching the OmenX
`SeoPageLayout` convention. `Terms` / `Help` / cross-site OmenX links live
in the existing top-right user menu, not a bottom bar.

### Live delay disclosure — LOCKED PATTERN

Pattern is borrowed from Polymarket's `• HT ⓘ` chip. Long disclaimer copy
lives behind the icon, never in the chip itself. We never toast for this.

- Component: `LiveDelayInfo` (`src/components/sports/live/LiveDelayInfo.tsx`)
  with `variant="score" | "stream"` and `tone="muted" | "onMedia"`.
- Every visible live-time chip (`liveClock`) MUST carry
  `<LiveDelayInfo variant="score" />`. Required surfaces today:
  `EventLiveStage`, `FullscreenStreamOverlay`, `GlobalStreamMiniPlayer`,
  `dashboard/LiveStreamCard`. New live chips inherit the rule.
- Video surfaces (Stage + Fullscreen) carry a persistent caption
  `Stream delayed · reference only` followed by the ⓘ. Styling:
  `font-mono text-[9px] uppercase tracking-widest text-white/55`,
  `bg-black/45..55` + `ring-1 ring-white/10` + `backdrop-blur`.
  The mini player is too small for the caption — chip ⓘ only.
- `TradeDrawer` MUST render the amber inline notice when
  `market.isLiveStream`: `border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#fbbf24]`,
  `Info` icon + sentence quoting `30–60 seconds`. Not dismissible.
- Copy is fixed. Score chip popover talks about "scores and match time";
  stream popover talks about "live stream". Both quote `30–60 seconds`
  and end with "settlement uses the official result."

## 5. Layout Principles

### Spacing scale

`gap-1` 4 · `gap-2` 8 · `gap-3` 12 · `gap-4` 16 · `gap-5` 20 · `gap-6` 24 ·
`gap-8` 32 · `gap-10` 40. Page padding: `px-6 md:px-8 pt-8 md:pt-10 pb-6 md:pb-8`.

### Radius scale (driven by `--radius: 1rem`)

| Token | Value | Use |
|---|---|---|
| `rounded-full` | 9999px | Pills, avatars |
| `rounded-xl` | 12px | Inputs, small chips |
| `rounded-2xl` | 16px | Day strip, ghost buttons, inner outcome blocks |
| `rounded-3xl` | 20px | Cards (event tiles, fan post, match card) |
| `rounded-4xl` | 24px | Hero surfaces |

### Home dashboard grid

- 3-column shell at `lg+`: `grid-cols-[340px_minmax(0,1fr)_360px]`
- Left column spans both rows (fans zone). Middle/right top row = events grid.
  Middle/right second row = season markets.
- `gap-5` between columns. Sections inside a column use `gap-4`.
- Below `lg`, columns reflow vertically — the left column never collapses.

### Alignment contracts (also see §4)

- All section headers share `min-h-9 leading-9` so titles align across columns.
- All cards in a grid row stretch to equal height via `h-full + mt-auto` footer.
- Side-rail panels (Spotlight, sticky filters) must use `lg:self-start` plus
  intrinsic height (`h-fit`, never `h-full`). Pair with `lg:sticky lg:top-4`
  when the main column can outgrow the viewport. Long-content main columns
  must wrap into multi-column grids (e.g. `xl:grid-cols-2` for season cards)
  before they push the side rail past its content.

## 6. Depth & Elevation

Surfaces ladder up by lightness, not by shadow:

| Layer | Token | Use |
|---|---|---|
| L0 | `--background` | Page |
| L1 | `--surface` / `--card` | Default cards |
| L2 | `--surface-elevated` | Hovered card, featured pricing |
| L3 | `bg-white/[0.05]` inside L1 | Inner blocks (outcome tiles, pills) |

Shadow utilities:

| Utility | Use |
|---|---|
| `shadow-card` | Default card (inset top highlight + soft drop) |
| `shadow-glow` | Primary CTA only (magenta + lavender halo) |
| `bg-ambient` | Hero shell ambient wash |
| `bg-gradient-neon` | Brand surfaces, "L" league mark, active-day pill |
| `text-gradient-neon` | Hero italic emphasis only |

Never combine `shadow-glow` with `shadow-card` on the same element.

## 7. Do's and Don'ts

Section 7 is append-only. Every regression the user catches gets pinned here.

**Do**

- Pull every color from `src/styles.css` semantic tokens.
- Use `min-h-9 leading-9` on every section h2 so cross-column baselines align.
- Use `h-full flex flex-col` + `mt-auto` footer so cards in a row equal height.
- Pass `h-full` through any wrapper between a grid and a card.
- Default-collapse long shelves to 1 row, expand via dashed ghost button.
- Reset expanded state when the filter (day strip, league) changes.
- Use `font-serif-display italic` only as a section-title suffix or for "vs".
- Use the dashed surface style for both empty states and expand controls — they
  share visual language.

**Don't**

- Don't write `text-white`, `bg-black`, `#xxxxxx`, or raw oklch in components.
- Don't set `leading-none` on a section h2 — breaks cross-column baseline.
- Don't set fixed pixel heights on cards — breaks equal-height row.
- Don't introduce a second accent color. Magenta is the only signature; green/red
  are reserved for win/loss semantics.
- Don't render a horizontal scroller for the events grid — use the 1-row +
  Show-all pattern instead.
- Don't add a `Browse all` link to the home events section — this page IS the
  sport's full events page.
- Don't show "N people are betting" aggregates in Live activity — rows must
  always be specific (handle + side + outcome + price + event + time).
- Don't ship a placeholder empty illustration; always pair onboarding with
  real editorial content.
- Don't render a league as plain mono text in a card header — always
  `<LeagueChip>`. One identity, one chip, everywhere.
- Don't use trading-desk jargon ("FUTURES", "Outrights", "Moneyline", "1X2")
  in user-facing eyebrows. Use the vocabulary in §4 Market-type eyebrow.
- Don't use the word **"Outcome" / "Outcomes" in visible copy** (column
  headers, eyebrows, table labels). The user-facing model is
  **event → markets**: each card represents one event; every priced row
  under it is a market. Generic labels read "Market" / "Markets". The TS
  `Outcome` type and `market.outcomes[]` array names stay as-is — this
  rule is copy-only. See `mem://copy/event-vs-market`.
- Don't ship a new card type without picking a TYPE label from the §4 vocab.
  If none fits, extend §4 first — then add the card.
- Don't render a price delta as a bare number (e.g. `↗ 3`). It MUST carry a
  sign and a `¢` unit, e.g. `+3¢` / `−1¢` / `0¢`. The number alone has to
  read correctly without the arrow.
- Don't add a page-level footer to product / dashboard surfaces. Footers are
  reserved for SEO / content pages (`SeoPageLayout` convention). Cross-site
  links go in the top-right user menu, not a bottom bar.
- Don't render a **binary event** (exactly 2 outcomes) as two nested YES/NO
  sub-markets. Binary = one Trade button per outcome + one shared order book
  with the two outcome labels as column headers. Per-outcome YES/NO + per-
  outcome order book is exclusive to multi-outcome (3+) events. See
  `mem://rules/binary-event`.
- Don't add a Draw row inside `BracketView` matchup cards. The bracket card
  is always 2 teams; Draw only appears on the matchup's detail page as the
  middle option of the 1X2 outcomes panel.
- Don't use a placeholder "L" stub or a colored gradient monogram for a
  known league. Register the real logo in `PRESETS` (`LeagueBadge.tsx`).
- Don't render the event-detail header and a separate outcome picker as two
  stacked blocks. The event header is a single card with a two-column body
  (fixture / title left, outcome rows right) and the stats strip across the
  bottom. Outcome rows are 56px tall with a lavender `ring-1 ring-primary/40`
  selected state.
- Don't put a tall single-column list next to a stretching `h-full` side
  panel — the side panel will leak whitespace below its content. Wrap the
  list in `xl:grid-cols-2` and switch the side panel to `h-fit lg:self-start`
  (sticky when needed).
- Don't push the live delay disclaimer into chip text or as a toast.
  The only acceptable forms are the ⓘ inside the chip, the persistent
  caption on the video surface, and the amber notice in the trade drawer.
- Don't ship a new live chip or video surface without `LiveDelayInfo`.
  The icon is part of the chip, not optional polish.

## 8. Responsive Behavior

| Breakpoint | Width | Behavior |
|---|---|---|
| base | <768px | 1-col stack; events grid 1 card per row, default collapsed = 1 |
| md | ≥768px | 2-col event grid; fans zone still full width above |
| lg | ≥1024px | 3-col dashboard shell (340 / 1fr / 360); fans zone in left rail |
| xl | ≥1280px | 3-col event grid; default collapsed = 3 cards (one row) |

- Tap targets ≥ 44×44 on touch surfaces.
- Day strip is fixed 7-day; on narrow screens it shrinks cell padding before
  it scrolls (and it still must not scroll — drop the dot indicator first).
- Fans-zone column never collapses entirely; below `lg` it reflows under the
  main grid but stays first-class.
- Use `h-dvh` (not `h-screen`) for any full-height layout.

### Modal / Picker presentation by form factor

Large-catalog pickers (e.g. World Cup team follow, 24+ items with search +
grouped multi-select) MUST switch presentation by form factor. Same body,
different shell:

| Form factor | Shell | Component | When |
|---|---|---|---|
| MOBILE (`<md`) | Full-screen bottom sheet (`Sheet side="bottom"`, `inset-0 h-full`) with sticky header + sticky Save footer | `<TeamPickerSheet variant="sheet" />` | Touch, one-hand reach, viewport-owned flow |
| DESKTOP (`≥md`) | Centered modal (`Dialog`, `w-[min(640px,92vw)] max-h-[80vh]`, `rounded-3xl`) over the page | `<TeamPickerSheet variant="dialog" />` | Mouse, page context stays visible behind overlay |

Rules:
- Never use a full-screen sheet on desktop — it eats the workspace and feels
  like a mobile webview. Never use a tiny centered dialog on mobile — search
  + grouped crests need viewport-scale real estate.
- Both variants share: sticky search header, "Following" pin group on top,
  grouped catalog with multi-select crests, sticky Save bar (`Clear all` +
  `Save preferences`).
- The sheet variant ships its own close `X` in the header. The dialog
  variant relies on the built-in `DialogContent` close button — do NOT
  render a second one.
- The compact entry card (`FollowTeamsCompact`) takes `pickerVariant` and
  passes it through. The hosting surface decides — typically `"sheet"` on
  mobile dashboards and `"dialog"` on desktop dashboards.
- This rule generalizes: any large-catalog picker (teams, leagues, markets,
  filters with >12 options + search) follows the same sheet-on-mobile,
  dialog-on-desktop split.

### Modal footer button stack

Any `ResponsiveModal` / `Dialog` / `Sheet` footer caps at **1 primary CTA +
1 row of ≤2 secondary buttons**.

- Primary CTA: at most one, full-width, in the brand/series accent
  (amber for Combo, magenta `--neon` for events, etc.). Use the canonical
  variant (e.g. `ShareTrigger variant="wide"`) — do not re-skin it with
  extra borders.
- Secondaries: rendered in a single `grid grid-cols-2 gap-2` row, sharing
  one zinc-outline token: `border border-zinc-700 bg-zinc-900/60
  rounded-2xl py-3`, icon-left at `h-3.5 w-3.5`, label
  `font-mono text-[11px] font-bold uppercase tracking-[0.25em]`.
- Never stack 3+ full-width buttons in a footer — it reads as a long
  laundry list and flattens hierarchy.
- Never mix amber and zinc outlines on the secondary row; the accent
  color is reserved for the primary CTA only.
- Disabled states stay in place (don't collapse the row); add a small
  caption underneath if a reason needs to be shown.

## 9. Agent Prompt Guide

Paste this block into design prompts for consistency:

> Stadium Neon — dark purple-black canvas (`--background`), magenta neon
> (`--neon`) reserved for moments of decision. Cards
> `rounded-3xl border border-border bg-surface p-5 shadow-card`, equal-height
> in rows via `flex h-full flex-col` + `mt-auto` footer. Section headers
> `font-display text-2xl font-semibold leading-9 min-h-9` — never
> `leading-none`. Mono meta (`font-mono text-[10px] uppercase tracking-widest`)
> for labels and prices. Italic serif (`font-serif-display`) only as a section
> title suffix. Event grids default to 1 row, expand via dashed ghost button.
> No second accent color.

Quick token reference:

| Need | Token / class |
|---|---|
| Page bg | `bg-background` |
| Card bg | `bg-surface` |
| Brand CTA | `bg-gradient-neon shadow-glow` |
| Active state | `bg-neon text-primary-foreground` |
| Win / up | `text-win` |
| Loss / down | `text-loss` |
| Hairline | `border-border` |
| Body text | `text-foreground` |
| Meta text | `text-muted-foreground` |
| Card radius | `rounded-3xl` |
| Pill radius | `rounded-full` |