import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { CARNIVAL_PRIZE_POOL, CARNIVAL_ENDS_AT } from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";
import heroBgAsset from "@/assets/carnival/hero-trophy-stadium.jpg.asset.json";
import { CarnivalFlagsMarquee } from "./CarnivalFlagsMarquee";
import { TwinkleField } from "./ConfettiLayer";

/**
 * SSR-safe countdown. Returns null until mounted on the client to avoid
 * hydration mismatches (Date.now() is non-deterministic across SSR/client).
 */
function useCountdown(targetIso: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
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
      {/* Full-bleed cinematic background: trophy hero-lit on the left,
          night stadium on the right — one cohesive scene. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-left opacity-55"
        style={{ backgroundImage: `url(${heroBgAsset.url})` }}
      />
      {/* Dark veil so the LED numerals stay readable on top */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      {/* Soft green atmosphere glow */}
      <div
        aria-hidden
        className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full opacity-50"
        style={{
          background: "oklch(0.7 0.18 145 / 0.25)",
          filter: "blur(80px)",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-25" />
      <TwinkleField count={compact ? 8 : 22} />
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

      {/* Four metallic L-brackets in each corner — like a real LED scoreboard frame. */}
      <CornerBracket className="left-1.5 top-1.5" />
      <CornerBracket className="right-1.5 top-1.5 rotate-90" />
      <CornerBracket className="left-1.5 bottom-1.5 -rotate-90" />
      <CornerBracket className="right-1.5 bottom-1.5 rotate-180" />

      {/* Flag marquee strip across the very top */}
      {!compact && (
        <div className="relative border-b border-zinc-900/80">
          <CarnivalFlagsMarquee height={18} opacity={0.55} />
        </div>
      )}

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
          <div className="flex min-w-[180px] flex-col items-center rounded border border-zinc-800 bg-black/90 px-4 py-2 shadow-2xl">
            <span className="font-pitch text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Ends in
            </span>
            <span
              className="font-scoreboard text-base font-bold text-[oklch(0.7_0.18_145)] tabular-nums leading-tight tracking-tight"
              suppressHydrationWarning
            >
              {c ? (
                <>
                  {pad(c.days)} <span className="text-zinc-700">:</span> {pad(c.hours)}{" "}
                  <span className="text-zinc-700">:</span> {pad(c.minutes)}{" "}
                  <span className="text-zinc-700">:</span> {pad(c.seconds)}
                </>
              ) : (
                "—— : —— : —— : ——"
              )}
            </span>
          </div>
        </div>

        {/* big number */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4">
            {/* left neon rail anchor */}
            <span
              aria-hidden
              className="hidden h-[2px] w-10 md:block"
              style={{
                background: "oklch(0.7 0.18 145)",
                boxShadow: "0 0 10px oklch(0.7 0.18 145 / 0.6)",
              }}
            />
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
            {/* right neon rail anchor */}
            <span
              aria-hidden
              className="hidden h-[2px] w-10 md:block"
              style={{
                background: "oklch(0.7 0.18 145)",
                boxShadow: "0 0 10px oklch(0.7 0.18 145 / 0.6)",
              }}
            />
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded border border-zinc-800 bg-[#0e0e0e] px-3 py-1">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span className="font-scoreboard text-[10px] font-bold uppercase tracking-[0.25em] text-[oklch(0.7_0.18_145)]">
              Jackpot accumulating · World Cup 2026 edition
            </span>
          </div>
        </div>
      </div>

      {/* Flag marquee strip across the very bottom — reverse direction */}
      {!compact && (
        <div className="relative border-t border-zinc-900/80">
          <CarnivalFlagsMarquee height={14} opacity={0.4} reverse />
        </div>
      )}
    </div>
  );
}

function CornerBracket({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={"absolute z-10 h-5 w-5 " + className}
      style={{
        borderLeft: "2px solid oklch(0.7 0.18 145 / 0.7)",
        borderTop: "2px solid oklch(0.7 0.18 145 / 0.7)",
        filter: "drop-shadow(0 0 6px oklch(0.7 0.18 145 / 0.6))",
      }}
    />
  );
}