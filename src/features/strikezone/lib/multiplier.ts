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

/** Cell background — orange heat. Higher mult → brighter orange. */
export function multiplierHeat(m: number): string {
  // 0..1 intensity
  const t = Math.min(1, Math.log(m + 1) / Math.log(MULT_CAP + 1));
  // Interpolate from very dark ember to bright orange
  // Dark: #2a1208 (very faint, near bg). Bright: #ff6b1a
  const r = Math.round(42 + t * (255 - 42));
  const g = Math.round(18 + t * (107 - 18));
  const b = Math.round(8 + t * (26 - 8));
  const alpha = 0.55 + t * 0.45;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Text color for cell — bright on bright cells, muted on dark cells. */
export function multiplierTextColor(m: number): string {
  const t = Math.min(1, Math.log(m + 1) / Math.log(MULT_CAP + 1));
  if (t > 0.6) return "#fff5e8";
  if (t > 0.3) return "#ffcfa0";
  return "#8a5a3a";
}