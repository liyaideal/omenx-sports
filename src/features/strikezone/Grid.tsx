import { useEffect, useRef, useState, useCallback } from "react";
import {
  multiplier,
  formatMultiplier,
  multiplierHeat,
  multiplierTextColor,
  applyLeverage,
} from "./lib/multiplier";
import type { StrikezonePosition } from "./hooks/useStrikezoneSession";

// ── Layout constants (in CSS pixels) ──────────────────────────────────────
const ROWS = 11; // ±5¢ around center
const ROW_H = 50;
const ROW_GAP = 5;
const COL_W = 78;
const COL_GAP = 6;
const PITCH_X = COL_W + COL_GAP;
const PITCH_Y = ROW_H + ROW_GAP;
const TOTAL_H = ROWS * ROW_H + (ROWS - 1) * ROW_GAP;
const HISTORY_FRAC = 0.34; // left chart takes ~34% of width
const PX_PER_MS = PITCH_X / 1000; // one column per second
const DYING_MS = 150; // non-hit cells in an expired column vanish quickly
const HIT_FLASH_MS = 650; // hit cell lingers and pulses
const SETTLE_MS = 750;
const POP_MS = 1400;
const WIN_BURST_MS = 1100;
const STAR_LIFE_MS = 950;

interface Props {
  currentPrice: number;
  history: number[];
  positions: StrikezonePosition[];
  betSize: number;
  leverage: number;
  onPlace: (cellCenter: number, distanceCents: number, secondsAhead: number, mult: number) => void;
  onCancel?: (positionId: string) => void;
  onLiquidate?: (positionId: string, atPrice: number) => void;
  recentHits: { id: string; at: number }[];
}

type Effect =
  | {
      kind: "win";
      startAt: number;
      p: StrikezonePosition;
      payoutNet: number;
      _popped?: boolean;
    }
  | {
      kind: "lose";
      startAt: number;
      p: StrikezonePosition;
    }
  | {
      kind: "liquidate";
      startAt: number;
      p: StrikezonePosition;
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
  onLiquidate,
  recentHits,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cssSize, setCssSize] = useState({ w: 0, h: TOTAL_H });

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
  // Track which positions we've already liquidated locally (avoid double-fire
  // before parent state propagates).
  const liquidatedLocalRef = useRef<Set<string>>(new Set());
  // Mouse hover
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
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
  const prevPositionsRef = useRef<Map<string, StrikezonePosition>>(new Map());
  const hitIdsRef = useRef<Set<string>>(new Set());
  hitIdsRef.current = new Set(recentHits.map((h) => h.id));

  useEffect(() => {
    const currIds = new Set(positions.map((p) => p.id));
    const now = Date.now();
    for (const [id, prevP] of prevPositionsRef.current) {
      if (!currIds.has(id) && !effectsRef.current.has(id)) {
        const won = hitIdsRef.current.has(id);
        const lev = prevP.leverage ?? 1;
        if (won) {
          const payoutNet = prevP.stake * prevP.mult * lev - prevP.stake;
          effectsRef.current.set(id, {
            kind: "win",
            startAt: now,
            p: prevP,
            payoutNet,
          });
        } else {
          effectsRef.current.set(id, { kind: "lose", startAt: now, p: prevP });
        }
      }
    }
    const next = new Map<string, StrikezonePosition>();
    for (const p of positions) next.set(p.id, p);
    prevPositionsRef.current = next;
    // Clean liquidatedLocal set of ids that are no longer tracked anywhere.
    for (const id of liquidatedLocalRef.current) {
      if (!currIds.has(id) && !effectsRef.current.has(id)) {
        liquidatedLocalRef.current.delete(id);
      }
    }
  }, [positions, recentHits]);

  // ── Resize observer ───────────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setCssSize({ w: Math.max(320, Math.floor(r.width)), h: TOTAL_H });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setCssSize({ w: Math.max(320, Math.floor(r.width)), h: TOTAL_H });
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
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(W * dpr)) canvas.width = Math.round(W * dpr);
      if (canvas.height !== Math.round(H * dpr)) canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const now = Date.now();
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
      ctx.fillStyle = "#0a0a1f";
      ctx.fillRect(0, 0, W, H);
      // subtle radial vignette glow
      const grad = ctx.createRadialGradient(W * 0.85, H * 0.85, 0, W * 0.85, H * 0.85, W * 0.7);
      grad.addColorStop(0, "rgba(255,107,26,0.06)");
      grad.addColorStop(1, "rgba(255,107,26,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Horizontal price guides at every 2¢
      ctx.font = '10px "Chakra Petch", monospace';
      ctx.textBaseline = "alphabetic";
      for (let i = -4; i <= 4; i += 2) {
        const py = yFor(center + i);
        ctx.strokeStyle = "rgba(0,240,255,0.07)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(W, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(0,240,255,0.55)";
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
        const stroke = up ? "#00ff9d" : "#ff2d4a";
        const glow = up ? "rgba(0,255,157,0.6)" : "rgba(255,45,74,0.6)";

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
        ag.addColorStop(0, up ? "rgba(0,255,157,0.18)" : "rgba(255,45,74,0.18)");
        ag.addColorStop(1, up ? "rgba(0,255,157,0)" : "rgba(255,45,74,0)");
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

        // Price pill (anchored to tip, drifts left of NOW_X)
        const pillW = 64;
        const pillH = 24;
        const pillX = HISTORY_W - pillW - 12;
        const pillY = tipY - pillH / 2;
        roundRect(ctx, pillX, pillY, pillW, pillH, 12);
        const pg = ctx.createLinearGradient(0, pillY, 0, pillY + pillH);
        pg.addColorStop(0, up ? "#0a3a26" : "#3a0a14");
        pg.addColorStop(1, up ? "#042418" : "#240a10");
        ctx.fillStyle = pg;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = stroke;
        ctx.stroke();
        ctx.fillStyle = stroke;
        ctx.font = '700 13px "Audiowide","Chakra Petch",sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = glow;
        ctx.shadowBlur = 6;
        ctx.fillText(`${priceRef.current.toFixed(1)}¢`, pillX + pillW / 2, pillY + pillH / 2);
        ctx.shadowBlur = 0;
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      }

      // ── 3. NOW divider ─────────────────────────────────────────────
      const ndg = ctx.createLinearGradient(0, 0, 0, H);
      ndg.addColorStop(0, "rgba(255,107,26,0)");
      ndg.addColorStop(0.12, "rgba(255,107,26,0.45)");
      ndg.addColorStop(0.88, "rgba(255,107,26,0.45)");
      ndg.addColorStop(1, "rgba(255,107,26,0)");
      ctx.fillStyle = ndg;
      ctx.fillRect(NOW_X - 0.5, 0, 1, H);

      // ── 4. Future grid cells ───────────────────────────────────────
      // Determine visible expirySec range
      const nowSec = now / 1000;

      // ── 4a. Liquidation check on open bets ──────────────────────────
      // Real-contract style: if |price - cellCenter| > liqDistance before
      // settlement, force-close the position with full margin loss.
      const livePrice = priceRef.current;
      for (const p of positionsRef.current) {
        if (effectsRef.current.has(p.id)) continue;
        if (liquidatedLocalRef.current.has(p.id)) continue;
        const lev = p.leverage ?? 1;
        if (lev <= 1) continue; // 1× has no effective liquidation under current ¢ range
        const liqDist = p.liqDistance ?? (4.5 / lev);
        if (Math.abs(livePrice - p.cellCenter) > liqDist) {
          liquidatedLocalRef.current.add(p.id);
          // Visual effect immediately at the bet's column position.
          effectsRef.current.set(p.id, {
            kind: "liquidate",
            startAt: now,
            p,
          });
          if (onLiquidate) onLiquidate(p.id, livePrice);
        }
      }

      // ── 4b. Liquidation rails for OPEN positions (red dashed) ──────
      for (const p of positionsRef.current) {
        if (effectsRef.current.has(p.id)) continue;
        const lev = p.leverage ?? 1;
        if (lev <= 1) continue;
        const liqDist = p.liqDistance ?? (4.5 / lev);
        const px = xForExpiry(p.targetAt);
        if (px < NOW_X) continue;
        const yUp = yFor(p.cellCenter + liqDist);
        const yDn = yFor(p.cellCenter - liqDist);
        ctx.save();
        ctx.strokeStyle = "rgba(255,60,90,0.55)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(NOW_X, yUp);
        ctx.lineTo(Math.min(W, px + COL_W / 2), yUp);
        ctx.moveTo(NOW_X, yDn);
        ctx.lineTo(Math.min(W, px + COL_W / 2), yDn);
        ctx.stroke();
        ctx.setLineDash([]);
        // tiny "LIQ" tag at right end
        ctx.fillStyle = "rgba(255,60,90,0.85)";
        ctx.font = '700 8px "Chakra Petch",monospace';
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        const tagX = Math.min(W - 2, px + COL_W / 2);
        ctx.fillText("LIQ", tagX, yUp - 6);
        ctx.fillText("LIQ", tagX, yDn + 6);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
        ctx.restore();
      }

      // First column expiry = ceil(now/1000) — that one is currently sliding toward NOW_X.
      const firstSec = Math.ceil(nowSec);
      // How many columns fit?
      const futureW = W - NOW_X;
      const visibleCols = Math.ceil(futureW / PITCH_X) + 2;

      const positionByKey = new Map<string, StrikezonePosition>();
      for (const p of positionsRef.current) {
        const k = `${Math.round(p.targetAt / 1000)}:${Math.round(p.cellCenter)}`;
        positionByKey.set(k, p);
      }

      // Build future cells; track for hit-test
      const futureCells: typeof futureCellsRef.current = [];
      const hover = hoverRef.current;
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
    hoverRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);
  const onMouseLeave = useCallback(() => {
    hoverRef.current = null;
  }, []);
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
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
      className="relative w-full"
      style={{ height: TOTAL_H }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{
          width: "100%",
          height: TOTAL_H,
          display: "block",
          cursor: "crosshair",
        }}
      />
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
    ctx.strokeStyle = "#00f0ff";
    ctx.shadowColor = "rgba(0,240,255,0.6)";
    ctx.shadowBlur = 12;
  } else {
    ctx.strokeStyle = "rgba(255,107,26,0.35)";
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  // mult text
  ctx.fillStyle = multiplierTextColor(mult);
  ctx.font = '700 13px "Chakra Petch","JetBrains Mono",monospace';
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
  p: StrikezonePosition,
  hover: boolean
) {
  // Solid bright orange bet cell with 3-line text
  roundRect(ctx, x, y, w, h, 8);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#ff8a3d");
  g.addColorStop(1, "#ff6b1a");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,138,61,0.7)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = hover ? "#fff" : "#ffd9b8";
  ctx.stroke();

  const lev = p.leverage ?? 1;
  const payoutNet = p.stake * p.mult * lev - p.stake;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // top line: stake (×lev)
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = '700 9px "Chakra Petch",monospace';
  ctx.fillText(`$${p.stake}${lev > 1 ? `×${lev}` : ""}`, x + w / 2, y + 10);
  // mid line: mult
  ctx.fillStyle = "#fff";
  ctx.font = '700 13px "Audiowide","Chakra Petch",sans-serif';
  ctx.fillText(formatMultiplier(applyLeverage(p.mult, lev)), x + w / 2, y + h / 2);
  // bottom line: +$payout
  ctx.fillStyle = "#00ff9d";
  ctx.font = '700 9px "Chakra Petch",monospace';
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
  _p: StrikezonePosition,
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
  g.addColorStop(0, "#fff6c4");
  g.addColorStop(0.55, "#ffb347");
  g.addColorStop(1, "#ff6b1a");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,220,120,0.95)";
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
    ctx.strokeStyle = i === 0 ? "#ffd97a" : "#ff8a3d";
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
  _p: StrikezonePosition
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
  ctx.fillStyle = negative ? "#ff3a5a" : "#00ff9d";
  ctx.shadowColor = negative ? "rgba(255,58,90,0.95)" : "rgba(0,255,157,0.95)";
  ctx.shadowBlur = 22;
  ctx.font = '800 30px "Audiowide","Chakra Petch",sans-serif';
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
  _p: StrikezonePosition
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
  g.addColorStop(0, flash < 1 ? "#ffffff" : "#ff7a8a");
  g.addColorStop(1, flash < 1 ? "#ffaab2" : "#8a0a18");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,60,90,0.95)";
  ctx.shadowBlur = 28 * (1 - t * 0.5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff3a5a";
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = '800 11px "Audiowide","Chakra Petch",sans-serif';
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
    ctx.strokeStyle = "#ff3a5a";
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
  ctx.font = '700 14px "Audiowide","Chakra Petch",sans-serif';
  const tw = ctx.measureText(text).width;
  const padX = 12;
  const w = tw + padX * 2;
  const h = 24;
  const x = cx - w / 2;
  const y = topY;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = "rgba(8,16,28,0.92)";
  ctx.shadowColor = "rgba(0,240,255,0.45)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#00f0ff";
  ctx.stroke();
  ctx.fillStyle = "#00f0ff";
  ctx.shadowColor = "rgba(0,240,255,0.8)";
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
  g.addColorStop(0, fadeToGold < 1 ? "#ffffff" : "#fff6c4");
  g.addColorStop(1, fadeToGold < 1 ? "#ffe9a0" : "#ffb347");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,220,120,0.95)";
  ctx.shadowBlur = 24 * (1 - t * 0.5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffd84a";
  ctx.stroke();

  ctx.fillStyle = "#3b1a00";
  ctx.font = '700 13px "Chakra Petch","JetBrains Mono",monospace';
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
    ctx.strokeStyle = "#ffd84a";
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
  const color = s.hue === "gold" ? "#ffd84a" : "#7cffb2";
  const glow = s.hue === "gold" ? "rgba(255,216,74,0.95)" : "rgba(124,255,178,0.9)";
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