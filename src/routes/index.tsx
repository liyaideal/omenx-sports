import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { MatchMarketCard } from "@/components/sports/dashboard/MatchMarketCard";
import { EventMarketTileCard } from "@/components/sports/dashboard/EventMarketTileCard";
import { LeagueSpotlightCard } from "@/components/sports/league/LeagueSpotlightCard";
import { LeagueComingSoonCard } from "@/components/sports/league/LeagueComingSoonCard";
import { FanZoneHeader } from "@/components/sports/dashboard/FanZoneHeader";
import { FansZoneEmpty } from "@/components/sports/dashboard/FansZoneEmpty";
import { LiveActivityCard } from "@/components/sports/dashboard/LiveActivityCard";
import { DayStripCalendar } from "@/components/sports/dashboard/DayStripCalendar";
import { ShowMoreEventsButton } from "@/components/sports/dashboard/ShowMoreEventsButton";
import { LiveStreamCard } from "@/components/sports/dashboard/LiveStreamCard";
import {
  ACCOUNT_STATS,
  FEATURED_MATCH,
  MATCH_MARKETS,
} from "@/data/sports-markets";
import {
  LEAGUES,
  getMatchMarketsByLeagueSlug,
  getSpotlightsByLeagueSlug,
  getBinaryQuestionsByLeagueSlug,
} from "@/data/leagues";
import {
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
      { title: "OmenX | Sports" },
      {
        name: "description",
        content:
          "OmenX Sports is a sports platform showcasing live and upcoming events with interactive features.",
      },
      { property: "og:title", content: "OmenX | Sports" },
      {
        property: "og:description",
        content:
          "OmenX Sports is a sports platform showcasing live and upcoming events with interactive features.",
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
  // Mobile: there is no Home tab — redirect to /events (the default mobile entry).
  // Desktop home stays intact.
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 767px)").matches) {
      navigate({ to: "/events", replace: true });
    }
  }, [navigate]);

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
            <MatchMarketCard market={FEATURED_MATCH} />
          ) : (
            <FansZoneEmpty editorPick={FEATURED_MATCH} suggested={SUGGESTED_TEAMS} />
          )}
          <div className="flex-1 [&>*]:h-full [&>*]:max-h-[560px]">
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
        {/* BOTTOM — League hub entry cards (props/bracket/futures live inside each hub) */}
        <section className="flex flex-col gap-4 lg:col-span-2 lg:col-start-2 lg:row-start-2">
          <PageSectionHeader title="Explore" accent="Tournaments" />
          <p className="-mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            One league live now, more rolling out soon — each gets its own hub.
          </p>
          {(() => {
            const featured = LEAGUES.filter((l) => l.status === "featured");
            const comingSoon = LEAGUES.filter((l) => l.status === "coming-soon");
            return (
              <div className="flex flex-col gap-4">
                {featured.map((league) => {
                  const matches = getMatchMarketsByLeagueSlug(league.slug);
                  const spotlights = getSpotlightsByLeagueSlug(league.slug);
                  const binaries = getBinaryQuestionsByLeagueSlug(league.slug);
                  const eventCount = matches.length + spotlights.length + binaries.length;
                  const highlights = [
                    ...spotlights
                      .slice(0, 3)
                      .map((s) => s.tagline ?? `${s.firstName} ${s.lastName}`),
                    ...binaries.slice(0, 3).map((b) => b.title),
                  ]
                    .filter(Boolean)
                    .slice(0, 4) as string[];
                  return (
                    <LeagueSpotlightCard
                      key={league.slug}
                      league={league}
                      eventCount={eventCount}
                      highlights={highlights}
                      kickoffLabel="Kicks off June 11"
                    />
                  );
                })}
                {comingSoon.length > 0 && (
                  <div className="grid gap-2.5 md:grid-cols-3">
                    {comingSoon.map((league) => (
                      <LeagueComingSoonCard key={league.slug} league={league} />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      </div>

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
