import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import type { LeagueHub } from "@/data/leagues";

/**
 * Compact secondary card for leagues whose hubs aren't actively pushed
 * yet. Used on the homepage alongside `LeagueSpotlightCard` to honestly
 * signal "this is coming, not live" without faking volume.
 *
 * Still clickable so curious users can peek at the empty hub.
 */
export function LeagueComingSoonCard({
  league,
}: {
  league: LeagueHub;
}) {
  const startsLabel = league.startsLabel;
  return (
    <Link
      to="/league/$slug"
      params={{ slug: league.slug }}
      search={{ view: "games" }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-border/80 bg-surface/60 p-3.5 transition hover:border-white/15 hover:bg-surface"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.04] p-1.5 ring-1 ring-white/10">
        <img
          src={league.logo}
          alt=""
          className="h-full w-full object-contain opacity-60 grayscale transition group-hover:opacity-90 group-hover:grayscale-0"
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-semibold text-foreground/85">
          {league.name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {startsLabel ? `Opens ${startsLabel}` : "Coming soon"}
        </div>
      </div>
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.05] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/10 transition group-hover:text-foreground"
        aria-hidden
      >
        <Bell className="h-3 w-3" /> Notify
      </span>
    </Link>
  );
}