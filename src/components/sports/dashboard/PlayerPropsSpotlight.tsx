import { useState } from "react";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { PlayerSpotlight } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * Spotlight column — same neon-ring portrait treatment, but the lower
 * panel is a stack of binary player-prop markets (anytime scorer, 2+
 * goals, shots o/u). Each row is a tradeable OmenX market.
 */
export function PlayerPropsSpotlight({ players }: { players: PlayerSpotlight[] }) {
  const [index, setIndex] = useState(0);
  const count = players.length;
  const player = players[index % count];
  const goPrev = () => setIndex((i) => (i - 1 + count) % count);
  const goNext = () => setIndex((i) => (i + 1) % count);
  const shareCurrent = () => {
    const href = player.props[0]?.tradeHref ?? "#";
    const url =
      typeof window !== "undefined"
        ? new URL(href, window.location.origin).toString()
        : href;
    navigator.clipboard?.writeText(url);
    toast.success("Link copied");
  };
  const imageFitClass = player.imageFit === "contain" ? "object-contain p-6" : "object-cover object-top";
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface bg-ambient p-5 shadow-card">
      <header className="relative z-10 flex items-center justify-between">
        <span
          aria-hidden
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          {index + 1} / {count}
        </span>
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Spotlight · {player.props.length} markets
          </div>
          <div className="font-display text-base font-semibold text-foreground">
            <span className="text-neon">@</span>
            {player.handle}
          </div>
        </div>
        <button
          type="button"
          aria-label="Share"
          onClick={shareCurrent}
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.04] text-muted-foreground transition hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </header>

      {/* portrait */}
      <div className="relative my-3 flex items-center justify-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg,oklch(0.7_0.28_340/0.85),oklch(0.55_0.2_295/0.4),oklch(0.7_0.28_340/0.85))] blur-[2px]"
          style={{
            WebkitMask: "radial-gradient(circle, transparent 46%, black 49%, black 52%, transparent 55%)",
            mask: "radial-gradient(circle, transparent 46%, black 49%, black 52%, transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ boxShadow: "0 0 70px 10px oklch(0.7 0.28 340 / 0.4) inset, 0 0 100px 20px oklch(0.55 0.2 295 / 0.3)" }}
        />
        <img
          key={player.handle}
          src={player.photo}
          alt={`${player.firstName} ${player.lastName}`}
          loading="lazy"
          className={`relative z-10 h-[240px] w-[200px] rounded-[110px] bg-white/[0.04] ${imageFitClass}`}
        />
        <button
          type="button"
          aria-label="Previous"
          onClick={goPrev}
          className="absolute left-1 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground backdrop-blur transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={goNext}
          className="absolute right-1 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground backdrop-blur transition hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10">
        <h3 className="font-display text-2xl font-bold leading-tight text-foreground">
          {player.firstName} {player.lastName}
        </h3>
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-white/[0.05]">●</span>
          {player.position}
        </div>
      </div>

      {/* prop markets */}
      <div className="relative z-10 mt-4 flex flex-col gap-2 border-t border-border pt-4">
        {player.props.map((m) => (
          <a key={m.id} href={m.tradeHref} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.06] transition hover:bg-white/[0.06]">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{m.title}</div>
              <div className="font-mono text-[10px] text-muted-foreground">Vol {m.volume} · {m.endsLabel}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {m.outcomes.slice(0, 2).map((o) => (
                <div key={o.id} className="flex flex-col items-center">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{o.label}</span>
                  <PricePill price={o.price} delta={o.delta24h} size="sm" />
                </div>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}