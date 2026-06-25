import { useEffect, useRef, useState, useCallback } from "react";
import {
  multiplier,
  formatMultiplier,
  multiplierHeat,
  multiplierTextColor,
  applyLeverage,
} from "./lib/multiplier";
import type { PinpointPosition } from "./hooks/usePinpointSession";

// ── Layout constants (in CSS pixels) ──────────────────────────────────────
const ROWS = 11; // ±5¢ around center
const HISTORY_FRAC = 0.34; // left chart takes ~34% of width
// Defaults used until the first ResizeObserver tick lands.
const DEFAULT_ROW_H = 50;
const DEFAULT_ROW_GAP = 5;
const DEFAULT_TOTAL_H = ROWS * DEFAULT_ROW_H + (ROWS - 1) * DEFAULT_ROW_GAP;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Derive runtime cell geometry from the container size. Keeps the
 *  "1 column per second" time semantics — pitchX just scales visually. */
function deriveLayout(containerH: number) {
  const availH = Math.max(360, containerH);
  const rowGap = availH < 520 ? 4 : availH < 680 ? 5 : 6;
  const rowH = clamp(Math.floor((availH - (ROWS - 1) * rowGap) / ROWS), 36, 68);
  const colGap = rowH < 44 ? 4 : 6;
  const colW = clamp(Math.round(rowH * 1.55), 60, 108);
  const totalH = ROWS * rowH + (ROWS - 1) * rowGap;
  return {
    rowH,
    rowGap,
    colW,
    colGap,
    pitchX: colW + colGap,
    pitchY: rowH + rowGap,
    totalH,
    pxPerMs: (colW + colGap) / 1000,
  };
}
const DYING_MS = 150; // non-hit cells in an expired column vanish quickly
const HIT_FLASH_MS = 650; // hit cell lingers and pulses
const SETTLE_MS = 750;
const POP_MS = 1400;
const WIN_BURST_MS = 1100;
const STAR_LIFE_MS = 950;

interface Props {
  currentPrice: number;
  history: number[];
  positions: PinpointPosition[];
  betSize: number;
  leverage: number;
  onPlace: (cellCenter: number, distanceCents: number, secondsAhead: number, mult: number) => void;
  onCancel?: (positionId: string) => void;
  recentHits: { id: string; at: number }[];
  /** Position ids the parent has just account-liquidated → spawn red burst. */
  recentLiquidations?: { id: string; at: number }[];
  /** Session frozen by liquidation — blocks new bets. */
  frozen?: boolean;
  /** 0–1 (or higher); used for the frozen overlay readout. */
  mmr?: number;
}

type Effect =
  | {
      kind: "win";
      startAt: number;
      p: PinpointPosition;
      payoutNet: number;
      _popped?: boolean;
    }
  | {
      kind: "lose";
      startAt: number;
      p: PinpointPosition;
    }
  | {
      kind: "liquidate";
      startAt: number;
      p: PinpointPosition;
      _popped?: boolean;
    };

type DyingCell = {
  startAt: number;
  expirySec: number;
  row: number;
  mult: number;
};

type HitFlashCell = {
  startAt: number;
  expirySec: number;
  row: number;
  mult: number;
};

type StarParticle = {
  startAt: number;
  x: number;
  y: number;
  vx: number; // px/ms
  vy: number; // px/ms
  size: number;
  hue: "gold" | "green";
  rot: number;
  vrot: number;
};

type ProfitPop = {
  startAt: number;
  amount: number;
  baseX: number;
  baseY: number;
};

export function Grid({
  currentPrice,
  history,
  positions,
  betSize,
  leverage,
  onPlace,
  onCancel,
  recentHits,
  recentLiquidations,
  frozen = false,
  mmr = 0,
}: Props) {
  // Keep frozen flag readable from event handlers without re-binding.
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cssSize, setCssSize] = useState({ w: 0, h: DEFAULT_TOTAL_H });
  // Latest derived geometry (kept in a ref so RAF / event handlers
  // read the current values without re-binding).
  const layoutRef = useRef(deriveLayout(DEFAULT_TOTAL_H));

  // Latest values readable from RAF without re-binding.
  const priceRef = useRef(currentPrice);
  priceRef.current = currentPrice;
  const historyRef = useRef(history);
  historyRef.current = history;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const betSizeRef = useRef(betSize);
  betSizeRef.current = betSize;
  const leverageRef = useRef(leverage);
  leverageRef.current = leverage;

  // Smoothed Y center (price)
  const centerRef = useRef(Math.round(currentPrice));
  // Effects/animations
  const effectsRef = useRef<Map<string, Effect>>(new Map());
  const dyingRef = useRef<DyingCell[]>([]);
  const hitFlashRef = useRef<HitFlashCell[]>([]);
  const starsRef = useRef<StarParticle[]>([]);
  const popsRef = useRef<ProfitPop[]>([]);
  // Mouse hover
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  // Timestamp of the most recently rendered RAF frame; used to compensate
  // for the cells' continuous leftward drift when hit-testing clicks/hover.
  const lastRenderNowRef = useRef<number>(Date.now());
  // Cell rect cache (built each frame for hit-testing)
  const futureCellsRef = useRef<
    Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      expirySec: number;
      row: number;
      mult: number;
      secs: number;
      dist: number;
      cellCenter: number;
    }>
  >([]);

  // ── Detect parent settlements: positions that vanish → push Effect ─────
  const prevPositionsRef = useRef<Map<string, PinpointPosition>>(new Map());
  const hitIdsRef = useRef<Set<string>>(new Set());
  hitIdsRef.current = new Set(recentHits.map((h) => h.id));
  const liqIdsRef = useRef<Set<string>>(new Set());
  liqIdsRef.current = new Set((recentLiquidations ?? []).map((h) => h.id));

  useEffect(() => {
    const currIds = new Set(positions.map((p) => p.id));
    const now = Date.now();
    for (const [id, prevP] of prevPositionsRef.current) {
      if (!currIds.has(id) && !effectsRef.current.has(id)) {
        const won = hitIdsRef.current.has(id);
        const liq = liqIdsRef.current.has(id);
        const lev = prevP.leverage ?? 1;
        if (won) {
          const payoutNet = prevP.stake * prevP.mult * lev - prevP.stake;
          effectsRef.current.set(id, {
            kind: "win",
            startAt: now,
            p: prevP,
            payoutNet,
          });
        } else if (liq) {
          effectsRef.current.set(id, { kind: "liquidate", startAt: now, p: prevP });
        } else {
          effectsRef.current.set(id, { kind: "lose", startAt: now, p: prevP });
        }
      }
    }
    const next = new Map<string, PinpointPosition>();
    for (const p of positions) next.set(p.id, p);
    prevPositionsRef.current = next;
  }, [positions, recentHits, recentLiquidations]);

  // ── Resize observer ───────────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setCssSize({
        w: Math.max(320, Math.floor(r.width)),
        h: Math.max(320, Math.floor(r.height)),
      });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setCssSize({
      w: Math.max(320, Math.floor(r.width)),
      h: Math.max(320, Math.floor(r.height)),
    });
    return () => ro.disconnect();
  }, []);

  // ── RAF render loop ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastT = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(64, t - lastT);
      lastT = t;
      const W = cssSize.w;
      const H = cssSize.h;
      // Recompute geometry from the current container height each frame
      // and publish via ref for event handlers to read.
      const layout = deriveLayout(H);
      layoutRef.current = layout;
      const { rowH: ROW_H, colW: COL_W, pitchX: PITCH_X, pitchY: PITCH_Y, pxPerMs: PX_PER_MS, totalH: TOTAL_H } = layout;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(W * dpr)) canvas.width = Math.round(W * dpr);
      if (canvas.height !== Math.round(H * dpr)) canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const now = Date.now();
      lastRenderNowRef.current = now;
      const HISTORY_W = Math.round(W * HISTORY_FRAC);
      const NOW_X = HISTORY_W;
      const yCenter = H / 2;

      // Smooth center re-centering when price drifts more than ±4¢
      const targetCenter = Math.round(priceRef.current);
      if (Math.abs(priceRef.current - centerRef.current) > 4) {
        centerRef.current = targetCenter;
      }
      const center = centerRef.current;

      const yFor = (p: number) => {
        const r = 5 - (p - center);
        return r * PITCH_Y + ROW_H / 2;
      };
      const xForExpiry = (expiryMs: number) =>
        NOW_X + (expiryMs - now) * PX_PER_MS;

      // ── 1. Background ────────────────────────────────────────────────
      ctx.fillStyle = "#0d1a10"; // LCD screen wash
      ctx.fillRect(0, 0, W, H);
      // LCD pixel-grid texture (subtle 3px dots)
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.5, W * 0.8);
      grad.addColorStop(0, "rgba(155,255,111,0.06)");
      grad.addColorStop(1, "rgba(155,255,111,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Horizontal price guides at every 2¢
      ctx.font = '14px "VT323","Silkscreen",monospace';
      ctx.textBaseline = "alphabetic";
      for (let i = -4; i <= 4; i += 2) {
        const py = yFor(center + i);
        ctx.strokeStyle = "rgba(155,255,111,0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(W, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(155,255,111,0.7)";
        ctx.fillText(`${center + i}¢`, 4, py - 3);
      }

      // ── 2. Price history line (left of NOW_X) ───────────────────────
      const hist = historyRef.current;
      const N = hist.length;
      if (N >= 2) {
        const clamp = (p: number) => Math.max(center - 5.5, Math.min(center + 5.5, p));
        const first = hist[0];
        const last = hist[N - 1];
        const up = last >= first;
        const stroke = up ? "#2dd76a" : "#ff3b1f";
        const glow = up ? "rgba(45,215,106,0.5)" : "rgba(255,59,31,0.5)";

        // Area fill
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let i = 0; i < N; i++) {
          const px = (i / (N - 1)) * HISTORY_W;
          const py = yFor(clamp(hist[i]));
          ctx.lineTo(px, py);
        }
        ctx.lineTo(HISTORY_W, H);
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, 0, 0, H);
        ag.addColorStop(0, up ? "rgba(45,215,106,0.18)" : "rgba(255,59,31,0.18)");
        ag.addColorStop(1, up ? "rgba(45,215,106,0)" : "rgba(255,59,31,0)");
        ctx.fillStyle = ag;
        ctx.fill();

        // Stroke
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const px = (i / (N - 1)) * HISTORY_W;
          const py = yFor(clamp(hist[i]));
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.shadowColor = glow;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tip dot at NOW_X
        const tipY = yFor(clamp(priceRef.current));
        ctx.beginPath();
        ctx.arc(HISTORY_W, tipY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = stroke;
        ctx.shadowColor = stroke;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Price pill: always anchored a full row ABOVE the K-line tip so it
        // can never collide with the hit-flash callout that lives on the
        // price row. A short leader line keeps the link to the tip clear.
        const pillW = 70;
        const pillH = 24;
        let pillCenterY = tipY - PITCH_Y;
        if (pillCenterY - pillH / 2 < 2) {
          // Near the top of the canvas — flip below the tip instead.
          pillCenterY = tipY + PITCH_Y;
        }
        const pillX = HISTORY_W - pillW - 14;
        const pillY = pillCenterY - pillH / 2;
        roundRect(ctx, pillX, pillY, pillW, pillH, 12);
        const pg = ctx.createLinearGradient(0, pillY, 0, pillY + pillH);
        pg.addColorStop(0, up ? "#ffd400" : "#ff3b1f");
        pg.addColorStop(1, up ? "#ffb800" : "#c41f0a");
        ctx.fillStyle = pg;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(14,24,18,0.85)";
        ctx.stroke();
        ctx.fillStyle = "#0e1812";
        ctx.font = '800 13px "Silkscreen","VT323",monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${priceRef.current.toFixed(1)}¢`, pillX + pillW / 2, pillY + pillH / 2);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";

        // Leader line from the tip dot to the displaced pill.
        ctx.save();
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(HISTORY_W, tipY);
        ctx.lineTo(pillX + pillW, pillY + pillH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // ── 3. NOW divider ─────────────────────────────────────────────
      const ndg = ctx.createLinearGradient(0, 0, 0, H);
      ndg.addColorStop(0, "rgba(255,59,31,0)");
      ndg.addColorStop(0.12, "rgba(255,59,31,0.55)");
      ndg.addColorStop(0.88, "rgba(255,59,31,0.55)");
      ndg.addColorStop(1, "rgba(255,59,31,0)");
      ctx.fillStyle = ndg;
      ctx.fillRect(NOW_X - 0.5, 0, 1, H);

      // ── 4. Future grid cells ───────────────────────────────────────
      // Determine visible expirySec range
      const nowSec = now / 1000;

      // First column expiry = ceil(now/1000) — that one is currently sliding toward NOW_X.
      const firstSec = Math.ceil(nowSec);
      // How many columns fit?
      const futureW = W - NOW_X;
      const visibleCols = Math.ceil(futureW / PITCH_X) + 2;

      const positionByKey = new Map<string, PinpointPosition>();
      for (const p of positionsRef.current) {
        const k = `${Math.round(p.targetAt / 1000)}:${Math.round(p.cellCenter)}`;
        positionByKey.set(k, p);
      }

      // Build future cells; track for hit-test
      const futureCells: typeof futureCellsRef.current = [];
      const hoverRaw = hoverRef.current;
      // No drift compensation needed for hover here — hover is sampled in the
      // same frame's `now`. (Click uses a later `now` and compensates below.)
      const hover = hoverRaw;
      for (let k = 0; k < visibleCols; k++) {
        const expirySec = firstSec + k;
        const expiryT = expirySec * 1000;
        const cx = xForExpiry(expiryT); // center x for column
        if (cx + COL_W / 2 < NOW_X - 1) continue; // already past NOW
        if (cx - COL_W / 2 > W) break;
        const secsAhead = Math.max(1, expirySec - Math.floor(nowSec));
        for (let r = 0; r < ROWS; r++) {
          const dist = 5 - r;
          const cellCenter = center + dist;
          const mlt = multiplier(Math.abs(dist), secsAhead);
          const cy = yFor(cellCenter);
          const x = cx - COL_W / 2;
          const y = cy - ROW_H / 2;
          const posKey = `${expirySec}:${Math.round(cellCenter)}`;
          const bet = positionByKey.get(posKey);

          // Hover state
          const isHover =
            !!hover &&
            hover.x >= x &&
            hover.x <= x + COL_W &&
            hover.y >= y &&
            hover.y <= y + ROW_H;

          if (bet) {
            drawBetCell(ctx, x, y, COL_W, ROW_H, bet, isHover);
          } else {
            drawIdleCell(ctx, x, y, COL_W, ROW_H, mlt, isHover);
          }

          futureCells.push({
            x,
            y,
            w: COL_W,
            h: ROW_H,
            expirySec,
            row: r,
            mult: mlt,
            secs: secsAhead,
            dist: Math.abs(dist),
            cellCenter,
          });
        }
      }
      futureCellsRef.current = futureCells;

      // ── 5. Spawn dying cells for columns whose expirySec just crossed NOW ──
      const prevFirst = prevFirstSecRef.current;
      if (prevFirst != null && prevFirst < firstSec) {
        for (let s = prevFirst; s < firstSec; s++) {
          // Determine the row the K-line tip hit at expiry: row whose
          // cellCenter == round(currentPrice).
          const hitCenter = Math.round(priceRef.current);
          const hitDist = hitCenter - center;
          const hitRow = 5 - hitDist; // may be outside [0,10] if price drifted far
          // Find any bet (now settled into effectsRef) at this column.
          const betCentersThisCol = new Set<number>();
          effectsRef.current.forEach((eff) => {
            if (Math.round(eff.p.targetAt / 1000) === s) {
              betCentersThisCol.add(Math.round(eff.p.cellCenter));
            }
          });
          for (let r = 0; r < ROWS; r++) {
            const dist = 5 - r;
            const cellCenter = center + dist;
            const mlt = multiplier(Math.abs(dist), 1);
            // Skip rows that are settled bet cells — their win/lose effect draws them.
            if (betCentersThisCol.has(Math.round(cellCenter))) continue;
            // Hit row that is NOT a bet → flash it brightly instead of dying.
            if (r === hitRow) {
              hitFlashRef.current.push({
                startAt: now,
                expirySec: s,
                row: r,
                mult: mlt,
              });
              continue;
            }
            dyingRef.current.push({
              startAt: now,
              expirySec: s,
              row: r,
              mult: mlt,
            });
          }
        }
      }
      prevFirstSecRef.current = firstSec;

      // ── 6. Render dying cells (pinned at NOW line, fast fade) ──────
      dyingRef.current = dyingRef.current.filter((d) => {
        const age = now - d.startAt;
        if (age > DYING_MS) return false;
        const p = age / DYING_MS;
        const alpha = 1 - p;
        const scale = 1 - p * 0.35;
        const dist = 5 - d.row;
        const cy = yFor(center + dist);
        const x = NOW_X - COL_W / 2;
        const y = cy - ROW_H / 2;
        ctx.save();
        ctx.globalAlpha = alpha;
        const cx = x + COL_W / 2;
        const cyy = y + ROW_H / 2;
        ctx.translate(cx, cyy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cyy);
        drawIdleCell(ctx, x, y, COL_W, ROW_H, d.mult, false);
        ctx.restore();
        return true;
      });

      // ── 6b. Hit-flash cells (non-bet hit row, gold pulse) ─────────
      hitFlashRef.current = hitFlashRef.current.filter((hf) => {
        const age = now - hf.startAt;
        if (age > HIT_FLASH_MS) return false;
        const t = age / HIT_FLASH_MS;
        const dist = 5 - hf.row;
        const cy = yFor(center + dist);
        const x = NOW_X - COL_W / 2;
        const y = cy - ROW_H / 2;
        drawHitFlash(ctx, x, y, COL_W, ROW_H, t, hf.mult);
        return true;
      });

      // ── 7. Render settlement effects (bet cells: win/lose) ─────────
      const toDelete: string[] = [];
      effectsRef.current.forEach((eff, id) => {
        const age = now - eff.startAt;
        const totalMs =
          eff.kind === "win"
            ? WIN_BURST_MS
            : eff.kind === "liquidate"
              ? HIT_FLASH_MS
              : SETTLE_MS;
        if (age > totalMs) {
          toDelete.push(id);
          return;
        }
        const t01 = Math.min(1, age / totalMs);
        const p = eff.p;
        // Keep bet cell pinned at the NOW line so the player can see the
        // exact strike position before the burst. Liquidations also pin
        // there — they happen mid-flight but the burst belongs on screen.
        const cx = NOW_X;
        const cy = yFor(p.cellCenter);
        const x = cx - COL_W / 2;
        const y = cy - ROW_H / 2;

        if (eff.kind === "win") {
          drawWinBurst(ctx, x, y, COL_W, ROW_H, t01, p, eff.payoutNet);
          // Spawn profit pop + star burst once
          if (!eff._popped) {
            eff._popped = true;
            popsRef.current.push({
              startAt: now,
              amount: eff.payoutNet,
              baseX: cx,
              baseY: cy - ROW_H / 2,
            });
            spawnStars(starsRef.current, cx, cy, now);
          }
        } else if (eff.kind === "liquidate") {
          drawLiquidateBurst(ctx, x, y, COL_W, ROW_H, t01, p);
          if (!eff._popped) {
            eff._popped = true;
            popsRef.current.push({
              startAt: now,
              amount: -p.stake,
              baseX: cx,
              baseY: cy - ROW_H / 2,
            });
          }
        } else {
          drawLoseFade(ctx, x, y, COL_W, ROW_H, t01, p);
        }
      });
      for (const id of toDelete) effectsRef.current.delete(id);

      // ── 8b. Star particles ───────────────────────────────────────
      starsRef.current = starsRef.current.filter((s) => {
        const age = now - s.startAt;
        if (age > STAR_LIFE_MS) return false;
        // physics
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 0.0009 * dt; // gentle gravity
        s.rot += s.vrot * dt;
        drawStar(ctx, s, age / STAR_LIFE_MS);
        return true;
      });

      // ── 8. Profit pops (floating +$xxx) ────────────────────────────
      popsRef.current = popsRef.current.filter((pop) => {
        const age = now - pop.startAt;
        if (age > POP_MS) return false;
        drawProfitPop(ctx, pop, age / POP_MS);
        return true;
      });

      // ── 9. Top countdown badge (drawn last over future area) ──────
      drawCountdownBadge(ctx, NOW_X + 6 + futureW / 2, 4, Math.ceil(60 - (now / 1000) % 60));

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cssSize]);

  const prevFirstSecRef = useRef<number | null>(null);

  // ── Mouse handlers ────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - r.left;
    const y = e.clientY - r.top;
    // Same drift compensation as onClick: align hover with the cell that will
    // be hit if the user clicks now.
    const dx = Math.max(0, (Date.now() - lastRenderNowRef.current) * layoutRef.current.pxPerMs);
    hoverRef.current = { x: rawX + dx, y };
  }, []);
  const onMouseLeave = useCallback(() => {
    hoverRef.current = null;
  }, []);
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Frozen session: block new bets. Cancellation also blocked because
      // cancel events still affect the liquidation queue.
      if (frozenRef.current) return;
      const r = e.currentTarget.getBoundingClientRect();
      const rawX = e.clientX - r.left;
      const y = e.clientY - r.top;
      // Cells drift LEFT at PX_PER_MS between RAF frames. The user aimed at
      // what they SAW (last painted frame); by the time this click handler
      // runs, futureCellsRef may already reflect a newer, further-left frame,
      // so the cursor sits over the cell that was visually to the RIGHT of
      // the target. Compensate by shifting the click x rightward by the
      // distance the cells have drifted since the last rendered frame.
      const dx = Math.max(0, (Date.now() - lastRenderNowRef.current) * layoutRef.current.pxPerMs);
      const x = rawX + dx;
      const cells = futureCellsRef.current;
      for (const c of cells) {
        if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
          // Existing bet on that cell?
          const posKey = `${c.expirySec}:${Math.round(c.cellCenter)}`;
          const existing = positionsRef.current.find(
            (p) =>
              `${Math.round(p.targetAt / 1000)}:${Math.round(p.cellCenter)}` === posKey
          );
          if (existing && onCancel) {
            onCancel(existing.id);
          } else if (!existing) {
            onPlace(c.cellCenter, c.dist, c.secs, c.mult);
          }
          return;
        }
      }
    },
    [onPlace, onCancel]
  );

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: frozen ? "not-allowed" : "crosshair",
        }}
      />
      {frozen && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="pp-stencil px-5 py-3 text-center"
            style={{
              color: "#fff",
              background: "var(--pp-red)",
              border: "2px solid #000",
              boxShadow: "4px 4px 0 #000",
              borderRadius: 6,
            }}
          >
            <div className="text-xs">SESSION FROZEN</div>
            <div className="pp-num mt-1 text-[10px]" style={{ color: "#fff" }}>
              MMR {(mmr * 100).toFixed(0)}% · NO NEW BETS
            </div>
          </div>
        </div>
      )}
      {/* Hidden helpers used at type level */}
      <span hidden>{formatMultiplier(applyLeverage(1, leverage))}</span>
      <span hidden style={{ color: multiplierTextColor(1), background: multiplierHeat(1) }} />
      <span hidden>{betSize}</span>
    </div>
  );
}

// ── Drawing helpers ──────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawIdleCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  mult: number,
  hover: boolean
) {
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = multiplierHeat(mult);
  ctx.fill();
  ctx.lineWidth = 1;
  if (hover) {
    ctx.strokeStyle = "#ffd400";
    ctx.shadowColor = "rgba(255,212,0,0.7)";
    ctx.shadowBlur = 12;
  } else {
    ctx.strokeStyle = "rgba(255,107,26,0.35)";
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  // mult text
  ctx.fillStyle = multiplierTextColor(mult);
  ctx.font = '700 13px "JetBrains Mono",monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(formatMultiplier(mult), x + w / 2, y + h / 2);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function drawBetCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  p: PinpointPosition,
  hover: boolean
) {
  // Solid bright orange bet cell with 3-line text
  roundRect(ctx, x, y, w, h, 8);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#ff5a36");
  g.addColorStop(1, "#ff3b1f");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,90,54,0.55)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = hover ? "#fff" : "#ffd400";
  ctx.stroke();

  const lev = p.leverage ?? 1;
  const payoutNet = p.stake * p.mult * lev - p.stake;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // top line: stake (×lev)
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = '700 9px "JetBrains Mono",monospace';
  ctx.fillText(`$${p.stake}${lev > 1 ? `×${lev}` : ""}`, x + w / 2, y + 10);
  // mid line: mult
  ctx.fillStyle = "#fff";
  ctx.font = '700 13px "Bungee","Anton",sans-serif';
  ctx.fillText(formatMultiplier(applyLeverage(p.mult, lev)), x + w / 2, y + h / 2);
  // bottom line: +$payout
  ctx.fillStyle = "#2dd76a";
  ctx.font = '700 9px "JetBrains Mono",monospace';
  ctx.fillText(`+$${payoutNet.toFixed(0)}`, x + w / 2, y + h - 9);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function drawWinBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number, // 0..1 over WIN_BURST_MS
  _p: PinpointPosition,
  _payoutNet: number
) {
  // Scale: 0.9 → 1.45 → 1
  const scale = t < 0.18
    ? 0.9 + (t / 0.18) * 0.55
    : t < 0.55
      ? 1.45 - ((t - 0.18) / 0.37) * 0.3
      : 1.15 - ((t - 0.55) / 0.45) * 0.15;
  const alpha = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
  const brightness = t < 0.18 ? 1 + (t / 0.18) * 1.4 : Math.max(1, 2.4 - (t - 0.18) * 2.5);

  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  // Body — bright gold-orange gradient
  roundRect(ctx, x, y, w, h, 8);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#fff2b0");
  g.addColorStop(0.55, "#ffd400");
  g.addColorStop(1, "#ff3b1f");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,212,0,0.85)";
  ctx.shadowBlur = 30 * brightness;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.restore();

  // Expanding rings (un-scaled)
  for (let i = 0; i < 2; i++) {
    const ringT = Math.min(1, Math.max(0, t * (1 + i * 0.15) - i * 0.18));
    if (ringT <= 0 || ringT >= 1) continue;
    const rScale = 0.4 + ringT * 2.2;
    const a = 0.9 * (1 - ringT);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cx, cy);
    ctx.scale(rScale, rScale);
    ctx.translate(-cx, -cy);
    roundRect(ctx, x, y, w, h, 12);
    ctx.lineWidth = 3 - ringT * 2;
    ctx.strokeStyle = i === 0 ? "#ffd400" : "#ff5a36";
    ctx.stroke();
    ctx.restore();
  }
}

function drawLoseFade(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  _p: PinpointPosition
) {
  const alpha = 1 - t;
  const scale = 1 - t * 0.22;
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  roundRect(ctx, x, y, w, h, 8);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  // morph orange → dark red as t grows
  const r = Math.round(255 - t * 175);
  const gg = Math.round(138 - t * 108);
  const b = Math.round(61 - t * 36);
  g.addColorStop(0, `rgba(${r},${gg},${b},0.95)`);
  g.addColorStop(1, `rgba(${Math.round(r * 0.6)},${Math.round(gg * 0.3)},${Math.round(b * 0.4)},0.9)`);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(255,80,80,${0.6 * alpha})`;
  ctx.stroke();
  ctx.restore();
}

function drawProfitPop(
  ctx: CanvasRenderingContext2D,
  pop: ProfitPop,
  t: number
) {
  // 0..0.18 fade-in + pop, then drift up
  const dy =
    t < 0.18
      ? 10 - (t / 0.18) * 18
      : t < 0.4
        ? -8 - ((t - 0.18) / 0.22) * 20
        : -28 - ((t - 0.4) / 0.6) * 52;
  const scale =
    t < 0.18 ? 0.7 + (t / 0.18) * 0.45 : t < 0.4 ? 1.15 - ((t - 0.18) / 0.22) * 0.15 : 1 - (t - 0.4) * 0.08;
  const alpha =
    t < 0.18 ? t / 0.18 : t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;

  const cx = pop.baseX;
  const cy = pop.baseY + dy;
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const negative = pop.amount < 0;
  ctx.fillStyle = negative ? "#ff3b1f" : "#2dd76a";
  ctx.shadowColor = negative ? "rgba(255,59,31,0.9)" : "rgba(45,215,106,0.9)";
  ctx.shadowBlur = 22;
  ctx.font = '800 30px "Bungee","Anton",sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const sign = negative ? "−" : "+";
  const mag = Math.abs(pop.amount).toFixed(0);
  ctx.fillText(`${sign}$${mag}${negative ? "  LIQ" : ""}`, 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawLiquidateBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  _p: PinpointPosition
) {
  // Sharp red impact: scale punch 0..0.18, then fade quickly.
  const scale =
    t < 0.18 ? 0.95 + (t / 0.18) * 0.28 : t < 0.5 ? 1.23 - ((t - 0.18) / 0.32) * 0.18 : 1.05;
  const alpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  roundRect(ctx, x, y, w, h, 8);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const flash = Math.min(1, t / 0.18);
  g.addColorStop(0, flash < 1 ? "#ffffff" : "#ff5a36");
  g.addColorStop(1, flash < 1 ? "#ffd2c8" : "#5a0a08");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,59,31,0.9)";
  ctx.shadowBlur = 28 * (1 - t * 0.5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff3b1f";
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = '800 11px "Bungee","Anton",sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("LIQ", cx, cy);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.restore();

  // Expanding red ring
  const ringT = Math.min(1, t / 0.55);
  if (ringT > 0 && ringT < 1) {
    ctx.save();
    ctx.globalAlpha = 0.85 * (1 - ringT);
    const rScale = 0.6 + ringT * 1.8;
    ctx.translate(cx, cy);
    ctx.scale(rScale, rScale);
    ctx.translate(-cx, -cy);
    roundRect(ctx, x, y, w, h, 10);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff3b1f";
    ctx.stroke();
    ctx.restore();
  }
}

function drawCountdownBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  secs: number
) {
  const text = `0:${String(secs).padStart(2, "0")}`;
  ctx.font = '700 14px "Bungee","Anton",sans-serif';
  const tw = ctx.measureText(text).width;
  const padX = 12;
  const w = tw + padX * 2;
  const h = 24;
  const x = cx - w / 2;
  const y = topY;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = "rgba(20,18,16,0.95)";
  ctx.shadowColor = "rgba(255,212,0,0.5)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#ffd400";
  ctx.stroke();
  ctx.fillStyle = "#ffd400";
  ctx.shadowColor = "rgba(255,212,0,0.9)";
  ctx.shadowBlur = 6;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, y + h / 2);
  ctx.shadowBlur = 0;
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

// ── Hit flash (non-bet K-line strike) ──────────────────────────────────
function drawHitFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  mult: number
) {
  // Phase 1 (0..0.18): scale punch + white→gold
  // Phase 2 (0.18..0.7): hold + pulsing ring
  // Phase 3 (0.7..1): fade out
  const scale =
    t < 0.18 ? 0.95 + (t / 0.18) * 0.23 : t < 0.55 ? 1.18 - ((t - 0.18) / 0.37) * 0.13 : 1.05;
  const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  roundRect(ctx, x, y, w, h, 8);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  // White-hot at start, settle to gold
  const fadeToGold = Math.min(1, t / 0.25);
  g.addColorStop(0, fadeToGold < 1 ? "#ffffff" : "#fff2b0");
  g.addColorStop(1, fadeToGold < 1 ? "#ffe066" : "#ffd400");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,212,0,0.85)";
  ctx.shadowBlur = 24 * (1 - t * 0.5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffd400";
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.font = '700 13px "JetBrains Mono",monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(formatMultiplier(mult), cx, cy);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.restore();

  // Expanding gold ring
  const ringT = Math.min(1, t / 0.6);
  if (ringT > 0 && ringT < 1) {
    ctx.save();
    ctx.globalAlpha = 0.85 * (1 - ringT);
    const rScale = 0.6 + ringT * 1.6;
    ctx.translate(cx, cy);
    ctx.scale(rScale, rScale);
    ctx.translate(-cx, -cy);
    roundRect(ctx, x, y, w, h, 10);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffd400";
    ctx.stroke();
    ctx.restore();
  }
}

// ── Star particles ─────────────────────────────────────────────────────
function spawnStars(
  store: StarParticle[],
  cx: number,
  cy: number,
  now: number
) {
  // Main bright stars
  const big = 7;
  for (let i = 0; i < big; i++) {
    const a = (Math.PI * 2 * i) / big + Math.random() * 0.7;
    const speed = 0.18 + Math.random() * 0.14; // px/ms
    store.push({
      startAt: now,
      x: cx + Math.cos(a) * 4,
      y: cy + Math.sin(a) * 4,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 0.05,
      size: 5 + Math.random() * 3,
      hue: Math.random() < 0.55 ? "gold" : "green",
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.012,
    });
  }
  // Smaller sparkles
  const small = 14;
  for (let i = 0; i < small; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = 0.08 + Math.random() * 0.22;
    store.push({
      startAt: now,
      x: cx,
      y: cy,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 0.04,
      size: 2 + Math.random() * 2,
      hue: Math.random() < 0.5 ? "gold" : "green",
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.02,
    });
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  s: StarParticle,
  t: number
) {
  const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
  const color = s.hue === "gold" ? "#ffd400" : "#2dd76a";
  const glow = s.hue === "gold" ? "rgba(255,212,0,0.95)" : "rgba(45,215,106,0.9)";
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rot);
  ctx.fillStyle = color;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10;
  // 4-point star = two crossed thin diamonds
  const r = s.size;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.35, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.35, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-r, 0);
  ctx.lineTo(0, r * 0.35);
  ctx.lineTo(r, 0);
  ctx.lineTo(0, -r * 0.35);
  ctx.closePath();
  ctx.fill();
  // Bright core
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}