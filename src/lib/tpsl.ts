/**
 * Shared Take-Profit / Stop-Loss validation + PnL preview.
 *
 * Used both by `TradeForm` (when placing a new order) and by
 * `EditTpslDialog` (when editing TP/SL on an existing position) so the two
 * surfaces never drift.
 *
 * All prices are in ¢ (0–100). Direction depends on the position side:
 *   - YES: TP > entry, SL < entry (and > liq when leverage > 1)
 *   - NO:  TP < entry, SL > entry (and < liq when leverage > 1)
 */

export interface TpSlInput {
  side: "yes" | "no";
  /** Reference price (current px for new orders, entry px for existing positions). */
  entry: number;
  /** Liquidation price in ¢. Only enforced when leverage > 1. */
  liq: number;
  leverage: number;
  tp: number | null;
  sl: number | null;
}

export interface TpSlValidation {
  tpError: string | null;
  slError: string | null;
  hasError: boolean;
}

const inRange = (v: number | null) =>
  v === null || (Number.isFinite(v) && v >= 0 && v <= 100);

export function validateTpSl(input: TpSlInput): TpSlValidation {
  const { side, entry, liq, leverage, tp, sl } = input;
  const tpInRange = inRange(tp);
  const slInRange = inRange(sl);
  const tpDirOk =
    tp === null ? true : side === "yes" ? tp > entry : tp < entry;
  const slDirOk =
    sl === null
      ? true
      : side === "yes"
        ? sl < entry && (leverage <= 1 || sl > liq)
        : sl > entry && (leverage <= 1 || sl < liq);

  const tpError = !tpInRange
    ? "0–100¢"
    : !tpDirOk
      ? side === "yes"
        ? `must be > ${entry}¢`
        : `must be < ${entry}¢`
      : null;

  const slError = !slInRange
    ? "0–100¢"
    : !slDirOk
      ? side === "yes"
        ? leverage > 1 && sl !== null && sl <= liq
          ? `must be > liq ${liq}¢`
          : `must be < ${entry}¢`
        : leverage > 1 && sl !== null && sl >= liq
          ? `must be < liq ${liq}¢`
          : `must be > ${entry}¢`
      : null;

  return { tpError, slError, hasError: !!tpError || !!slError };
}

/**
 * PnL (USDC) if TP/SL hits, given the order's notional and fee.
 * Returns `null` when the target is unset or invalid.
 */
export function previewTpSlPnl(
  input: TpSlInput & { notional: number; fee: number },
): { tpPnl: number | null; slPnl: number | null } {
  const { side, entry, tp, sl, notional, fee } = input;
  const { tpError, slError } = validateTpSl(input);
  const sign = side === "yes" ? 1 : -1;
  const tpPnl =
    tp !== null && !tpError
      ? (tp / 100 - entry / 100) * notional * sign - fee
      : null;
  const slPnl =
    sl !== null && !slError
      ? (sl / 100 - entry / 100) * notional * sign - fee
      : null;
  return { tpPnl, slPnl };
}