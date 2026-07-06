# Project Memory

## Core
New shared components MUST be showcased in `/style-guide` (src/routes/style-guide.tsx). Always add a demo to the appropriate section when creating a new reusable component — never wait for the user to remind.
The `/style-guide` route is the project's playground. Whenever you add OR modify any module/section that appears on real pages, mirror the change in `/style-guide` in the same edit.
Domain vocabulary: "event" = the question/contest, "market" = an outcome/option inside an event. Never swap them.
OMENX wordmark = always `@/assets/omenx-logo.svg`. Never render "OMENX" in Audiowide/Orbitron/any display font as a logo substitute.

## Memories
- [Market vs Event terminology](mem://glossary/market-vs-event)
- [Binary event has no nested Yes/No](mem://rules/binary-event)
- [Live delay disclosure](mem://design/live-delay-disclosure)
- [Chart position overlay](mem://design/chart-position-overlay)
- [Carnival LED visuals](mem://design/carnival-led)
- [Share poster](mem://design/share-poster)
- [OMENX logo usage](mem://design/omenx-logo) — always use the official SVG wordmark, never font-set "OMENX"
- [Quest task rewards never auto-grant](mem://rules/quest-no-auto-grant) — NewbieTask 4-state machine; threshold → claimable, user must click Claim
- [Guess the Legend reveal](mem://features/signed-jersey-reveal) — /promo/world-cup `legend` tab; 1 country + 4 candidates + 3 clues per round; correct → 1× Tier-01 Basic Vault spin; never 8-in-1; reveal cadence random (no countdown)
- [Activation dialogs](mem://design/activation-dialogs) — reward-pool / voucher / deposit-match shared shell, mobile bottom sheet, CTA-only callback, OmenX register+deposit wired at page level