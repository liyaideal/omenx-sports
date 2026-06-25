/**
 * Tiny event bus for Pinpoint juice effects — decouples Grid (effect source)
 * from EffectsLayer (DOM overlay renderer) and AccountBlock (target anchor).
 *
 * Effects honor the golden rule: local + non-blocking + aggregatable.
 * No global mutex; consumers just `emit` and the overlay handles batching.
 */

export type WinTier = "S" | "M" | "L" | "XL";

export interface WinFxPayload {
  /** Viewport coords where the cell sat (used as coin source). */
  x: number;
  y: number;
  tier: WinTier;
  /** Net win (already excludes stake). */
  amount: number;
}

export interface ComboFxPayload {
  count: number;
  totalAmount: number;
  tier: WinTier;
}

type Events = {
  win: WinFxPayload;
  combo: ComboFxPayload;
  streakBreak: void;
};

type Handler<T> = (payload: T) => void;

const handlers: { [K in keyof Events]: Set<Handler<Events[K]>> } = {
  win: new Set(),
  combo: new Set(),
  streakBreak: new Set(),
};

export function on<K extends keyof Events>(evt: K, fn: Handler<Events[K]>): () => void {
  handlers[evt].add(fn as Handler<Events[keyof Events]>);
  return () => handlers[evt].delete(fn as Handler<Events[keyof Events]>);
}

export function emit<K extends keyof Events>(evt: K, payload: Events[K]) {
  for (const fn of handlers[evt]) {
    try {
      (fn as Handler<Events[K]>)(payload);
    } catch {
      /* swallow — never let one bad consumer break others */
    }
  }
}

/** Tier from net-win ratio over stake. */
export function tierFromRatio(ratio: number, leverage = 1): WinTier {
  // High-leverage bonus: +1 step at 3×.
  const lifted = leverage >= 3 ? ratio * 1.5 : ratio;
  if (lifted < 2) return "S";
  if (lifted < 5) return "M";
  if (lifted < 15) return "L";
  return "XL";
}

export function tierBumpForStreak(tier: WinTier, streak: number): WinTier {
  // Past 5-win streak, lift one tier (max XL).
  if (streak < 5) return tier;
  const order: WinTier[] = ["S", "M", "L", "XL"];
  const i = order.indexOf(tier);
  return order[Math.min(order.length - 1, i + 1)];
}

export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
