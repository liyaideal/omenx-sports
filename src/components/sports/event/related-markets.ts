import type { SportsMarket } from "@/data/sports-markets";

/**
 * Generate mock "related markets" for a given fixture-based market — same
 * fixture, different question. Used by `RelatedMarketsBar` to let the user
 * pivot between markets without leaving the page. The first entry is always
 * the originally loaded market so the chip row reads as a tab strip.
 *
 * Non-fixture markets (futures, top-scorer, etc.) return [] so the bar hides.
 */
export function getRelatedMarkets(market: SportsMarket): SportsMarket[] {
  const fixture = market.fixture;
  if (!fixture) return [];
  const base = {
    league: market.league,
    endsLabel: market.endsLabel,
    fixture,
    tradeHref: market.tradeHref,
    kind: "match" as const,
    shape: "binary" as const,
    isLiveStream: market.isLiveStream,
    livePoster: market.livePoster,
    liveScore: market.liveScore,
    liveClock: market.liveClock,
    stage: market.stage,
  };
  return [
    market,
    {
      ...base,
      id: `${market.id}__btts`,
      title: "Both teams to score",
      volume: "$184K",
      volume24h: "$42K",
      participants: 1280,
      outcomes: [
        { id: "y", label: "Yes", price: 0.62, delta24h: 0.02 },
        { id: "n", label: "No", price: 0.38, delta24h: -0.02 },
      ],
    },
    {
      ...base,
      id: `${market.id}__o25`,
      title: "Over 2.5 goals",
      volume: "$226K",
      volume24h: "$51K",
      participants: 1540,
      outcomes: [
        { id: "y", label: "Yes", price: 0.55, delta24h: 0.03 },
        { id: "n", label: "No", price: 0.45, delta24h: -0.03 },
      ],
    },
    {
      ...base,
      id: `${market.id}__home_scorer`,
      title: `${fixture.home.name} anytime scorer`,
      volume: "$92K",
      volume24h: "$18K",
      participants: 640,
      outcomes: [
        { id: "y", label: "Yes", price: 0.71, delta24h: 0.01 },
        { id: "n", label: "No", price: 0.29, delta24h: -0.01 },
      ],
    },
    {
      ...base,
      id: `${market.id}__cards`,
      title: "Over 4.5 cards",
      volume: "$68K",
      volume24h: "$11K",
      participants: 410,
      outcomes: [
        { id: "y", label: "Yes", price: 0.41, delta24h: -0.02 },
        { id: "n", label: "No", price: 0.59, delta24h: 0.02 },
      ],
    },
  ];
}

/** Short pill label for a related market chip. */
export function getRelatedChipLabel(market: SportsMarket, idx: number): string {
  if (idx === 0) {
    if (market.kind === "match" && market.shape === "three-way") return "Full time result";
    if (market.kind === "match") return "Match result";
    return market.title;
  }
  return market.title;
}