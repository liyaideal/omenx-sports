import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TickerRow {
  short: string;
  market: string;
  price: number;
  delta: number;
  href?: string;
}

interface LiveTickerProps {
  rows: TickerRow[];
  className?: string;
  /** Seconds for one full loop. */
  durationSec?: number;
}

/**
 * Vertical infinite-scrolling ticker — communicates "the market is moving"
 * with constant motion in the page rail. Pauses on hover so users can read
 * and click. Rows are duplicated once to make the loop seamless.
 */
export function LiveTicker({ rows, className, durationSec = 24 }: LiveTickerProps) {
  const doubled = [...rows, ...rows];
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between pb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
          Live ticker
        </span>
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-loss/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-loss" />
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
        <div
          className="flex flex-col gap-2 will-change-transform animate-[ticker-scroll_var(--ticker-duration)_linear_infinite] group-hover:[animation-play-state:paused]"
          style={{ ["--ticker-duration" as string]: `${durationSec}s` }}
        >
          {doubled.map((r, i) => {
            const up = r.delta >= 0;
            return (
              <a
                key={`${r.short}-${i}`}
                href={r.href ?? "#"}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-9 shrink-0 font-mono text-[11px] font-semibold tabular-nums text-foreground">
                    {r.short}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {r.market}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] tabular-nums">
                  <span className="text-foreground">{r.price}¢</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5",
                      up ? "text-win" : "text-loss",
                    )}
                  >
                    {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(r.delta).toFixed(1)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}