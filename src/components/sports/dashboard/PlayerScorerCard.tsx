import { ArrowUpRight } from "lucide-react";
import type { TopScorer } from "@/data/sports-mock";

export function PlayerScorerCard({ player }: { player: TopScorer }) {
  return (
    <a
      href={player.href}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:border-white/15"
    >
      {/* Photo with dashed neon ring */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border border-dashed border-white/20" />
        <div
          className="absolute inset-1 overflow-hidden rounded-full"
          style={{ boxShadow: `0 0 24px -4px oklch(0.7 0.22 ${player.club.hue} / 0.6)` }}
        >
          <img src={player.photo} alt={`${player.firstName} ${player.lastName}`} className="h-full w-full object-cover" />
        </div>
        <img src={player.club.logo} alt="" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-surface p-0.5 ring-2 ring-surface" />
      </div>

      {/* Name + goals pill */}
      <div className="min-w-0">
        <div className="font-sans text-xs text-muted-foreground">{player.firstName}</div>
        <div className="font-display text-2xl font-semibold leading-tight text-foreground">{player.lastName}</div>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
          {player.goals} Goals
        </span>
      </div>

      {/* Jersey + link icon */}
      <div className="flex flex-col items-end gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full border border-border bg-white/[0.04] text-muted-foreground group-hover:text-foreground">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        <div className="relative grid h-14 w-14 place-items-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/15" />
          <span className="font-display text-2xl font-bold text-foreground">{player.jersey}</span>
        </div>
      </div>
    </a>
  );
}
