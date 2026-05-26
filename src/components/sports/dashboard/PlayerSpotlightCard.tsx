import { ChevronLeft, ChevronRight, Footprints, GitFork, Trophy, X } from "lucide-react";
import type { ComponentType } from "react";

interface PlayerSpotlightCardProps {
  handle: string;
  firstName: string;
  lastName: string;
  position: string;
  photo: string;
  stats: { label: string; value: number }[];
}

const STAT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Goals: Footprints,
  Assist: GitFork,
  Matches: Trophy,
};

export function PlayerSpotlightCard({ handle, firstName, lastName, position, photo, stats }: PlayerSpotlightCardProps) {
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface bg-ambient p-5 shadow-card">
      {/* top row */}
      <header className="relative z-10 flex items-center justify-between">
        <button aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.04] text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div className="font-display text-xl font-semibold tracking-tight text-foreground">
            <span className="text-neon">@</span> {handle}
          </div>
        </div>
        <button aria-label="Rank" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/[0.04] text-muted-foreground hover:text-foreground">
          <Trophy className="h-4 w-4" />
        </button>
      </header>

      {/* player visual */}
      <div className="relative my-4 flex flex-1 items-center justify-center">
        {/* outer glow rings */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg,oklch(0.7_0.28_340/0.85),oklch(0.55_0.2_295/0.4),oklch(0.7_0.28_340/0.85))] blur-[2px]" style={{ WebkitMask: "radial-gradient(circle, transparent 46%, black 49%, black 52%, transparent 55%)", mask: "radial-gradient(circle, transparent 46%, black 49%, black 52%, transparent 55%)" }} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ boxShadow: "0 0 80px 10px oklch(0.7 0.28 340 / 0.45) inset, 0 0 120px 20px oklch(0.55 0.2 295 / 0.35)" }} />

        {/* player photo */}
        <img
          src={photo}
          alt={`${firstName} ${lastName}`}
          loading="lazy"
          className="relative z-10 h-[320px] w-[260px] rounded-[140px] object-cover object-top"
        />

        {/* prev / next */}
        <button aria-label="Previous" className="absolute left-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground backdrop-blur hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button aria-label="Next" className="absolute right-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground backdrop-blur hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* name + position */}
      <div className="relative z-10">
        <h3 className="font-display text-3xl font-bold leading-tight text-foreground">
          {firstName} {lastName}
        </h3>
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-white/[0.05]">●</span>
          {position}
        </div>
      </div>

      {/* stats */}
      <div className="relative z-10 mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
        {stats.map((s) => {
          const Icon = STAT_ICONS[s.label] ?? Trophy;
          return (
            <div key={s.label} className="flex flex-col items-center text-center">
              <Icon className="h-4 w-4 text-neon" />
              <div className="mt-1.5 font-display text-2xl font-bold tabular-nums text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
