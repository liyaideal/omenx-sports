import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TraderRow {
  handle: string;
  /** 24h P&L in USDC (signed). */
  pnl24h: number;
  /** Hue 0–360 for the avatar gradient (stable per user). */
  hue: number;
  href?: string;
}

interface TopTradersCardProps {
  rows: TraderRow[];
  className?: string;
}

function fmtUsd(n: number) {
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "−";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/**
 * "Top traders" — small leaderboard of who's printing today. Each row jumps
 * to that user's profile on the OmenX main site (handle-based link).
 */
export function TopTradersCard({ rows, className }: TopTradersCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between pb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
          Top traders · 24h
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          P&amp;L
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map((r, i) => {
          const win = r.pnl24h >= 0;
          return (
            <a
              key={r.handle}
              href={r.href ?? "#"}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
            >
              <span className="w-4 text-center font-mono text-[10px] tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white ring-1 ring-white/10"
                style={{
                  backgroundImage: `linear-gradient(135deg, oklch(0.65 0.18 ${r.hue}) 0%, oklch(0.4 0.16 ${(r.hue + 40) % 360}) 100%)`,
                }}
              >
                {r.handle.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                @{r.handle}
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-semibold tabular-nums",
                  win ? "text-win" : "text-loss",
                )}
              >
                {fmtUsd(r.pnl24h)}
              </span>
              <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          );
        })}
      </div>
    </div>
  );
}