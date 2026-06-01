import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { validateTpSl, previewTpSlPnl } from "@/lib/tpsl";

interface TradeFormProps {
  outcome: "yes" | "no";
  /**
   * Display label for the side. Prefer the team alias from `sideLabels`
   * (e.g. "Arsenal", "Real Madrid"). Only fall back to "Yes" / "No" for
   * neutral markets with no sideLabels.
   */
  outcomeLabel: string;
  /** Current price in ¢ (= probability). */
  price: number;
  /** Available wallet balance (USD). */
  balance?: number;
  /** Notified after a successful (mock) order is placed. */
  onPlaceOrder?: (order: PlacedOrder) => void;
  className?: string;
}

type Side = "buy" | "sell";
type Type = "market" | "limit";

export interface PlacedOrder {
  side: Side;
  type: Type;
  outcome: "yes" | "no";
  outcomeLabel: string;
  /** Execution / limit price in ¢. */
  price: number;
  margin: number;
  leverage: number;
  notional: number;
  shares: number;
  fee: number;
  liq: number;
  tp: number | null;
  sl: number | null;
  label: string;
}

export function TradeForm({
  outcome,
  outcomeLabel,
  price,
  balance = 5000,
  onPlaceOrder,
  className,
}: TradeFormProps) {
  const [side, setSide] = useState<Side>("buy");
  const [type, setType] = useState<Type>("market");
  const [tpslOpen, setTpslOpen] = useState(false);
  const [margin, setMargin] = useState(100);
  const [leverage, setLeverage] = useState(1);
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [limit, setLimit] = useState(price.toString());

  const accentClass =
    outcome === "yes"
      ? "bg-primary text-primary-foreground"
      : "bg-gradient-neon text-white shadow-glow";
  const sideToneClass = (s: Side) =>
    side === s
      ? outcome === "yes"
        ? "bg-primary/15 text-primary ring-1 ring-primary/30"
        : "bg-neon/15 text-neon ring-1 ring-neon/30"
      : "text-muted-foreground hover:text-foreground";

  const px = type === "market" ? price : Number(limit) || price;
  // Notional = Margin × Leverage. Shares = Notional / (price in $).
  const notional = margin * leverage;
  const shares = useMemo(() => (px > 0 ? notional / (px / 100) : 0), [notional, px]);
  const fee = notional * 0.002;
  // All positions are long (Buy YES or Buy NO). Selling closes an existing
  // position. PnL at settle = (1 − px/100) × notional for the holder of the
  // winning side; the losing side settles to 0.
  const pnlAtSettle = (1 - px / 100) * notional - fee;
  // Cross-margin liq price — display only; real engine uses maintenance margin.
  // Cross uses ~90% of free balance as the safety buffer, expressed in price ¢.
  const liq = useMemo(() => {
    if (leverage <= 1 || notional <= 0) return 0;
    const buffer = ((balance * 0.9) / notional) * 100;
    const raw = outcome === "yes" ? px - buffer : px + buffer;
    return Math.max(1, Math.min(99, Math.round(raw)));
  }, [leverage, px, outcome, balance, notional]);

  // TP / SL validation. Inputs are in ¢ (0..100). Direction depends on side:
  // YES → TP > px, SL < px (and > liq); NO → reversed.
  const tpNum = tp === "" ? null : Number(tp);
  const slNum = sl === "" ? null : Number(sl);
  const { tpError, slError, hasError: hasFormError } = validateTpSl({
    side: outcome,
    entry: px,
    liq,
    leverage,
    tp: tpNum,
    sl: slNum,
  });
  const { tpPnl, slPnl } = previewTpSlPnl({
    side: outcome,
    entry: px,
    liq,
    leverage,
    tp: tpNum,
    sl: slNum,
    notional,
    fee,
  });

  const action = side === "buy" ? "Buy" : "Sell";
  const baseCtaLabel =
    leverage > 1
      ? `${action} ${outcomeLabel} ${leverage}× @ ${Math.round(px)}¢`
      : `${action} ${outcomeLabel} @ ${Math.round(px)}¢`;
  const ctaLabel = hasFormError ? "Fix TP / SL" : baseCtaLabel;

  const handleSubmit = () => {
    if (hasFormError) {
      toast.error("Fix TP / SL before submitting");
      return;
    }
    if (margin <= 0) {
      toast.error("Set a margin amount");
      return;
    }
    if (margin > balance) {
      toast.error("Insufficient balance", {
        description: `Margin ${margin.toFixed(2)} > available ${balance.toFixed(2)} USDC`,
      });
      return;
    }
    const order: PlacedOrder = {
      side,
      type,
      outcome,
      outcomeLabel,
      price: Math.round(px),
      margin,
      leverage,
      notional,
      shares,
      fee,
      liq,
      tp: tpNum,
      sl: slNum,
      label: baseCtaLabel,
    };
    try {
      onPlaceOrder?.(order);
    } catch (err) {
      toast.error("Order failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      return;
    }
    toast.success(`Order placed · ${baseCtaLabel}`, {
      description: `Notional ${notional.toFixed(2)} USDC · Fee ${fee.toFixed(2)}`,
    });
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 shadow-card", className)}>
      {/* Side toggle — neutral outcome-tinted, NOT win/loss */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/5">
        {(["buy", "sell"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "rounded-lg py-2 text-xs font-display font-semibold uppercase tracking-widest transition-colors",
              sideToneClass(s),
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Type tabs */}
      <div className="mt-4 flex items-center gap-3 border-b border-border pb-2 text-xs">
        {(["market", "limit"] as Type[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "relative pb-2 font-medium capitalize transition-colors",
              type === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {type === t && (
              <span className="absolute -bottom-px left-0 right-0 h-px bg-gradient-neon" />
            )}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="mt-4 space-y-3">
        {type === "limit" && (
          <Field label="Limit Price (¢)">
            <input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-transparent text-right font-mono text-lg tabular-nums outline-none"
            />
          </Field>
        )}
        <Field label="Margin (USDC)">
          <input
            type="number"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value) || 0)}
            className="w-full bg-transparent text-right font-mono text-lg tabular-nums outline-none"
          />
        </Field>
        <div className="flex items-center gap-1.5">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setMargin(Math.round((balance * p) / 100))}
              className="flex-1 rounded-lg bg-white/[0.04] py-1.5 font-mono text-[11px] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* Leverage — first-class control (perp prediction market) */}
      <div className="mt-4 rounded-xl border border-border bg-white/[0.02] px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Leverage
          </span>
          <span className="font-mono text-sm text-neon">{leverage}×</span>
        </div>
        <Slider
          value={[leverage]}
          onValueChange={([v]) => setLeverage(v)}
          min={1}
          max={20}
          step={1}
          className="mt-2"
        />
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>1×</span>
          <span>
            Notional = {margin.toLocaleString()} × {leverage} ={" "}
            <span className="text-foreground">{notional.toLocaleString()} USDC</span>
          </span>
          <span>20×</span>
        </div>
      </div>

      {/* TP/SL toggle */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-white/[0.02] px-3 py-2.5">
        <div className="text-xs font-display font-semibold">TP/SL</div>
        <Switch checked={tpslOpen} onCheckedChange={setTpslOpen} />
      </div>

      {tpslOpen && (
        <div className="mt-4 space-y-4 rounded-xl border border-neon/20 bg-neon/[0.03] p-4">
          <div className="grid grid-cols-2 gap-2">
            <Field label="TP (¢)" compact error={tpError}>
              <input
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                placeholder="—"
                inputMode="decimal"
                className={cn(
                  "w-full bg-transparent text-right font-mono text-sm tabular-nums outline-none placeholder:text-muted-foreground",
                  tpError && "text-loss",
                )}
              />
            </Field>
            <Field label="SL (¢)" compact error={slError}>
              <input
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                placeholder="—"
                inputMode="decimal"
                className={cn(
                  "w-full bg-transparent text-right font-mono text-sm tabular-nums outline-none placeholder:text-muted-foreground",
                  slError && "text-loss",
                )}
              />
            </Field>
          </div>

          {(tpPnl !== null || slPnl !== null) && (
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-muted-foreground uppercase tracking-widest">If TP hits</div>
                <div className={cn("mt-0.5 tabular-nums", tpPnl !== null ? (tpPnl >= 0 ? "text-win" : "text-loss") : "text-muted-foreground/50")}>
                  {tpPnl !== null ? `${tpPnl >= 0 ? "+" : ""}${tpPnl.toFixed(2)} USDC` : "—"}
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-muted-foreground uppercase tracking-widest">If SL hits</div>
                <div className={cn("mt-0.5 tabular-nums", slPnl !== null ? (slPnl >= 0 ? "text-win" : "text-loss") : "text-muted-foreground/50")}>
                  {slPnl !== null ? `${slPnl >= 0 ? "+" : ""}${slPnl.toFixed(2)} USDC` : "—"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-[11px] font-mono">
        <SummaryRow label="Margin" value={`${margin.toFixed(2)} USDC`} />
        <SummaryRow label="Contracts" value={shares.toFixed(1)} />
        <SummaryRow
          label="Est. PnL @ settle"
          value={`${pnlAtSettle >= 0 ? "+" : ""}${pnlAtSettle.toFixed(2)} USDC`}
          highlight={pnlAtSettle >= 0 ? "win" : "loss"}
        />
      </dl>

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 border-t border-border bg-background/95 px-5 py-3 backdrop-blur">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={hasFormError}
          className={cn(
            "w-full rounded-xl py-3 font-display font-semibold uppercase tracking-widest text-sm transition-opacity hover:opacity-90",
            hasFormError
              ? "cursor-not-allowed bg-white/[0.06] text-muted-foreground hover:opacity-100"
              : "",
            accentClass,
          )}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  compact,
  error,
  children,
}: {
  label: string;
  compact?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        className={cn(
          "flex items-center justify-between rounded-xl border bg-white/[0.02]",
          compact ? "px-3 py-1.5" : "px-3 py-2.5",
          error ? "border-loss/60" : "border-border",
        )}
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="flex-1 pl-3">{children}</div>
      </label>
      {error && (
        <p className="px-1 text-[10px] font-mono text-loss">{error}</p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: "win" | "loss" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "tabular-nums",
          highlight === "win" ? "text-win" : highlight === "loss" ? "text-loss" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}