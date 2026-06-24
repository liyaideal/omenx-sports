import { useMemo, useState, useEffect, useRef } from "react";
import { multiplier, formatMultiplier, multiplierHeat, multiplierBorder } from "./lib/multiplier";
import type { StrikezonePosition } from "./hooks/useStrikezoneSession";
import { cn } from "@/lib/utils";

const COLS = 60; // seconds ahead
const ROWS = 21; // ±10¢ around center, row 10 = center

interface Props {
  currentPrice: number; // ¢ (0..100)
  tickSec: number;
  positions: StrikezonePosition[]; // open only (filtered by parent)
  betSize: number;
  onPlace: (cellCenter: number, distanceCents: number, secondsAhead: number, mult: number) => void;
  recentHits: { id: string; at: number }[];
}

export function Grid({ currentPrice, tickSec, positions, betSize, onPlace, recentHits }: Props) {
  const center = Math.round(currentPrice); // grid center row tracks integer ¢
  const [hover, setHover] = useState<{ col: number; row: number } | null>(null);

  // Precompute cell metadata (multipliers don't depend on center — they depend on distance)
  const cells = useMemo(() => {
    const out: { col: number; row: number; dist: number; secs: number; mult: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      const dist = 10 - r; // top row = +10¢ above center
      for (let c = 0; c < COLS; c++) {
        const secs = c + 1;
        out.push({ col: c, row: r, dist, secs, mult: multiplier(dist, secs) });
      }
    }
    return out;
  }, []);

  // Bet marker positions (computed from absolute target time and cellCenter vs current center)
  const now = Date.now();
  const markers = positions
    .map((p) => {
      const secsLeft = Math.ceil((p.targetAt - now) / 1000);
      const col = secsLeft - 1; // 0-indexed col
      const row = 10 - (p.cellCenter - center);
      return { p, col, row };
    })
    .filter((m) => m.col >= 0 && m.col < COLS && m.row >= 0 && m.row < ROWS);

  // Aggregate per-cell stake
  const cellBets = new Map<string, { stake: number; count: number }>();
  for (const m of markers) {
    const k = `${m.col}:${m.row}`;
    const cur = cellBets.get(k) ?? { stake: 0, count: 0 };
    cur.stake += m.p.stake;
    cur.count += 1;
    cellBets.set(k, cur);
  }

  // Sub-second smooth scroll offset (visual only) — bets shift left within current second
  const [subOffset, setSubOffset] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      const ms = Date.now() % 1000;
      setSubOffset(ms / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      alive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Recent hits set
  const hitIds = new Set(recentHits.map((h) => h.id));

  return (
    <div className="relative w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
      {/* Y-axis price labels (left) */}
      <div className="flex">
        <div className="flex w-10 flex-col border-r border-zinc-800 bg-zinc-950 text-[9px] font-mono text-zinc-500">
          {Array.from({ length: ROWS }, (_, r) => {
            const p = center + (10 - r);
            const isCenter = r === 10;
            return (
              <div
                key={r}
                className={cn(
                  "flex flex-1 items-center justify-end pr-1 tabular-nums",
                  isCenter && "font-bold text-emerald-300"
                )}
              >
                {p}¢
              </div>
            );
          })}
        </div>

        {/* Grid body */}
        <div className="relative flex-1">
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, 22px)`,
            }}
          >
            {cells.map((cell) => {
              const isCenter = cell.row === 10;
              const isHover = hover?.col === cell.col && hover?.row === cell.row;
              return (
                <button
                  key={`${cell.col}:${cell.row}`}
                  onMouseEnter={() => setHover({ col: cell.col, row: cell.row })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() =>
                    onPlace(center + cell.dist, Math.abs(cell.dist), cell.secs, cell.mult)
                  }
                  className={cn(
                    "relative border-r border-b border-zinc-900/60 transition-colors",
                    "hover:z-10 hover:ring-1 hover:ring-emerald-400/60",
                    isCenter && "border-b-emerald-400/30"
                  )}
                  style={{
                    backgroundColor: multiplierHeat(cell.mult),
                    borderColor: isHover ? multiplierBorder(cell.mult) : undefined,
                  }}
                >
                  <span
                    className={cn(
                      "absolute inset-0 flex items-center justify-center font-mono text-[8px] tabular-nums leading-none",
                      cell.mult < 8 ? "text-zinc-500" : "text-zinc-300"
                    )}
                  >
                    {cell.mult >= 10 ? Math.round(cell.mult) : cell.mult.toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center price line */}
          <div
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-emerald-300/40"
            style={{ top: `${10 * 22 + 11}px` }}
          />

          {/* Bet markers overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              transform: `translateX(${-subOffset * (100 / COLS)}%)`,
              willChange: "transform",
            }}
          >
            {Array.from(cellBets.entries()).map(([k, v]) => {
              const [col, row] = k.split(":").map(Number);
              const sample = markers.find((m) => m.col === col && m.row === row)!;
              const hit = hitIds.has(sample.p.id);
              return (
                <div
                  key={k}
                  className={cn(
                    "absolute flex items-center justify-center rounded-sm border-2 font-mono text-[9px] font-bold tabular-nums",
                    hit
                      ? "border-white bg-emerald-400 text-zinc-950 animate-pulse"
                      : "border-emerald-300 bg-emerald-500/40 text-emerald-100"
                  )}
                  style={{
                    left: `${(col / COLS) * 100}%`,
                    top: `${row * 22}px`,
                    width: `calc(${100 / COLS}% - 1px)`,
                    height: "22px",
                    boxShadow: hit
                      ? "0 0 12px rgba(52,211,153,0.9)"
                      : "0 0 6px rgba(52,211,153,0.4)",
                  }}
                  title={`$${v.stake} × ${formatMultiplier(sample.p.mult)} ${v.count > 1 ? `(${v.count} bets)` : ""}`}
                >
                  ${v.stake}
                </div>
              );
            })}
          </div>

          {/* Hover tooltip */}
          {hover && (() => {
            const cell = cells[hover.row * COLS + hover.col];
            const win = (betSize * cell.mult).toFixed(0);
            return (
              <div
                className="pointer-events-none absolute z-20 -translate-x-1/2 rounded border border-zinc-700 bg-zinc-950/95 px-2 py-1 font-mono text-[10px] text-zinc-200 shadow-lg"
                style={{
                  left: `${((hover.col + 0.5) / COLS) * 100}%`,
                  top: `${hover.row * 22 - 36}px`,
                }}
              >
                <div>
                  T+{cell.secs}s · {center + cell.dist}¢
                </div>
                <div className="text-emerald-300">
                  ${betSize} → ${win} ({formatMultiplier(cell.mult)})
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* X-axis (bottom) */}
      <div className="flex border-t border-zinc-800 bg-zinc-950 text-[9px] font-mono text-zinc-500">
        <div className="w-10 border-r border-zinc-800" />
        <div
          className="grid flex-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: COLS }, (_, c) => (
            <div key={c} className="flex justify-center py-0.5 tabular-nums">
              {(c + 1) % 10 === 0 ? `+${c + 1}s` : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}