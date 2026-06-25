/**
 * Bettle-style payout multiplier.
 *
 *   raw = 1 + 0.6 * distance² * (1 + secondsAhead / 25)
 *
 * Capped at 95.00× to match Bettle's display ceiling. Yields ~1× near the
 * current price, climbing fast for far-away cells.
 */
export const MULT_CAP = 95;

export function multiplier(distanceCents: number, secondsAhead: number): number {
  const d = Math.abs(distanceCents);
  const t = Math.max(1, secondsAhead);
  const raw = 1 + 0.6 * d * d * (1 + t / 25);
  return Math.min(MULT_CAP, Math.round(raw * 100) / 100);
}

/** Cap for leveraged display so cells never blow up past 4 chars. */
export const LEVERAGE_DISPLAY_CAP = 999;

export function applyLeverage(mult: number, leverage: number): number {
  return Math.min(LEVERAGE_DISPLAY_CAP, Math.round(mult * leverage * 100) / 100);
}

export function formatMultiplier(m: number): string {
  if (m >= 100) return `${Math.round(m)}x`;
  return `${m.toFixed(2)}x`;
}

/** Cell background — LCD heat. Higher mult → brighter mint/coin gradient. */
export function multiplierHeat(m: number): string {
  const t = Math.min(1, Math.log(m + 1) / Math.log(MULT_CAP + 1));
  // Dark LCD wash → mint → coin gold as multiplier climbs.
  // Dark: #14241a, Mid: #7ed4b2 (mint), Hot: #ffcc00 (coin).
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

/** Text color for cell — high contrast vs the new mint/gold heat. */
export function multiplierTextColor(m: number): string {
  const t = Math.min(1, Math.log(m + 1) / Math.log(MULT_CAP + 1));
  if (t > 0.5) return "#1a1a1a"; // dark over mint/coin
  return "#f4ecd8";              // cream over LCD wash
}