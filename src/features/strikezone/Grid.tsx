import { useEffect, useMemo, useRef, useState } from "react";
import {
  multiplier,
  formatMultiplier,
  multiplierHeat,
  multiplierTextColor,
  applyLeverage,
} from "./lib/multiplier";
import type { StrikezonePosition } from "./hooks/useStrikezoneSession";

// Layout constants
const ROWS = 11; // ±5¢ around center; row 5 = center
const ROW_H = 56;
const ROW_GAP = 4;
const COL_W = 76;
const COL_GAP = 4;
const VISIBLE_COLS = 10;
const PITCH_Y = ROW_H + ROW_GAP;
const PITCH_X = COL_W + COL_GAP;
const TOTAL_H = ROWS * ROW_H + (ROWS - 1) * ROW_GAP;
const HISTORY_W = 360;
const SETTLE_TTL_MS = 1300; // how long settled markers linger at NOW line

interface Props {
  currentPrice: number;
  history: number[];
  positions: StrikezonePosition[];
  betSize: number;
  leverage: number;
  onPlace: (cellCenter: number, distanceCents: number, secondsAhead: number, mult: number) => void;
  recentHits: { id: string; at: number }[];
}

export function Grid({
  currentPrice,
  history,
  positions,
  betSize,
  leverage,
  onPlace,
  recentHits,
}: Props) {
  // Stable y-axis center: only re-center when price drifts beyond ±4¢.
  const [center, setCenter] = useState(() => Math.round(currentPrice));
  useEffect(() => {
    if (Math.abs(currentPrice - center) > 4) {
      setCenter(Math.round(currentPrice));
    }
  }, [currentPrice, center]);

  const yFor = (p: number) => {
    const r = 5 - (p - center);
    return r * PITCH_Y + ROW_H / 2;
  };

  // 1Hz tick — drives marker repositioning when baseSec advances.
  // Initialized to null to avoid SSR/CSR hydration mismatch.
  const [tickSec, setTickSec] = useState<number | null>(null);
  useEffect(() => {
    setTickSec(Math.floor(Date.now() / 1000));
    const id = window.setInterval(() => {
      setTickSec(Math.floor(Date.now() / 1000));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  // Smooth horizontal scroll via direct DOM transform (no React rerender).
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const ms = Date.now();
      const progress = (ms % 1000) / 1000;
      if (scrollRef.current) {
        scrollRef.current.style.transform = `translateX(${-progress * PITCH_X}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const baseSec = tickSec ?? 0;
  const columnCount = VISIBLE_COLS + 2; // one extra at right for smooth slide-in

  // Top-of-grid clock countdown — seconds until next tick rollover (1..60 loop).
  const nextTickInSec = tickSec == null ? null : 60 - (baseSec % 60);

  // Precompute mult per (row, col-offset). Static — independent of tickSec.
  const cellMults = useMemo(() => {
    const out: number[][] = [];
    for (let c = 0; c < columnCount; c++) {
      const col: number[] = [];
      const secs = c + 1;
      for (let r = 0; r < ROWS; r++) {
        const dist = 5 - r;
        col.push(multiplier(dist, secs));
      }
      out.push(col);
    }
    return out;
  }, []);

  // Hit floats — fire at NOW line at the bet's y.
  const [floats, setFloats] = useState<{ id: string; y: number; text: string }[]>([]);
  const seenHits = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const h of recentHits) {
      if (seenHits.current.has(h.id)) continue;
      seenHits.current.add(h.id);
      const p = positions.find((x) => x.id === h.id);
      if (!p) continue;
      const lev = p.leverage ?? 1;
      const text = `+$${(p.stake * p.mult * lev - p.stake).toFixed(0)}`;
      const y = yFor(p.cellCenter);
      const id = h.id + ":fx";
      setFloats((f) => [...f, { id, y, text }]);
      window.setTimeout(() => {
        setFloats((f) => f.filter((x) => x.id !== id));
      }, 1300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentHits.length]);

  const hitIds = new Set(recentHits.map((h) => h.id));

  return (
    <div className="relative flex w-full" style={{ height: TOTAL_H }}>
      {/* HISTORY (left) */}
      <div
        className="relative shrink-0"
        style={{ width: HISTORY_W, height: TOTAL_H }}
      >
        <HistoryChart
          history={history}
          currentPrice={currentPrice}
          center={center}
          yFor={yFor}
          width={HISTORY_W}
          height={TOTAL_H}
        />
      </div>

      {/* NOW divider */}
      <div className="relative shrink-0" style={{ width: 1, height: TOTAL_H }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(255,107,26,0.45) 12%, rgba(255,107,26,0.45) 88%, transparent)",
            opacity: 0.7,
          }}
        />
      </div>

      {/* FUTURE GRID (right) — scrolling */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ height: TOTAL_H, marginLeft: 6 }}
      >
        {/* Clock badge — top center, mimics reference */}
        <div
          className="sz-display absolute left-1/2 z-30 -translate-x-1/2 rounded-md px-3 py-1 text-base"
          style={{
            top: -10,
            color: "var(--sz-cyan)",
            background: "rgba(8,16,28,0.92)",
            border: "1.5px solid var(--sz-cyan)",
            boxShadow:
              "0 0 14px rgba(0,240,255,0.45), inset 0 0 8px rgba(0,240,255,0.15)",
            letterSpacing: "0.08em",
          }}
        >
          <span className="sz-glow-cyan tabular-nums">
            {String(Math.floor(nextTickInSec / 60)).padStart(1, "0")}:
            {String(nextTickInSec % 60).padStart(2, "0")}
          </span>
        </div>
        <div
          ref={scrollRef}
          className="absolute left-0 top-0"
          style={{
            width: columnCount * PITCH_X,
            height: TOTAL_H,
            willChange: "transform",
          }}
        >
          {cellMults.map((colMults, c) => (
            <div
              key={c}
              className="absolute top-0"
              style={{ left: c * PITCH_X, width: COL_W, height: TOTAL_H }}
            >
              {colMults.map((m, r) => {
                const dist = 5 - r;
                const secs = c + 1;
                const displayMult = applyLeverage(m, leverage);
                return (
                  <button
                    key={r}
                    onClick={() => onPlace(center + dist, Math.abs(dist), secs, m)}
                    className="sz-cell absolute"
                    style={{
                      top: r * PITCH_Y,
                      left: 0,
                      width: COL_W,
                      height: ROW_H,
                      backgroundColor: multiplierHeat(m),
                    }}
                    title={`$${betSize} × ${leverage}× → $${(betSize * m * leverage).toFixed(0)}`}
                  >
                    <span
                      className="sz-num absolute inset-0 flex items-center justify-center tabular-nums"
                      style={{
                        fontSize: 13,
                        color: multiplierTextColor(m),
                      }}
                    >
                      {formatMultiplier(displayMult)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Bet markers */}
          {positions.map((p) => {
            const colRel = Math.floor((p.targetAt - baseSec * 1000) / 1000) - 1;
            if (colRel < 0 || colRel >= columnCount) return null;
            const y = yFor(p.cellCenter);
            if (y < 0 || y > TOTAL_H) return null;
            const isHit = hitIds.has(p.id);
            const lev = p.leverage ?? 1;
            const payout = p.stake * p.mult * lev - p.stake;
            return (
              <div
                key={p.id}
                className={`pointer-events-none absolute ${isHit ? "sz-cell-hit" : ""}`}
                style={{
                  left: colRel * PITCH_X,
                  top: y - ROW_H / 2,
                  width: COL_W,
                  height: ROW_H,
                  borderRadius: 8,
                  background:
                    "linear-gradient(180deg, rgba(255,138,61,0.95) 0%, rgba(255,107,26,0.95) 100%)",
                  border: "1.5px solid #ffd9b8",
                  boxShadow:
                    "0 0 18px rgba(255,138,61,0.7), inset 0 0 10px rgba(255,255,255,0.25)",
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
                  <span
                    className="sz-num text-[9px] tabular-nums"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    ${p.stake}
                    {lev > 1 ? `×${lev}` : ""}
                  </span>
                  <span
                    className="sz-display text-[13px] tabular-nums"
                    style={{ color: "#fff" }}
                  >
                    {formatMultiplier(applyLeverage(p.mult, lev))}
                  </span>
                  <span
                    className="sz-num text-[9px] tabular-nums"
                    style={{ color: "var(--sz-green)" }}
                  >
                    +${payout.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Float "+$X" — fires at NOW line (left edge) */}
        {floats.map((f) => (
          <div
            key={f.id}
            className="sz-float sz-display sz-glow-green pointer-events-none absolute z-40 text-2xl"
            style={{
              left: 8,
              top: f.y,
              transform: "translateY(-50%)",
              color: "var(--sz-green)",
            }}
          >
            {f.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryChart({
  history,
  currentPrice,
  center,
  yFor,
  width,
  height,
}: {
  history: number[];
  currentPrice: number;
  center: number;
  yFor: (p: number) => number;
  width: number;
  height: number;
}) {
  const N = history.length;
  // Clamp to within ±5.5¢ of center so the line never escapes the panel.
  const clamp = (p: number) => Math.max(center - 5.5, Math.min(center + 5.5, p));
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * width;
    const y = yFor(clamp(history[i]));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const first = history[0];
  const last = history[N - 1];
  const up = last >= first;
  const stroke = up ? "var(--sz-green)" : "var(--sz-red)";
  const glow = up ? "rgba(0,255,157,0.55)" : "rgba(255,45,74,0.55)";
  const tipY = yFor(clamp(currentPrice));

  // Build area fill polygon
  const areaPts = `0,${height} ${pts.join(" ")} ${width.toFixed(1)},${height}`;

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="absolute inset-0"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sz-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal cents guides every 2¢ */}
        {Array.from({ length: 6 }, (_, i) => {
          const cents = center + 5 - i * 2;
          const y = yFor(cents);
          return (
            <g key={i}>
              <line
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="rgba(0,240,255,0.08)"
                strokeDasharray="2 4"
              />
              <text
                x={4}
                y={y - 3}
                fontSize={9}
                fill="rgba(0,240,255,0.55)"
                fontFamily="Chakra Petch, monospace"
              >
                {cents}¢
              </text>
            </g>
          );
        })}
        <polygon fill="url(#sz-area)" points={areaPts} />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          points={pts.join(" ")}
          style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
        />
        {/* tip dot */}
        <circle
          cx={width}
          cy={tipY}
          r={4.5}
          fill={stroke}
          style={{ filter: `drop-shadow(0 0 8px ${stroke})` }}
        />
      </svg>
      {/* Price capsule — horizontal, anchored to tip */}
      <div
        className="sz-pill sz-display pointer-events-none absolute flex items-center px-2.5 py-1 text-base"
        style={{
          right: 16,
          top: tipY,
          transform: "translateY(-50%)",
          color: "var(--sz-green)",
          transition: "top 800ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <span className="sz-glow-green">{currentPrice.toFixed(1)}¢</span>
      </div>
    </div>
  );
}