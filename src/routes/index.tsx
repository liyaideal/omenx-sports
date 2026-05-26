import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { MatchMarketCard } from "@/components/sports/dashboard/MatchMarketCard";
import { EventMarketTileCard } from "@/components/sports/dashboard/EventMarketTileCard";
import { LeagueWinnerMarketCard } from "@/components/sports/dashboard/LeagueWinnerMarketCard";
import { TopScorerMarketCard } from "@/components/sports/dashboard/TopScorerMarketCard";
import { PlayerPropsSpotlight } from "@/components/sports/dashboard/PlayerPropsSpotlight";
import {
  ACCOUNT_STATS,
  FEATURED_MATCH,
  LEAGUE_WINNER_MARKET,
  MATCH_MARKETS,
  SPOTLIGHT,
  TOP_SCORER_MARKET,
} from "@/data/sports-markets";
import { TOP_SCORERS } from "@/data/sports-mock";
import { omenxUrl } from "@/lib/omenx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stadium Neon — Sports prediction markets on OmenX" },
      {
        name: "description",
        content:
          "Bet the moment. Trade binary sports markets across the EPL, La Liga, UCL, and NBA — settled on OmenX.",
      },
      { property: "og:title", content: "Stadium Neon — A sports zone by OmenX" },
      {
        property: "og:description",
        content:
          "Live sports prediction markets with deep order books and instant settlement, powered by OmenX.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <AppTopBar
        userName="Jeremy"
        userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
        equity={ACCOUNT_STATS.available}
      />

      <div className="grid gap-5 px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10 lg:grid-cols-[340px_minmax(0,1fr)_360px]">
        {/* LEFT — Featured market (spans both rows) */}
        <section className="flex flex-col gap-4 lg:row-span-2">
          <SectionHeader title="Featured" accent="event" />
          <MatchMarketCard market={FEATURED_MATCH} />
        </section>

        {/* TOP — Live & upcoming, spans col 2–3, sits above the spotlight */}
        <section className="flex flex-col gap-4 lg:col-span-2 lg:col-start-2 lg:row-start-1">
          <SectionHeader
            title="Live & upcoming"
            accent="events"
            as="h1"
            live
            stats={{
              positions: ACCOUNT_STATS.openPositions,
              pnl: ACCOUNT_STATS.pnlToday,
            }}
            right={
              <a href={omenxUrl.events()} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                Browse all <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            }
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {MATCH_MARKETS.map((m) => (
              <EventMarketTileCard key={m.id} market={m} />
            ))}
          </div>
        </section>

        {/* BOTTOM CENTER — Futures + Top scorer */}
        <section className="flex flex-col gap-5 lg:col-start-2 lg:row-start-2">
          <LeagueWinnerMarketCard market={LEAGUE_WINNER_MARKET} />
          <TopScorerMarketCard
            market={TOP_SCORER_MARKET}
            photos={{
              messi: TOP_SCORERS[0].photo,
              haaland: TOP_SCORERS[1].photo,
            }}
          />
        </section>

        {/* BOTTOM RIGHT — Player props spotlight */}
        <section className="flex flex-col lg:col-start-3 lg:row-start-2">
          <PlayerPropsSpotlight player={SPOTLIGHT} />
        </section>
      </div>

      {/* OmenX bridge strip */}
      <div className="border-t border-border px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground">
            Wallet, portfolio, payouts, and account live on the OmenX main site.
          </div>
          <div className="flex items-center gap-2">
            <a href={omenxUrl.wallet()} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-white/10 hover:bg-white/10">
              Wallet <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href={omenxUrl.portfolio()} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-white/10 hover:bg-white/10">
              Open Portfolio <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href={omenxUrl.history()} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              Settled history <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SectionHeader({
  title,
  accent,
  right,
  stats,
  live,
  as: As = "h2",
}: {
  title: string;
  accent?: string;
  right?: React.ReactNode;
  stats?: { positions: number; pnl: string };
  live?: boolean;
  as?: "h1" | "h2";
}) {
  const pnlUp = stats?.pnl.trim().startsWith("+");
  const pnlTone = stats
    ? pnlUp
      ? "text-win"
      : "text-loss"
    : "";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <As className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold">
          {live && (
            <span
              aria-label="Live"
              className="h-2 w-2 animate-pulse rounded-full bg-[oklch(0.7_0.22_25)] shadow-[0_0_8px_oklch(0.7_0.22_25)]"
            />
          )}
          <span>
            {title}
            {accent && <span className="font-serif-display italic text-neon"> {accent}</span>}
          </span>
        </As>
        {stats && (
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_6px_var(--primary)]" />
              {stats.positions} open
            </span>
            <span className="text-border">·</span>
            <span className={`inline-flex items-center gap-1 ${pnlTone}`}>
              {stats.pnl} today {pnlUp ? "↑" : "↓"}
            </span>
          </span>
        )}
      </div>
      {right}
    </div>
  );
}
