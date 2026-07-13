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
