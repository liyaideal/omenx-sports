import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { CARNIVAL_PRIZE_POOL, CARNIVAL_ENDS_AT } from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

function pad(n: number, width = 2) {
  return n.toString().padStart(width, "0");
}

/**
 * Stadium LED scoreboard — the headline visual for the World Cup Carnival
 * hub. Black slab, dot-matrix background, accent-green Orbitron numerals.
 * Used both at the top of /promo/world-cup and in the style guide demo.
 */
export function ScoreboardHero({ compact = false }: { compact?: boolean }) {
  const c = useCountdown(CARNIVAL_ENDS_AT);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border-4 bg-black shadow-[0_0_50px_rgba(0,0,0,0.9)]",
        "border-[#1a1a1a]",
      )}
    >
      <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-25" />
      {/* side neon rails */}
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent 0%, oklch(0.7 0.18 145) 50%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-1 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent 0%, oklch(0.7 0.18 145) 50%, transparent 100%)",
        }}
      />

      <div className={cn("relative grid gap-6 p-6 md:p-10", compact && "p-5 md:p-6")}>
        {/* top row: live + edition + countdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
            <span className="font-pitch text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Live Prize Pool
            </span>
          </div>
          <div className="flex items-center gap-2 rounded border border-zinc-800 bg-[#0c0c0c] px-3 py-1.5">
            <span className="font-pitch text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Ends in
            </span>
            <span className="font-scoreboard text-sm font-bold text-[oklch(0.7_0.18_145)] tabular-nums">
              {pad(c.days)}d : {pad(c.hours)}h : {pad(c.minutes)}m : {pad(c.seconds)}s
            </span>
          </div>
        </div>

        {/* big number */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-baseline gap-3">
            <span
              className={cn(
                "font-scoreboard font-black italic tracking-tighter text-[oklch(0.7_0.18_145)] tabular-nums",
                compact ? "text-4xl md:text-5xl" : "text-6xl md:text-8xl",
              )}
              style={{ filter: "drop-shadow(0 0 18px oklch(0.7 0.18 145 / 0.45))" }}
            >
              {CARNIVAL_PRIZE_POOL.toLocaleString()}
            </span>
            <span
              className={cn(
                "font-scoreboard font-bold text-zinc-400",
                compact ? "text-xl" : "text-3xl md:text-4xl",
              )}
            >
              U
            </span>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded border border-zinc-800 bg-[#0e0e0e] px-3 py-1">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span className="font-scoreboard text-[10px] font-bold uppercase tracking-[0.25em] text-[oklch(0.7_0.18_145)]">
              Jackpot accumulating · World Cup 2026 edition
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}