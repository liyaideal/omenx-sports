import { useEffect, useState } from "react";
import { Trophy, Sparkles } from "lucide-react";
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

export function LuckyBoxSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-2 border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-blue-400">
          SEC-03 · DAILY LUCKY BOX
        </div>
        <h3 className="mt-1 font-pitch text-xl font-bold uppercase tracking-wide text-white">
          Today's volume:{" "}
          <span className="font-scoreboard text-[oklch(0.7_0.18_145)] tabular-nums">
            {USER_CARNIVAL_STATE.todayVolume.toLocaleString()} U
          </span>
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          Higher daily volume unlocks a bigger vault tomorrow. One spin per
          calendar day — first-come, first-served while pool stock lasts.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {LUCKY_BOX_TIERS.map((t) => (
          <TierCard key={t.id} tier={t} />
        ))}
      </div>
    </div>
  );
}

function TierCard({ tier }: { tier: LuckyBoxTier }) {
  const accent = ACCENT[tier.accent];
  const unlocked = USER_CARNIVAL_STATE.todayVolume >= tier.volumeUnlock;
  const progress = Math.min(1, USER_CARNIVAL_STATE.todayVolume / tier.volumeUnlock);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<LuckyBoxPrize | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [scrollIdx, setScrollIdx] = useState(0);

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => setScrollIdx((i) => (i + 1) % tier.prizes.length), 80);
    return () => clearInterval(id);
  }, [spinning, tier.prizes.length]);

  function spin() {
    if (!unlocked || hasSpun || spinning) return;
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

  const reelLabel = result ? result.label : tier.prizes[scrollIdx]?.label ?? "—";

  return (
    <div
      className="relative flex flex-col gap-4 overflow-hidden border-2 bg-[#0a0a0a] p-5"
      style={{ borderColor: unlocked ? accent : "rgb(39 39 42)" }}
    >
      <div className="flex items-start justify-between">
        <span
          className="font-scoreboard text-[10px] font-bold tracking-[0.25em]"
          style={{ color: unlocked ? accent : "rgb(113 113 122)" }}
        >
          {tier.code}
        </span>
        <span className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {tier.poolLabel}
        </span>
      </div>
      <h3 className="font-pitch text-xl font-bold uppercase tracking-wide text-white">
        {tier.name}
      </h3>

      {/* Reel */}
      <div
        className="relative grid h-24 place-items-center overflow-hidden border border-zinc-800 bg-black"
        aria-live="polite"
      >
        <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-25" />
        <div
          className={cn(
            "relative font-scoreboard text-xl font-black italic tabular-nums",
            result?.hero && "text-amber-300",
            spinning && "animate-pulse",
          )}
          style={{
            color: result?.hero ? "#fde047" : unlocked ? accent : "rgb(113 113 122)",
            filter: result?.hero
              ? "drop-shadow(0 0 14px rgba(253,224,71,0.7))"
              : `drop-shadow(0 0 10px ${unlocked ? accent : "transparent"})`,
          }}
        >
          {result?.hero && <Sparkles className="mr-2 inline h-5 w-5" />}
          {reelLabel}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          <span>Unlock at {tier.volumeUnlock.toLocaleString()} U volume</span>
          <span style={{ color: unlocked ? accent : undefined }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className="h-full"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: accent,
              boxShadow: unlocked ? `0 0 10px ${accent}` : undefined,
            }}
          />
        </div>
      </div>

      <ul className="space-y-1.5 border-t border-zinc-900 pt-3">
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
        disabled={!unlocked || hasSpun || spinning}
        className="border-2 px-4 py-2.5 font-pitch text-xs font-bold uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          borderColor: unlocked ? accent : "rgb(39 39 42)",
          background: unlocked && !hasSpun ? accent : "transparent",
          color: unlocked && !hasSpun ? "black" : "rgb(113 113 122)",
        }}
      >
        {hasSpun
          ? "Used today"
          : spinning
            ? "Spinning…"
            : unlocked
              ? "Open vault"
              : "Locked"}
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