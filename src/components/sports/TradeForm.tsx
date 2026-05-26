import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LiquidationBar } from "./LiquidationBar";

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
  className?: string;
}

type Side = "buy" | "sell";
type Type = "market" | "limit";
type Margin = "cross" | "isolated";

export function TradeForm({
  outcome,
  outcomeLabel,
  price,
  balance = 5000,
  className,
}: TradeFormProps) {
  const [side, setSide] = useState<Side>("buy");
  const [type, setType] = useState<Type>("market");
  const [pro, setPro] = useState(false);
  const [margin, setMargin] = useState(100);
  const [leverage, setLeverage] = useState(1);
  const [marginMode, setMarginMode] = useState<Margin>("cross");
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
  // Mock liq price — for display only; real engine uses maintenance margin.
  const liq = useMemo(() => {
    if (leverage <= 1) return 0;
    const buffer = 100 / leverage;
    return outcome === "yes" ? Math.max(1, px - buffer) : Math.min(99, px + buffer);
  }, [leverage, px, outcome]);

  const action = side === "buy" ? "Buy" : "Sell";
  const ctaLabel = pro
    ? `${action} ${outcomeLabel} ${leverage}× @ ${Math.round(px)}¢`
    : `${action} ${outcomeLabel} @ ${Math.round(px)}¢`;

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
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          Bal {balance.toLocaleString()} USDC
        </span>
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
        <Field label={pro ? "Margin (USDC)" : "Amount (USDC)"}>
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

      {/* PRO toggle */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Zap className={cn("h-4 w-4", pro ? "text-neon" : "text-muted-foreground")} />
          <div>
            <div className="text-xs font-display font-semibold">PRO · Leverage</div>
            <div className="text-[10px] font-mono text-muted-foreground">Margin, TP/SL, Liq price</div>
          </div>
        </div>
        <Switch checked={pro} onCheckedChange={setPro} />
      </div>

      {pro && (
        <div className="mt-4 space-y-4 rounded-xl border border-neon/20 bg-neon/[0.03] p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Leverage</span>
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
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.04] p-1">
            {(["cross", "isolated"] as Margin[]).map((m) => (
              <button
                key={m}
                onClick={() => setMarginMode(m)}
                className={cn(
                  "rounded-md py-1 text-[11px] font-mono uppercase tracking-widest transition-colors",
                  marginMode === m
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="TP (¢)" compact>
              <input
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                placeholder="—"
                className="w-full bg-transparent text-right font-mono text-sm tabular-nums outline-none placeholder:text-muted-foreground"
              />
            </Field>
            <Field label="SL (¢)" compact>
              <input
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                placeholder="—"
                className="w-full bg-transparent text-right font-mono text-sm tabular-nums outline-none placeholder:text-muted-foreground"
              />
            </Field>
          </div>

          {leverage > 1 && (
            <>
              <LiquidationBar entry={px} current={px} liquidation={Math.round(liq)} tone={outcome} />
              <p className="text-[10px] font-mono text-muted-foreground/70">
                Liq price is an estimate · actual value depends on funding & maintenance margin
              </p>
            </>
          )}
        </div>
      )}

      {/* Summary */}
      <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-[11px] font-mono">
        <SummaryRow label="Avg price" value={`${Math.round(px)}¢`} />
        {pro && <SummaryRow label="Margin" value={`${margin.toFixed(2)} USDC`} />}
        <SummaryRow label="Notional" value={`${notional.toFixed(2)} USDC`} />
        <SummaryRow label="Contracts" value={shares.toFixed(1)} />
        <SummaryRow label="Fee" value={`${fee.toFixed(2)} USDC`} />
        <SummaryRow
          label="Est. PnL @ settle"
          value={`${pnlAtSettle >= 0 ? "+" : ""}${pnlAtSettle.toFixed(2)} USDC`}
          highlight={pnlAtSettle >= 0 ? "win" : "loss"}
        />
        {pro && leverage > 1 && (
          <SummaryRow label="Liq price" value={`${Math.round(liq)}¢`} highlight="loss" />
        )}
      </dl>

      <button
        className={cn(
          "mt-5 w-full rounded-xl py-3 font-display font-semibold uppercase tracking-widest text-sm transition-opacity hover:opacity-90",
          accentClass,
        )}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function Field({ label, compact, children }: { label: string; compact?: boolean; children: React.ReactNode }) {
  return (
    <label
      className={cn(
        "flex items-center justify-between rounded-xl border border-border bg-white/[0.02]",
        compact ? "px-3 py-1.5" : "px-3 py-2.5",
      )}
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex-1 pl-3">{children}</div>
    </label>
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