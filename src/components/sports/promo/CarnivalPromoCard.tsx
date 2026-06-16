import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CARNIVAL_PRIZE_POOL, CARNIVAL_ENDS_AT } from "@/data/world-cup-carnival";
import trophyAsset from "@/assets/carnival/wc-trophy-gold.png.asset.json";

function useCountdown(targetIso: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m`;
}

/**
 * Mini LED scoreboard slotted into the World Cup league hub hero (right
 * side). Drives traffic from the games/props page into the carnival hub.
 */
export function CarnivalPromoCard() {
  const left = useCountdown(CARNIVAL_ENDS_AT);
  return (
    <div className="relative w-full max-w-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-2xl bg-[oklch(0.7_0.18_145)]/20 blur-xl transition-opacity duration-500 group-hover/carnival:opacity-100"
      />
      <Link
        to="/promo/world-cup"
        search={{ tab: "overview" }}
        className="group/carnival relative block w-full overflow-hidden rounded-2xl border-2 border-[oklch(0.7_0.18_145)]/40 bg-black px-5 py-4 transition-colors hover:border-[oklch(0.7_0.18_145)]"
      >
        <div aria-hidden className="absolute inset-0 bg-carnival-led-dots" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[oklch(0.7_0.18_145)]/40 to-transparent animate-carnival-scan"
        />
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 0%, oklch(0.7 0.18 145) 50%, transparent 100%)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              aria-hidden
              className="absolute inset-0 -m-2 rounded-full bg-yellow-400/25 blur-2xl transition-transform duration-500 group-hover/carnival:scale-125"
            />
            <img
              src={trophyAsset.url}
              alt=""
              aria-hidden
              className="relative h-12 w-12 object-contain transition-transform duration-500 group-hover/carnival:scale-110"
              style={{ filter: "drop-shadow(0 0 12px rgba(242,208,36,0.6))" }}
            />
          </div>
          <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
            </span>
            <span className="font-pitch text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              World Cup Carnival
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
                className="font-scoreboard text-xl font-black italic tabular-nums text-[oklch(0.7_0.18_145)] animate-pulse"
                style={{ filter: "drop-shadow(0 0 10px oklch(0.7 0.18 145 / 0.7))" }}
            >
              {CARNIVAL_PRIZE_POOL.toLocaleString()}
            </span>
            <span className="font-scoreboard text-sm font-bold text-zinc-400">U</span>
            <span className="ml-1 font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              prize pool
            </span>
          </div>
            <div
              className="mt-1 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-scoreboard text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
              suppressHydrationWarning
            >
              Ends in {left ?? "——"}
            </div>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-[oklch(0.7_0.18_145)]/50 bg-[oklch(0.7_0.18_145)]/10 text-[oklch(0.7_0.18_145)] transition-all group-hover/carnival:translate-x-1 group-hover/carnival:bg-[oklch(0.7_0.18_145)] group-hover/carnival:text-black">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </div>
  );
}