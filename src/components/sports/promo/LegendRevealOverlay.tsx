import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, SkipForward, Volume2, VolumeX } from "lucide-react";
import {
  LEGEND_COUNTRIES,
  LEGEND_SIGNED_IMAGES,
  type LegendRound,
} from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";
import * as FlatFlags from "country-flag-icons/react/3x2";

const ACCENT = "#4ade80";
const AMBER = "#facc15";
const MISS = "#f87171";
const BLUE = "#60a5fa";

/* -------------------------------------------------------------------- */
/*  Scripted timeline (seconds since overlay mount)                     */
/* -------------------------------------------------------------------- */

const T = {
  curtain: 0,
  clueStart: 0.6,
  cluePer: 0.45,
  eliminate: 1.95,
  eliminatePer: 0.35,
  flip: 2.95,
  banner: 3.55,
  badge: 4.5,
  reward: 5.4,
  end: 6.4,
} as const;
const FULL_DURATION_MS = 6800;
const REDUCED_DURATION_MS = 2200;

/* -------------------------------------------------------------------- */
/*  Module-level body scroll lock — reference counted so concurrent     */
/*  overlays, StrictMode double-effects, and fast tab switches never    */
/*  leak `overflow: hidden` onto <body>.                                 */
/* -------------------------------------------------------------------- */

let __bodyLockCount = 0;
let __bodyLockOriginal = "";

function acquireBodyLock() {
  if (typeof document === "undefined") return;
  if (__bodyLockCount === 0) {
    __bodyLockOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  __bodyLockCount += 1;
}

function releaseBodyLock() {
  if (typeof document === "undefined") return;
  if (__bodyLockCount <= 0) {
    __bodyLockCount = 0;
    return;
  }
  __bodyLockCount -= 1;
  if (__bodyLockCount === 0) {
    document.body.style.overflow = __bodyLockOriginal;
    __bodyLockOriginal = "";
  }
}

export type RevealOutcome = "hit" | "miss" | "no-pick";

function outcomeForRound(round: LegendRound): RevealOutcome {
  if (!round.userPickId) return "no-pick";
  return round.userPickId === round.correctCandidateId ? "hit" : "miss";
}

function FlagSvg({ code, className }: { code: string; className?: string }) {
  const Cmp = (FlatFlags as Record<string, React.ComponentType<{ className?: string }> | undefined>)[
    code.replace(/-/g, "_")
  ];
  return Cmp ? <Cmp className={className} /> : null;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener?.("change", fn);
    return () => m.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

/* -------------------------------------------------------------------- */
/*  WebAudio short tones — no asset deps                                */
/* -------------------------------------------------------------------- */

function useTones(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = () => {
    if (muted) return null;
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  };
  const beep = (freq: number, durMs = 140, type: OscillatorType = "square", gain = 0.05) => {
    const ctx = ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durMs / 1000);
    o.stop(ctx.currentTime + durMs / 1000);
  };
  useEffect(() => () => { ctxRef.current?.close().catch(() => {}); }, []);
  return { beep };
}

/* -------------------------------------------------------------------- */
/*  Overlay                                                              */
/* -------------------------------------------------------------------- */

export interface LegendRevealOverlayProps {
  round: LegendRound;
  /** Called when sequence completes naturally or user clicks SKIP. */
  onClose: () => void;
  /** When true, skips localStorage persistence in caller. Used by playground. */
  isReplay?: boolean;
  /** Force outcome (playground use); defaults to round-derived outcome. */
  outcomeOverride?: RevealOutcome;
}

export function LegendRevealOverlay({
  round,
  onClose,
  isReplay = false,
  outcomeOverride,
}: LegendRevealOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const totalMs = reduced ? REDUCED_DURATION_MS : FULL_DURATION_MS;
  const outcome = outcomeOverride ?? outcomeForRound(round);
  const country = LEGEND_COUNTRIES[round.country];
  const correct = round.candidates.find((c) => c.id === round.correctCandidateId);

  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("legend.reveal.muted") === "1";
  });
  const toggleMuted = () => {
    setMuted((m) => {
      const nv = !m;
      try { window.localStorage.setItem("legend.reveal.muted", nv ? "1" : "0"); } catch { /* ignore */ }
      return nv;
    });
  };
  const { beep } = useTones(muted);

  // Phase ticker — increments through the timeline.
  const [, force] = useReducer((x) => x + 1, 0);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const closedRef = useRef(false);

  useEffect(() => {
    startedAtRef.current = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const tick = (now: number) => {
      elapsedRef.current = now - startedAtRef.current;
      force();
      if (elapsedRef.current >= totalMs) {
        if (!closedRef.current) {
          closedRef.current = true;
          // Small grace pause so users see final state
          timers.push(setTimeout(onClose, 320));
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // Lock body scroll while playing (ref-counted, leak-safe).
    acquireBodyLock();
    let released = false;
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      for (const t of timers) clearTimeout(t);
      if (!released) {
        released = true;
        releaseBodyLock();
      }
    };
    // Recompute only if outcome changes (won't mid-flight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalMs]);

  const elapsed = elapsedRef.current / 1000;
  const factor = reduced ? REDUCED_DURATION_MS / FULL_DURATION_MS : 1;
  const at = (t: number) => elapsed >= t * factor;

  // Audio cues — fired once per threshold
  const firedRef = useRef<Record<string, boolean>>({});
  const fire = (key: string, fn: () => void) => {
    if (firedRef.current[key]) return;
    firedRef.current[key] = true;
    fn();
  };
  if (at(T.curtain)) fire("curtain", () => beep(120, 220, "sine", 0.04));
  if (at(T.clueStart)) fire("c0", () => beep(640, 90));
  if (at(T.clueStart + T.cluePer)) fire("c1", () => beep(720, 90));
  if (at(T.clueStart + T.cluePer * 2)) fire("c2", () => beep(820, 90));
  if (at(T.flip)) fire("flip", () => beep(960, 180, "triangle", 0.06));
  if (at(T.banner)) {
    fire("banner", () => {
      if (outcome === "hit") {
        beep(660, 110); setTimeout(() => beep(880, 110), 110); setTimeout(() => beep(1100, 180), 240);
      } else if (outcome === "miss") {
        beep(180, 260, "sawtooth", 0.05);
      }
    });
  }

  function handleSkip() {
    if (closedRef.current) return;
    closedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    onClose();
  }

  // Keyboard: ESC skips
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.min(1, elapsedRef.current / totalMs);

  const wrongCandidates = useMemo(
    () => round.candidates.filter((c) => c.id !== round.correctCandidateId),
    [round],
  );

  const bannerCopy =
    outcome === "hit"
      ? "YOU HIT IT · TIER-01 SPIN GRANTED"
      : outcome === "miss"
        ? "MISSED · NEXT ROUND TBA"
        : "REVEALED · NO PICK THIS ROUND";
  const bannerColor = outcome === "hit" ? ACCENT : outcome === "miss" ? MISS : BLUE;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Round ${round.roundNumber} reveal`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/95 backdrop-blur-sm sm:items-center sm:overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at center, rgba(250,204,21,0.06), transparent 60%)",
      }}
    >
      {/* CRT scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "linear-gradient(transparent 50%, rgba(0,0,0,0.7) 50%)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* LED frame */}
      <motion.div
        className="pointer-events-none absolute inset-2 border-2 sm:inset-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: at(T.curtain) ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          borderColor: AMBER,
          boxShadow: `0 0 40px ${AMBER}55, inset 0 0 40px ${AMBER}33`,
        }}
      />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 sm:px-6 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="min-w-0 truncate font-scoreboard text-[10px] font-bold tracking-[0.28em] sm:text-[11px] sm:tracking-[0.32em]"
          style={{ color: AMBER }}
        >
          <span className="animate-pulse">●</span>{" "}
          ROUND {String(round.roundNumber).padStart(2, "0")} · REVEALING…
        </motion.div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? "Unmute" : "Mute"}
            className="grid h-8 w-8 place-items-center border border-zinc-700 bg-black/60 text-zinc-300 transition-colors hover:border-amber-400 hover:text-amber-400"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 border border-zinc-700 bg-black/60 px-3 py-1.5 font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-300 transition-colors hover:border-amber-400 hover:text-amber-400"
          >
            SKIP <SkipForward className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Progress hairline */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-amber-400/70"
        style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
      />

      {/* Stage */}
      <div className="relative mx-auto w-full max-w-4xl px-4 pb-6 pt-14 sm:px-6 sm:pb-0 sm:pt-0">
        {/* Clue stack */}
        <div className="mb-8 space-y-2">
          {round.clues.map((clue, i) => {
            const lit = at(T.clueStart + T.cluePer * i);
            return (
              <motion.div
                key={clue.idx}
                animate={{
                  borderColor: lit ? AMBER : "#1f1f1f",
                  boxShadow: lit ? `0 0 12px ${AMBER}66` : "none",
                }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center gap-3 border bg-[#0d0d0d]/80 px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <div
                  className="grid h-7 w-7 shrink-0 place-items-center font-scoreboard text-[11px] font-bold transition-colors"
                  style={{
                    background: lit ? AMBER : "transparent",
                    color: lit ? "black" : "#52525b",
                    border: lit ? "none" : "1px dashed #2a2a2a",
                  }}
                >
                  {clue.idx}
                </div>
                <div className="shrink-0 font-scoreboard text-[10px] font-bold tracking-[0.22em] text-zinc-500 sm:text-[11px] sm:tracking-[0.24em]">
                  {clue.label}
                </div>
                <div className="ml-auto min-w-0 truncate text-right font-pitch text-xs font-bold uppercase tracking-wide sm:text-sm">
                  <AnimatePresence mode="wait">
                    {lit ? (
                      <motion.span
                        key="v"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: AMBER }}
                      >
                        {clue.value}
                      </motion.span>
                    ) : (
                      <motion.span key="h" className="text-zinc-700">
                        ████
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Candidate grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {round.candidates.map((cand) => {
            const isCorrect = cand.id === round.correctCandidateId;
            const isUserPick = cand.id === round.userPickId;
            const eliminateIdx = wrongCandidates.findIndex((w) => w.id === cand.id);
            const eliminated =
              !isCorrect &&
              at(T.eliminate + Math.max(0, eliminateIdx) * T.eliminatePer);
            const focused = isCorrect && at(T.flip);
            const flipped = isCorrect && at(T.flip + 0.05);
            return (
              <motion.div
                key={cand.id}
                animate={{
                  scale: focused ? 1.12 : eliminated ? 0.92 : 1,
                  opacity: eliminated ? 0.25 : 1,
                  filter: eliminated ? "grayscale(1)" : "grayscale(0)",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={cn(
                  "relative border bg-[#0d0d0d] p-2 sm:p-3",
                  isCorrect && focused && "z-10",
                )}
                style={{
                  borderColor: focused
                    ? ACCENT
                    : eliminated
                      ? MISS
                      : "#1f1f1f",
                  boxShadow: focused
                    ? `0 0 40px ${ACCENT}99, 0 0 0 2px ${ACCENT}`
                    : eliminated && at(T.eliminate)
                      ? `0 0 0 1px ${MISS}66`
                      : "none",
                }}
              >
                {/* Card body — flip animation on the correct one */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black [perspective:800px]">
                  <motion.div
                    className="absolute inset-0 [transform-style:preserve-3d]"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.55, ease: "easeInOut" }}
                  >
                    {/* Front — flag silhouette */}
                    <div className="absolute inset-0 grid place-items-center bg-[#0a0a0a] [backface-visibility:hidden]">
                      <FlagSvg
                        code={country.iso2}
                        className="h-3/5 w-3/5 opacity-50"
                      />
                    </div>
                    {/* Back — signed portrait for the correct one, X for wrong */}
                    <div
                      className="absolute inset-0 [backface-visibility:hidden]"
                      style={{ transform: "rotateY(180deg)" }}
                    >
                      {isCorrect ? (
                        <img
                          src={LEGEND_SIGNED_IMAGES[round.country]}
                          alt={cand.name}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-zinc-700">
                          <X className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  {/* Light sweep on correct */}
                  {focused && (
                    <motion.div
                      initial={{ x: "-120%" }}
                      animate={{ x: "120%" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-y-0 w-1/3"
                      style={{
                        background:
                          "linear-gradient(105deg, transparent, rgba(255,255,255,0.55), transparent)",
                      }}
                    />
                  )}
                </div>
                <div className="mt-1.5 truncate font-pitch text-[10px] font-bold uppercase tracking-wide text-white sm:mt-2 sm:text-[12px]">
                  {cand.name}
                </div>
                {isUserPick && (
                  <div
                    className="absolute -top-2 right-1 px-1 py-0.5 font-scoreboard text-[7px] font-bold tracking-[0.2em] sm:right-2 sm:px-1.5 sm:text-[8px] sm:tracking-[0.22em]"
                    style={{ background: AMBER, color: "black" }}
                  >
                    YOUR PICK
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {at(T.banner) && (
            <motion.div
              key="banner"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-6 flex flex-col items-center justify-center gap-1.5 border-2 px-4 py-2.5 sm:mt-8 sm:flex-row sm:gap-3 sm:px-5 sm:py-3"
              style={{
                borderColor: bannerColor,
                background: `${bannerColor}1A`,
                boxShadow: `0 0 30px ${bannerColor}66`,
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {outcome === "hit" ? (
                  <Check className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: bannerColor }} />
                ) : outcome === "miss" ? (
                  <X className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: bannerColor }} />
                ) : (
                  <span
                    className="grid h-4 w-4 shrink-0 place-items-center text-xs font-bold sm:h-5 sm:w-5"
                    style={{ color: bannerColor }}
                  >
                    ●
                  </span>
                )}
                <span
                  className="text-center font-scoreboard text-[12px] font-bold tracking-[0.2em] sm:text-sm sm:tracking-[0.22em]"
                  style={{ color: "white" }}
                >
                  {bannerCopy}
                </span>
              </div>
              <span
                className="text-center font-scoreboard text-[10px] font-bold tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em]"
                style={{ color: bannerColor }}
              >
                · {correct?.name ?? country.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti — only for hit, only if not reduced */}
        {!reduced && outcome === "hit" && at(T.banner) && (
          <ConfettiBurst color={ACCENT} />
        )}

        {/* Reward callout */}
        <AnimatePresence>
          {at(T.reward) && outcome === "hit" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-center font-scoreboard text-[11px] font-bold tracking-[0.28em]"
              style={{ color: AMBER }}
            >
              SPIN UNLOCKED — OPEN LUCKY BOX WHEN READY
            </motion.div>
          )}
        </AnimatePresence>
        {/* Bottom helper text — inline on mobile so it doesn't overlap banner */}
        <div className="mt-6 text-center font-scoreboard text-[9px] font-bold tracking-[0.3em] text-zinc-600 sm:hidden">
          {isReplay ? "REPLAY · NO REWARD CHANGE" : "FIRST WATCH · CINEMATIC AUTO-PLAYS ONCE"} · ESC TO SKIP
        </div>
      </div>

      {/* Bottom helper text — desktop only, absolute */}
      <div className="absolute inset-x-0 bottom-4 hidden text-center font-scoreboard text-[9px] font-bold tracking-[0.3em] text-zinc-600 sm:block">
        {isReplay ? "REPLAY · NO REWARD CHANGE" : "FIRST WATCH · CINEMATIC AUTO-PLAYS ONCE"} · ESC TO SKIP
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------- */
/*  Lightweight CSS-particle confetti (no extra deps)                   */
/* -------------------------------------------------------------------- */

function ConfettiBurst({ color }: { color: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        i,
        x: (Math.random() - 0.5) * 600,
        y: -200 - Math.random() * 200,
        r: Math.random() * 540,
        delay: Math.random() * 0.15,
        c: i % 3 === 0 ? AMBER : i % 3 === 1 ? color : "#ffffff",
      })),
    [color],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.i}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 600, opacity: 0, rotate: p.r }}
          transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 h-2 w-1"
          style={{ background: p.c }}
        />
      ))}
    </div>
  );
}