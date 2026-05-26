import { cn } from "@/lib/utils";
import { LeaderboardRow, LeaderboardHeader } from "./LeaderboardRow";

export interface StandingsRow {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

interface StandingsPreviewProps {
  league: string;
  rows: StandingsRow[];
  className?: string;
}

/**
 * Compact standings preview for the bento grid. Surfaces the top of a league
 * table — each row hover-clickable as a future market filter.
 */
export function StandingsPreview({ league, rows, className }: StandingsPreviewProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between pb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
          {league} · standings
        </span>
        <a href="#" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          Full table →
        </a>
      </div>
      <LeaderboardHeader />
      <div className="mt-1 flex flex-1 flex-col justify-between">
        {rows.map((r, i) => (
          <LeaderboardRow key={r.team} rank={i + 1} {...r} />
        ))}
      </div>
    </div>
  );
}