/**
 * Bettle-style payout multiplier.
 * Balanced curve: near cell ~1.5×, far cell (10¢ × 60s ahead) ~50×.
 *
 *   mult = 1.5 × (1 + 0.6 × distance¢) × (1 + 0.4 × seconds_ahead / 10)
 */
export function multiplier(distanceCents: number, secondsAhead: number): number {
  const d = Math.abs(distanceCents);
  const t = Math.max(1, secondsAhead);
  const raw = 1.5 * (1 + 0.6 * d) * (1 + 0.4 * (t / 10));
  return Math.round(raw * 10) / 10;
}

export function formatMultiplier(m: number): string {
  return m >= 10 ? `${Math.round(m)}×` : `${m.toFixed(1)}×`;
}

/** Heat color for cell — emerald (safe) → amber → rose (risky). */
export function multiplierHeat(m: number): string {
  if (m < 3) return "rgb(52 211 153 / 0.18)";
  if (m < 8) return "rgb(132 204 22 / 0.20)";
  if (m < 20) return "rgb(250 204 21 / 0.22)";
  return "rgb(244 63 94 / 0.24)";
}

export function multiplierBorder(m: number): string {
  if (m < 3) return "rgb(52 211 153 / 0.35)";
  if (m < 8) return "rgb(132 204 22 / 0.40)";
  if (m < 20) return "rgb(250 204 21 / 0.45)";
  return "rgb(244 63 94 / 0.50)";
}