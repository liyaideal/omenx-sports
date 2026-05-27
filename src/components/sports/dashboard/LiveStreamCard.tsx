import { Link } from "@tanstack/react-router";
import { Play, Users } from "lucide-react";
import type { SportsMarket, TeamLite } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * Compact "we are streaming this match" tile, sized to drop into the same
 * grid cell as EventMarketTileCard. Distinguished by a small video-poster
 * header strip with a LIVE pill + play overlay + live score, then the same
 * outcome-row + footer rhythm as a regular event tile.
 */
export function LiveStreamCard({ market }: { market: SportsMarket }) {
  const fixture = market.fixture;
  if (!fixture || !market.liveScore) return null;

  const headline = market.outcomes.filter((o) => o.label !== "Draw").slice(0, 2);

  return (
    <Link
      to="/event/$id"
      params={{ id: market.id }}
      className="group flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-[color:var(--accent)]/40 bg-surface p-5 shadow-card ring-1 ring-[color:var(--accent)]/20 transition hover:border-[color:var(--accent)]/60"
    >
      {/* Poster header strip with LIVE pill + play + score */}
      <div className="relative -mx-5 -mt-5 aspect-[16/7] overflow-hidden">
        {market.livePoster ? (
          <img
            src={market.livePoster}
            alt={`${fixture.home.name} vs ${fixture.away.name} live`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-transparent" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--accent-foreground)]">
            <span className="relative grid h-1.5 w-1.5 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            LIVE
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/80">
            {market.league.short}
          </span>
        </div>

        {market.liveClock && (
          <span className="absolute right-3 top-3 rounded-full bg-background/60 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white ring-1 ring-white/20 backdrop-blur">
            {market.liveClock}
          </span>
        )}

        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/60 ring-1 ring-white/30 backdrop-blur-md transition group-hover:scale-105">
          <Play className="h-4 w-4 translate-x-0.5 fill-foreground text-foreground" />
        </span>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-3">
        <TeamScore team={fixture.home} score={market.liveScore.home} align="left" />
        <span className="font-serif-display text-sm italic text-muted-foreground">vs</span>
        <TeamScore team={fixture.away} score={market.liveScore.away} align="right" />
      </div>

      {/* Outcome rows */}
      <div className="flex flex-1 flex-col gap-1.5">
        {headline.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.05] transition group-hover:bg-white/[0.06]"
          >
            <div className="flex min-w-0 items-center gap-2">
              {o.team && (
                <img src={o.team.logo} alt="" className="h-5 w-5 shrink-0 object-contain" />
              )}
              <span className="truncate text-sm font-medium text-foreground">
                {o.team?.name ?? o.label}
              </span>
            </div>
            <PricePill price={o.price} delta={o.delta24h} size="md" />
          </div>
        ))}
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 text-[color:var(--accent)]">
          <span className="relative grid h-1.5 w-1.5 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          Streaming now
        </span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {market.participants.toLocaleString()}</span>
          <span className="text-foreground">Vol {market.volume}</span>
        </span>
      </footer>
    </Link>
  );
}

function TeamScore({
  team,
  score,
  align,
}: {
  team: TeamLite;
  score: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 16px -4px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
      >
        <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
      </div>
      <div className={`flex min-w-0 flex-col ${align === "right" ? "items-end" : "items-start"}`}>
        <span className="truncate text-[11px] font-medium text-muted-foreground">{team.short}</span>
        <span className="font-display text-xl font-semibold leading-none tabular-nums text-foreground">
          {score}
        </span>
      </div>
    </div>
  );
}