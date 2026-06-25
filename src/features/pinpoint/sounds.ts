/**
 * 8-bit-style sound effects synthesized with WebAudio — no audio files.
 * Calls are no-ops on the server and when the user has muted via
 * localStorage `omenx.pinpoint.muted`.
 */

const MUTE_KEY = "omenx.pinpoint.muted";

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  try { ctx = new C(); } catch { return null; }
  return ctx;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(MUTE_KEY) === "1";
}
export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

type Tone = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number; // ramp endpoint
};

function play(tones: Tone[]) {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const now = ac.currentTime;
  let t = now;
  for (const tone of tones) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = tone.type ?? "square";
    osc.frequency.setValueAtTime(tone.freq, t);
    if (tone.slideTo != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.slideTo), t + tone.dur);
    }
    const g = tone.gain ?? 0.08;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(g, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + tone.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + tone.dur + 0.02);
    t += tone.dur;
  }
}

/** Coin pickup — 2-note ascending blip used when a bet is placed. */
export const sndCoin     = () => play([{ freq: 988, dur: 0.06 }, { freq: 1319, dur: 0.12 }]);
/** Win — 4-note victory fanfare. */
export const sndWin      = () => play([
  { freq: 784, dur: 0.08 }, { freq: 988, dur: 0.08 },
  { freq: 1319, dur: 0.08 }, { freq: 1568, dur: 0.18 },
]);
/** Lose — 2-note descending. */
export const sndLose     = () => play([{ freq: 392, dur: 0.1 }, { freq: 196, dur: 0.18 }]);
/** Game over — long descending sawtooth (cross-margin liquidation). */
export const sndGameOver = () => play([
  { freq: 523, dur: 0.18, type: "sawtooth", slideTo: 261 },
  { freq: 261, dur: 0.22, type: "sawtooth", slideTo: 131 },
  { freq: 131, dur: 0.34, type: "sawtooth", slideTo: 65 },
]);
/** Click — UI tick. */
export const sndClick    = () => play([{ freq: 1760, dur: 0.03, gain: 0.05 }]);
/** Level-up — chime. */
export const sndLevelUp  = () => play([
  { freq: 1047, dur: 0.07 }, { freq: 1319, dur: 0.07 },
  { freq: 1568, dur: 0.07 }, { freq: 2093, dur: 0.18 },
]);
/** Streak tick — small bell at every consecutive win past 2. */
export const sndStreak   = () => play([{ freq: 1568, dur: 0.05 }, { freq: 2093, dur: 0.08 }]);

/** Tiered win — same shape, brighter / higher with tier. */
export const sndWinTier = (tier: "S" | "M" | "L" | "XL") => {
  const base = tier === "S" ? 1 : tier === "M" ? 1.12 : tier === "L" ? 1.25 : 1.4;
  play([
    { freq: 784 * base, dur: 0.06 },
    { freq: 988 * base, dur: 0.06 },
    { freq: 1319 * base, dur: 0.07 },
    { freq: 1568 * base, dur: tier === "XL" ? 0.24 : 0.16, gain: tier === "S" ? 0.07 : 0.09 },
  ]);
};
/** Coin arrival "tink" — short, bright. */
export const sndCoinArrive = () => play([{ freq: 2349, dur: 0.04, gain: 0.05 }]);
/** Combo chord — count drives pitch. */
export const sndCombo = (count: number) => {
  const lift = Math.min(1.45, 1 + (count - 2) * 0.07);
  play([
    { freq: 1047 * lift, dur: 0.06 },
    { freq: 1319 * lift, dur: 0.06 },
    { freq: 1568 * lift, dur: 0.18, gain: 0.1 },
  ]);
};
/** Streak lost — short minor drop. */
export const sndStreakLost = () => play([
  { freq: 392, dur: 0.08, type: "triangle" },
  { freq: 294, dur: 0.16, type: "triangle", gain: 0.05 },
]);