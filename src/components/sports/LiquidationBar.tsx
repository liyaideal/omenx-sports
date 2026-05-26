import { cn } from "@/lib/utils";

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
  className?: string;
}

export function LiquidationBar({ entry, current, liquidation, tone = "yes", className }: LiquidationBarProps) {
  const min = Math.min(entry, current, liquidation) - 5;
  const max = Math.max(entry, current, liquidation) + 5;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const accent = tone === "yes" ? "var(--primary)" : "var(--neon)";
  // Always paint from the liq edge (red) toward the current price (accent),
  // so the colored span = "safety budget" between liquidation and current.
  const liqPct = pct(liquidation);
  const curPct = pct(current);
  const left = Math.min(liqPct, curPct);
  const width = Math.abs(curPct - liqPct);
  const liqOnLeft = liqPct <= curPct;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>Entry {entry}¢</span>
        <span>Current {current}¢</span>
        <span className="text-loss">Liq {liquidation}¢</span>
      </div>
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
        <Marker pct={liqPct} color="var(--loss)" />
        <Marker pct={pct(entry)} color="var(--muted-foreground)" />
        <Marker pct={curPct} color={accent} large />
      </div>
    </div>
  );
}

function Marker({ pct, color, large }: { pct: number; color: string; large?: boolean }) {
  return (
    <div
      className={cn("absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full ring-2 ring-background", large ? "h-3.5 w-3.5" : "h-2.5 w-2.5")}
      style={{ left: `${pct}%`, background: color }}
    />
  );
}