import { Clock } from "lucide-react";
import type { SportsMarket, TeamLite } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * Compact match market tile used in the upcoming strip. Same chrome as
 * the old UpcomingEventCard but the inline mini-row exposes 1 / X / 2
 * prices and volume so it reads as a market, not a calendar entry.
 */
export function EventMarketTileCard({ market }: { market: SportsMarket }) {
  if (!market.fixture) return null;
  const { home, away } = market.fixture;
  return (
    <a
      href={market.tradeHref}
      className="group flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:border-white/15"
    >
      <div className="flex items-center justify-between gap-2">
        <TeamSide team={home} align="left" />
        <span className="rounded-full bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-muted-foreground">vs</span>
        <TeamSide team={away} align="right" />
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {market.outcomes.map((o) => (
          <div key={o.id} className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.03] py-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {o.team?.short ?? o.meta ?? o.label}
            </span>
            <PricePill price={o.price} delta={o.delta24h} size="sm" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2.5 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {market.endsLabel}</span>
        <span className="text-foreground">Vol {market.volume}</span>
      </div>
    </a>
  );
}

function TeamSide({ team, align }: { team: TeamLite; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 16px -4px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
      >
        <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
      </div>
      <span className="truncate text-xs font-medium text-foreground">{team.short}</span>
    </div>
  );
}