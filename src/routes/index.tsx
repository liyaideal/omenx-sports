import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { MatchMarketCard } from "@/components/sports/dashboard/MatchMarketCard";
import { EventMarketTileCard } from "@/components/sports/dashboard/EventMarketTileCard";
import { LeagueWinnerMarketCard } from "@/components/sports/dashboard/LeagueWinnerMarketCard";
import { TopScorerMarketCard } from "@/components/sports/dashboard/TopScorerMarketCard";
import { PlayerPropsSpotlight } from "@/components/sports/dashboard/PlayerPropsSpotlight";
import { FanZoneHeader } from "@/components/sports/dashboard/FanZoneHeader";
import { FanPostCard } from "@/components/sports/dashboard/FanPostCard";
import { FansZoneEmpty } from "@/components/sports/dashboard/FansZoneEmpty";
import { LiveActivityCard } from "@/components/sports/dashboard/LiveActivityCard";
import { DayStripCalendar } from "@/components/sports/dashboard/DayStripCalendar";
import { ShowMoreEventsButton } from "@/components/sports/dashboard/ShowMoreEventsButton";
import {
  ACCOUNT_STATS,
  FEATURED_MATCH,
  MATCH_MARKETS,
  SEASON_LEAGUE_GROUPS,
  SPOTLIGHTS,
} from "@/data/sports-markets";
import {
  FAN_POST,
  FOLLOWED_TEAMS,
  LIVE_TRADES,
  SUGGESTED_TEAMS,
  TEAMS,
  type TeamKey,
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
  const followedKeys = (Object.keys(TEAMS) as TeamKey[]).filter((k) =>
    FOLLOWED_TEAMS.includes(TEAMS[k]),
  );
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setExpanded(false);
  }, [selectedOffset]);
  const countsByOffset = useMemo(() => {
    const map: Record<number, number> = {};
    for (const m of MATCH_MARKETS) {
      const o = m.dayOffset ?? 0;
      map[o] = (map[o] ?? 0) + 1;
    }
    return map;
  }, []);
  const visibleMarkets = useMemo(
    () =>
      selectedOffset === null
        ? MATCH_MARKETS
        : MATCH_MARKETS.filter((m) => (m.dayOffset ?? 0) === selectedOffset),
    [selectedOffset],
  );
  const dayLabel = useMemo(() => {
    if (selectedOffset === null) return "any day";
    if (selectedOffset === 0) return "today";
    if (selectedOffset === 1) return "tomorrow";
    if (selectedOffset === -1) return "yesterday";
    const d = new Date();
    d.setDate(d.getDate() + selectedOffset);
    return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  }, [selectedOffset]);
  return (
    <AppShell>
      <AppTopBar
        userName="Jeremy"
        userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
        equity={ACCOUNT_STATS.available}
      />

      <div className="grid gap-5 px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10 lg:grid-cols-[340px_minmax(0,1fr)_360px]">
        {/* LEFT — Fans zone (spans both rows) */}
        <section className="flex flex-col gap-4 lg:row-span-2">
          <FanZoneHeader
            followingCount={FOLLOWED_TEAMS.length}
            suggested={SUGGESTED_TEAMS}
            followedNames={FOLLOWED_TEAMS.map((t) => t.name)}
          />
          {FOLLOWED_TEAMS.length > 0 ? (
            <>
              <MatchMarketCard market={FEATURED_MATCH} />
              <FanPostCard {...FAN_POST} />
            </>
          ) : (
            <FansZoneEmpty editorPick={FEATURED_MATCH} suggested={SUGGESTED_TEAMS} />
          )}
          <div className="flex-1 [&>*]:h-full">
            <LiveActivityCard
              trades={LIVE_TRADES}
              followedTeams={FOLLOWED_TEAMS}
              followedKeys={followedKeys}
            />
          </div>
        </section>

        {/* TOP — Live & upcoming, spans col 2–3, sits above the spotlight */}
        <section className="flex flex-col gap-4 lg:col-span-2 lg:col-start-2 lg:row-start-1">
          <SectionHeader
            title="Live & upcoming"
            accent=" Events"
            as="h1"
            live
          />
          <DayStripCalendar
            selectedOffset={selectedOffset}
            onSelect={setSelectedOffset}
            countsByOffset={countsByOffset}
          />
          <p className="-mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Prices in ¢ (0–100) · arrows show 24h change
          </p>
          {visibleMarkets.length > 0 ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleMarkets.map((m, idx) => {
                  const hideClass = expanded
                    ? ""
                    : idx === 0
                      ? ""
                      : idx === 1
                        ? "hidden md:block"
                        : idx === 2
                          ? "hidden xl:block"
                          : "hidden";
                  return (
                    <div key={m.id} className={`h-full ${hideClass}`}>
                      <EventMarketTileCard market={m} />
                    </div>
                  );
                })}
              </div>
              {visibleMarkets.length > 1 && (
                <ShowMoreEventsButton
                  expanded={expanded}
                  total={visibleMarkets.length}
                  onToggle={() => setExpanded((v) => !v)}
                />
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center text-sm text-muted-foreground">
              No events scheduled for {dayLabel}.
            </div>
          )}
        </section>

        {/* BOTTOM — Season markets (futures + player props) */}
        <section className="flex flex-col gap-4 lg:col-span-2 lg:col-start-2 lg:row-start-2">
          <SectionHeader
            title="Season"
            accent="Events"
          />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5 xl:grid-cols-2">
              {SEASON_LEAGUE_GROUPS.flatMap((group) => [
                <LeagueWinnerMarketCard key={`${group.id}-w`} market={group.winner} />,
                <TopScorerMarketCard key={`${group.id}-t`} market={group.topScorer} photos={group.photos} />,
              ])}
            </div>
            <div className="lg:sticky lg:top-4 lg:self-start">
              <PlayerPropsSpotlight players={SPOTLIGHTS} />
            </div>
          </div>
        </section>
      </div>

      {/* OmenX bridge strip */}
      <div className="border-t border-border px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-display text-base font-medium text-foreground">
              Made a call? Cash it in.
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_6px_var(--primary)]" />
                {ACCOUNT_STATS.openPositions} open
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1 text-win">
                {ACCOUNT_STATS.pnlToday} today ↑
              </span>
              <span className="text-border">·</span>
              <span className="text-foreground">{ACCOUNT_STATS.toClaim} to claim</span>
            </span>
          </div>
          <a
            href={omenxUrl.portfolio()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-semibold text-foreground ring-1 ring-primary/30 transition hover:bg-primary/20"
          >
            Open Portfolio <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
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
    <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-5 gap-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <As className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold leading-9">
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
