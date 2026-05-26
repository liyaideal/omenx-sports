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
