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
  status: "todo" | "in-progress" | "done";
  cta: string;
  ctaHref?: string;
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
    status: "done",
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
    ctaHref: "/events",
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
export const COMBO_MAX_PICKS = 4;
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
/*  Tabs                                                              */
/* ------------------------------------------------------------------ */

export type CarnivalTab = "overview" | "newbie" | "combo" | "luckybox" | "rules";

export const CARNIVAL_TABS: { id: CarnivalTab; label: string; sec: string }[] = [
  { id: "overview", label: "Overview", sec: "MAIN" },
  { id: "newbie", label: "Welcome Pack", sec: "SEC-01" },
  { id: "combo", label: "Combo Challenge", sec: "SEC-02" },
  { id: "luckybox", label: "Lucky Box", sec: "SEC-03" },
  { id: "rules", label: "Rules", sec: "INFO" },
];