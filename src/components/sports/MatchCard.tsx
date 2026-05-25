import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";
import { LeagueBadge } from "./LeagueBadge";

export interface MatchCardProps {
  home: string;
  away: string;
  kickoff: string;
  date: string;
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  status?: "upcoming" | "live" | "final";
  className?: string;
}

const STATUS: Record<NonNullable<MatchCardProps["status"]>, { label: string; cls: string }> = {
  upcoming: { label: "Upcoming", cls: "text-muted-foreground bg-white/5" },
  live: { label: "Live", cls: "text-neon bg-neon/10 ring-1 ring-neon/30" },
  final: { label: "Final", cls: "text-muted-foreground bg-white/5" },
};

export function MatchCard({ home, away, kickoff, date, league, status = "upcoming", className }: MatchCardProps) {
  const s = STATUS[status];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:bg-surface-elevated hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <TeamCrest name={home} size="md" />
          <div className="text-sm font-display font-semibold text-foreground">{home}</div>
        </div>
        <div className="font-mono text-xs text-muted-foreground tabular-nums">{kickoff}</div>
        <div className="flex items-center gap-2.5">
          <div className="text-sm font-display font-semibold text-foreground text-right">{away}</div>
          <TeamCrest name={away} size="md" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Clock className="h-3 w-3" />
          {date}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", s.cls)}>
            {s.label}
          </span>
          <LeagueBadge league={league} showLabel={false} />
        </div>
      </div>
    </div>
  );
}