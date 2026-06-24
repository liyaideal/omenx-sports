import { cn } from "@/lib/utils";
import { formatMultiplier } from "./lib/multiplier";
import type { StrikezonePosition } from "./hooks/useStrikezoneSession";

interface Props {
  positions: StrikezonePosition[];
  now: number;
}

export function PositionsPanel({ positions, now }: Props) {
  if (positions.length === 0) {
    return (
      <div className="rounded border border-dashed border-zinc-800 p-3 text-center text-[10px] text-zinc-600">
        No bets yet. Click a grid cell to place one.
      </div>
    );
  }
  return (
    <div className="space-y-1 overflow-y-auto">
      {positions.slice(0, 30).map((p) => {
        const secsLeft = Math.max(0, Math.ceil((p.targetAt - now) / 1000));
        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center justify-between rounded border px-2 py-1 text-[11px]",
              p.status === "open" && "border-emerald-400/30 bg-emerald-400/5",
              p.status === "won" && "border-emerald-400/60 bg-emerald-400/15",
              p.status === "lost" && "border-rose-500/40 bg-rose-500/10 opacity-70",
              p.status === "refunded" && "border-zinc-700 bg-zinc-900/60 opacity-60"
            )}
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-zinc-200">
                {p.outcomeLabel} @ {p.cellCenter.toFixed(0)}¢
              </div>
              <div className="font-mono text-[9px] tabular-nums text-zinc-500">
                ${p.stake} · {formatMultiplier(p.mult)}{" "}
                {p.status === "open" ? `· T-${secsLeft}s` : `· ${p.status}`}
              </div>
            </div>
            <div
              className={cn(
                "font-mono text-xs tabular-nums",
                p.status === "won" && "text-emerald-300",
                p.status === "lost" && "text-rose-400",
                p.status === "refunded" && "text-zinc-500",
                p.status === "open" && "text-zinc-400"
              )}
            >
              {p.status === "won"
                ? `+$${((p.payout ?? 0) - p.stake).toFixed(0)}`
                : p.status === "lost"
                  ? `-$${p.stake}`
                  : p.status === "refunded"
                    ? "$0"
                    : `→$${(p.stake * p.mult).toFixed(0)}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}