import { useEffect, useRef } from "react";
import {
  on,
  prefersReducedMotion,
  type ComboFxPayload,
  type WinFxPayload,
  type WinTier,
} from "./effectsBus";
import { sndCoinArrive } from "../sounds";

/**
 * Full-viewport effects layer. pointer-events:none, fixed inset:0.
 * Single canvas + a tiny DOM combo-badge slot.
 *
 * Runs its own rAF loop. Subscribes to the effects bus and draws:
 *   • Coin streams (bezier from cell → balance anchor)
 *   • COMBO badge (DOM) anchored above the balance
 */

type Coin = {
  startAt: number;
  dur: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  ctrlX: number;
  ctrlY: number;
  size: number;
  hue: "gold" | "white";
  /** Whether the "arrive" callback has fired yet. */
  arrived?: boolean;
};

const COIN_DUR_MIN = 460;
const COIN_DUR_MAX = 620;
const MAX_COINS = 32;

function tierCoinCount(tier: WinTier): number {
  switch (tier) {
    case "S": return 3;
    case "M": return 6;
    case "L": return 10;
    case "XL": return 14;
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getAnchor(): { x: number; y: number } {
  if (typeof document === "undefined") return { x: 24, y: 24 };
  const el = document.querySelector<HTMLElement>("[data-pp-balance-anchor]");
  if (!el) return { x: 24, y: 24 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Trigger the balance card's "absorbed coin" pulse. */
function pulseAnchor() {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>("[data-pp-balance-anchor]");
  if (!el) return;
  el.classList.remove("pp-bal-pulse");
  // force reflow so the animation restarts even if it just played
  void el.offsetWidth;
  el.classList.add("pp-bal-pulse");
}

export function EffectsLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const comboRef = useRef<HTMLDivElement | null>(null);
  const coinsRef = useRef<Coin[]>([]);
  const reducedRef = useRef<boolean>(false);

  useEffect(() => {
    reducedRef.current = prefersReducedMotion();

    const off1 = on("win", (p: WinFxPayload) => {
      spawnCoinsForWin(p);
    });
    const off2 = on("combo", (p: ComboFxPayload) => {
      showCombo(p);
    });
    return () => { off1(); off2(); };
  }, []);

  function spawnCoinsForWin(p: WinFxPayload) {
    if (reducedRef.current) {
      // Reduced motion: still pulse the balance so the value-change has a beat.
      pulseAnchor();
      return;
    }
    const anchor = getAnchor();
    const n = tierCoinCount(p.tier);
    const baseSize = p.tier === "S" ? 7 : p.tier === "M" ? 9 : p.tier === "L" ? 11 : 13;
    // Cap total in-flight coins, but always allow at least 2 for visibility.
    const room = Math.max(2, MAX_COINS - coinsRef.current.length);
    const count = Math.min(n, room);
    const now = performance.now();
    for (let i = 0; i < count; i++) {
      const stagger = i * (24 + Math.random() * 16);
      const jitter = 14;
      const fromX = p.x + (Math.random() - 0.5) * jitter;
      const fromY = p.y + (Math.random() - 0.5) * jitter;
      // Bezier control point: high arc above the midpoint, biased upward.
      const midX = (fromX + anchor.x) / 2 + (Math.random() - 0.5) * 80;
      const midY = Math.min(fromY, anchor.y) - 110 - Math.random() * 40;
      coinsRef.current.push({
        startAt: now + stagger,
        dur: COIN_DUR_MIN + Math.random() * (COIN_DUR_MAX - COIN_DUR_MIN),
        fromX,
        fromY,
        toX: anchor.x,
        toY: anchor.y,
        ctrlX: midX,
        ctrlY: midY,
        size: baseSize + Math.random() * 3,
        hue: Math.random() < 0.7 ? "gold" : "white",
      });
    }
  }

  function showCombo(p: ComboFxPayload) {
    const el = comboRef.current;
    if (!el) return;
    const anchor = getAnchor();
    el.style.left = `${anchor.x}px`;
    el.style.top = `${anchor.y + 28}px`;
    el.textContent =
      p.tier === "XL"
        ? `★ COMBO ×${p.count} ★`
        : p.count >= 5
          ? `COMBO ×${p.count}`
          : `×${p.count} HIT`;
    el.dataset.tier = p.tier;
    el.classList.remove("pp-combo-pop");
    void el.offsetWidth;
    el.classList.add("pp-combo-pop");
  }

  // rAF loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
      if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const now = performance.now();
      const coins = coinsRef.current;
      let pulseFired = false;
      coinsRef.current = coins.filter((c) => {
        const age = now - c.startAt;
        if (age < 0) return true; // still in stagger delay
        const t = age / c.dur;
        if (t >= 1) {
          if (!c.arrived) {
            c.arrived = true;
            if (!pulseFired) {
              pulseAnchor();
              sndCoinArrive();
              pulseFired = true;
            }
          }
          return false;
        }
        const e = easeInOutCubic(t);
        // Quadratic bezier
        const x = (1 - e) ** 2 * c.fromX + 2 * (1 - e) * e * c.ctrlX + e * e * c.toX;
        const y = (1 - e) ** 2 * c.fromY + 2 * (1 - e) * e * c.ctrlY + e * e * c.toY;
        drawCoin(ctx, x, y, c.size, c.hue, t);
        return true;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 60,
        }}
      />
      <div
        ref={comboRef}
        aria-hidden
        className="pp-combo-badge"
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          pointerEvents: "none",
          zIndex: 61,
          transform: "translate(-50%, 0)",
        }}
      />
    </>
  );
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  hue: "gold" | "white",
  t: number,
) {
  // Trail
  ctx.save();
  const alpha = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = hue === "gold" ? "#ffd400" : "#ffffff";
  ctx.shadowColor = hue === "gold" ? "rgba(255,212,0,0.95)" : "rgba(255,255,255,0.9)";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  // Inner shimmer
  ctx.shadowBlur = 0;
  ctx.fillStyle = hue === "gold" ? "#fff2b0" : "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  // $ glyph
  ctx.fillStyle = "#7a4a00";
  ctx.font = `800 ${Math.round(size * 1.2)}px "Press Start 2P","Silkscreen",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", x, y + 1);
  ctx.restore();
}
