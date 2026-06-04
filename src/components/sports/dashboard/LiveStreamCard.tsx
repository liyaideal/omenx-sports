import { Link } from "@tanstack/react-router";
import { Play, Users } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
import { TeamName } from "@/components/sports/TeamName";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { LiveDelayInfo } from "@/components/sports/live/LiveDelayInfo";

/**
 * Compact "we are streaming this match" tile, sized to drop into the same
 * grid cell as EventMarketTileCard. Distinguished by a small video-poster
 * header strip with a LIVE pill + play overlay + live score, then the same
 * outcome-row + footer rhythm as a regular event tile.
 */
export function LiveStreamCard({ market }: { market: SportsMarket }) {
  const fixture = market.fixture;
  if (!fixture || !market.liveScore) return null;
  const { openTrade } = useTradeDrawer();

  // Show every outcome (including Draw for 1X2) horizontally so the card
  // stays the same height regardless of 2- or 3-way markets.
  const outcomes = market.outcomes.slice(0, 3);

  return (
    <Link
      to="/event/$id"
      params={{ id: market.id }}
      className="group flex h-full flex-col gap-3 overflow-hidden rounded-3xl border border-[color:var(--accent)]/40 bg-surface p-4 shadow-card ring-1 ring-[color:var(--accent)]/20 transition hover:border-[color:var(--accent)]/60"
    >
      {/* Poster header strip with LIVE pill + play + score */}
      <div className="relative -mx-4 -mt-4 aspect-[16/9] overflow-hidden">
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
        </div>

        {market.liveClock && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white ring-1 ring-white/20 backdrop-blur">
            {market.liveClock}
            <LiveDelayInfo variant="score" tone="onMedia" />
          </span>
        )}

        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/60 ring-1 ring-white/30 backdrop-blur-md transition group-hover:scale-105">
          <Play className="h-4 w-4 translate-x-0.5 fill-foreground text-foreground" />
        </span>

        {/* Scoreboard overlay — broadcast-style score bug */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full bg-background/70 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur">
            <img src={fixture.home.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />
            <TeamName
              short={fixture.home.short}
              full={fixture.home.name}
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            />
            <span className="font-display text-xl font-semibold leading-none tabular-nums text-foreground">
              {market.liveScore.home}
            </span>
            <span className="text-muted-foreground">–</span>
            <span className="font-display text-xl font-semibold leading-none tabular-nums text-foreground">
              {market.liveScore.away}
            </span>
            <TeamName
              short={fixture.away.short}
              full={fixture.away.name}
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            />
            <img src={fixture.away.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />
          </div>
        </div>
      </div>

      {/* Segmented market bar — single pill split by dividers. Keeps the
          card flat regardless of 2- or 3-way markets and reads cleanly. */}
      <div className="flex items-stretch overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] transition group-hover:bg-white/[0.06]">
        {outcomes.map((o, i) => {
          const cents = Math.round(o.price * 100);
          return (
            <button
              key={o.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openTrade({ marketId: market.id, outcomeId: o.id });
              }}
              className={`flex min-w-0 flex-1 items-baseline justify-center gap-1.5 px-2 py-2.5 transition hover:bg-white/[0.06] ${
                i < outcomes.length - 1 ? "border-r border-white/[0.06]" : ""
              }`}
            >
              {o.team ? (
                <TeamName
                  short={o.team.short}
                  full={o.team.name}
                  className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                />
              ) : (
                <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {o.label}
                </span>
              )}
              <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-foreground">
                {cents}<span className="text-muted-foreground">¢</span>
              </span>
            </button>
          );
        })}
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-border pt-2.5 font-mono text-[11px] text-muted-foreground">
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