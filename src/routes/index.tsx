import { createFileRoute } from "@tanstack/react-router";
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
import { LiveStreamCard } from "@/components/sports/dashboard/LiveStreamCard";
import { MobileChrome } from "@/components/sports/mobile/MobileChrome";
import { MobileHomeHero } from "@/components/sports/mobile/MobileHomeHero";
import { MobileAccountSnapshot } from "@/components/sports/mobile/MobileAccountSnapshot";
import { MobileLiveStatusBar } from "@/components/sports/mobile/MobileLiveStatusBar";
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
import { BridgeStrip } from "@/components/sports/dashboard/BridgeStrip";
import { PageSectionHeader } from "@/components/sports/dashboard/PageSectionHeader";

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

const USER_NAME = "Jeremy";
const USER_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80";

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
  // Live-streamed matches surface as prominent cards above the regular grid;
  // they're filtered out of the non-live grid to avoid double-rendering.
  const liveStreamMarkets = useMemo(
    () => visibleMarkets.filter((m) => m.isLiveStream),
    [visibleMarkets],
  );
  const upcomingMarkets = useMemo(
    () => visibleMarkets.filter((m) => !m.isLiveStream),
    [visibleMarkets],
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
      {/* Desktop top bar */}
      <div className="hidden md:block">
        <AppTopBar
          userName={USER_NAME}
          userAvatar={USER_AVATAR}
          equity={ACCOUNT_STATS.available}
        />
      </div>

      {/* DESKTOP layout (≥ md) — unchanged */}
      <div className="hidden gap-5 px-6 pb-6 pt-8 md:grid md:px-8 md:pb-8 md:pt-10 lg:grid-cols-[340px_minmax(0,1fr)_360px]">
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
          <PageSectionHeader title="Live & upcoming" accent=" Events" as="h1" live />
          <DayStripCalendar
            selectedOffset={selectedOffset}
            onSelect={setSelectedOffset}
            countsByOffset={countsByOffset}
          />
          <p className="-mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Prices in ¢ (0–100) · arrows show 24h change
          </p>
          {liveStreamMarkets.length + upcomingMarkets.length > 0 ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[...liveStreamMarkets, ...upcomingMarkets].map((m, idx) => {
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
                      {m.isLiveStream ? (
                        <LiveStreamCard market={m} />
                      ) : (
                        <EventMarketTileCard market={m} />
                      )}
                    </div>
                  );
                })}
              </div>
              {liveStreamMarkets.length + upcomingMarkets.length > 1 && (
                <ShowMoreEventsButton
                  expanded={expanded}
                  total={liveStreamMarkets.length + upcomingMarkets.length}
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
          <PageSectionHeader title="Season" accent="Events" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5 xl:grid-cols-2">
              {SEASON_LEAGUE_GROUPS.flatMap((group) => [
                <LeagueWinnerMarketCard key={`${group.id}-w`} market={group.winner} />,
                <TopScorerMarketCard
                  key={`${group.id}-t`}
                  market={group.topScorer}
                  photos={group.photos}
                />,
              ])}
            </div>
            <div className="lg:sticky lg:top-4 lg:self-start">
              <PlayerPropsSpotlight players={SPOTLIGHTS} />
            </div>
          </div>
        </section>
      </div>

      {/* MOBILE layout (< md) — slim home: live + today preview + section teasers + season */}
      <MobileChrome>
        {liveStreamMarkets.length > 0 && (
          <MobileLiveHero markets={liveStreamMarkets} />
        )}

        <section className="space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold leading-9">
              Today's
              <span className="font-serif-display italic text-neon"> Events</span>
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Top {Math.min(3, upcomingMarkets.length)}
            </span>
          </header>
          {upcomingMarkets.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {upcomingMarkets.slice(0, 3).map((m) => (
                <EventMarketTileCard key={m.id} market={m} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center text-sm text-muted-foreground">
              No events scheduled today.
            </div>
          )}
          <MobileSeeMoreCard
            to="/events"
            icon={CalendarDays}
            label="See all events"
            hint={`${MATCH_MARKETS.length} markets · day strip + filters`}
          />
        </section>

        <section className="space-y-3">
          <FanZoneHeader
            followingCount={FOLLOWED_TEAMS.length}
            suggested={SUGGESTED_TEAMS}
            followedNames={FOLLOWED_TEAMS.map((t) => t.name)}
          />
          <MobileSeeMoreCard
            to="/fans"
            icon={Users}
            label="Open Fans Zone"
            hint={`${FOLLOWED_TEAMS.length} following · live trades + posts`}
          />
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold leading-9">
            Season
            <span className="font-serif-display italic text-neon"> Events</span>
          </h2>
          <div className="space-y-4">
            {SEASON_LEAGUE_GROUPS.flatMap((group) => [
              <LeagueWinnerMarketCard key={`${group.id}-w`} market={group.winner} />,
              <TopScorerMarketCard
                key={`${group.id}-t`}
                market={group.topScorer}
                photos={group.photos}
              />,
            ])}
            <PlayerPropsSpotlight players={SPOTLIGHTS} />
          </div>
        </section>
      </MobileChrome>

      {/* Desktop bridge strip */}
      <div className="hidden md:block">
        <BridgeStrip
          openPositions={ACCOUNT_STATS.openPositions}
          pnlToday={ACCOUNT_STATS.pnlToday}
          toClaim={ACCOUNT_STATS.toClaim}
          portfolioHref={omenxUrl.portfolio()}
        />
      </div>
    </AppShell>
  );
}
