/**
 * Tournament-shaped data for league hubs: group-stage standings (with
 * "to win group" prices) and a knockout bracket. Both are intentionally
 * scoped to tournament-kind leagues (World Cup 2026 in the current
 * mock); season leagues skip these.
 */
import { TEAMS, type TeamLite } from "@/data/sports-mock";

export interface GroupTeamStanding {
  team: TeamLite | { name: string; short: string; logo?: string; hue?: number };
  /** Implied probability to win the group (0..1). */
  price: number;
  delta24h?: number;
}

export interface GroupMarket {
  /** Stable id, also used as /event/$id slug. */
  id: string;
  /** Group letter, e.g. "A". */
  group: string;
  title: string;
  endsLabel: string;
  volume: string;
  standings: GroupTeamStanding[];
}

export interface BracketTeam {
  short: string;
  name: string;
  logo?: string;
  hue?: number;
}

export interface BracketMatchup {
  id: string;
  home?: BracketTeam;
  away?: BracketTeam;
  /** Probability the home side advances (0..1); pair with away. */
  homePrice?: number;
  awayPrice?: number;
  /** Settled winner — renders as a solid pill, no price. */
  winner?: "home" | "away";
  kickoffLabel?: string;
}

export interface BracketRound {
  id: string;
  label: string;
  matchups: BracketMatchup[];
}

/* ---------------- World Cup 2026 — mock groups (A, B, F) ---------------- */

const nation = (short: string, name: string, hue: number): BracketTeam => ({
  short,
  name,
  hue,
  logo: `https://flagcdn.com/w160/${short.toLowerCase()}.png`,
});

const FRA = nation("fr", "France", 230);
const GER = nation("de", "Germany", 50);
const JPN = nation("jp", "Japan", 0);
const CAN = nation("ca", "Canada", 10);
const ARG = nation("ar", "Argentina", 220);
const MEX = nation("mx", "Mexico", 145);
const BRA = nation("br", "Brazil", 145);
const ESP = nation("es", "Spain", 25);
const NED = nation("nl", "Netherlands", 35);
const POR = nation("pt", "Portugal", 145);
const USA = nation("us", "United States", 250);
const BEL = nation("be", "Belgium", 25);

export const WC26_GROUPS: GroupMarket[] = [
  {
    id: "wc26-grpa-winner",
    group: "A",
    title: "Group A — Winner",
    endsLabel: "Group stage",
    volume: "$1.42M",
    standings: [
      { team: ARG, price: 0.58, delta24h: 0.02 },
      { team: MEX, price: 0.24, delta24h: -0.01 },
      { team: CAN, price: 0.12, delta24h: 0 },
      { team: { name: "Saudi Arabia", short: "sa", logo: "https://flagcdn.com/w160/sa.png" }, price: 0.06, delta24h: -0.01 },
    ],
  },
  {
    id: "wc26-grpb-winner",
    group: "B",
    title: "Group B — Winner",
    endsLabel: "Group stage",
    volume: "$1.18M",
    standings: [
      { team: BRA, price: 0.52, delta24h: 0.03 },
      { team: POR, price: 0.28, delta24h: 0.01 },
      { team: { name: "Switzerland", short: "ch", logo: "https://flagcdn.com/w160/ch.png" }, price: 0.13, delta24h: -0.02 },
      { team: { name: "Senegal", short: "sn", logo: "https://flagcdn.com/w160/sn.png" }, price: 0.07, delta24h: -0.02 },
    ],
  },
  {
    id: "wc26-grpf-winner",
    group: "F",
    title: "Group F — Winner",
    endsLabel: "Group stage",
    volume: "$2.01M",
    standings: [
      { team: FRA, price: 0.52, delta24h: 0.03 },
      { team: GER, price: 0.31, delta24h: -0.02 },
      { team: JPN, price: 0.12, delta24h: 0.01 },
      { team: { name: "Ecuador", short: "ec", logo: "https://flagcdn.com/w160/ec.png" }, price: 0.05, delta24h: -0.02 },
    ],
  },
];

/* ---------------- World Cup 2026 — bracket (QF → SF → F) ---------------- */

export const WC26_BRACKET: BracketRound[] = [
  {
    id: "qf",
    label: "Quarterfinals",
    matchups: [
      { id: "qf1", home: ARG, away: NED, homePrice: 0.62, awayPrice: 0.38, kickoffLabel: "Jul 10" },
      { id: "qf2", home: FRA, away: GER, homePrice: 0.58, awayPrice: 0.42, kickoffLabel: "Jul 10" },
      { id: "qf3", home: BRA, away: ESP, homePrice: 0.55, awayPrice: 0.45, kickoffLabel: "Jul 11" },
      { id: "qf4", home: POR, away: USA, homePrice: 0.68, awayPrice: 0.32, kickoffLabel: "Jul 11" },
    ],
  },
  {
    id: "sf",
    label: "Semifinals",
    matchups: [
      { id: "sf1", home: ARG, away: FRA, homePrice: 0.5, awayPrice: 0.5, kickoffLabel: "Jul 14" },
      { id: "sf2", home: BRA, away: POR, homePrice: 0.58, awayPrice: 0.42, kickoffLabel: "Jul 15" },
    ],
  },
  {
    id: "f",
    label: "Final",
    matchups: [
      { id: "final", home: ARG, away: BRA, homePrice: 0.48, awayPrice: 0.52, kickoffLabel: "Jul 19 · MetLife" },
    ],
  },
];

/** Map league slug → tournament data. Season leagues return undefined. */
export function getGroupsByLeagueSlug(slug: string): GroupMarket[] {
  if (slug === "world-cup-2026") return WC26_GROUPS;
  return [];
}

export function getBracketByLeagueSlug(slug: string): BracketRound[] {
  if (slug === "world-cup-2026") return WC26_BRACKET;
  return [];
}

/** Convenience for picking a few binary question markets to surface in
 *  the Props tab. Filters existing player-prop / season-binary markets
 *  by league short. */
export { TEAMS };