import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { PageHeader } from "@/components/sports/dashboard/PageHeader";
import { FanZoneHeader } from "@/components/sports/dashboard/FanZoneHeader";
import { FanPollCard } from "@/components/sports/dashboard/FanPollCard";
import { FanPostCard } from "@/components/sports/dashboard/FanPostCard";
import { UpcomingEventCard } from "@/components/sports/dashboard/UpcomingEventCard";
import { LeagueTableCard } from "@/components/sports/dashboard/LeagueTableCard";
import { PlayerScorerCard } from "@/components/sports/dashboard/PlayerScorerCard";
import { PlayerSpotlightCard } from "@/components/sports/dashboard/PlayerSpotlightCard";
import {
  FAN_POLL,
  FAN_POST,
  SPOTLIGHT_PLAYER,
  STANDINGS,
  TOP_SCORERS,
  UPCOMING_EVENTS,
} from "@/data/sports-mock";
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
      />
      <PageHeader title="Dashboard" balance="€0,00" />

      <div className="grid gap-5 px-6 pb-6 md:px-8 md:pb-8 lg:grid-cols-[340px_minmax(0,1fr)_360px]">
        {/* LEFT — Fan Zone */}
        <section className="flex flex-col gap-4">
          <FanZoneHeader />
          <FanPollCard {...FAN_POLL} />
          <FanPostCard {...FAN_POST} />
        </section>

        {/* CENTER — Upcoming + Table + Scorers */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">
              Upcoming <span className="font-serif-display italic text-neon">event</span>
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {UPCOMING_EVENTS.map((e, i) => (
              <UpcomingEventCard key={i} {...e} />
            ))}
          </div>
          <LeagueTableCard league="PREMIER LEAGUE" rows={STANDINGS} />
          <div className="grid gap-3">
            {TOP_SCORERS.map((p) => (
              <PlayerScorerCard key={p.lastName} player={p} />
            ))}
          </div>
        </section>

        {/* RIGHT — Spotlight */}
        <section className="flex flex-col">
          <PlayerSpotlightCard {...SPOTLIGHT_PLAYER} />
        </section>
      </div>

      {/* OmenX bridge strip */}
      <div className="border-t border-border px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground">
            Portfolio, payouts, and account live on the OmenX main site.
          </div>
          <div className="flex items-center gap-2">
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
