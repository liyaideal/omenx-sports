import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";
import { TeamCrest } from "./TeamCrest";
import { TeamName } from "./TeamName";
import type { Team } from "@/lib/teams";

export interface MiniEventCardProps {
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  home: Team;
  away: Team;
  kickoff: string;
  /** e.g. "Today · 21:00" */
  whenLabel: string;
  href?: string;
  className?: string;
}

/**
 * Compact event card sized for the bento grid (~104px tall). Sibling of
 * MatchCard, but denser and primary-action-first (the whole card is the link
 * to trade rather than a passive listing).
 */
export function MiniEventCard({
  league,
  home,
  away,
  kickoff,
  whenLabel,
  href = "#",
  className,
}: MiniEventCardProps) {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:bg-surface-elevated",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-neon opacity-0 transition-opacity group-hover:opacity-100" />
      <LeagueBadge league={league} showLabel={false} />
      <div className="flex flex-1 items-center gap-3">
        <TeamCrest name={home.name} abbr={home.short} logoUrl={home.logo} size="sm" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">vs</span>
        <TeamCrest name={away.name} abbr={away.short} logoUrl={away.logo} size="sm" />
        <div className="ml-1 flex min-w-0 flex-col">
          <span className="truncate text-xs font-semibold text-foreground">
            <TeamName short={home.short} full={home.name} /> – <TeamName short={away.short} full={away.name} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {whenLabel} · {kickoff}
          </span>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </a>
  );
}