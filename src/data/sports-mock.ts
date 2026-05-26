/**
 * Mock data for the sports dashboard. Replace with live OmenX feeds once
 * the data contract is settled. Image URLs use Unsplash for crests and
 * stock player photography — swap to licensed assets before launch.
 */
import { omenxUrl } from "@/lib/omenx";

export interface TeamLite {
  name: string;
  short: string;
  logo: string;
  /** Voter / supporter accent in oklch for poll bars and pill glow. */
  hue: number;
}

export const TEAMS = {
  chelsea: {
    name: "Chelsea",
    short: "CHE",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png",
    hue: 245,
  },
  psg: {
    name: "Paris SG",
    short: "PSG",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png",
    hue: 295,
  },
  manCity: {
    name: "Man City",
    short: "MCI",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
    hue: 210,
  },
  arsenal: {
    name: "Arsenal",
    short: "ARS",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
    hue: 10,
  },
  barcelona: {
    name: "Barcelona",
    short: "BAR",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
    hue: 250,
  },
  realMadrid: {
    name: "Real Madrid",
    short: "RMA",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
    hue: 270,
  },
  newcastle: {
    name: "Newcastle",
    short: "NEW",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/361.png",
    hue: 0,
  },
  liverpool: {
    name: "Liverpool",
    short: "LIV",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
    hue: 15,
  },
  interMiami: {
    name: "Inter Miami",
    short: "MIA",
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/20232.png",
    hue: 340,
  },
} as const satisfies Record<string, TeamLite>;

export const FAN_POLL = {
  authorAvatar: TEAMS.chelsea.logo,
  authorName: "Chelsea",
  authorHandle: "@chelsea_official",
  question: "Who will win today's match?",
  home: TEAMS.chelsea,
  away: TEAMS.psg,
  whenLabel: "Today",
  kickoff: "8:00pm",
  votes: { home: 21, away: 29 },
  reactions: { likes: 78, comments: 35, shares: 32, flags: 32 },
  marketHref: omenxUrl.markets(),
};

export const FAN_POST = {
  authorAvatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces&q=80",
  authorName: "Alex",
  authorHandle: "@alexio_98",
  postedAgo: "2 minutes ago",
  title: "PSG in the Champions League!",
  image:
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&h=520&fit=crop&q=80",
  href: omenxUrl.markets(),
};

export const UPCOMING_EVENTS = [
  {
    home: TEAMS.manCity,
    away: TEAMS.arsenal,
    kickoff: "5:30pm",
    dateLabel: "Today 6:00pm",
    league: { name: "La Liga", short: "LA LIGA" },
    href: omenxUrl.markets(),
  },
  {
    home: TEAMS.chelsea,
    away: TEAMS.psg,
    kickoff: "5:30pm",
    dateLabel: "23 Aug 4:30pm",
    league: { name: "La Liga", short: "LA LIGA" },
    href: omenxUrl.markets(),
  },
  {
    home: TEAMS.barcelona,
    away: TEAMS.arsenal,
    kickoff: "5:30pm",
    dateLabel: "28 Aug 9:00pm",
    league: { name: "La Liga", short: "LA LIGA" },
    href: omenxUrl.markets(),
  },
];

export interface StandingRow {
  team: TeamLite;
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

export const STANDINGS: StandingRow[] = [
  { team: TEAMS.manCity, played: 8, wins: 2, draws: 0, losses: 82 },
  { team: TEAMS.arsenal, played: 8, wins: 2, draws: 0, losses: 82 },
  { team: TEAMS.newcastle, played: 6, wins: 2, draws: 0, losses: 62 },
  { team: TEAMS.liverpool, played: 3, wins: 4, draws: 0, losses: 22 },
];

/**
 * Mock user follow state. Toggle to `[]` to preview the Fans Zone
 * empty / onboarding state in the left column of the home page.
 */
export const FOLLOWED_TEAMS: TeamLite[] = [TEAMS.chelsea, TEAMS.manCity];

/** Surfaced in the Fans Zone empty state as one-tap follow chips. */
export const SUGGESTED_TEAMS: TeamLite[] = [
  TEAMS.realMadrid,
  TEAMS.barcelona,
  TEAMS.liverpool,
  TEAMS.arsenal,
  TEAMS.psg,
];

export interface TopScorer {
  firstName: string;
  lastName: string;
  goals: number;
  jersey: number;
  photo: string;
  club: TeamLite;
  href: string;
}

export const TOP_SCORERS: TopScorer[] = [
  {
    firstName: "Lionel",
    lastName: "Messi",
    goals: 21,
    jersey: 10,
    photo:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop&q=80",
    club: TEAMS.interMiami,
    href: omenxUrl.markets(),
  },
  {
    firstName: "Erling",
    lastName: "Haaland",
    goals: 16,
    jersey: 17,
    photo:
      "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=400&fit=crop&q=80",
    club: TEAMS.manCity,
    href: omenxUrl.markets(),
  },
];

export const SPOTLIGHT_PLAYER = {
  handle: "KIL_SEBGEY B.",
  firstName: "Kylian",
  lastName: "Mbappé",
  position: "Forward",
  photo:
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&h=1100&fit=crop&q=85",
  stats: [
    { label: "Goals", value: 132 },
    { label: "Assist", value: 320 },
    { label: "Matches", value: 89 },
  ],
};
