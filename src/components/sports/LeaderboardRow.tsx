import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";

export interface LeaderboardRowProps {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  rank?: number;
  className?: string;
}

export function LeaderboardRow({ team, played, wins, draws, losses, points, rank, className }: LeaderboardRowProps) {
  return (
    <div className={cn("grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/[0.03]", className)}>
      <div className="flex items-center gap-2.5">
        {rank !== undefined && <span className="w-4 text-xs font-mono text-muted-foreground tabular-nums">{rank}</span>}
        <TeamCrest name={team} size="sm" />
        <span className="text-sm font-medium text-foreground truncate">{team}</span>
      </div>
      <span className="w-6 text-right font-mono text-xs text-foreground tabular-nums">{played}</span>
      <span className="w-6 text-right font-mono text-xs text-foreground tabular-nums">{wins}</span>
      <span className="w-6 text-right font-mono text-xs text-muted-foreground tabular-nums">{losses}</span>
      <span className="w-8 text-right font-mono text-xs font-semibold text-primary tabular-nums">{points}</span>
    </div>
  );
}

export function LeaderboardHeader() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-3 pb-2 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
      <span>Team</span>
      <span className="w-6 text-right">P</span>
      <span className="w-6 text-right">W</span>
      <span className="w-6 text-right">L</span>
      <span className="w-8 text-right">PTS</span>
    </div>
  );
}