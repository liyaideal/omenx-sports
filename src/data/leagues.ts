/**
 * League Hub metadata — a thin layer above `sports-markets` that maps a
 * league short code (e.g. "EPL", "UCL") to a URL-friendly slug, a kind
 * (tournament vs season-league), and hero copy used by `/league/$slug`.
 *
 * P0 keeps the existing `SportsMarket.league` shape (`{ name, short }`)
 * untouched and reads slug/kind via these helpers. Future iterations may
 * inline the slug/kind on each market.
 */
import {
  MATCH_MARKETS,
  SEASON_LEAGUE_GROUPS,
  SPOTLIGHTS,
  type SportsMarket,
  type PlayerSpotlight,
} from "@/data/sports-markets";
import worldCup2026Logo from "@/assets/leagues/world-cup-2026.png";
import uclLogoAsset from "@/assets/leagues/ucl.svg.asset.json";
import eplLogoAsset from "@/assets/leagues/epl.svg.asset.json";

export type LeagueKind = "tournament" | "season-league";

export interface LeagueHub {
  slug: string;
  /** Short code used in `SportsMarket.league.short`. */
  short: string;
  /** Display name (matches `league.name`). */
  name: string;
  kind: LeagueKind;
  /** One-line hub tagline shown in the hero. */
  tagline: string;
  /** Hex-less OKLCH triplet for the hero gradient accent. */
  accent: string;
  /** ESPN crest reused from `LeagueBadge` presets. */
  logo: string;
  /**
   * Rollout status. `featured` = primary push, gets the spotlight card on
   * the homepage. `coming-soon` = hub exists but markets are not live yet,
   * gets the compact secondary treatment.
   */
  status: "featured" | "coming-soon";
  /** Optional short label for the coming-soon state, e.g. "Aug 15". */
  startsLabel?: string;
}

export const LEAGUES: LeagueHub[] = [
  {
    slug: "world-cup-2026",
    short: "WC",
    name: "World Cup 2026",
    kind: "tournament",
    tagline: "48 nations · USA, Canada & Mexico · June 11 – July 19",
    accent: "0.7 0.18 145",
    logo: worldCup2026Logo,
    status: "featured",
  },
  {
    slug: "ucl",
    short: "UCL",
    name: "UEFA Champions League",
    kind: "tournament",
    tagline: "Europe's elite · league phase to Wembley final",
    accent: "0.65 0.2 250",
    logo: uclLogoAsset.url,
    status: "coming-soon",
    startsLabel: "Sep 16",
  },
  {
    slug: "epl",
    short: "EPL",
    name: "Premier League",
    kind: "season-league",
    tagline: "38 matchdays · 25/26 season title race",
    accent: "0.55 0.2 295",
    logo: eplLogoAsset.url,
    status: "coming-soon",
    startsLabel: "Aug 15",
  },
  {
    slug: "laliga",
    short: "LL",
    name: "La Liga",
    kind: "season-league",
    tagline: "El Clásico, Vinícius, Lewandowski · Spain's top flight",
    accent: "0.7 0.22 25",
    logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/15.png",
    status: "coming-soon",
    startsLabel: "Aug 22",
  },
];

export function getLeagueBySlug(slug: string): LeagueHub | undefined {
  return LEAGUES.find((l) => l.slug === slug);
}

export function getLeagueByShort(short: string): LeagueHub | undefined {
  const norm = short.replace(/\s+/g, "").toLowerCase();
  return LEAGUES.find((l) => l.short.toLowerCase() === norm);
}

/** Match markets that belong to this league (by short code match). */
export function getMatchMarketsByLeagueSlug(slug: string): SportsMarket[] {
  const hub = getLeagueBySlug(slug);
  if (!hub) return [];
  return MATCH_MARKETS.filter(
    (m) => m.league.short.toLowerCase() === hub.short.toLowerCase(),
  );
}

/** Season futures (winner + top scorer) attached to this league, if any. */
export function getSeasonGroupByLeagueSlug(slug: string) {
  return SEASON_LEAGUE_GROUPS.find((g) => g.id === slug);
}

/** Player-prop spotlights with at least one market in this league. */
export function getSpotlightsByLeagueSlug(slug: string): PlayerSpotlight[] {
  const hub = getLeagueBySlug(slug);
  if (!hub) return [];
  return SPOTLIGHTS.filter((s) =>
    s.props.some(
      (p) => p.league.short.toLowerCase() === hub.short.toLowerCase(),
    ),
  );
}

/**
 * Loose binary YES/NO markets attached to this league. Pulls from
 * `MATCH_MARKETS` (e.g. "Messi hat-trick", "Haaland 2+ goals") and from
 * any spotlight prop tagged for this league. Three-way match cards are
 * excluded — those belong in the Games tab.
 */
export function getBinaryQuestionsByLeagueSlug(slug: string): SportsMarket[] {
  const hub = getLeagueBySlug(slug);
  if (!hub) return [];
  const short = hub.short.toLowerCase();
  const fromMatches = MATCH_MARKETS.filter(
    (m) =>
      m.shape === "binary" &&
      m.kind !== "match" &&
      m.league.short.toLowerCase() === short,
  );
  const fromSpotlights = SPOTLIGHTS.flatMap((s) =>
    s.props.filter(
      (p) => p.shape === "binary" && p.league.short.toLowerCase() === short,
    ),
  );
  // Dedupe by id.
  const seen = new Set<string>();
  return [...fromMatches, ...fromSpotlights].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}