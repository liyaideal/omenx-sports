/**
 * Fixtures for the homepage playground at /style-guide/homepage.
 *
 * Keep these isolated from the real `sports-markets.ts` / `sports-mock.ts`
 * exports so the playground can exercise edge states without leaking
 * back into the live homepage.
 */
import {
  FEATURED_MATCH,
  MATCH_MARKETS,
  SEASON_LEAGUE_GROUPS,
  SPOTLIGHTS,
  type SportsMarket,
  type Outcome,
} from "@/data/sports-markets";
import { LIVE_TRADES, TEAMS, type LiveTrade, type TeamKey } from "@/data/sports-mock";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

// ---------- Event tile variants ----------

export const TILE_THREE_WAY: SportsMarket = clone(MATCH_MARKETS[0]);

export const TILE_BINARY: SportsMarket = {
  id: "fx-binary",
  kind: "match",
  shape: "binary",
  title: "Over 2.5 goals — Chelsea vs PSG",
  league: { name: "UEFA Champions League", short: "UCL" },
  endsLabel: "Today 8:00pm",
  volume: "$420K",
  volume24h: "$120K",
  participants: 812,
  outcomes: [
    { id: "y", label: "YES", price: 0.58, delta24h: 0.01 },
    { id: "n", label: "NO", price: 0.42, delta24h: -0.01 },
  ],
  tradeHref: "/event/fx-binary",
};

export const TILE_HOT: SportsMarket = (() => {
  const m = clone(MATCH_MARKETS[0]);
  m.id = "fx-hot";
  m.participants = 4200;
  m.outcomes.forEach((o: Outcome) => (o.delta24h = 0.01));
  return m;
})();

export const TILE_TRENDING: SportsMarket = (() => {
  const m = clone(MATCH_MARKETS[0]);
  m.id = "fx-trend";
  m.participants = 900;
  m.outcomes[0].delta24h = 0.08;
  m.outcomes[2].delta24h = -0.06;
  return m;
})();

export const TILE_NEUTRAL: SportsMarket = (() => {
  const m = clone(MATCH_MARKETS[0]);
  m.id = "fx-neutral";
  m.participants = 320;
  m.outcomes.forEach((o: Outcome) => (o.delta24h = 0.005));
  return m;
})();

export const TILE_ALL_UP: SportsMarket = (() => {
  const m = clone(MATCH_MARKETS[0]);
  m.id = "fx-allup";
  m.outcomes.forEach((o: Outcome) => (o.delta24h = 0.04));
  return m;
})();

export const TILE_ALL_DOWN: SportsMarket = (() => {
  const m = clone(MATCH_MARKETS[0]);
  m.id = "fx-alldown";
  m.outcomes.forEach((o: Outcome) => (o.delta24h = -0.04));
  return m;
})();

// ---------- Match card variants ----------

export const MATCH_THREE_WAY: SportsMarket = clone(FEATURED_MATCH);
export const MATCH_BINARY: SportsMarket = {
  ...clone(FEATURED_MATCH),
  id: "fx-match-binary",
  shape: "binary",
  title: "Chelsea to win — Chelsea vs PSG",
  outcomes: [
    { id: "y", label: "YES", price: 0.42, delta24h: 0.03, team: TEAMS.chelsea },
    { id: "n", label: "NO", price: 0.58, delta24h: -0.03, team: TEAMS.psg },
  ],
};

// ---------- Season market variants ----------

const baseWinner = SEASON_LEAGUE_GROUPS[0].winner;

export const WINNER_DEFAULT: SportsMarket = clone(baseWinner);

export const WINNER_SHORT: SportsMarket = (() => {
  const m = clone(baseWinner);
  m.id = "fx-winner-short";
  m.outcomes = m.outcomes.slice(0, 2);
  return m;
})();

export const WINNER_ALL_UP: SportsMarket = (() => {
  const m = clone(baseWinner);
  m.id = "fx-winner-up";
  m.outcomes.forEach((o: Outcome) => (o.delta24h = 0.03));
  return m;
})();

export const WINNER_ALL_DOWN: SportsMarket = (() => {
  const m = clone(baseWinner);
  m.id = "fx-winner-down";
  m.outcomes.forEach((o: Outcome) => (o.delta24h = -0.02));
  return m;
})();

export const TOPSCORER_WITH_PHOTOS = {
  market: clone(SEASON_LEAGUE_GROUPS[0].topScorer),
  photos: SEASON_LEAGUE_GROUPS[0].photos,
};
export const TOPSCORER_NO_PHOTOS = {
  market: clone(SEASON_LEAGUE_GROUPS[0].topScorer),
  photos: undefined,
};

// ---------- Player props spotlight ----------

export const SPOTLIGHT_ONE = [SPOTLIGHTS[0]];
export const SPOTLIGHT_MANY = SPOTLIGHTS;

// ---------- Live trades ----------

export const TRADES_DEFAULT: LiveTrade[] = LIVE_TRADES;
export const TRADES_EMPTY: LiveTrade[] = [];
export const TRADES_NO_MATCH: LiveTrade[] = LIVE_TRADES.filter(
  (t) => !t.eventTeams.some((k) => k === "chelsea" || k === "manCity"),
);

export const FOLLOW_NONE = {
  followedTeams: [],
  followedKeys: [] as TeamKey[],
};
export const FOLLOW_CHELSEA = {
  followedTeams: [TEAMS.chelsea],
  followedKeys: ["chelsea"] as TeamKey[],
};
export const FOLLOW_PSG_NOMATCH = {
  followedTeams: [TEAMS.psg],
  followedKeys: ["psg"] as TeamKey[],
};

// ---------- Account stat variants ----------

export const STATS_DEFAULT = { openPositions: 7, pnlToday: "+$142.20", toClaim: "$48.00" };
export const STATS_FLAT = { openPositions: 4, pnlToday: "$0.00", toClaim: "$0.00" };
export const STATS_LOSING = { openPositions: 3, pnlToday: "-$32.40", toClaim: "$0.00" };
export const STATS_ZERO = { openPositions: 0, pnlToday: "$0.00", toClaim: "$0.00" };
export const STATS_BIG_CLAIM = {
  openPositions: 12,
  pnlToday: "+$1,284.50",
  toClaim: "$12,400.00",
};

// ---------- Day strip counts ----------

export const DAY_COUNTS_VARIED: Record<number, number> = {
  [-3]: 0, [-2]: 2, [-1]: 4, [0]: 6, [1]: 3, [2]: 1, [3]: 0,
};
export const DAY_COUNTS_EMPTY: Record<number, number> = {};
