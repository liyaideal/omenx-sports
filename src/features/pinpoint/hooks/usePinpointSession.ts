import { useCallback, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "../lib/storage";
import { quoteCell } from "../amm";
import {
  LEVERAGE_OPTIONS as LEVS,
  LIQ_TRIGGER_MMR,
  MM_RATE,
} from "../constants";

export interface PinpointPosition {
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
  /** Margin (= max loss) paid at open. */
  stake: number;
  /** Account leverage locked at open. */
  leverage: number;
  /** YES price at open (quoted by AMM, vig included). */
  pEntry: number;
  /** Locked-in odds = 1/pEntry, capped at ODDS_CAP. Aliased to legacy `mult`. */
  odds: number;
  /** Notional = stake × leverage. */
  notional: number;
  /** Held YES quantity = notional / pEntry. */
  q: number;
  /** Opening trading fee (= notional × TRADING_FEE_RATE) — already deducted at open. */
  feePaid: number;
  /** Legacy alias for `odds` — kept so existing stats / UI keep working. */
  mult: number;
  /** Set when account was force-liquidated (cross-margin wipe). */
  liquidatedAt?: number;
  placedAt: number;
  status: "open" | "won" | "lost" | "canceled" | "liquidated";
  /** Settlement price ¢ (when settled). */
  settledPrice?: number;
  /** Gross payout returned to balance (= margin + net win on won, margin on canceled, 0 else). */
  payout?: number;
}

export interface PinpointState {
  balance: number;
  betSize: number;
  /** Account-level leverage (1 / 2 / 3). Changing it only affects new bets. */
  leverage: number;
  sessionPL: number;
  positions: PinpointPosition[];
  /** `frozen` = session is in liquidation; no more bets, no cancels, UI locked. */
  sessionStatus: "active" | "frozen";
  /** MMR captured at the moment of liquidation (for the frozen UI). */
  frozenMmr?: number;
  /** Wall-clock ms when the session was frozen. */
  frozenAt?: number;
  /** Pinpoint sub-account lifetime deposits — for "house edge" disclosure. */
  totalDeposited: number;
}

const BET_SIZES = [10, 25, 100, 500, 1000, 5000] as const;
export const BET_SIZE_OPTIONS = BET_SIZES;

export const LEVERAGE_OPTIONS = LEVS;
/**
 * Default starting balance for the Pinpoint sub-account.
 *
 * Pinpoint is a *separate* play-money pocket inside OmenX; users explicitly
 * fund it from their main wallet. We seed first-time users with $0 — the
 * onboarding deposit flow handles the first transfer (and after a liquidation
 * the same deposit sheet is the only way back in). Margin-health UI uses
 * `Math.max(balance + lockedStake, fallback)` as the "full" anchor.
 */
export const INITIAL_BALANCE = 0;
/** Anchor used by the margin-health bar when balance is empty / brand-new. */
export const MARGIN_HEALTH_ANCHOR = 1000;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * Mark-to-market every open position against the latest AMM quote.
 * Returns equity, total maintenance margin (ΣMM), and MMR.
 *
 * Per-position unrealized P/L is capped at −margin: the user can never
 * lose more than the stake on a single leg (account-level cap is the
 * total of all margins).
 */
export function computeEquity(
  state: PinpointState,
  priceByOutcome: Record<string, number>
): {
  equity: number;
  lockedStake: number;
  maintenance: number;
  unrealized: number;
  /** Maintenance margin ratio (Σ MM / equity). ≥ LIQ_TRIGGER_MMR → liquidation. */
  mmr: number;
} {
  const now = Date.now();
  let unrealized = 0;
  let lockedStake = 0;
  let mm = 0;
  for (const p of state.positions) {
    if (p.status !== "open") continue;
    lockedStake += p.stake;
    mm += p.notional * MM_RATE;
    const price = priceByOutcome[p.outcomeId];
    if (price == null) continue;
    const ttlMs = p.targetAt - now;
    const { p: pT } = quoteCell({
      cellCenter: p.cellCenter,
      currentPrice: price,
      ttlMs,
    });
    // P/L = q × (p_t − p_entry), floored at −margin (per-position cap).
    const raw = p.q * (pT - p.pEntry);
    unrealized += clamp(raw, -p.stake, Number.POSITIVE_INFINITY);
  }
  const equity = state.balance + unrealized;
  const mmr = mm > 0 ? mm / Math.max(equity, 1e-6) : 0;
  return { equity, lockedStake, maintenance: mm, unrealized, mmr };
}

const DEFAULT_STATE: PinpointState = {
  balance: INITIAL_BALANCE,
  betSize: 100,
  leverage: 1,
  sessionPL: 0,
  positions: [],
  sessionStatus: "active",
  totalDeposited: 0,
};

export function usePinpointSession() {
  const [state, setState] = useState<PinpointState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setState((s) => {
        const merged = { ...s, ...loaded } as PinpointState;
        // v3 migration: legacy positions used old odds = mult; refund any open
        // legs so the user lands on a clean slate with the new economic model.
        let refund = 0;
        const migrated = (merged.positions || []).map((p) => {
          if (p.status === "open") {
            refund += p.stake;
            return { ...p, status: "canceled" as const, payout: p.stake };
          }
          return p;
        });
        return {
          ...merged,
          balance: merged.balance + refund,
          positions: migrated,
          sessionStatus: merged.sessionStatus ?? "active",
        };
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  /**
   * Open a new position.
   *
   * Caller passes the cell + live price; the hook computes p/odds/q/notional/fee
   * via the AMM at open time and locks them onto the position.
   */
  const placeBet = useCallback(
    (params: {
      marketId: string;
      outcomeId: string;
      marketLabel: string;
      outcomeLabel: string;
      targetAt: number;
      cellCenter: number;
      secondsAhead: number;
      distanceCents: number;
      stake: number;
      currentPrice: number;
    }): { id: string | null; reason?: "frozen" | "duplicate" | "balance" } => {
      const id = `bet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = Date.now();
      let outcome: { id: string | null; reason?: "frozen" | "duplicate" | "balance" } = { id: null };
      setState((s) => {
        if (s.sessionStatus === "frozen") {
          outcome = { id: null, reason: "frozen" };
          return s;
        }
        // One-bet-per-cell rule (no merging / averaging).
        const dupKey = `${Math.round(params.targetAt / 1000)}:${Math.round(params.cellCenter)}:${params.outcomeId}`;
        const dup = s.positions.find(
          (p) =>
            p.status === "open" &&
            `${Math.round(p.targetAt / 1000)}:${Math.round(p.cellCenter)}:${p.outcomeId}` === dupKey
        );
        if (dup) {
          outcome = { id: null, reason: "duplicate" };
          return s;
        }
        const lev = Math.max(1, s.leverage);
        const notional = params.stake * lev;
        const ttlMs = params.targetAt - now;
        const { p, odds } = quoteCell({
          cellCenter: params.cellCenter,
          currentPrice: params.currentPrice,
          ttlMs,
        });
        const q = notional / p;
        const feePaid =
          Math.round(notional * 0.02 * 100) / 100; // TRADING_FEE_RATE
        const debit = params.stake + feePaid;
        if (s.balance < debit) {
          outcome = { id: null, reason: "balance" };
          return s;
        }
        const position: PinpointPosition = {
          ...params,
          leverage: lev,
          pEntry: p,
          odds,
          mult: odds, // legacy alias
          notional,
          q,
          feePaid,
          id,
          placedAt: now,
          status: "open",
        };
        outcome = { id };
        return {
          ...s,
          balance: s.balance - debit,
          // Fees count as immediate session loss.
          sessionPL: s.sessionPL - feePaid,
          positions: [position, ...s.positions].slice(0, 200),
        };
      });
      return outcome;
    },
    []
  );

  /**
   * Resolve a position at its expiry second.
   *  - won   → payout = margin + q × (1 − pEntry)
   *  - lost  → payout = 0 (margin already forfeited at open)
   */
  const settlePosition = useCallback(
    (id: string, result: "won" | "lost", settledPrice: number) => {
      setState((s) => {
        const idx = s.positions.findIndex((p) => p.id === id);
        if (idx === -1 || s.positions[idx].status !== "open") return s;
        const p = s.positions[idx];
        const winAmount = p.q * (1 - p.pEntry);
        const payout = result === "won" ? p.stake + winAmount : 0;
        const pl = result === "won" ? winAmount : -p.stake;
        const next = [...s.positions];
        next[idx] = { ...p, status: result, settledPrice, payout };
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

  /**
   * Cancel a single open position. Refuses if the session is frozen OR if
   * the bet is inside the last `CANCEL_LOCK_MS` before judgement.
   * Margin is refunded; opening fee is NOT (anti-free-option护栏).
   */
  const cancelPosition = useCallback(
    (id: string): { ok: boolean; reason?: "frozen" | "locked" | "missing" } => {
      let result: { ok: boolean; reason?: "frozen" | "locked" | "missing" } = {
        ok: false,
        reason: "missing",
      };
      setState((s) => {
        if (s.sessionStatus === "frozen") {
          result = { ok: false, reason: "frozen" };
          return s;
        }
        const p = s.positions.find((x) => x.id === id);
        if (!p || p.status !== "open") return s;
        const remaining = p.targetAt - Date.now();
        if (remaining < 1500 /* CANCEL_LOCK_MS */) {
          result = { ok: false, reason: "locked" };
          return s;
        }
        result = { ok: true };
        return {
          ...s,
          balance: s.balance + p.stake,
          positions: s.positions.map((x) =>
            x.id === id ? { ...x, status: "canceled" as const, payout: x.stake } : x
          ),
        };
      });
      return result;
    },
    []
  );

  /**
   * Account-wide liquidation (MMR ≥ 100%). Marks every open leg `liquidated`
   * (margin forfeited) and freezes the session — new bets and cancels are
   * blocked until reset().
   *
   * Spec: the liquidation engine is a backend waterfall; here we just collapse
   * into the final "all out" state for UI fidelity.
   */
  const liquidateAll = useCallback(
    (
      ctx?: { mmr?: number }
    ): { liquidatedIds: string[] } => {
      const liquidatedIds: string[] = [];
      const now = Date.now();
      setState((s) => {
        if (s.sessionStatus === "frozen") return s;
        let plDelta = 0;
        const next = s.positions.map((p) => {
          if (p.status !== "open") return p;
          plDelta -= p.stake;
          liquidatedIds.push(p.id);
          return {
            ...p,
            status: "liquidated" as const,
            settledPrice: p.cellCenter,
            payout: 0,
            liquidatedAt: now,
          };
        });
        return {
          ...s,
          sessionPL: s.sessionPL + plDelta,
          positions: next,
          sessionStatus: "frozen" as const,
          frozenMmr: ctx?.mmr,
          frozenAt: now,
        };
      });
      return { liquidatedIds };
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
      const cur = (s.leverage ?? 1) as (typeof LEVS)[number];
      const i = LEVS.indexOf(cur);
      const ni = Math.max(0, Math.min(LEVS.length - 1, (i === -1 ? 0 : i) + dir));
      return { ...s, leverage: LEVS[ni] };
    });
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  /**
   * Credit the Pinpoint sub-account from an external source (the OmenX main
   * wallet). If the session was frozen, depositing automatically unfreezes —
   * a frozen session has no open legs by construction, so it's safe to resume.
   * The caller is responsible for debiting the main wallet (`debitWallet`).
   */
  const deposit = useCallback((amount: number) => {
    if (!(amount > 0)) return;
    setState((s) => ({
      ...s,
      balance: s.balance + amount,
      sessionStatus: "active" as const,
      frozenMmr: undefined,
      frozenAt: undefined,
      totalDeposited: (s.totalDeposited ?? 0) + amount,
    }));
  }, []);

  return {
    state,
    hydrated,
    placeBet,
    settlePosition,
    cancelPosition,
    liquidateAll,
    deposit,
    setBetSize,
    cycleBetSize,
    setLeverage,
    cycleLeverage,
    reset,
    LIQ_TRIGGER_MMR,
  };
}