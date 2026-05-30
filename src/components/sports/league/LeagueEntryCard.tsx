import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { LeagueHub } from "@/data/leagues";

/**
 * Compact entry card for a league hub. Used on `/events` (mobile bottom
 * row) and on the desktop home page in place of the legacy season-futures
 * grid. Click → `/league/$slug?view=games`.
 */
export function LeagueEntryCard({
  league,
  matchCount,
  variant = "card",
}: {
  league: LeagueHub;
  matchCount: number;
  /** "card" = full block, "chip" = pill chip for tight rows. */
  variant?: "card" | "chip";
}) {
  if (variant === "chip") {
    return (
      <Link
        to="/league/$slug"
        params={{ slug: league.slug }}
        search={{ view: "games" }}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 transition hover:border-white/15"
      >
        <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/10">
          <img src={league.logo} alt="" className="h-[78%] w-[78%] object-contain" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground">
          {league.name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {matchCount}
        </span>
      </Link>
    );
  }
  return (
    <Link
      to="/league/$slug"
      params={{ slug: league.slug }}
      search={{ view: "games" }}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card transition hover:border-white/15"
      style={{
        backgroundImage: `radial-gradient(circle at 0% 0%, oklch(${league.accent} / 0.16), transparent 65%)`,
      }}
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06] p-1.5 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 16px -6px oklch(${league.accent} / 0.6)` }}
      >
        <img src={league.logo} alt="" className="h-full w-full object-contain" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{
              backgroundColor: `oklch(${league.accent} / 0.18)`,
              color: `oklch(${league.accent})`,
            }}
          >
            {league.kind === "tournament" ? "Tournament" : "Season"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {matchCount} {matchCount === 1 ? "market" : "markets"}
          </span>
        </div>
        <div className="mt-1 truncate font-display text-base font-semibold text-foreground">
          {league.name}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {league.tagline}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}