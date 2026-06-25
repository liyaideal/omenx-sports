/**
 * Pinpoint AMM quoting.
 *
 * Each cell is the digital option "price at expiry ∈ [center−0.5, center+0.5]".
 * pFair uses a truncated-Gaussian approximation: σ(t) = BASE_SIGMA · √t.
 * pQuote adds a small inline vig (庄家边际) — this is the implicit edge.
 * Odds = clamp(1/pQuote, 1, ODDS_CAP). Pure functions; safe to call per frame.
 */
import {
  BASE_SIGMA,
  ODDS_CAP,
  P_MAX,
  P_MIN,
  VIG_PER_CELL,
} from "./constants";

// Abramowitz–Stegun 7.1.26 — max error ~1.5e-7. Good enough for UI quoting.
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}
const Phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export interface CellQuote {
  /** Quoted YES price (≈ probability of hit, inclusive of vig). */
  p: number;
  /** Fair probability without vig — for diagnostics. */
  pFair: number;
  /** Locked-in odds = 1/p, capped at ODDS_CAP. */
  odds: number;
}

/** Quote a single cell. */
export function quoteCell(args: {
  /** Cell center in ¢ (band = [center−0.5, center+0.5]). */
  cellCenter: number;
  /** Latest price line in ¢. */
  currentPrice: number;
  /** Time-to-expiry in ms. ≤0 means "judged now". */
  ttlMs: number;
}): CellQuote {
  const ttlSec = Math.max(0.05, args.ttlMs / 1000);
  const sigma = BASE_SIGMA * Math.sqrt(ttlSec);
  const lo = args.cellCenter - 0.5;
  const hi = args.cellCenter + 0.5;
  const pFair = clamp(
    Phi((hi - args.currentPrice) / sigma) -
      Phi((lo - args.currentPrice) / sigma),
    0,
    1
  );
  const p = clamp(pFair + VIG_PER_CELL, P_MIN, P_MAX);
  const odds = Math.min(ODDS_CAP, 1 / p);
  return { p, pFair, odds };
}

/** Format the odds for cell labels: `2.34x`, `12.7x`, `100x`. */
export function formatOdds(odds: number): string {
  if (odds >= 99.5) return "100x";
  if (odds >= 10) return `${odds.toFixed(1)}x`;
  return `${odds.toFixed(2)}x`;
}

/** Format probability for cell sub-label: `48%`, `7.3%`, `1.0%`. */
export function formatProb(p: number): string {
  const pct = p * 100;
  if (pct >= 10) return `${Math.round(pct)}%`;
  return `${pct.toFixed(1)}%`;
}

/** Compute the size of the win (`q × (1 − p_entry)`) for a margin/leverage/p. */
export function computeWinAmount(margin: number, leverage: number, p: number): number {
  const notional = margin * leverage;
  const q = notional / p;
  return q * (1 - p);
}

/** Cell heat color — odds-driven. Low odds = cool LCD mint, high odds = coin gold. */
export function oddsHeat(odds: number): string {
  const t = Math.min(1, Math.log(odds) / Math.log(ODDS_CAP));
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const k = t / 0.5;
    r = Math.round(20 + k * (126 - 20));
    g = Math.round(36 + k * (212 - 36));
    b = Math.round(26 + k * (178 - 26));
  } else {
    const k = (t - 0.5) / 0.5;
    r = Math.round(126 + k * (255 - 126));
    g = Math.round(212 + k * (204 - 212));
    b = Math.round(178 + k * (0 - 178));
  }
  const alpha = 0.55 + t * 0.4;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Text color for cell — high contrast vs the heat above. */
export function oddsTextColor(odds: number): string {
  const t = Math.min(1, Math.log(odds) / Math.log(ODDS_CAP));
  return t > 0.5 ? "#1a1a1a" : "#f4ecd8";
}