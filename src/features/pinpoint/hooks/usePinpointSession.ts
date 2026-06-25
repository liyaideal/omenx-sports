import { useCallback, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "../lib/storage";

export interface StrikezonePosition {
  id: string;
  marketId: string;
  outcomeId: string;
  marketLabel: string;
  outcomeLabel: string;
  /** Target absolute timestamp (ms) when this bet settles. */
  targetAt: number;
  /** Center price of the cell (¢, 0..100). The cell covers [center-0.5, center+0.5]. */
  cellCenter: number;
  /** Seconds ahead at placement (for display). */
  secondsAhead: number;
  /** Cents distance from current price at placement. */
  distanceCents: number;
  stake: number;
  mult: number;
  /** Platform leverage applied at placement (1, 2, 3). */
  leverage: number;
  /** Set when account was force-liquidated (cross-margin wipe). */
  liquidatedAt?: number;
  placedAt: number;
  status: "open" | "won" | "lost" | "refunded" | "liquidated";
  /** Settlement price ¢ (when settled). */
  settledPrice?: number;
  /** Payout received (stake × mult when won, stake when refunded, 0 when lost). */
  payout?: number;
}

export interface StrikezoneState {
  balance: number;
  betSize: number;
  leverage: number;
  sessionPL: number;
  positions: StrikezonePosition[];
}

const BET_SIZES = [10, 25, 100, 500, 1000, 5000] as const;
export const BET_SIZE_OPTIONS = BET_SIZES;

const LEVERAGES = [1, 2, 3] as const;
export const LEVERAGE_OPTIONS = LEVERAGES;
/** Cross-margin maintenance ratio. Account liquidates when equity ≤ this × Σ stake(open). */
export const MAINTENANCE_RATIO = 0.15;
/** Default starting balance — used by margin-health UI as the "full" anchor. */
export const INITIAL_BALANCE = 10000;

/** Is the current price in the cell? */
function inCell(price: number, cellCenter: number): boolean {
  return price >= cellCenter - 0.5 && price < cellCenter + 0.5;
}

/**
 * Compute live equity given current prices keyed by outcomeId.
 * Equity = balance + Σ (open: in-cell ? stake × mult × lev : 0).
 * Positions whose outcomeId is missing from priceByOutcome contribute 0
 * (treated as currently out-of-the-money — conservative).
 */
export function computeEquity(
  state: StrikezoneState,
  priceByOutcome: Record<string, number>
): { equity: number; lockedStake: number; maintenance: number } {
  let unrealized = 0;
  let lockedStake = 0;
  for (const p of state.positions) {
    if (p.status !== "open") continue;
    lockedStake += p.stake;
    const price = priceByOutcome[p.outcomeId];
    if (price == null) continue;
    if (inCell(price, p.cellCenter)) {
      unrealized += p.stake * p.mult * (p.leverage ?? 1);
    }
  }
  return {
    equity: state.balance + unrealized,
    lockedStake,
    maintenance: MAINTENANCE_RATIO * lockedStake,
  };
}

const DEFAULT_STATE: StrikezoneState = {
  balance: INITIAL_BALANCE,
  betSize: 100,
  leverage: 1,
  sessionPL: 0,
  positions: [],
};

export function useStrikezoneSession() {
  const [state, setState] = useState<StrikezoneState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setState((s) => {
        const merged = { ...s, ...loaded } as StrikezoneState;
        // Migration: legacy open positions used old leverage rules → refund them.
        let refund = 0;
        const migrated = (merged.positions || []).map((p) => {
          if (p.status === "open") {
            refund += p.stake;
            return { ...p, status: "refunded" as const, payout: p.stake };
          }
          return p;
        });
        return { ...merged, balance: merged.balance + refund, positions: migrated };
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const lastBetIdRef = useRef<string | null>(null);
  const lastBetExpiryRef = useRef<number>(0);

  const placeBet = useCallback(
    (params: Omit<StrikezonePosition, "id" | "placedAt" | "status">) => {
      const id = `bet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = Date.now();
      setState((s) => {
        if (s.balance < params.stake) return s;
        const position: StrikezonePosition = {
          ...params,
          id,
          placedAt: now,
          status: "open",
        };
        return {
          ...s,
          balance: s.balance - params.stake,
          positions: [position, ...s.positions].slice(0, 200),
        };
      });
      lastBetIdRef.current = id;
      lastBetExpiryRef.current = now + 5000;
      return id;
    },
    []
  );

  const settlePosition = useCallback(
    (id: string, result: "won" | "lost" | "refunded" | "liquidated", settledPrice: number) => {
      setState((s) => {
        const idx = s.positions.findIndex((p) => p.id === id);
        if (idx === -1 || s.positions[idx].status !== "open") return s;
        const p = s.positions[idx];
        const lev = p.leverage ?? 1;
        // Contract semantics: stake = margin (already deducted in placeBet).
        //   Win   → payout = stake × mult × leverage (notional × mult)
        //   Lost  → payout = 0, margin forfeited (capped at stake)
        //   Liq   → same as lost, flagged separately for UI
        //   Refund→ stake returned
        const payout =
          result === "won"
            ? p.stake * p.mult * lev
            : result === "refunded"
              ? p.stake
              : 0;
        const next = [...s.positions];
        next[idx] = {
          ...p,
          status: result,
          settledPrice,
          payout,
          ...(result === "liquidated" ? { liquidatedAt: Date.now() } : {}),
        };
        const pl =
          result === "won"
            ? payout - p.stake
            : result === "lost" || result === "liquidated"
              ? -p.stake
              : 0;
        return {
          ...s,
          balance: s.balance + payout,
          sessionPL: s.sessionPL + pl,
          positions: next,
        };
      });
    },
    []
  );

  const undoLast = useCallback(() => {
    const id = lastBetIdRef.current;
    if (!id) return false;
    if (Date.now() > lastBetExpiryRef.current) return false;
    let undone = false;
    setState((s) => {
      const p = s.positions.find((x) => x.id === id);
      if (!p || p.status !== "open") return s;
      undone = true;
      return {
        ...s,
        balance: s.balance + p.stake,
        positions: s.positions.filter((x) => x.id !== id),
      };
    });
    if (undone) lastBetIdRef.current = null;
    return undone;
  }, []);

  const stopAll = useCallback(() => {
    setState((s) => {
      const refunded = s.positions.map((p) =>
        p.status === "open" ? { ...p, status: "refunded" as const, payout: p.stake } : p
      );
      const refundAmount = s.positions
        .filter((p) => p.status === "open")
        .reduce((sum, p) => sum + p.stake, 0);
      return { ...s, balance: s.balance + refundAmount, positions: refunded };
    });
  }, []);

  const cancelPosition = useCallback((id: string) => {
    let ok = false;
    setState((s) => {
      const p = s.positions.find((x) => x.id === id);
      if (!p || p.status !== "open") return s;
      ok = true;
      return {
        ...s,
        balance: s.balance + p.stake,
        positions: s.positions.filter((x) => x.id !== id),
      };
    });
    if (ok && lastBetIdRef.current === id) lastBetIdRef.current = null;
    return ok;
  }, []);

  /**
   * Cross-margin liquidation: force-close every open position at the given
   * per-outcome price. In-cell positions still get their `won` payout
   * (lifeline), out-of-cell are marked `liquidated` (stake forfeited).
   * Returns the list of liquidated position ids (for visual fx).
   */
  const liquidateAll = useCallback(
    (priceByOutcome: Record<string, number>): { liquidatedIds: string[]; wonIds: string[] } => {
      const liquidatedIds: string[] = [];
      const wonIds: string[] = [];
      const now = Date.now();
      setState((s) => {
        let balanceDelta = 0;
        let plDelta = 0;
        const next = s.positions.map((p) => {
          if (p.status !== "open") return p;
          const price = priceByOutcome[p.outcomeId];
          const hasPrice = price != null;
          const hit = hasPrice && inCell(price, p.cellCenter);
          if (hit) {
            const payout = p.stake * p.mult * (p.leverage ?? 1);
            balanceDelta += payout;
            plDelta += payout - p.stake;
            wonIds.push(p.id);
            return { ...p, status: "won" as const, settledPrice: price, payout };
          }
          plDelta += -p.stake;
          liquidatedIds.push(p.id);
          return {
            ...p,
            status: "liquidated" as const,
            settledPrice: hasPrice ? price : p.cellCenter,
            payout: 0,
            liquidatedAt: now,
          };
        });
        return {
          ...s,
          balance: s.balance + balanceDelta,
          sessionPL: s.sessionPL + plDelta,
          positions: next,
        };
      });
      return { liquidatedIds, wonIds };
    },
    []
  );

  const setBetSize = useCallback((size: number) => {
    setState((s) => ({ ...s, betSize: size }));
  }, []);

  const cycleBetSize = useCallback((dir: 1 | -1) => {
    setState((s) => {
      const i = BET_SIZES.indexOf(s.betSize as (typeof BET_SIZES)[number]);
      const ni = Math.max(0, Math.min(BET_SIZES.length - 1, (i === -1 ? 2 : i) + dir));
      return { ...s, betSize: BET_SIZES[ni] };
    });
  }, []);

  const setLeverage = useCallback((lev: number) => {
    setState((s) => ({ ...s, leverage: lev }));
  }, []);

  const cycleLeverage = useCallback((dir: 1 | -1) => {
    setState((s) => {
      const cur = (s.leverage ?? 1) as (typeof LEVERAGES)[number];
      const i = LEVERAGES.indexOf(cur);
      const ni = Math.max(0, Math.min(LEVERAGES.length - 1, (i === -1 ? 0 : i) + dir));
      return { ...s, leverage: LEVERAGES[ni] };
    });
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  return {
    state,
    hydrated,
    placeBet,
    settlePosition,
    undoLast,
    stopAll,
    cancelPosition,
    liquidateAll,
    setBetSize,
    cycleBetSize,
    setLeverage,
    cycleLeverage,
    reset,
    lastBetExpiryRef,
    lastBetIdRef,
  };
}