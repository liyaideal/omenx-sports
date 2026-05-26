---
name: Event vs Market copy convention
description: User-facing copy rules for distinguishing event, market, and outcome across the sports zone
type: preference
---
Definitions:
- Event = real-world fixture or season (Arsenal vs Chelsea; EPL 24/25; EPL Top Scorer season)
- Market = tradeable question on an event (1X2, BTTS, Over 2.5, Top Scorer)
- Outcome = a side of a market (Home/Draw/Away, YES/NO, Haaland)

Rules:
- Home-page cards aggregate one event → "Featured / Live & upcoming / Browse all" use event(s)
- Market-type labels (1X2, BTTS, Top scorer, Player props) use market(s)
- Price rows use outcome, never market
- Top nav "Events" is correct; link via omenxUrl.events()
- Phrase "prediction markets" is a product-category noun in meta/SEO copy — keep as is
- Component/file/data names (MatchMarketCard, MATCH_MARKETS, etc.) are technical and stay unchanged; this rule only governs visible copy

Two easily-confused market shapes (do not mix in copy):
- **Multi-outcome futures market** (one market, many candidates) → e.g. "EPL Top Scorer 25/26" with Messi / Haaland / Salah as outcomes. Subtitle pattern: "{league} · To win {award}". Each row buys one candidate.
- **Player props bundle** (one player, many markets) → e.g. Mbappé spotlight with Anytime scorer / 2+ goals / Shots o2.5 as separate YES/NO markets. Subtitle pattern: "Player props · N markets".
- Never label a futures-outcome row as "player props" or vice versa.
