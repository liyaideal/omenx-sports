## Goal
Add a reusable "spotlight coach-mark" overlay component for first-visit page guidance, and demo it in `/style-guide` using the Welcome Pack → **Complete Registration** task as the highlighted target. No changes to `/promo/world-cup`.

## New component
`src/components/sports/activation/CoachMarkOverlay.tsx`

Props:
- `open`, `onOpenChange`
- `targetRef: React.RefObject<HTMLElement>` — element to spotlight
- `title: string` (e.g. `"Claim Your 10U Sign-Up Reward"`)
- `description?: string`
- `ctaLabel?: string` (default `"Got it"`)
- `onCta?: () => void` (defaults to close)
- `placement?: "auto" | "top" | "bottom"` (default `"auto"`)
- `padding?: number` (spotlight padding, default 8)

Behavior / visuals:
- Fixed full-screen overlay (`z-50`) with dark scrim `bg-black/70 backdrop-blur-sm`, fades in.
- Uses `getBoundingClientRect()` on `targetRef` (recomputed on `resize` + `scroll`) to render a **cut-out spotlight** via SVG `<mask>`: full-viewport dark rect minus a rounded rect around the target. Non-interactive; clicking scrim does nothing (guided step).
- Neon ring around the spotlight (`ring-[oklch(0.7_0.18_145)]` glow via box-shadow) matching brand.
- Tooltip card anchored below (or above if target is in lower half) the spotlight:
  - Eyebrow "STEP · 01" (mono, muted)
  - Title in `font-pitch` uppercase
  - Description in muted body
  - Primary CTA button (neon gradient, same style as ActivationDialog CTA) — label `Got it`
- Small connector arrow from card toward spotlight.
- On mobile (`useIsMobile`): card docks to bottom of viewport instead of anchoring, spotlight ring still drawn around target.
- Escape key closes; focus trapped on the CTA button.
- Exports added to `src/components/sports/activation/index.ts`.

## Style-guide demo
Edit `src/routes/style-guide.tsx`:
- Add nav entry `["coachmark", "Coach-Mark Overlay"]` right after `activation`.
- New `CoachMarkDemo` component:
  - Renders a scaled-down mock of the Welcome Pack grid: two `TaskCard`s side-by-side (reuse `NewbieRewardsSection`'s `TaskCard` export + `NEWBIE_TASKS` fixtures) inside a bordered "preview stage" container with its own local `position: relative` so the overlay is scoped to the demo box (achieved by rendering overlay in a portal-free absolute container within the stage).
  - A "Replay guide" button above the stage toggles `open`.
  - `targetRef` attached to the first `TaskCard` (Complete Registration).
  - Overlay shows: title `Claim Your 10U Sign-Up Reward`, description `Finish registration to unlock your first 10 U position voucher.`, CTA `Got it`.
- Section copy explains: single-step spotlight for page-entry onboarding; caller supplies the target ref and the copy; dismissal is user-driven via CTA only.

## Scope guardrails
- No edits to `/promo/world-cup`, `NewbieRewardsSection`, or any live page.
- Overlay is UI-only; no persistence / "don't show again" logic (out of scope, callers handle).
- Follows mobile bottom-sheet spirit but overlay stays overlay (spotlight requires it).

## Memory
Append short entry to `.lovable/memory/design/activation-dialogs.md` (or new sibling) noting the coach-mark pattern and its playground location, and update `mem://index.md`.
