---
name: Demo engine governance
description: Backend ownership boundary between this frontend blueprint and the OmenX main-site demo engine; rules for state vs mock content and pre-integration markers.
type: rules
---

# Demo Engine Governance

This project (`omenx-sports`) is a **frontend blueprint**. It does not own a backend.

## Single backend principle

The OmenX main-site project is the single backend for all OmenX frontend blueprints. Its Supabase instance is the only source of truth for:

- User identity / auth sessions
- Orders and positions
- Ledger / balance / transaction history
- Vouchers, rewards, quests
- Any other cross-module or transactional state

Sports, and any future Pro/Lite/... blueprints, all connect to the same main-site demo engine. They call its existing RPCs and Edge Functions; they never create their own Supabase project or schema.

## State goes to DB, content stays mock

After integration with the demo engine:

- **Transactional state** → main-site Supabase (orders, positions, ledger, vouchers, auth, etc.).
- **Display content** → stays in `src/data/*` mocks forever. This includes league profiles, team/player data, live scores, community posts, and market/chart shapes. Do not migrate this content to the DB.

## Pre-integration convention

Until the demo engine is wired:

- Simulated state may live in mocks or `localStorage`.
- Every such location must carry the comment: `// DEMO-STATE: 待接入主站演示引擎`.
- This marker is the switch point for the later unified migration.

## Reference

Backend boundary details live in the main-site repository at `docs/backend-boundary.md`.

## Integration status (2026-07-13)

**Wired** — the following surfaces call the OmenX main-site Supabase directly
via `src/lib/demoEngine.ts` (`https://lbrwdmnctmivgrsgdpqj.supabase.co`):

- **Auth**: `signInDemo(scenario)` → main-site Edge Function
  `ensure-demo-user` (`matched` / `welcome`) then `signInWithPassword`.
  Session persists in localStorage under key `omenx-sports-demo-session`.
  Entry UI is a Google "Choose an account" simulator
  (`GoogleAccountChooser`) matched to the OmenX main-site chooser:
  `matched` → **Alex Carter** (`alex.carter@gmail.com`), `welcome` →
  **Mia Reyes** (`mia.reyes@gmail.com`), plus a "Use another account"
  row that calls `demoEngine.auth.signInAnonymously()` (main-site trigger
  provisions the profile + trial balance). The product surface must NEVER
  say "demo" / "test" — call the entry "Continue with Google".
- **Profile / balance**: `profiles.balance` + `profiles.trial_balance`.
  Total equity = sum of both; Trial Bonus is consumed before Main.
- **Live prices**: `event_options` (realtime + 60s polling fallback) for
  the two mapped World Cup 2026 semifinals — see
  `src/lib/demoEngineEvents.ts` (`DEMO_EVENT_MAPPINGS`).
- **Order placement**: `TradeDrawer` on a mapped event writes one
  `trades` row + one `positions` row (side=`long`, order_type=`market`,
  leverage=1, fee=0) and decrements `profiles.trial_balance` /
  `profiles.balance` (trial first).
- **Open positions**: `positions.status = 'Open'` for the current user,
  repriced via realtime `event_options`; rendered by
  `LivePositionsCard` inside `MeSheet` and `/style-guide#demo-engine`.

**Pilot scope**: only `wc26-semi-fra-esp` and `wc26-semi-arg-eng`.
Every other market keeps its mock trade flow and carries the
`// DEMO-STATE: 待接入主站演示引擎` marker.

**Never**: enable Supabase inside this project, initiate schema changes,
or read/write `wallets` (address book, not balances).
