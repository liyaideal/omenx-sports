/**
 * Pinpoint v3 economic + UI constants.
 *
 * All knobs that the spec ("Pinpoint 产品逻辑 终版 v3") can dial live here so
 * risk can tune without grepping the codebase.
 */

/** Account-level leverage choices (first-launch cap is 3x). */
export const LEVERAGE_OPTIONS = [1, 2, 3] as const;

/** Per-position maintenance margin rate. MM_i = Notional_i × MM_RATE. */
export const MM_RATE = 0.05;

/** Account liquidates when MMR = ΣMM / equity ≥ this. */
export const LIQ_TRIGGER_MMR = 1.0;

/** Hard odds cap on remote cells (1/p clamped here → equivalent p_min). */
export const ODDS_CAP = 100;
export const P_MIN = 1 / ODDS_CAP; // 0.01
export const P_MAX = 0.99;

/** Inline vig (per-cell): pQuote = clamp(pFair + VIG_PER_CELL). */
export const VIG_PER_CELL = 0.006; // ~0.6¢; aggregated across 11 rows ≈ 6.6% over-round

/** Trading Fee charged on opening, % of Notional. Spec calls this
 *  Opening Premium; shown to the user before they click. */
export const TRADING_FEE_RATE = 0.02;

/** Last N ms before judgement → bet cannot be cancelled (anti-free-option). */
export const CANCEL_LOCK_MS = 1500;

/** Liquidation close-out fee → insurance fund. Currently bookkeeping only. */
export const LIQUIDATION_FEE_RATE = 0.0075;

/** Base volatility for AMM σ(t) = BASE_SIGMA · √t (¢/√sec). Tuned against
 *  the mock ticker's random walk (~±0.46¢ std per second). */
export const BASE_SIGMA = 0.46;