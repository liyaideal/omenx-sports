import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LiquidationBarProps {
  entry: number;
  current: number;
  liquidation: number;
  /**
   * Which side of the binary this position is on. YES positions liquidate
   * when YES price falls (liq < entry); NO positions liquidate when YES
   * price rises (liq > entry, since NO price = 100 − YES price).
   */
  tone?: "yes" | "no";
  /** Take-profit target in ¢. Omit when unset or invalid. */
  tp?: number;
  /** Stop-loss target in ¢. Omit when unset or invalid. */
  sl?: number;
  /** Pre-computed PnL preview at TP for the tooltip. */
  tpPnl?: number;
  /** Pre-computed PnL preview at SL for the tooltip. */
  slPnl?: number;
  className?: string;
}

export function LiquidationBar({
  entry,
  current,
  liquidation,
  tone = "yes",
  tp,
  sl,
  tpPnl,
  slPnl,
  className,
}: LiquidationBarProps) {
  // Always include 0 / 100 as outer bounds so the price scale is consistent
  // and TP / SL markers always sit inside the visible range.
  const refs = [entry, current, liquidation, tp, sl].filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  const min = Math.max(0, Math.min(...refs) - 5);
  const max = Math.min(100, Math.max(...refs) + 5);
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const accent = tone === "yes" ? "var(--primary)" : "var(--neon)";
  // Always paint from the liq edge (red) toward the current price (accent),
  // so the colored span = "safety budget" between liquidation and current.
  const liqPct = pct(liquidation);
  const curPct = pct(current);
  const left = Math.min(liqPct, curPct);
  const width = Math.abs(curPct - liqPct);
  const liqOnLeft = liqPct <= curPct;
  const fmtPnl = (v: number | undefined) =>
    typeof v === "number" ? `${v >= 0 ? "+" : ""}${v.toFixed(2)} USDC` : undefined;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>Entry {entry}¢</span>
        <span>Current {current}¢</span>
        <span className="text-loss">Liq {liquidation}¢</span>
      </div>
      <TooltipProvider delayDuration={120}>
        <div className="relative h-2 w-full rounded-full bg-white/[0.06]">
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: `${left}%`,
              width: `${width}%`,
              background: liqOnLeft
                ? `linear-gradient(90deg, var(--loss), ${accent})`
                : `linear-gradient(90deg, ${accent}, var(--loss))`,
              opacity: 0.7,
            }}
          />
          <Marker pct={liqPct} color="var(--loss)" tip={`Liquidation · ${liquidation}¢`} />
          <Marker pct={pct(entry)} color="var(--muted-foreground)" tip={`Entry · ${entry}¢`} />
          {typeof sl === "number" && (
            <Marker
              pct={pct(sl)}
              color="var(--loss)"
              variant="sl"
              tip={`Stop loss · ${sl}¢${fmtPnl(slPnl) ? ` · ${fmtPnl(slPnl)}` : ""}`}
            />
          )}
          {typeof tp === "number" && (
            <Marker
              pct={pct(tp)}
              color="var(--win)"
              variant="tp"
              tip={`Take profit · ${tp}¢${fmtPnl(tpPnl) ? ` · ${fmtPnl(tpPnl)}` : ""}`}
            />
          )}
          <Marker pct={curPct} color={accent} large pulse tip={`Current · ${current}¢`} />
        </div>
      </TooltipProvider>
      {/* Price scale */}
      <div className="relative h-3 w-full">
        {[0, 25, 50, 75, 100].map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 font-mono text-[9px] text-muted-foreground/60"
            style={{ left: `${pct(tick)}%` }}
          >
            {tick}¢
          </span>
        ))}
      </div>
    </div>
  );
}

function Marker({
  pct,
  color,
  large,
  pulse,
  variant,
  tip,
}: {
  pct: number;
  color: string;
  large?: boolean;
  pulse?: boolean;
  variant?: "tp" | "sl";
  tip?: string;
}) {
  const isTriangle = variant === "tp" || variant === "sl";
  const node = (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
        isTriangle
          ? "h-0 w-0"
          : cn(
              "rounded-full ring-2 ring-background",
              large ? "h-3.5 w-3.5" : "h-2.5 w-2.5",
              pulse && "animate-pulse",
            ),
      )}
      style={
        isTriangle
          ? {
              left: `${pct}%`,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: variant === "tp" ? `8px solid ${color}` : "none",
              borderTop: variant === "sl" ? `8px solid ${color}` : "none",
            }
          : { left: `${pct}%`, background: color }
      }
    />
  );
  if (!tip) return node;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="contents" aria-label={tip}>
          {node}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{tip}</TooltipContent>
    </Tooltip>
  );
}