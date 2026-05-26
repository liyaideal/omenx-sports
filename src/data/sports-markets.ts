/**
 * Sports markets — the OmenX prediction-market data shape applied to
 * sport-specific contexts (match 1X2, league-winner futures, top-scorer,
 * player props). Prices are in 0..1; render as ¢ in the UI.
 */
import { omenxUrl } from "@/lib/omenx";
import { TEAMS, type TeamLite } from "@/data/sports-mock";
import mbappePhoto from "@/assets/mbappe.png";

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
  /** Outcome shape — drives card layout. binary = 2 outcomes (YES/NO or A/B),
   *  three-way = 1X2 soccer-style. Inferable from outcomes.length but
   *  explicit keeps rendering decisions cheap. */
  shape: "binary" | "three-way";
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
  shape: "three-way",
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
    shape: "three-way",
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
    // Binary two-team market (no draw) — e.g. NBA / playoff / knockout.
    id: "liv-new",
    kind: "match",
    shape: "binary",
    title: "Liverpool to beat Newcastle",
    league: { name: "Premier League", short: "EPL" },
    endsLabel: "23 Aug 4:30pm",
    volume: "$1.18M",
    volume24h: "$310K",
    participants: 2604,
    fixture: { home: TEAMS.liverpool, away: TEAMS.newcastle, kickoff: "4:30pm", whenLabel: "23 Aug" },
    outcomes: [
      { id: "h", label: "LIV", price: 0.63, delta24h: 0.04, team: TEAMS.liverpool },
      { id: "a", label: "NEW", price: 0.37, delta24h: -0.04, team: TEAMS.newcastle },
    ],
    tradeHref: omenxUrl.markets(),
  },
  {
    // Binary single-market YES/NO event — non-match prop.
    id: "messi-hattrick",
    kind: "player-prop",
    shape: "binary",
    title: "Messi scores a hat-trick on Sunday",
    league: { name: "MLS", short: "MLS" },
    endsLabel: "28 Aug 9:00pm",
    volume: "$420K",
    volume24h: "$96K",
    participants: 1184,
    outcomes: [
      { id: "y", label: "YES", price: 0.18, delta24h: 0.02 },
      { id: "n", label: "NO", price: 0.82, delta24h: -0.02 },
    ],
    tradeHref: omenxUrl.markets(),
  },
];

export const LEAGUE_WINNER_MARKET: SportsMarket = {
  id: "epl-winner-25-26",
  kind: "league-winner",
  shape: "three-way",
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
  shape: "three-way",
  title: "Premier League — Top scorer 25/26",
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
    mbappePhoto,
  props: [
    {
      id: "mbappe-anytime",
      kind: "player-prop",
      shape: "binary",
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
      shape: "binary",
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
      shape: "binary",
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
