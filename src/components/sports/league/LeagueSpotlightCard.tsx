import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Flame } from "lucide-react";
import type { LeagueHub } from "@/data/leagues";

/**
 * Full-width hero card for the league we're actively pushing on the
 * homepage. Visual weight = "this is THE thing right now": big crest,
 * accent gradient, kickoff countdown, a few preview chips and a bold CTA.
 *
 * Pairs with `LeagueComingSoonCard` for the rest of the rollout list.
 */
export function LeagueSpotlightCard({
  league,
  eventCount,
  highlights = [],
  kickoffLabel,
}: {
  league: LeagueHub;
  /** Number of live events in the hub (drives the "N events live" chip). */
  eventCount: number;
  /** Up to ~4 short prop/event names to tease inside the card. */
  highlights?: string[];
  /** Human-readable kickoff string, e.g. "Kicks off June 11". */
  kickoffLabel?: string;
}) {
  const accent = league.accent;
  return (
    <Link
      to="/league/$slug"
      params={{ slug: league.slug }}
      search={{ view: "games" }}
      className="group relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:border-white/15 md:p-6"
      style={{
        backgroundImage: `
          radial-gradient(circle at 12% 0%, oklch(${accent} / 0.32), transparent 55%),
          radial-gradient(circle at 88% 100%, oklch(${accent} / 0.18), transparent 55%)
        `,
      }}
    >
      {/* Top row: status + meta */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
          style={{
            backgroundColor: `oklch(${accent} / 0.22)`,
            color: `oklch(${accent})`,
            boxShadow: `inset 0 0 0 1px oklch(${accent} / 0.45)`,
          }}
        >
          <Flame className="h-3 w-3" /> Now trading
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {eventCount} {eventCount === 1 ? "event" : "events"} live
        </span>
        {kickoffLabel && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <CalendarDays className="h-3 w-3" /> {kickoffLabel}
          </span>
        )}
      </div>

      {/* Body: crest + title */}
      <div className="flex items-center gap-4 md:gap-6">
        <span
          className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/[0.06] p-2 ring-1 ring-white/15 md:h-20 md:w-20"
          style={{ boxShadow: `0 0 32px -8px oklch(${accent} / 0.7)` }}
        >
          <img src={league.logo} alt="" className="h-full w-full object-contain" loading="eager" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-2xl font-semibold text-foreground md:text-3xl">
            {league.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground md:text-sm">
            {league.tagline}
          </p>
        </div>
      </div>

      {/* Highlight chips */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {highlights.slice(0, 4).map((h) => (
            <span
              key={h}
              className="truncate rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-foreground/85 ring-1 ring-white/10"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Games · Props · Bracket
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-background transition group-hover:gap-2.5"
          style={{ backgroundColor: `oklch(${accent})` }}
        >
          Enter the hub <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}