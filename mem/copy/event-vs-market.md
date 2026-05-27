---
name: Event vs Market copy convention
description: User-facing copy rules — every priced row is a "market" under its parent "event"; the word "outcome" is banned from visible copy
type: preference
---
Definitions (user-facing copy):
- **Event** = the real-world thing being predicted (Arsenal vs Chelsea fixture; EPL 24/25 season; EPL Top Scorer 25/26 season). One card on the home page = one event.
- **Market** = a single priced, tradeable line under an event (Home / Draw / Away; YES / NO; "Haaland to win Top Scorer"). Every priced row in the UI is a market.

Rules:
- The word **"Outcome" / "Outcomes" is banned from visible copy.** Every place that previously read "Outcome" now reads "Market".
- Column headers, eyebrows, and section labels above priced rows say **Market** (singular) or **Markets** (plural). Examples: event-detail header right column eyebrow = "Markets"; LeagueWinnerMarketCard column header = "Market"; PositionsTable column = "Market".
- The column that previously held the event question (e.g. "Man City win UCL?") is labeled **Event**, not "Market".
- Home-page cards aggregate one event → "Featured / Live & upcoming / Browse all" use event(s).
- Top nav "Events" is correct; link via `omenxUrl.events()`.
- Phrase "prediction markets" is a product-category noun in meta/SEO copy — keep as is.
- Component/file/data/type names (`MatchMarketCard`, `MATCH_MARKETS`, `Outcome` TS interface, `market.outcomes[]`, etc.) are technical and stay unchanged; this rule only governs visible copy.
- Descriptive column labels that name the entity (e.g. "Player" in TopScorerMarketCard) stay — only the generic word "Outcome" is replaced.

Two easily-confused market shapes (do not mix in copy):
- **Multi-candidate futures event** (one event, many candidate markets) → e.g. "EPL Top Scorer 25/26" with Messi / Haaland / Salah each rendered as a separate market row. Subtitle pattern: "{league} · To win {award}".
- **Player props bundle** (one player, many markets) → e.g. Mbappé spotlight with Anytime scorer / 2+ goals / Shots o2.5 as separate YES/NO markets. Subtitle pattern: "Player props · N markets".
- Never label a futures candidate row as "player props" or vice versa.
