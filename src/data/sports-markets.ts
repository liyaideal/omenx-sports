/**
 * Sports markets — the OmenX prediction-market data shape applied to
 * sport-specific contexts (match 1X2, league-winner futures, top-scorer,
 * player props). Prices are in 0..1; render as ¢ in the UI.
 */
import { omenxUrl } from "@/lib/omenx";
import { TEAMS, type TeamLite } from "@/data/sports-mock";

export type { TeamLite } from "@/data/sports-mock";
export { TEAMS } from "@/data/sports-mock";

export type MarketKind = "match" | "league-winner" | "top-scorer" | "player-prop";

export interface Outcome {
  id: string;
  label: string;
  price: number; // 0..1
  delta24h?: number; // -1..1
  team?: TeamLite;
  meta?: string; // e.g. "10" jersey, "F" position
}

export interface SportsMarket {
  id: string;
  kind: MarketKind;
  title: string;
  league: { name: string; short: string };
  endsLabel: string;
  volume: string;
  volume24h: string;
  participants: number;
  outcomes: Outcome[];
  fixture?: { home: TeamLite; away: TeamLite; kickoff: string; whenLabel: string };
  tradeHref: string;
}

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "live", label: "Live", live: true },
  { id: "soccer", label: "Soccer" },
  { id: "epl", label: "EPL" },
  { id: "ucl", label: "UCL" },
  { id: "laliga", label: "La Liga" },
  { id: "nba", label: "NBA" },
  { id: "nfl", label: "NFL" },
] as const;

export const FEATURED_MATCH: SportsMarket = {
  id: "che-psg-2025-ucl",
  kind: "match",
  title: "Chelsea vs Paris SG — Full time result",
  league: { name: "UEFA Champions League", short: "UCL" },
  endsLabel: "Today 8:00pm",
  volume: "$2.45M",
  volume24h: "$612K",
  participants: 4821,
  fixture: { home: TEAMS.chelsea, away: TEAMS.psg, kickoff: "8:00pm", whenLabel: "Today" },
  outcomes: [
    { id: "h", label: "Chelsea", price: 0.42, delta24h: 0.03, team: TEAMS.chelsea },
    { id: "d", label: "Draw", price: 0.21, delta24h: -0.01 },
    { id: "a", label: "Paris SG", price: 0.37, delta24h: -0.02, team: TEAMS.psg },
  ],
  tradeHref: omenxUrl.markets(),
};

export const MATCH_MARKETS: SportsMarket[] = [
  {
    id: "mci-ars",
    kind: "match",
    title: "Man City vs Arsenal",
    league: { name: "Premier League", short: "EPL" },
    endsLabel: "Today 6:00pm",
    volume: "$1.82M",
    volume24h: "$240K",
    participants: 2104,
    fixture: { home: TEAMS.manCity, away: TEAMS.arsenal, kickoff: "6:00pm", whenLabel: "Today" },
    outcomes: [
      { id: "h", label: "MCI", price: 0.48, delta24h: 0.02, team: TEAMS.manCity },
      { id: "d", label: "Draw", price: 0.24, delta24h: 0, meta: "X" },
      { id: "a", label: "ARS", price: 0.28, delta24h: -0.02, team: TEAMS.arsenal },
    ],
    tradeHref: omenxUrl.markets(),
  },
  {
    id: "che-psg",
    kind: "match",
    title: "Chelsea vs Paris SG",
    league: { name: "UCL", short: "UCL" },
    endsLabel: "23 Aug 4:30pm",
    volume: "$2.45M",
    volume24h: "$612K",
    participants: 4821,
    fixture: { home: TEAMS.chelsea, away: TEAMS.psg, kickoff: "4:30pm", whenLabel: "23 Aug" },
    outcomes: [
      { id: "h", label: "CHE", price: 0.42, delta24h: 0.03, team: TEAMS.chelsea },
      { id: "d", label: "Draw", price: 0.21, delta24h: -0.01, meta: "X" },
      { id: "a", label: "PSG", price: 0.37, delta24h: -0.02, team: TEAMS.psg },
    ],
    tradeHref: omenxUrl.markets(),
  },
  {
    id: "bar-ars",
    kind: "match",
    title: "Barcelona vs Arsenal",
    league: { name: "Friendly", short: "FRIENDLY" },
    endsLabel: "28 Aug 9:00pm",
    volume: "$640K",
    volume24h: "$88K",
    participants: 982,
    fixture: { home: TEAMS.barcelona, away: TEAMS.arsenal, kickoff: "9:00pm", whenLabel: "28 Aug" },
    outcomes: [
      { id: "h", label: "BAR", price: 0.55, delta24h: 0.01, team: TEAMS.barcelona },
      { id: "d", label: "Draw", price: 0.22, delta24h: 0, meta: "X" },
      { id: "a", label: "ARS", price: 0.23, delta24h: -0.01, team: TEAMS.arsenal },
    ],
    tradeHref: omenxUrl.markets(),
  },
];

export const LEAGUE_WINNER_MARKET: SportsMarket = {
  id: "epl-winner-25-26",
  kind: "league-winner",
  title: "Premier League — Winner 25/26",
  league: { name: "Premier League", short: "EPL" },
  endsLabel: "Settles May 24, 2026",
  volume: "$12.4M",
  volume24h: "$1.1M",
  participants: 18420,
  outcomes: [
    { id: "mci", label: "Man City", price: 0.38, delta24h: 0.02, team: TEAMS.manCity },
    { id: "ars", label: "Arsenal", price: 0.31, delta24h: 0.04, team: TEAMS.arsenal },
    { id: "liv", label: "Liverpool", price: 0.18, delta24h: -0.01, team: TEAMS.liverpool },
    { id: "new", label: "Newcastle", price: 0.08, delta24h: -0.02, team: TEAMS.newcastle },
  ],
  tradeHref: omenxUrl.markets(),
};

export const TOP_SCORER_MARKET: SportsMarket = {
  id: "epl-top-scorer-25-26",
  kind: "top-scorer",
  title: "EPL Top Scorer 25/26",
  league: { name: "Premier League", short: "EPL" },
  endsLabel: "Settles May 24, 2026",
  volume: "$3.6M",
  volume24h: "$420K",
  participants: 6210,
  outcomes: [
    {
      id: "messi",
      label: "L. Messi",
      price: 0.34,
      delta24h: 0.03,
      team: TEAMS.interMiami,
      meta: "21G · #10",
    },
    {
      id: "haaland",
      label: "E. Haaland",
      price: 0.41,
      delta24h: -0.02,
      team: TEAMS.manCity,
      meta: "16G · #17",
    },
  ],
  tradeHref: omenxUrl.markets(),
};

export interface PlayerSpotlight {
  handle: string;
  firstName: string;
  lastName: string;
  position: string;
  club: TeamLite;
  photo: string;
  props: SportsMarket[];
}

export const SPOTLIGHT: PlayerSpotlight = {
  handle: "MBAPPE_KM",
  firstName: "Kylian",
  lastName: "Mbappé",
  position: "Forward · Real Madrid",
  club: TEAMS.realMadrid,
  photo:
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&h=1100&fit=crop&q=85",
  props: [
    {
      id: "mbappe-anytime",
      kind: "player-prop",
      title: "Anytime goalscorer",
      league: { name: "La Liga", short: "LL" },
      endsLabel: "Today 8:00pm",
      volume: "$184K",
      volume24h: "$42K",
      participants: 612,
      outcomes: [
        { id: "y", label: "Yes", price: 0.71, delta24h: 0.04 },
        { id: "n", label: "No", price: 0.29, delta24h: -0.04 },
      ],
      tradeHref: omenxUrl.markets(),
    },
    {
      id: "mbappe-2plus",
      kind: "player-prop",
      title: "2+ goals scored",
      league: { name: "La Liga", short: "LL" },
      endsLabel: "Today 8:00pm",
      volume: "$96K",
      volume24h: "$22K",
      participants: 318,
      outcomes: [
        { id: "y", label: "Yes", price: 0.28, delta24h: 0.02 },
        { id: "n", label: "No", price: 0.72, delta24h: -0.02 },
      ],
      tradeHref: omenxUrl.markets(),
    },
    {
      id: "mbappe-shots",
      kind: "player-prop",
      title: "Over 3.5 shots on target",
      league: { name: "La Liga", short: "LL" },
      endsLabel: "Today 8:00pm",
      volume: "$58K",
      volume24h: "$11K",
      participants: 204,
      outcomes: [
        { id: "o", label: "Over", price: 0.46, delta24h: 0.01 },
        { id: "u", label: "Under", price: 0.54, delta24h: -0.01 },
      ],
      tradeHref: omenxUrl.markets(),
    },
  ],
};

export const ACCOUNT_STATS = {
  available: "$1,240.50",
  openPositions: 7,
  pnlToday: "+$142.20",
};
