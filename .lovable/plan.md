## Goal
Sync `RULE-03 Lucky Box` in `CarnivalRulesSection.tsx` with the new accumulative-ticket logic (tickets earned per tier, never expire, no daily cap, tiers independent).

## Changes
File: `src/components/sports/promo/CarnivalRulesSection.tsx` — replace the three RULE-03 bullets with:

- Each Lucky Box tier grants **1 ticket** the first time your **daily volume** crosses its threshold (Basic 100 U, Premium 1,000 U, Grand 5,000 U). Thresholds are independent — hitting 5,000 U in one day earns tickets for all three tiers at once.
- Tickets **never expire** and are **not cleared at day reset**. Spend them any time from the Lucky Box tab.
- Each tier is drawn from its own prize pool; opening a vault consumes 1 ticket for that tier only. Prize odds are shown on every card.
- Volume does not stack across days for earning purposes — a tier only grants a new ticket after a fresh day's volume crosses its threshold again.

No other rules sections change. No component/API changes.
