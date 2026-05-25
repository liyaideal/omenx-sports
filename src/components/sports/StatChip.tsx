import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";

export interface StatChipProps {
  player: string;
  firstName: string;
  metric: string;
  metricLabel: string;
  number: number;
  className?: string;
}

export function StatChip({ player, firstName, metric, metricLabel, number, className }: StatChipProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-card", className)}>
      <TeamCrest name={player} size="lg" />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-mono text-muted-foreground tracking-wider">{firstName}</div>
            <div className="font-serif-display italic text-lg leading-tight text-foreground">{player.split(" ").slice(-1)[0]}</div>
          </div>
          <button className="text-muted-foreground hover:text-foreground" aria-label="Open">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-primary">
          {metric} {metricLabel}
        </div>
      </div>
      {/* dashed circle with number */}
      <div className="relative grid h-14 w-14 place-items-center">
        <div className="absolute inset-0 rounded-full border border-dashed border-white/15" />
        <span className="font-display font-bold text-2xl text-foreground tabular-nums">{number}</span>
      </div>
    </div>
  );
}