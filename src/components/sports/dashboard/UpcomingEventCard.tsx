import { Clock } from "lucide-react";
import type { TeamLite } from "@/data/sports-mock";

interface UpcomingEventCardProps {
  home: TeamLite;
  away: TeamLite;
  kickoff: string;
  dateLabel: string;
  league: { name: string; short: string };
  href: string;
}

export function UpcomingEventCard({ home, away, kickoff, dateLabel, league, href }: UpcomingEventCardProps) {
  return (
    <a href={href} className="group flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:border-white/15">
      <div className="flex items-center justify-between gap-2">
        <TeamSide team={home} align="left" />
        <span className="rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] text-foreground">{kickoff}</span>
        <TeamSide team={away} align="right" />
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {dateLabel}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-neon text-[8px] font-bold text-primary-foreground">L</span>
          {league.name}
        </span>
      </div>
    </a>
  );
}

function TeamSide({ team, align }: { team: TeamLite; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 16px -4px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
      >
        <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
      </div>
      <span className="truncate text-sm font-medium text-foreground">{team.name}</span>
    </div>
  );
}
