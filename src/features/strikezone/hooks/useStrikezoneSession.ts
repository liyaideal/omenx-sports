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
  /** Platform leverage applied at placement (1, 2, 5, 10). */
  leverage: number;
  placedAt: number;
  status: "open" | "won" | "lost" | "refunded";
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

const LEVERAGES = [1, 2, 5, 10] as const;
export const LEVERAGE_OPTIONS = LEVERAGES;

const DEFAULT_STATE: StrikezoneState = {
  balance: 10000,
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
    if (loaded) setState((s) => ({ ...s, ...loaded }));
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
    (id: string, result: "won" | "lost" | "refunded", settledPrice: number) => {
      setState((s) => {
        const idx = s.positions.findIndex((p) => p.id === id);
        if (idx === -1 || s.positions[idx].status !== "open") return s;
        const p = s.positions[idx];
        const lev = p.leverage ?? 1;
        // Win: stake × mult × leverage paid back.
        // Loss: keep stake forfeited AND deduct extra stake × (lev-1).
        // Refund: stake returned untouched.
        const payout =
          result === "won"
            ? p.stake * p.mult * lev
            : result === "refunded"
              ? p.stake
              : 0;
        const extraLoss = result === "lost" ? p.stake * (lev - 1) : 0;
        const next = [...s.positions];
        next[idx] = { ...p, status: result, settledPrice, payout };
        const pl =
          result === "won"
            ? payout - p.stake
            : result === "lost"
              ? -p.stake * lev
              : 0;
        return {
          ...s,
          balance: s.balance + payout - extraLoss,
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
    setBetSize,
    cycleBetSize,
    setLeverage,
    cycleLeverage,
    reset,
    lastBetExpiryRef,
    lastBetIdRef,
  };
}