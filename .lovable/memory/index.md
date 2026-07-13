# Project Memory

## Core
New shared components MUST be showcased in `/style-guide` (src/routes/style-guide.tsx). Always add a demo to the appropriate section when creating a new reusable component — never wait for the user to remind.
The `/style-guide` route is the project's playground. Whenever you add OR modify any module/section that appears on real pages, mirror the change in `/style-guide` in the same edit.
Domain vocabulary: "event" = the question/contest, "market" = an outcome/option inside an event. Never swap them.
OMENX wordmark = always `@/assets/omenx-logo.svg`. Never render "OMENX" in Audiowide/Orbitron/any display font as a logo substitute.
No own backend: this project is a frontend blueprint and never provisions its own Supabase. Cross-module state (orders/positions/ledger/vouchers/auth) will eventually flow through the OmenX main-site demo engine (the main OmenX project's Supabase). This project may only call existing RPC / Edge Functions from the main site; it never initiates schema changes. Backend boundary reference: `docs/backend-boundary.md` in the main-site repo.
State goes to DB, content stays mock: after the demo engine is wired, transactional state lives in the main-site DB; pure display content (league profiles, team/player data, scores, community posts, market shapes) always remains in `src/data/*` mocks and must never be migrated to the DB.
Pre-integration convention: until the demo engine is connected, new features may keep simulated state in mocks or localStorage, but every such location must be annotated with `// DEMO-STATE: 待接入主站演示引擎` so the migration can be done in one sweep later.

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
- [Demo engine governance](mem://rules/demo-engine) — no own Supabase; state flows to OmenX main-site DB, content stays in src/data mocks, pre-integration marks with // DEMO-STATE