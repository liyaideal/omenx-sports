/**
 * Team dictionary — central source of truth for team identity in the design system.
 *
 * `short` is the 2–4 letter abbreviation shown in compact UI (OutcomePill, OrderBook),
 * with `name` surfaced via tooltip on hover. `logo` points at a stable public CDN —
 * components fall back to a generated letter crest when the image fails to load.
 */
export interface Team {
  id: string;
  name: string;
  short: string;
  logo?: string;
}

// ESPN soccer crest CDN (public). NBA uses cdn.nba.com primary logos.
const ESPN = (id: number) => `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
const NBA = (id: number) => `https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`;

export const teams = {
  realMadrid: { id: "real-madrid", name: "Real Madrid", short: "RMA", logo: ESPN(86) },
  barcelona: { id: "barcelona", name: "Barcelona", short: "BAR", logo: ESPN(83) },
  manCity: { id: "man-city", name: "Man City", short: "MCI", logo: ESPN(382) },
  arsenal: { id: "arsenal", name: "Arsenal", short: "ARS", logo: ESPN(359) },
  chelsea: { id: "chelsea", name: "Chelsea", short: "CHE", logo: ESPN(363) },
  psg: { id: "psg", name: "Paris SG", short: "PSG", logo: ESPN(160) },
  lakers: { id: "lakers", name: "LA Lakers", short: "LAL", logo: NBA(1610612747) },
  celtics: { id: "celtics", name: "Boston Celtics", short: "BOS", logo: NBA(1610612738) },
  // Neutral outcomes — no logo, letter crest only.
  yes: { id: "yes", name: "Yes", short: "YES" },
  no: { id: "no", name: "No", short: "NO" },
} as const satisfies Record<string, Team>;

export type TeamKey = keyof typeof teams;