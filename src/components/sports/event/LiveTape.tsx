import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";

interface LiveTapeProps {
  market: SportsMarket;
  className?: string;
  /** How many rows to show at once. */
  rows?: number;
}

interface Fill {
  id: string;
  user: string;
  outcomeIdx: number;
  outcomeLabel: string;
  side: "buy" | "sell";
  price: number; // ¢
  size: number;
  agoSec: number;
}

const USERS = [
  "0xa1f…b2c",
  "luna.eth",
  "ronaldo7",
  "shark_99",
  "fan_paul",
  "wager_kid",
  "0x73c…1ee",
  "midfield_m",
  "stoxx",
  "ev_calc",
  "tilt_zero",
  "mbappe.fan",
];

function rand(seed: number): () => number {
  let s = seed | 0 || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function fmtAgo(s: number): string {
  if (s < 60) return `${Math.max(1, Math.floor(s))}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

/**
 * Rolling tape of recent public fills for the current market. Mocked from a
 * deterministic seed so each market has a stable feed, with a fresh fill
 * sliding in every few seconds for social proof / liveness.
 */
export function LiveTape({ market, className, rows = 8 }: LiveTapeProps) {
  const initial = useMemo<Fill[]>(() => {
    const r = rand(
      [...market.id].reduce((acc, c) => acc + c.charCodeAt(0), 0) + 17,
    );
    const out: Fill[] = [];
    for (let i = 0; i < rows; i++) {
      const outcomeIdx = Math.floor(r() * market.outcomes.length);
      const o = market.outcomes[outcomeIdx];
      const px = Math.round(o.price * 100);
      const jitter = Math.floor(r() * 5) - 2;
      out.push({
        id: `seed-${i}`,
        user: USERS[Math.floor(r() * USERS.length)],
        outcomeIdx,
        outcomeLabel: o.team?.name ?? o.label,
        side: r() > 0.42 ? "buy" : "sell",
        price: Math.max(1, Math.min(99, px + jitter)),
        size: 10 + Math.floor(r() * 480),
        agoSec: 4 + i * 6 + Math.floor(r() * 9),
      });
    }
    return out;
  }, [market.id, market.outcomes, rows]);

  const [fills, setFills] = useState<Fill[]>(initial);
  useEffect(() => setFills(initial), [initial]);

  useEffect(() => {
    const r = rand(Date.now());
    const tickAge = setInterval(() => {
      setFills((prev) => prev.map((f) => ({ ...f, agoSec: f.agoSec + 1 })));
    }, 1000);
    const inject = setInterval(() => {
      setFills((prev) => {
        const outcomeIdx = Math.floor(r() * market.outcomes.length);
        const o = market.outcomes[outcomeIdx];
        if (!o) return prev;
        const px = Math.round(o.price * 100);
        const jitter = Math.floor(r() * 5) - 2;
        const next: Fill = {
          id: `live-${Date.now()}`,
          user: USERS[Math.floor(r() * USERS.length)],
          outcomeIdx,
          outcomeLabel: o.team?.name ?? o.label,
          side: r() > 0.42 ? "buy" : "sell",
          price: Math.max(1, Math.min(99, px + jitter)),
          size: 10 + Math.floor(r() * 480),
          agoSec: 1,
        };
        return [next, ...prev].slice(0, rows);
      });
    }, 4200);
    return () => {
      clearInterval(tickAge);
      clearInterval(inject);
    };
  }, [market.outcomes, rows]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Live tape · recent fills
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          Live
        </div>
      </div>
      <div className="space-y-0.5 font-mono text-[11px] tabular-nums">
        {fills.map((f, i) => {
          const tone = f.outcomeIdx === 0 ? "primary" : "neon";
          return (
            <div
              key={f.id}
              className={cn(
                "grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                i === 0 && "bg-white/[0.04]",
              )}
            >
              <span className="truncate text-muted-foreground">{f.user}</span>
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 text-[10px] uppercase",
                  f.side === "buy"
                    ? "bg-win/15 text-win"
                    : "bg-loss/15 text-loss",
                )}
              >
                {f.side}
              </span>
              <span
                className={cn(
                  "min-w-[60px] truncate text-right",
                  tone === "primary" ? "text-primary" : "text-neon",
                )}
              >
                {f.outcomeLabel}
              </span>
              <span className="min-w-[44px] text-right text-foreground">
                {f.price}¢ × {f.size}
              </span>
              <span className="min-w-[28px] text-right text-muted-foreground">
                {fmtAgo(f.agoSec)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}