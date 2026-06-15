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

export interface ComboPick {
  marketId: string;
  matchLabel: string;
  pickLabel: string;
  /** Locked odds at the moment of selection. */
  odds: number;
  kickoff: string;
}

/** Sample picks that pre-populate the combo builder so the page demos well. */
export const COMBO_SAMPLE_PICKS: ComboPick[] = [
  { marketId: "wc26-grpa-mex-vs-cz", matchLabel: "Mexico vs Czechia", pickLabel: "Mexico", odds: 1.92, kickoff: "Jun 27 · 20:00" },
  { marketId: "wc26-grpb-can-vs-pan", matchLabel: "Canada vs Panama", pickLabel: "Canada", odds: 1.55, kickoff: "Jun 27 · 22:00" },
  { marketId: "wc26-grpc-bra-vs-kor", matchLabel: "Brazil vs South Korea", pickLabel: "Brazil", odds: 1.40, kickoff: "Jun 28 · 18:00" },
  { marketId: "wc26-grpd-usa-vs-tur", matchLabel: "USA vs Türkiye", pickLabel: "USA", odds: 2.10, kickoff: "Jun 28 · 21:00" },
];

export const COMBO_MAX_ODDS = 50;
export const COMBO_STAKE = 10;
export const COMBO_MAX_PICKS = 4;
export const COMBO_MAX_COMBOS_PER_USER = 3;

/** Pickable outcomes for the slot picker (mock). */
export const COMBO_PICK_CATALOG: ComboPick[] = [
  ...COMBO_SAMPLE_PICKS,
  { marketId: "wc26-grpe-ger-vs-ecu", matchLabel: "Germany vs Ecuador", pickLabel: "Germany", odds: 1.48, kickoff: "Jun 29 · 18:00" },
  { marketId: "wc26-grpf-ned-vs-jpn", matchLabel: "Netherlands vs Japan", pickLabel: "Netherlands", odds: 1.68, kickoff: "Jun 29 · 21:00" },
  { marketId: "wc26-grpg-bel-vs-egy", matchLabel: "Belgium vs Egypt", pickLabel: "Belgium", odds: 1.50, kickoff: "Jun 30 · 18:00" },
  { marketId: "wc26-grph-esp-vs-uru", matchLabel: "Spain vs Uruguay", pickLabel: "Spain", odds: 1.35, kickoff: "Jun 30 · 21:00" },
  { marketId: "wc26-grpi-fra-vs-nor", matchLabel: "France vs Norway", pickLabel: "France", odds: 1.42, kickoff: "Jul 1 · 18:00" },
  { marketId: "wc26-grpj-arg-vs-aut", matchLabel: "Argentina vs Austria", pickLabel: "Argentina", odds: 1.30, kickoff: "Jul 1 · 21:00" },
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
  fanLevel: 24,
  qualificationPercent: 65,
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