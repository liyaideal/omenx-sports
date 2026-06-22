---
name: Quest task rewards never auto-grant
description: NewbieTask uses 4-state machine; threshold reached → claimable (user must click Claim), never directly claimed
type: feature
---
`NewbieTask.status` is `locked | in-progress | claimable | claimed`. Hitting the threshold moves a task to `claimable` and shows a pulsing green Ready-to-claim pill + filled Claim button — the user MUST click Claim to dispatch the voucher. Auto-crediting on completion is a bug. `in-progress` CTAs must be real links: external (OmenX main site, e.g. wallet) opens in new tab with ArrowUpRight icon; internal (sports sub-domain, e.g. `/league/world-cup-2026?view=games`) is same-tab. Playground: `/style-guide` World Cup Carnival section.