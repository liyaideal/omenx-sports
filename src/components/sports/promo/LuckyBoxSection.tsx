import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Gift, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  LUCKY_BOX_TIERS,
  USER_CARNIVAL_STATE,
  type LuckyBoxTier,
  type LuckyBoxPrize,
} from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

const ACCENT: Record<LuckyBoxTier["accent"], string> = {
  accent: "oklch(0.7 0.18 145)",
  amber: "#facc15",
  blue: "#60a5fa",
};

const MAX_THRESHOLD =
  LUCKY_BOX_TIERS[LUCKY_BOX_TIERS.length - 1]?.volumeUnlock ?? 5000;

type TierStatus = "active" | "surpassed" | "locked";

function computeActiveIndex(volume: number): number {
  let idx = -1;
  LUCKY_BOX_TIERS.forEach((t, i) => {
    if (volume >= t.volumeUnlock) idx = i;
  });
  return idx;
}

export function LuckyBoxSection({
  volumeOverride,
}: {
  volumeOverride?: number;
} = {}) {
  const todayVolume = volumeOverride ?? USER_CARNIVAL_STATE.todayVolume;
  const activeIndex = computeActiveIndex(todayVolume);
  const tokenPct = Math.max(
    0,
    Math.min(100, (todayVolume / MAX_THRESHOLD) * 100),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
        <Gift
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-blue-400/10"
        />
        <div className="relative font-scoreboard text-[10px] font-bold tracking-[0.25em] text-blue-400">
          SEC-03 · DAILY LUCKY BOX
        </div>
        <h3 className="relative mt-1 font-pitch text-xl font-bold uppercase tracking-wide text-white">
          Today's volume:{" "}
          <span className="font-scoreboard text-[oklch(0.7_0.18_145)] tabular-nums">
            {todayVolume.toLocaleString()} U
          </span>
        </h3>
        <p className="relative mt-1 text-sm text-zinc-400">
          Higher daily volume unlocks a bigger vault tomorrow. One spin per
          calendar day — first-come, first-served while pool stock lasts.
        </p>
      </div>

      <VolumeLadder
        volume={todayVolume}
        tokenPct={tokenPct}
        activeIndex={activeIndex}
      />

      <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
        {LUCKY_BOX_TIERS.map((t, i) => {
          const status: TierStatus =
            i === activeIndex
              ? "active"
              : i < activeIndex
                ? "surpassed"
                : "locked";
          const remaining = Math.max(0, t.volumeUnlock - todayVolume);
          return (
            <TierCard
              key={t.id}
              tier={t}
              status={status}
              remaining={remaining}
              isFirstUnreached={i === activeIndex + 1}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Volume Ladder ---------------- */

function VolumeLadder({
  volume,
  tokenPct,
  activeIndex,
}: {
  volume: number;
  tokenPct: number;
  activeIndex: number;
}) {
  const activeTier = activeIndex >= 0 ? LUCKY_BOX_TIERS[activeIndex] : null;
  const activeColor = activeTier ? ACCENT[activeTier.accent] : "#facc15";

  // Express positions as `calc(... * (100% - 32px) + 16px)` so nodes align
  // with the track inset (px-4 padding).
  const posExpr = (pct: number) =>
    `calc(${pct.toFixed(3)}% * (100% - 32px) / 100% + 16px)`;

  return (
    <div className="relative">
      <div className="relative h-14 overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] px-4">
        <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-25" />

        {/* Track baseline */}
        <div className="absolute left-4 right-4 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className="h-full"
            style={{
              width: `${tokenPct}%`,
              background:
                "linear-gradient(90deg, oklch(0.7 0.18 145), #facc15)",
              boxShadow: `0 0 12px ${activeColor}`,
            }}
          />
        </div>

        {/* Nodes */}
        {LUCKY_BOX_TIERS.map((t, i) => {
          const pct = (t.volumeUnlock / MAX_THRESHOLD) * 100;
          const reached = i <= activeIndex;
          const color = ACCENT[t.accent];
          return (
            <div
              key={t.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: posExpr(pct) }}
            >
              <div
                className={cn(
                  "h-3 w-3 rotate-45",
                  !reached && "border border-dashed",
                )}
                style={{
                  background: reached ? color : "transparent",
                  borderColor: reached ? color : "rgb(82 82 91)",
                  boxShadow: reached ? `0 0 10px ${color}` : undefined,
                }}
              />
              <div
                className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap font-scoreboard text-[9px] font-bold tracking-[0.18em]"
                style={{ color: reached ? color : "rgb(113 113 122)" }}
              >
                {t.volumeUnlock.toLocaleString()} U
              </div>
            </div>
          );
        })}

        {/* Token */}
        {volume > 0 && (
          <motion.div
            initial={{ left: "16px", opacity: 0 }}
            animate={{ left: posExpr(tokenPct), opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="relative grid h-7 w-16 place-items-center"
              style={{
                clipPath:
                  "polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%)",
                background: activeColor,
                boxShadow: `0 0 18px ${activeColor}`,
              }}
            >
              <span className="font-scoreboard text-[10px] font-black italic tabular-nums text-black">
                {volume.toLocaleString()} U
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* LED beam from token → active card */}
      {activeIndex >= 0 && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="pointer-events-none absolute z-10 hidden md:block"
          style={{
            left: posExpr(tokenPct),
            top: "calc(100% + 2px)",
            height: "22px",
            width: "2px",
            background: `linear-gradient(180deg, ${activeColor}, transparent)`,
            boxShadow: `0 0 10px ${activeColor}`,
            transformOrigin: "top center",
            transform: "translateX(-50%)",
          }}
        />
      )}

      {/* Caption */}
      <div className="mt-2 font-pitch text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {activeTier ? (
          <>
            Your vault today ·{" "}
            <span style={{ color: activeColor }}>
              {activeTier.code} {activeTier.name}
            </span>{" "}
            · only this vault applies
          </>
        ) : (
          <>
            Reach{" "}
            <span className="text-white">
              {LUCKY_BOX_TIERS[0]?.volumeUnlock.toLocaleString()} U
            </span>{" "}
            to unlock your first vault
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tier Card ---------------- */

function TierCard({
  tier,
  status,
  remaining,
  isFirstUnreached,
}: {
  tier: LuckyBoxTier;
  status: TierStatus;
  remaining: number;
  isFirstUnreached: boolean;
}) {
  const accent = ACCENT[tier.accent];
  const isActive = status === "active";
  const isSurpassed = status === "surpassed";
  const isLocked = status === "locked";
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<LuckyBoxPrize | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [scrollIdx, setScrollIdx] = useState(0);

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(
      () => setScrollIdx((i) => (i + 1) % tier.prizes.length),
      80,
    );
    return () => clearInterval(id);
  }, [spinning, tier.prizes.length]);

  function spin() {
    if (!isActive || hasSpun || spinning) return;
    setSpinning(true);
    setResult(null);
    const winner = drawPrize(tier.prizes);
    setTimeout(() => {
      setSpinning(false);
      setResult(winner);
      setHasSpun(true);
      toast.success(`${tier.name}: ${winner.label}`);
    }, 2200);
  }

  const reelLabel = result
    ? result.label
    : tier.prizes[scrollIdx]?.label ?? "—";

  const progressPct = isLocked
    ? Math.min(
        100,
        Math.round(((tier.volumeUnlock - remaining) / tier.volumeUnlock) * 100),
      )
    : 100;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden border-2 bg-[#0a0a0a] p-5 transition-all",
        isActive && "z-[1] shadow-[0_0_40px_rgba(250,204,21,0.35)]",
      )}
      style={{
        borderColor: isActive
          ? accent
          : isSurpassed
            ? "rgb(63 63 70)"
            : "rgb(39 39 42)",
        borderStyle: isLocked ? "dashed" : "solid",
      }}
    >
      {/* Active spotlight cone */}
      {isActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(120% 60% at 50% 0%, ${accent}40 0%, transparent 55%)`,
          }}
        />
      )}
      {/* Dim shroud over surpassed / locked */}
      {!isActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] bg-black/55"
          style={{ backdropFilter: "grayscale(0.7)" }}
        />
      )}

      {/* Status corner badge */}
      {isActive && (
        <div
          className="absolute right-3 top-3 z-[3] flex items-center gap-1 px-2 py-0.5 font-scoreboard text-[9px] font-bold tracking-[0.22em]"
          style={{ background: accent, color: "black" }}
        >
          <Sparkles className="h-2.5 w-2.5" />
          YOUR TIER
        </div>
      )}
      {isSurpassed && (
        <div className="absolute right-3 top-3 z-[3] flex items-center gap-1 border border-dashed border-zinc-500 px-2 py-0.5 font-scoreboard text-[9px] font-bold tracking-[0.22em] text-zinc-400">
          <Check className="h-2.5 w-2.5" />
          CLEARED
        </div>
      )}
      {isLocked && (
        <div className="absolute right-3 top-3 z-[3] flex items-center gap-1 border border-zinc-700 px-2 py-0.5 font-scoreboard text-[9px] font-bold tracking-[0.22em] text-zinc-500">
          <Lock className="h-2.5 w-2.5" />
          {isFirstUnreached ? "NEXT UP" : "LOCKED"}
        </div>
      )}

      <div className="relative z-[3] flex items-start justify-between">
        <span
          className="font-scoreboard text-[10px] font-bold tracking-[0.25em]"
          style={{ color: isActive ? accent : "rgb(113 113 122)" }}
        >
          {tier.code}
        </span>
        <span className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {tier.poolLabel}
        </span>
      </div>
      <h3 className="relative z-[3] font-pitch text-xl font-bold uppercase tracking-wide text-white">
        {tier.name}
      </h3>

      {/* Reel */}
      <div
        className="relative z-[3] grid h-24 place-items-center overflow-hidden border border-zinc-800 bg-black"
        aria-live="polite"
      >
        <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-25" />
        <div
          aria-hidden
          className="absolute inset-0 animate-scoreboard-sweep"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
          }}
        />
        <Trophy
          aria-hidden
          className="pointer-events-none absolute left-3 top-2 h-5 w-5 opacity-10"
          style={{ color: accent }}
        />
        <div
          className={cn(
            "relative font-scoreboard text-xl font-black italic tabular-nums",
            result?.hero && "text-amber-300",
            spinning && "animate-pulse",
          )}
          style={{
            color: result?.hero
              ? "#fde047"
              : isActive
                ? accent
                : "rgb(113 113 122)",
            filter: result?.hero
              ? "drop-shadow(0 0 14px rgba(253,224,71,0.7))"
              : `drop-shadow(0 0 10px ${isActive ? accent : "transparent"})`,
          }}
        >
          {result?.hero && <Sparkles className="mr-2 inline h-5 w-5" />}
          {reelLabel}
        </div>
      </div>

      <div className="relative z-[3]">
        <div className="mb-1.5 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          <span>
            {isLocked
              ? `+${remaining.toLocaleString()} U to unlock`
              : `Unlock at ${tier.volumeUnlock.toLocaleString()} U volume`}
          </span>
          <span style={{ color: !isLocked ? accent : undefined }}>
            {progressPct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className="h-full"
            style={{
              width: `${progressPct}%`,
              background: accent,
              boxShadow: !isLocked ? `0 0 10px ${accent}` : undefined,
            }}
          />
        </div>
      </div>

      <ul className="relative z-[3] space-y-1.5 border-t border-zinc-900 pt-3">
        {tier.prizes.map((p) => (
          <li
            key={p.label}
            className="flex items-center justify-between font-pitch text-xs"
          >
            <span className="flex items-center gap-1.5 text-zinc-300">
              {p.hero && <Trophy className="h-3 w-3 text-amber-400" />}
              {p.label}
            </span>
            <span className="font-scoreboard text-[10px] font-bold tabular-nums text-zinc-500">
              {(p.chance * 100).toFixed(p.chance < 0.05 ? 1 : 0)}%
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={spin}
        disabled={!isActive || hasSpun || spinning}
        className="relative z-[3] border-2 px-4 py-2.5 font-pitch text-xs font-bold uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: isActive ? accent : "rgb(39 39 42)",
          background: isActive && !hasSpun ? accent : "transparent",
          color: isActive && !hasSpun ? "black" : "rgb(113 113 122)",
        }}
      >
        {hasSpun
          ? "Used today"
          : spinning
            ? "Spinning…"
            : isActive
              ? "Open vault"
              : isSurpassed
                ? "Outgrown · higher tier active"
                : `+${remaining.toLocaleString()} U to unlock`}
      </button>
    </div>
  );
}

function drawPrize(prizes: LuckyBoxPrize[]): LuckyBoxPrize {
  const total = prizes.reduce((a, p) => a + p.chance, 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= p.chance;
    if (r <= 0) return p;
  }
  return prizes[0];
}
