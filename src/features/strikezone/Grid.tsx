import { useMemo, useEffect, useRef, useState } from "react";
import {
  multiplier,
  formatMultiplier,
  multiplierHeat,
  multiplierTextColor,
  applyLeverage,
} from "./lib/multiplier";
import type { StrikezonePosition } from "./hooks/useStrikezoneSession";
import { PriceCapsule } from "./PriceCapsule";

// Visible window
const COLS = 10; // future seconds +1..+10
const ROWS = 11; // ±5¢ around center; row 5 = center
const ROW_H = 64;
const CELL_GAP = 6;

interface Props {
  currentPrice: number; // ¢
  positions: StrikezonePosition[]; // open bets on active outcome
  betSize: number;
  leverage: number;
  onPlace: (cellCenter: number, distanceCents: number, secondsAhead: number, mult: number) => void;
  recentHits: { id: string; at: number }[];
}

export function Grid({ currentPrice, positions, betSize, leverage, onPlace, recentHits }: Props) {
  const center = Math.round(currentPrice);

  // Precompute multiplier per (row, col). distance = (5 - row), secondsAhead = col + 1
  const cells = useMemo(() => {
    const out: { row: number; col: number; dist: number; secs: number; mult: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      const dist = 5 - r; // +5 at top, -5 at bottom
      for (let c = 0; c < COLS; c++) {
        const secs = c + 1;
        out.push({ row: r, col: c, dist, secs, mult: multiplier(dist, secs) });
      }
    }
    return out;
  }, []);

  // Bet markers
  const now = Date.now();
  const markers = positions
    .map((p) => {
      const secsLeft = Math.max(1, Math.ceil((p.targetAt - now) / 1000));
      const col = secsLeft - 1;
      const row = 5 - (p.cellCenter - center);
      return { p, col, row };
    })
    .filter((m) => m.col >= 0 && m.col < COLS && m.row >= 0 && m.row < ROWS);

  const cellBets = new Map<string, { stake: number; count: number }>();
  for (const m of markers) {
    const k = `${m.row}:${m.col}`;
    const cur = cellBets.get(k) ?? { stake: 0, count: 0 };
    cur.stake += m.p.stake;
    cur.count += 1;
    cellBets.set(k, cur);
  }

  // Floating "+$X" texts on hit
  const [floats, setFloats] = useState<{ id: string; row: number; col: number; text: string }[]>(
    []
  );
  const seenHitsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const h of recentHits) {
      if (seenHitsRef.current.has(h.id)) continue;
      seenHitsRef.current.add(h.id);
      const m = markers.find((mk) => mk.p.id === h.id);
      if (!m) continue;
      const lev = m.p.leverage ?? 1;
      const text = `+$${(m.p.stake * m.p.mult * lev - m.p.stake).toFixed(0)}`;
      const id = h.id + ":fx";
      setFloats((f) => [...f, { id, row: m.row, col: m.col, text }]);
      setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentHits.length]);

  const hitIds = new Set(recentHits.map((h) => h.id));
  const yRange: [number, number] = [center - 5.5, center + 5.5];
  const gridHeight = ROWS * ROW_H + (ROWS - 1) * CELL_GAP;

  return (
    <div
      className="relative flex"
      style={{ height: `${gridHeight}px`, gap: "16px" }}
    >
      {/* Y-axis labels — between rows, every 2 rows */}
      <div
        className="relative shrink-0"
        style={{ width: "44px", height: `${gridHeight}px` }}
      >
        {Array.from({ length: ROWS + 1 }, (_, i) => {
          const value = center + 5 - i + 0.5;
          const top = i * (ROW_H + CELL_GAP) - CELL_GAP / 2;
          // only show every other label to avoid crowding
          if (i % 2 !== 0) return null;
          return (
            <div
              key={i}
              className="sz-num absolute right-0 text-xs tabular-nums"
              style={{
                top: `${top}px`,
                transform: "translateY(-50%)",
                color: "var(--sz-cyan)",
                opacity: 0.65,
                textShadow: "0 0 6px rgba(0,240,255,0.35)",
              }}
            >
              {value.toFixed(0)}¢
            </div>
          );
        })}
        {/* price capsule lives on the axis */}
        <PriceCapsule price={currentPrice} range={yRange} height={gridHeight} />
      </div>

      {/* Grid body */}
      <div className="relative flex-1">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, ${ROW_H}px)`,
            gap: `${CELL_GAP}px`,
          }}
        >
          {cells.map((cell) => {
            const k = `${cell.row}:${cell.col}`;
            const bet = cellBets.get(k);
            const isHit = markers.some(
              (m) => m.row === cell.row && m.col === cell.col && hitIds.has(m.p.id)
            );
            const displayMult = applyLeverage(cell.mult, leverage);
            return (
              <button
                key={k}
                onClick={() =>
                  onPlace(center + cell.dist, Math.abs(cell.dist), cell.secs, cell.mult)
                }
                className={`sz-cell ${bet ? "sz-cell-bet" : ""} ${isHit ? "sz-cell-hit" : ""}`}
                style={{
                  backgroundColor: multiplierHeat(cell.mult),
                }}
                title={`$${betSize} × ${leverage}× → $${(betSize * cell.mult * leverage).toFixed(0)}`}
              >
                <span
                  className="sz-num absolute inset-0 flex items-center justify-center tabular-nums"
                  style={{
                    fontSize: bet ? "13px" : "18px",
                    color: multiplierTextColor(cell.mult),
                    transition: "font-size 150ms ease",
                  }}
                >
                  {formatMultiplier(displayMult)}
                </span>
                {bet && (
                  <span
                    className="sz-display sz-glow-cyan absolute bottom-1 left-1/2 -translate-x-1/2 text-base"
                    style={{ color: "var(--sz-cyan)" }}
                  >
                    ${bet.stake}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Float "+$X" overlay */}
        {floats.map((f) => {
          const colW = `calc((100% - ${(COLS - 1) * CELL_GAP}px) / ${COLS})`;
          return (
            <div
              key={f.id}
              className="sz-float sz-display sz-glow-green pointer-events-none absolute z-40 text-2xl"
              style={{
                top: `${f.row * (ROW_H + CELL_GAP) + ROW_H / 2}px`,
                left: `calc(${f.col} * (${colW} + ${CELL_GAP}px) + ${colW} / 2)`,
                transform: "translate(-50%, -50%)",
                color: "var(--sz-green)",
              }}
            >
              {f.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}