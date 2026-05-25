import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";
import { LeagueBadge } from "./LeagueBadge";
import { CountdownPill } from "./CountdownPill";

interface EventHeaderProps {
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  home: string;
  away: string;
  kickoff: string;
  status?: "live" | "upcoming" | "final";
  volume: string;
  liquidity: string;
  endsIn: string;
  className?: string;
}

const STATUS: Record<NonNullable<EventHeaderProps["status"]>, { label: string; cls: string }> = {
  live: { label: "Live", cls: "text-neon bg-neon/10 ring-1 ring-neon/30" },
  upcoming: { label: "Upcoming", cls: "text-primary bg-primary/10 ring-1 ring-primary/30" },
  final: { label: "Final", cls: "text-muted-foreground bg-white/[0.04]" },
};

export function EventHeader({
  league,
  home,
  away,
  kickoff,
  status = "upcoming",
  volume,
  liquidity,
  endsIn,
  className,
}: EventHeaderProps) {
  const s = STATUS[status];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface bg-ambient p-6 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LeagueBadge league={league} />
          <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest", s.cls)}>
            {s.label}
          </span>
        </div>
        <CountdownPill value={endsIn} tone={status === "live" ? "live" : "muted"} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <TeamCrest name={home} size="xl" />
          <div className="font-display font-semibold text-foreground">{home}</div>
        </div>
        <div className="text-center">
          <div className="font-serif-display italic text-3xl text-muted-foreground">vs</div>
          <div className="mt-1 font-mono text-xs text-muted-foreground tracking-wider">{kickoff}</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <TeamCrest name={away} size="xl" />
          <div className="font-display font-semibold text-foreground">{away}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
        <Stat label="Volume" value={volume} />
        <Stat label="Liquidity" value={liquidity} />
        <Stat label="Ends in" value={endsIn} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}