import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PlayerSpotlight } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * Spotlight column — same neon-ring portrait treatment, but the lower
 * panel is a stack of binary player-prop markets (anytime scorer, 2+
 * goals, shots o/u). Each row is a tradeable OmenX market.
 */
export function PlayerPropsSpotlight({ player }: { player: PlayerSpotlight }) {
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface bg-ambient p-5 shadow-card">
      <header className="relative z-10 flex items-center justify-between">
        <button aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.04] text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Player markets</div>
          <div className="font-display text-base font-semibold text-foreground">
            <span className="text-neon">@</span>
            {player.handle}
          </div>
        </div>
        <a href={player.props[0]?.tradeHref ?? "#"} aria-label="Open" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.04] text-muted-foreground hover:text-foreground">
          <ArrowUpRight className="h-4 w-4" />
        </a>
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
        <img src={player.photo} alt={`${player.firstName} ${player.lastName}`} loading="lazy" className="relative z-10 h-[240px] w-[200px] rounded-[110px] object-cover object-top" />
        <button aria-label="Previous" className="absolute left-1 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground backdrop-blur hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button aria-label="Next" className="absolute right-1 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground backdrop-blur hover:text-foreground">
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