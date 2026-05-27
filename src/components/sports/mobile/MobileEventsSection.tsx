import { useEffect, useMemo, useState } from "react";
import { EventMarketTileCard } from "@/components/sports/dashboard/EventMarketTileCard";
import { DayStripCalendar } from "@/components/sports/dashboard/DayStripCalendar";
import { LeagueWinnerMarketCard } from "@/components/sports/dashboard/LeagueWinnerMarketCard";
import { TopScorerMarketCard } from "@/components/sports/dashboard/TopScorerMarketCard";
import { MobileLiveHero } from "@/components/sports/mobile/MobileLiveHero";
import { MATCH_MARKETS, SEASON_LEAGUE_GROUPS } from "@/data/sports-markets";

/**
 * Full mobile Events page section. Owns its own day-strip state so the
 * homepage doesn't need to pass anything down; the home teaser shows the
 * first 3 upcoming cards while this section shows the full filtered list.
 */
export function MobileEventsSection() {
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);
  // Reset is unused here but kept for parity with the desktop reducer flow.
  useEffect(() => undefined, [selectedOffset]);

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
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, [selectedOffset]);

  return (
    <div className="space-y-6">
      {liveStreamMarkets.length > 0 && (
        <MobileLiveHero markets={liveStreamMarkets} />
      )}

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h1 className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold leading-9">
            <span
              aria-label="Live"
              className="h-2 w-2 animate-pulse rounded-full bg-[oklch(0.7_0.22_25)] shadow-[0_0_8px_oklch(0.7_0.22_25)]"
            />
            Upcoming
            <span className="font-serif-display italic text-neon"> Events</span>
          </h1>
        </header>
        <DayStripCalendar
          selectedOffset={selectedOffset}
          onSelect={setSelectedOffset}
          countsByOffset={countsByOffset}
        />
        <p className="-mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Prices in ¢ · arrows show 24h change
        </p>
        {upcomingMarkets.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {upcomingMarkets.map((m) => (
              <EventMarketTileCard key={m.id} market={m} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center text-sm text-muted-foreground">
            No events scheduled for {dayLabel}.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <header className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold leading-9">
            Season
            <span className="font-serif-display italic text-neon"> Futures</span>
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Winner · Top scorer
          </span>
        </header>
        <div className="space-y-4">
          {SEASON_LEAGUE_GROUPS.flatMap((group) => [
            <LeagueWinnerMarketCard
              key={`${group.id}-w`}
              market={group.winner}
            />,
            <TopScorerMarketCard
              key={`${group.id}-t`}
              market={group.topScorer}
              photos={group.photos}
            />,
          ])}
        </div>
      </section>
    </div>
  );
}