/**
 * Mock data for the OMENX World Cup Carnival promo page (`/promo/world-cup`).
 *
 * All numbers, copy, probabilities and ticker lines are static fixtures —
 * the promo page is presentation-only (no DB writes). Components own any
 * transient state (selected combos, lucky-box spin result).
 */

export const CARNIVAL_PRIZE_POOL = 3_000_000;

/** Target date the Hero countdown ticks toward (final, MetLife). */
export const CARNIVAL_ENDS_AT = "2026-07-19T20:00:00Z";

export interface NewbieTask {
  id: "register" | "first-deposit" | "first-trade" | "invite";
  code: string;
  title: string;
  description: string;
  rewardLabel: string;
  /** 0..1 mock progress so the LED bars have something to fill. */
  progress: number;
  /**
   * 4-state machine. CRITICAL: rewards are NEVER auto-credited.
   * - `locked`        — prerequisites unmet (e.g. T-02 before T-01 done)
   * - `in-progress`   — user is working toward the threshold
   * - `claimable`     — threshold reached, **waiting for the user to click Claim**
   * - `claimed`       — voucher dispatched
   */
  status: "locked" | "in-progress" | "claimable" | "claimed";
  cta: string;
  ctaHref?: string;
  /** true = OmenX main site (open in new tab); false/undefined = same sports sub-domain (TanStack Link). */
  ctaExternal?: boolean;
  newOnly: boolean;
}

export const NEWBIE_TASKS: NewbieTask[] = [
  {
    id: "register",
    code: "T-01",
    title: "Complete registration",
    description: "Open an OMENX account and verify your email to claim your welcome voucher.",
    rewardLabel: "10 U Position Voucher",
    progress: 1,
    status: "claimed",
    cta: "Claimed",
    newOnly: true,
  },
  {
    id: "first-deposit",
    code: "T-02",
    title: "First deposit ≥ 20 U",
    description: "Top up at least 20 U to unlock the deposit voucher.",
    rewardLabel: "20 U Position Voucher",
    progress: 0.4,
    status: "in-progress",
    cta: "Deposit now",
    ctaHref: "https://omenx.lovable.app/wallet",
    ctaExternal: true,
    newOnly: true,
  },
  {
    id: "first-trade",
    code: "T-03",
    title: "First 100 U of volume",
    description: "Place trades totalling 100 U of effective volume on any market.",
    rewardLabel: "30 U Position Voucher",
    progress: 0.15,
    status: "in-progress",
    cta: "Open events",
    ctaHref: "/league/world-cup-2026?view=games",
    ctaExternal: false,
    newOnly: true,
  },
  {
    id: "invite",
    code: "T-04",
    title: "Invite friends to trade",
    description: "Earn one voucher per friend who places real volume. Up to 10 friends counted.",
    rewardLabel: "50 U × up to 10 friends",
    progress: 0.2,
    status: "in-progress",
    cta: "Copy invite link",
    newOnly: false,
  },
];

export const INVITE_PROGRESS = { current: 2, max: 10, voucherPerFriend: 50 };

/* ------------------------------------------------------------------ */
/*  Combo Challenge — 10 U → 500 U                                     */
/* ------------------------------------------------------------------ */

/**
 * v2 — Frontend PRD-aligned model. Matches are first-class; markets nest
 * under matches; only MONEYLINE markets are combo-eligible (PRD §0.2).
 * SPREAD / TOTAL markets render as display-only reference data and are
 * blocked from combos via `combo_eligible: false`.
 */

export const COMBO_MAX_ODDS = 50;
export const COMBO_STAKE = 10;
export const COMBO_MAX_PICKS = 3;
export const COMBO_MAX_COMBOS_PER_USER = 3;

export const COMBO_STAKE_MIN = 1;
export const COMBO_STAKE_MAX = 10;
export const COMBO_STAKE_STEP = 0.1;

export const COMBO_QUOTE_TTL_SEC = 60;
export const COMBO_REQUOTE_PROBABILITY = 0.3;
export const COMBO_REQUOTE_DRIFT_RANGE: [number, number] = [0.05, 0.15];

export type WCStage = "GROUP" | "R32" | "R16" | "QF" | "SF" | "FINAL";
export type MatchComboStatus = "AVAILABLE" | "MATCH_CUTOFF_REACHED" | "IN_PLAY";
export type OutcomeSide = "HOME" | "DRAW" | "AWAY";
export type WCMarketType = "MONEYLINE" | "SPREAD" | "TOTAL";

export interface WCOutcome {
  outcomeId: string;
  label: string;
  side: OutcomeSide;
  /** 0..1 implied probability — drives display % and combo odds (1/p). */
  probability: number;
  selectable: boolean;
  disabledReason?: string;
}

export interface WCMarketLine {
  /** Numeric line for spread/total, e.g. 2.5. */
  lineValue: number;
  /** Always exactly 2 outcomes for spread/total (HOME/AWAY semantics). */
  outcomes: WCOutcome[];
}

export interface WCMarket {
  /** Stable id `${matchId}:ML|SP|TT` for use as combo-leg uniqueness key. */
  marketId: string;
  marketType: WCMarketType;
  combo_eligible: boolean;
  /** MONEYLINE only — direct outcomes (Home / Draw / Away). */
  outcomes?: WCOutcome[];
  /** SPREAD / TOTAL — multiple selectable lines; UI lets user step through. */
  lines?: WCMarketLine[];
  /** Index of the line shown by default (e.g. middle of the array). */
  defaultLineIndex?: number;
}

export interface WCMatch {
  matchId: string;
  stage: WCStage;
  matchday: string; // YYYY-MM-DD
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
  /** Kickoff label e.g. "Jun 15 · 20:00 ET". */
  kickoff: string;
  matchStartTimeMs: number;
  matchComboStatus: MatchComboStatus;
  markets: WCMarket[];
}

function ml(
  home: { code: string; name: string; p: number },
  draw: number,
  away: { code: string; name: string; p: number },
): WCMarket {
  return {
    marketId: "", // filled in by enrichMatch
    marketType: "MONEYLINE",
    combo_eligible: true,
    outcomes: [
      { outcomeId: `${home.code}_WIN`, label: `${home.name} Win`, side: "HOME", probability: home.p, selectable: true },
      { outcomeId: "DRAW", label: "Draw", side: "DRAW", probability: draw, selectable: true },
      { outcomeId: `${away.code}_WIN`, label: `${away.name} Win`, side: "AWAY", probability: away.p, selectable: true },
    ],
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Build a 4-line SPREAD market around the moneyline favorite. */
function buildSpread(
  matchId: string,
  homeCode: string,
  awayCode: string,
  homeP: number,
  awayP: number,
): WCMarket {
  const homeIsFav = homeP >= awayP;
  const favCode = homeIsFav ? homeCode : awayCode;
  const dogCode = homeIsFav ? awayCode : homeCode;
  const favSide: OutcomeSide = homeIsFav ? "HOME" : "AWAY";
  const dogSide: OutcomeSide = homeIsFav ? "AWAY" : "HOME";
  const favP = Math.max(homeP, awayP);
  const lineValues = [0.5, 1.0, 1.5, 2.5];
  const lines: WCMarketLine[] = lineValues.map((line) => {
    // 0.5 ≈ easier than ML (slight bump), 2.5 ≈ much harder.
    const adj = (line - 1.0) * 0.12;
    const favWinProb = clamp(favP - adj, 0.08, 0.92);
    return {
      lineValue: line,
      outcomes: [
        {
          outcomeId: `SP_${favCode}_-${line}`,
          label: `${favCode} -${line}`,
          side: favSide,
          probability: favWinProb,
          selectable: true,
        },
        {
          outcomeId: `SP_${dogCode}_+${line}`,
          label: `${dogCode} +${line}`,
          side: dogSide,
          probability: 1 - favWinProb,
          selectable: true,
        },
      ],
    };
  });
  return {
    marketId: `${matchId}:SP`,
    marketType: "SPREAD",
    combo_eligible: true,
    defaultLineIndex: 1,
    lines,
  };
}

/** Build a 5-line TOTAL market (Over / Under) around a centered base line. */
function buildTotal(matchId: string, baseOver = 0.5): WCMarket {
  const baseLine = 2.5;
  const lineValues = [0.5, 1.5, 2.5, 3.5, 4.5];
  const lines: WCMarketLine[] = lineValues.map((line) => {
    const diff = (line - baseLine) * 0.18; // higher line → lower over prob
    const overP = clamp(baseOver - diff, 0.05, 0.95);
    return {
      lineValue: line,
      outcomes: [
        {
          outcomeId: `TT_O_${line}`,
          label: `Over ${line}`,
          side: "HOME",
          probability: overP,
          selectable: true,
        },
        {
          outcomeId: `TT_U_${line}`,
          label: `Under ${line}`,
          side: "AWAY",
          probability: 1 - overP,
          selectable: true,
        },
      ],
    };
  });
  return {
    marketId: `${matchId}:TT`,
    marketType: "TOTAL",
    combo_eligible: true,
    defaultLineIndex: 2,
    lines,
  };
}

/**
 * Each match is defined with a single MONEYLINE market; this enricher
 * auto-attaches a Spread and Total market with multi-line options so the
 * combo card can offer all three Polymarket-style.
 */
function enrichMatch(m: WCMatch): WCMatch {
  const moneyline = m.markets[0];
  moneyline.marketId = `${m.matchId}:ML`;
  const homeP = moneyline.outcomes?.find((o) => o.side === "HOME")?.probability ?? 0.4;
  const awayP = moneyline.outcomes?.find((o) => o.side === "AWAY")?.probability ?? 0.4;
  // Closer matches → marginally higher total over prob (more game-script variance).
  const baseOver = clamp(0.5 + (1 - Math.abs(homeP - awayP)) * 0.05, 0.4, 0.62);
  return {
    ...m,
    markets: [
      moneyline,
      buildSpread(m.matchId, m.homeCode, m.awayCode, homeP, awayP),
      buildTotal(m.matchId, baseOver),
    ],
  };
}

/** Fixture: ~20 World Cup 2026 matches across stages, with cut-off + display-only mix. */
const RAW_WC_MATCHES: WCMatch[] = [
  // Matchday 1 — Group, today
  {
    matchId: "WC26_GRPA_ARG_MEX", stage: "GROUP", matchday: "2026-06-15",
    home: "Argentina", away: "Mexico", homeCode: "ARG", awayCode: "MEX",
    kickoff: "Jun 15 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 16, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "ARG", name: "Argentina", p: 0.52 }, 0.27, { code: "MEX", name: "Mexico", p: 0.21 }),

    ],
  },
  {
    matchId: "WC26_GRPB_BRA_JPN", stage: "GROUP", matchday: "2026-06-15",
    home: "Brazil", away: "Japan", homeCode: "BRA", awayCode: "JPN",
    kickoff: "Jun 15 · 23:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 16, 3, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "BRA", name: "Brazil", p: 0.62 }, 0.22, { code: "JPN", name: "Japan", p: 0.16 }),

    ],
  },
  {
    matchId: "WC26_GRPC_FRA_NOR", stage: "GROUP", matchday: "2026-06-15",
    home: "France", away: "Norway", homeCode: "FRA", awayCode: "NOR",
    kickoff: "Jun 15 · 17:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 15, 21, 0),
    // Already kicked off — locked from combo selection.
    matchComboStatus: "MATCH_CUTOFF_REACHED",
    markets: [
      ml({ code: "FRA", name: "France", p: 0.58 }, 0.24, { code: "NOR", name: "Norway", p: 0.18 }),
    ],
  },
  // Matchday 2 — tomorrow
  {
    matchId: "WC26_GRPD_ESP_USA", stage: "GROUP", matchday: "2026-06-16",
    home: "Spain", away: "USA", homeCode: "ESP", awayCode: "USA",
    kickoff: "Jun 16 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 17, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "ESP", name: "Spain", p: 0.55 }, 0.26, { code: "USA", name: "USA", p: 0.19 }),

    ],
  },
  {
    matchId: "WC26_GRPE_GER_CAN", stage: "GROUP", matchday: "2026-06-16",
    home: "Germany", away: "Canada", homeCode: "GER", awayCode: "CAN",
    kickoff: "Jun 16 · 17:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 16, 21, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "GER", name: "Germany", p: 0.61 }, 0.23, { code: "CAN", name: "Canada", p: 0.16 }),
    ],
  },
  {
    matchId: "WC26_GRPF_POR_GHA", stage: "GROUP", matchday: "2026-06-16",
    home: "Portugal", away: "Ghana", homeCode: "POR", awayCode: "GHA",
    kickoff: "Jun 16 · 23:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 17, 3, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "POR", name: "Portugal", p: 0.57 }, 0.24, { code: "GHA", name: "Ghana", p: 0.19 }),

    ],
  },
  // Matchday 3
  {
    matchId: "WC26_GRPG_NED_KOR", stage: "GROUP", matchday: "2026-06-17",
    home: "Netherlands", away: "South Korea", homeCode: "NED", awayCode: "KOR",
    kickoff: "Jun 17 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 18, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "NED", name: "Netherlands", p: 0.54 }, 0.27, { code: "KOR", name: "South Korea", p: 0.19 }),
    ],
  },
  {
    matchId: "WC26_GRPH_BEL_EGY", stage: "GROUP", matchday: "2026-06-17",
    home: "Belgium", away: "Egypt", homeCode: "BEL", awayCode: "EGY",
    kickoff: "Jun 17 · 17:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 17, 21, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "BEL", name: "Belgium", p: 0.59 }, 0.24, { code: "EGY", name: "Egypt", p: 0.17 }),

    ],
  },
  {
    matchId: "WC26_GRPI_ITA_AUS", stage: "GROUP", matchday: "2026-06-17",
    home: "Italy", away: "Australia", homeCode: "ITA", awayCode: "AUS",
    kickoff: "Jun 17 · 23:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 18, 3, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "ITA", name: "Italy", p: 0.51 }, 0.28, { code: "AUS", name: "Australia", p: 0.21 }),
    ],
  },
  {
    matchId: "WC26_GRPJ_ENG_DEN", stage: "GROUP", matchday: "2026-06-18",
    home: "England", away: "Denmark", homeCode: "ENG", awayCode: "DEN",
    kickoff: "Jun 18 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 19, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "ENG", name: "England", p: 0.49 }, 0.29, { code: "DEN", name: "Denmark", p: 0.22 }),

    ],
  },
  {
    matchId: "WC26_GRPK_URU_CRO", stage: "GROUP", matchday: "2026-06-18",
    home: "Uruguay", away: "Croatia", homeCode: "URU", awayCode: "CRO",
    kickoff: "Jun 18 · 17:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 18, 21, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "URU", name: "Uruguay", p: 0.44 }, 0.30, { code: "CRO", name: "Croatia", p: 0.26 }),
    ],
  },
  {
    matchId: "WC26_GRPL_MAR_SUI", stage: "GROUP", matchday: "2026-06-18",
    home: "Morocco", away: "Switzerland", homeCode: "MAR", awayCode: "SUI",
    kickoff: "Jun 18 · 23:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 19, 3, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "MAR", name: "Morocco", p: 0.41 }, 0.30, { code: "SUI", name: "Switzerland", p: 0.29 }),
    ],
  },
  // R16
  {
    matchId: "WC26_R16_BRA_POR", stage: "R16", matchday: "2026-06-30",
    home: "Brazil", away: "Portugal", homeCode: "BRA", awayCode: "POR",
    kickoff: "Jun 30 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 6, 1, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "BRA", name: "Brazil", p: 0.53 }, 0.27, { code: "POR", name: "Portugal", p: 0.20 }),

    ],
  },
  {
    matchId: "WC26_R16_ARG_NED", stage: "R16", matchday: "2026-06-30",
    home: "Argentina", away: "Netherlands", homeCode: "ARG", awayCode: "NED",
    kickoff: "Jun 30 · 17:00 ET", matchStartTimeMs: Date.UTC(2026, 5, 30, 21, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "ARG", name: "Argentina", p: 0.48 }, 0.28, { code: "NED", name: "Netherlands", p: 0.24 }),
    ],
  },
  {
    matchId: "WC26_R16_FRA_BEL", stage: "R16", matchday: "2026-07-01",
    home: "France", away: "Belgium", homeCode: "FRA", awayCode: "BEL",
    kickoff: "Jul 1 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 6, 2, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "FRA", name: "France", p: 0.50 }, 0.28, { code: "BEL", name: "Belgium", p: 0.22 }),
    ],
  },
  {
    matchId: "WC26_R16_ESP_ENG", stage: "R16", matchday: "2026-07-01",
    home: "Spain", away: "England", homeCode: "ESP", awayCode: "ENG",
    kickoff: "Jul 1 · 17:00 ET", matchStartTimeMs: Date.UTC(2026, 6, 1, 21, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "ESP", name: "Spain", p: 0.46 }, 0.29, { code: "ENG", name: "England", p: 0.25 }),
    ],
  },
  // QF
  {
    matchId: "WC26_QF_BRA_FRA", stage: "QF", matchday: "2026-07-09",
    home: "Brazil", away: "France", homeCode: "BRA", awayCode: "FRA",
    kickoff: "Jul 9 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 6, 10, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "BRA", name: "Brazil", p: 0.47 }, 0.28, { code: "FRA", name: "France", p: 0.25 }),
    ],
  },
  {
    matchId: "WC26_QF_ARG_ESP", stage: "QF", matchday: "2026-07-09",
    home: "Argentina", away: "Spain", homeCode: "ARG", awayCode: "ESP",
    kickoff: "Jul 9 · 17:00 ET", matchStartTimeMs: Date.UTC(2026, 6, 9, 21, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "ARG", name: "Argentina", p: 0.45 }, 0.29, { code: "ESP", name: "Spain", p: 0.26 }),
    ],
  },
  // SF
  {
    matchId: "WC26_SF_BRA_ARG", stage: "SF", matchday: "2026-07-15",
    home: "Brazil", away: "Argentina", homeCode: "BRA", awayCode: "ARG",
    kickoff: "Jul 15 · 20:00 ET", matchStartTimeMs: Date.UTC(2026, 6, 16, 0, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "BRA", name: "Brazil", p: 0.44 }, 0.28, { code: "ARG", name: "Argentina", p: 0.28 }),
    ],
  },
  // Final
  {
    matchId: "WC26_FINAL", stage: "FINAL", matchday: "2026-07-19",
    home: "Brazil", away: "France", homeCode: "BRA", awayCode: "FRA",
    kickoff: "Jul 19 · 16:00 ET", matchStartTimeMs: Date.UTC(2026, 6, 19, 20, 0),
    matchComboStatus: "AVAILABLE",
    markets: [
      ml({ code: "BRA", name: "Brazil", p: 0.46 }, 0.28, { code: "FRA", name: "France", p: 0.26 }),

    ],
  },
];

export const WC_COMBO_MATCHES: WCMatch[] = RAW_WC_MATCHES.map(enrichMatch);

export const WC_STAGES: { id: WCStage | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "GROUP", label: "Group" },
  { id: "R16", label: "R16" },
  { id: "QF", label: "QF" },
  { id: "SF", label: "SF" },
  { id: "FINAL", label: "Final" },
];

/* ------------------------------------------------------------------ */
/*  Lucky Box — daily volume → spin tier                               */
/* ------------------------------------------------------------------ */

export interface LuckyBoxPrize {
  label: string;
  /** 0..1 probability (sums to ~1 within a tier). */
  chance: number;
  hero?: boolean;
}

export interface LuckyBoxTier {
  id: "basic" | "premium" | "grand";
  code: string;
  name: string;
  volumeUnlock: number; // U of effective volume to unlock
  poolLabel: string;
  accent: "accent" | "amber" | "blue";
  prizes: LuckyBoxPrize[];
}

export const LUCKY_BOX_TIERS: LuckyBoxTier[] = [
  {
    id: "basic",
    code: "TIER-01",
    name: "Basic Vault",
    volumeUnlock: 100,
    poolLabel: "100 U Pool",
    accent: "accent",
    prizes: [
      { label: "1 U Voucher", chance: 0.7 },
      { label: "3 U Voucher", chance: 0.2 },
      { label: "10 U Voucher", chance: 0.08 },
      { label: "30 U Voucher", chance: 0.02 },
    ],
  },
  {
    id: "premium",
    code: "TIER-02",
    name: "Premium Vault",
    volumeUnlock: 1_000,
    poolLabel: "1,000 U Pool",
    accent: "amber",
    prizes: [
      { label: "5 U Voucher", chance: 0.55 },
      { label: "20 U Voucher", chance: 0.3 },
      { label: "100 U USDT", chance: 0.12 },
      { label: "Match Day Box", chance: 0.03 },
    ],
  },
  {
    id: "grand",
    code: "TIER-03",
    name: "Grand Trophy Vault",
    volumeUnlock: 5_000,
    poolLabel: "5,000 U Pool",
    accent: "blue",
    prizes: [
      { label: "20 U Voucher", chance: 0.5 },
      { label: "100 U USDT", chance: 0.3 },
      { label: "500 U USDT", chance: 0.18 },
      { label: "Signed Jersey", chance: 0.02, hero: true },
    ],
  },
];

/** Mock current-day stats so the unlock progress bars look alive. */
export const USER_CARNIVAL_STATE = {
  todayVolume: 1240,
  vouchersClaimed: 50,
  vouchersPending: 120,
  followedTeams: ["ARG", "FRA", "BRA", "ESP", "MEX", "USA"],
  hasSpunToday: false,
};

/* ------------------------------------------------------------------ */
/*  Scoreboard ticker — bottom-of-page LED ad band                     */
/* ------------------------------------------------------------------ */

export const CARNIVAL_TICKER_LINES = [
  "● JACKPOT ACCUMULATING — 3,000,000 U LIVE PRIZE POOL",
  "● BRAZIL VS KOREA KICKING OFF IN 02:45:12",
  "● TOP TRADER @JEREMY EARNED 4,500 U IN LAST 24H",
  "● NEW DROP — SIGNED JERSEY DRAWN BY @MADS",
  "● COMBO CHALLENGE — 18 USERS HIT 10× ODDS THIS HOUR",
];

/* ------------------------------------------------------------------ */
/*  Guess the Legend — country-by-country reveal of signed jerseys     */
/* ------------------------------------------------------------------ */

/**
 * 8 confirmed signing countries (one country may appear in the queue
 * more than once — e.g. Brazil could surface Kaká in one round and
 * Roberto Carlos in another). Reveal schedule is INTENTIONALLY random
 * because each player's signing window depends on their availability;
 * the UI must NEVER display a numeric countdown for the next round.
 */
export type LegendCountryCode =
  | "BRA" | "ESP" | "FRA" | "ARG" | "GER" | "ENG" | "NED" | "POR";

import flagBra from "@/assets/legend-reveal/flag-bra.jpg";
import flagEsp from "@/assets/legend-reveal/flag-esp.jpg";
import flagFra from "@/assets/legend-reveal/flag-fra.jpg";
import flagArg from "@/assets/legend-reveal/flag-arg.jpg";
import flagGer from "@/assets/legend-reveal/flag-ger.jpg";
import flagEng from "@/assets/legend-reveal/flag-eng.jpg";
import flagNed from "@/assets/legend-reveal/flag-ned.jpg";
import flagPor from "@/assets/legend-reveal/flag-por.jpg";
import signedBra from "@/assets/legend-reveal/signed-bra.jpg";
import signedEsp from "@/assets/legend-reveal/signed-esp.jpg";
import signedFra from "@/assets/legend-reveal/signed-fra.jpg";
import signedArg from "@/assets/legend-reveal/signed-arg.jpg";
import signedGer from "@/assets/legend-reveal/signed-ger.jpg";
import signedEng from "@/assets/legend-reveal/signed-eng.jpg";
import signedNed from "@/assets/legend-reveal/signed-ned.jpg";
import signedPor from "@/assets/legend-reveal/signed-por.jpg";
import signedCiv from "@/assets/legend-reveal/signed-civ.jpg";
import signedMystery from "@/assets/legend-reveal/signed-mystery.jpg";

export interface LegendCountry {
  name: string;
  flag: string;
  /** ISO 3166-1 alpha-2 (or GB-ENG subdivision) for flat SVG flags in the HUD. */
  iso2: string;
  /** Confederation tag shown beneath the flag plate (REGION · CONMEBOL etc.). */
  region: string;
  /** Weathered banner image used as the round's hero visual. */
  flagImage: string;
}

export const LEGEND_COUNTRIES: Record<LegendCountryCode, LegendCountry> = {
  BRA: { name: "Brazil",      flag: "🇧🇷", iso2: "BR",     region: "CONMEBOL", flagImage: flagBra },
  ESP: { name: "Spain",       flag: "🇪🇸", iso2: "ES",     region: "UEFA",     flagImage: flagEsp },
  FRA: { name: "France",      flag: "🇫🇷", iso2: "FR",     region: "UEFA",     flagImage: flagFra },
  ARG: { name: "Argentina",   flag: "🇦🇷", iso2: "AR",     region: "CONMEBOL", flagImage: flagArg },
  GER: { name: "Germany",     flag: "🇩🇪", iso2: "DE",     region: "UEFA",     flagImage: flagGer },
  ENG: { name: "England",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", iso2: "GB-ENG", region: "UEFA",     flagImage: flagEng },
  NED: { name: "Netherlands", flag: "🇳🇱", iso2: "NL",     region: "UEFA",     flagImage: flagNed },
  POR: { name: "Portugal",    flag: "🇵🇹", iso2: "PT",     region: "UEFA",     flagImage: flagPor },
};

/** Per-country signed portrait used in the archive strip when a round is revealed. */
export const LEGEND_SIGNED_IMAGES: Record<LegendCountryCode, string> = {
  BRA: signedBra,
  ESP: signedEsp,
  FRA: signedFra,
  ARG: signedArg,
  GER: signedGer,
  ENG: signedEng,
  NED: signedNed,
  POR: signedPor,
};

/** Halftone silhouette + ? — used on the active-round hero visual until reveal. */
export const LEGEND_MYSTERY_PORTRAIT = signedMystery;

export interface LegendCandidate {
  /** Stable id, lowercase-dashed (e.g. "iniesta"). */
  id: string;
  name: string;
  /** Marquee club shown beneath the name. Display only. */
  club: string;
  /** Mock community vote share 0..1; the 4 candidates per round MUST sum to ~1. */
  votePct: number;
}

/**
 * A clue row in the scoreboard "split-flap" stack. Always 3 per round, always
 * the same three labels in the same order so the UI can rely on positional
 * stability. `value` is hidden when state === "locked".
 */
export type LegendClueLabel = "POSITION" | "PEAK CLUB" | "MAJOR TROPHY";

export interface LegendClue {
  idx: 1 | 2 | 3;
  label: LegendClueLabel;
  /** The revealed value, e.g. "ATTACKER" or "AC MILAN". Empty when locked. */
  value: string;
  state: "revealed" | "locked";
  /** Shown on locked rows, e.g. "Unlocks after 60% community vote". */
  unlockHint?: string;
}

export type LegendRoundStatus =
  /** Future round — country not yet announced. Shown as a locked dot. */
  | "upcoming"
  /** Currently open for voting. */
  | "voting"
  /** User already locked a pick, but reveal hasn't happened. */
  | "locked-in"
  /** Reveal done — user picked correctly. */
  | "revealed-hit"
  /** Reveal done — user missed (or didn't pick). */
  | "revealed-miss";

export interface LegendRound {
  id: string;
  /** 1-indexed round number, shown as "Round #03". */
  roundNumber: number;
  country: LegendCountryCode;
  /** id of the correct candidate inside `candidates`. Only meaningful once revealed. */
  correctCandidateId: string;
  candidates: LegendCandidate[];
  clues: LegendClue[];
  status: LegendRoundStatus;
  /** Candidate id the user locked in (for locked-in / revealed-* states). */
  userPickId?: string;
}

/**
 * Mock timeline:
 * - Round #01 France/Vieira → user picked correctly (hit)
 * - Round #02 Argentina/Zanetti → user missed (picked Verón)
 * - Round #03 Spain/Iniesta → currently voting, 2 of 3 clues live
 * - Round #04 + future → upcoming placeholders
 *
 * Distractor candidates are real retired legends from the same country
 * (frontend-only fiction — none of them have signed for OmenX).
 */
export const LEGEND_ROUNDS: LegendRound[] = [
  {
    id: "round-01-fra",
    roundNumber: 1,
    country: "FRA",
    correctCandidateId: "vieira",
    status: "revealed-hit",
    userPickId: "vieira",
    candidates: [
      { id: "vieira", name: "Patrick Vieira", club: "Arsenal", votePct: 0.38 },
      { id: "henry", name: "Thierry Henry", club: "Arsenal", votePct: 0.41 },
      { id: "thuram", name: "Lilian Thuram", club: "Juventus", votePct: 0.12 },
      { id: "makelele", name: "Claude Makélélé", club: "Chelsea", votePct: 0.09 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",      value: "DEFENSIVE MIDFIELDER" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",     value: "ARSENAL" },
      { idx: 3, state: "revealed", label: "MAJOR TROPHY",  value: "EURO 2000" },
    ],
  },
  {
    id: "round-02-arg",
    roundNumber: 2,
    country: "ARG",
    correctCandidateId: "zanetti",
    status: "revealed-miss",
    userPickId: "veron",
    candidates: [
      { id: "zanetti", name: "Javier Zanetti", club: "Inter Milan", votePct: 0.29 },
      { id: "veron", name: "Juan Sebastián Verón", club: "Lazio", votePct: 0.34 },
      { id: "crespo", name: "Hernán Crespo", club: "Parma", votePct: 0.21 },
      { id: "riquelme", name: "Juan Román Riquelme", club: "Boca Juniors", votePct: 0.16 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",      value: "RIGHT BACK" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",     value: "INTER MILAN" },
      { idx: 3, state: "revealed", label: "MAJOR TROPHY",  value: "COPA AMÉRICA 1991" },
    ],
  },
  {
    id: "round-03-esp",
    roundNumber: 3,
    country: "ESP",
    correctCandidateId: "iniesta",
    status: "voting",
    candidates: [
      { id: "iniesta", name: "Andrés Iniesta", club: "Barcelona", votePct: 0.42 },
      { id: "xavi", name: "Xavi Hernández", club: "Barcelona", votePct: 0.31 },
      { id: "puyol", name: "Carles Puyol", club: "Barcelona", votePct: 0.14 },
      { id: "villa", name: "David Villa", club: "Valencia", votePct: 0.13 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",   value: "CENTRAL MIDFIELDER" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",  value: "BARCELONA" },
      {
        idx: 3,
        state: "locked",
        label: "MAJOR TROPHY",
        value: "WORLD CUP 2010",
        unlockHint: "Unlocks after 60% community vote",
      },
    ],
  },
  {
    id: "round-04",
    roundNumber: 4,
    country: "BRA",
    correctCandidateId: "cafu",
    status: "upcoming",
    candidates: [
      { id: "cafu", name: "Cafu", club: "AS Roma", votePct: 0 },
      { id: "roberto-carlos", name: "Roberto Carlos", club: "Real Madrid", votePct: 0 },
      { id: "ronaldinho", name: "Ronaldinho", club: "Barcelona", votePct: 0 },
      { id: "rivaldo", name: "Rivaldo", club: "Barcelona", votePct: 0 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",     value: "RIGHT BACK" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",    value: "AS ROMA" },
      { idx: 3, state: "revealed", label: "MAJOR TROPHY", value: "WORLD CUP 2002" },
    ],
  },
  {
    id: "round-05",
    roundNumber: 5,
    country: "GER",
    correctCandidateId: "ballack",
    status: "upcoming",
    candidates: [
      { id: "ballack", name: "Michael Ballack", club: "Bayern Munich", votePct: 0 },
      { id: "schweinsteiger", name: "Bastian Schweinsteiger", club: "Bayern Munich", votePct: 0 },
      { id: "klose", name: "Miroslav Klose", club: "Lazio", votePct: 0 },
      { id: "lahm", name: "Philipp Lahm", club: "Bayern Munich", votePct: 0 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",     value: "ATTACKING MIDFIELDER" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",    value: "BAYERN MUNICH" },
      { idx: 3, state: "revealed", label: "MAJOR TROPHY", value: "BUNDESLIGA 2006" },
    ],
  },
  {
    id: "round-06",
    roundNumber: 6,
    country: "ENG",
    correctCandidateId: "gerrard",
    status: "upcoming",
    candidates: [
      { id: "gerrard", name: "Steven Gerrard", club: "Liverpool", votePct: 0 },
      { id: "lampard", name: "Frank Lampard", club: "Chelsea", votePct: 0 },
      { id: "beckham", name: "David Beckham", club: "Manchester United", votePct: 0 },
      { id: "ferdinand", name: "Rio Ferdinand", club: "Manchester United", votePct: 0 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",     value: "CENTRAL MIDFIELDER" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",    value: "LIVERPOOL" },
      { idx: 3, state: "revealed", label: "MAJOR TROPHY", value: "CHAMPIONS LEAGUE 2005" },
    ],
  },
  {
    id: "round-07",
    roundNumber: 7,
    country: "NED",
    correctCandidateId: "seedorf",
    status: "upcoming",
    candidates: [
      { id: "seedorf", name: "Clarence Seedorf", club: "AC Milan", votePct: 0 },
      { id: "davids", name: "Edgar Davids", club: "Juventus", votePct: 0 },
      { id: "kluivert", name: "Patrick Kluivert", club: "Barcelona", votePct: 0 },
      { id: "van-nistelrooy", name: "Ruud van Nistelrooy", club: "Manchester United", votePct: 0 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",     value: "CENTRAL MIDFIELDER" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",    value: "AC MILAN" },
      { idx: 3, state: "revealed", label: "MAJOR TROPHY", value: "CHAMPIONS LEAGUE 2003" },
    ],
  },
  {
    id: "round-08",
    roundNumber: 8,
    country: "POR",
    correctCandidateId: "figo",
    status: "upcoming",
    candidates: [
      { id: "figo", name: "Luís Figo", club: "Real Madrid", votePct: 0 },
      { id: "deco", name: "Deco", club: "Barcelona", votePct: 0 },
      { id: "rui-costa", name: "Rui Costa", club: "AC Milan", votePct: 0 },
      { id: "pauleta", name: "Pauleta", club: "Paris Saint-Germain", votePct: 0 },
    ],
    clues: [
      { idx: 1, state: "revealed", label: "POSITION",     value: "RIGHT WINGER" },
      { idx: 2, state: "revealed", label: "PEAK CLUB",    value: "REAL MADRID" },
      { idx: 3, state: "revealed", label: "MAJOR TROPHY", value: "BALLON D'OR 2000" },
    ],
  },
];

export interface PrewarmLegend {
  id: string;
  name: string;
  country: string;
  flag: string;
  /** True if the legend is part of the 8-country main pool (Vieira). */
  inMainPool: boolean;
  caption: string;
  /** Halftone portrait used in the archive strip. */
  signedImage: string;
}

/**
 * Already-signed memorabilia shown above the round to build trust ("this
 * isn't vapor — we have signatures in hand"). Y.Touré is intentionally
 * NOT in the 8-country pool — he's a pre-warm bonus, used to seed FOMO
 * without committing him to a future round.
 */
export const PREWARM_LEGENDS: PrewarmLegend[] = [
  {
    id: "vieira",
    name: "Patrick Vieira",
    country: "France",
    flag: "🇫🇷",
    inMainPool: true,
    caption: "Round #01 reward — already in the vault",
    signedImage: signedFra,
  },
  {
    id: "y-toure",
    name: "Yaya Touré",
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    inMainPool: false,
    caption: "Pre-warm bonus — not part of the 8-country main pool",
    signedImage: signedCiv,
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs                                                              */
/* ------------------------------------------------------------------ */

export type CarnivalTab =
  | "overview"
  | "newbie"
  | "combo"
  | "luckybox"
  | "legend"
  | "rules";

export const CARNIVAL_TABS: { id: CarnivalTab; label: string; sec: string }[] = [
  { id: "overview", label: "Overview", sec: "MAIN" },
  { id: "newbie", label: "Welcome Pack", sec: "SEC-01" },
  { id: "combo", label: "Combo Challenge", sec: "SEC-02" },
  { id: "luckybox", label: "Lucky Box", sec: "SEC-03" },
  { id: "legend", label: "Guess the Legend", sec: "SEC-04" },
  { id: "rules", label: "Rules", sec: "INFO" },
];