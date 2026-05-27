import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  ACCOUNT_STATS,
  FEATURED_MATCH,
  SEASON_LEAGUE_GROUPS,
  SPOTLIGHTS,
} from "@/data/sports-markets";
import { FAN_POST, FOLLOWED_TEAMS, SUGGESTED_TEAMS, TEAMS } from "@/data/sports-mock";
import { omenxUrl } from "@/lib/omenx";

import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { BridgeStrip } from "@/components/sports/dashboard/BridgeStrip";
import { PageSectionHeader } from "@/components/sports/dashboard/PageSectionHeader";
import { FanZoneHeader } from "@/components/sports/dashboard/FanZoneHeader";
import { FansZoneEmpty } from "@/components/sports/dashboard/FansZoneEmpty";
import { FanPostCard } from "@/components/sports/dashboard/FanPostCard";
import { MatchMarketCard } from "@/components/sports/dashboard/MatchMarketCard";
import { LiveActivityCard } from "@/components/sports/dashboard/LiveActivityCard";
import { DayStripCalendar } from "@/components/sports/dashboard/DayStripCalendar";
import { EventMarketTileCard } from "@/components/sports/dashboard/EventMarketTileCard";
import { ShowMoreEventsButton } from "@/components/sports/dashboard/ShowMoreEventsButton";
import { LeagueWinnerMarketCard } from "@/components/sports/dashboard/LeagueWinnerMarketCard";
import { TopScorerMarketCard } from "@/components/sports/dashboard/TopScorerMarketCard";
import { PlayerPropsSpotlight } from "@/components/sports/dashboard/PlayerPropsSpotlight";

import {
  TILE_THREE_WAY,
  TILE_BINARY,
  TILE_HOT,
  TILE_TRENDING,
  TILE_NEUTRAL,
  TILE_ALL_UP,
  TILE_ALL_DOWN,
  MATCH_THREE_WAY,
  MATCH_BINARY,
  WINNER_DEFAULT,
  WINNER_SHORT,
  WINNER_ALL_UP,
  WINNER_ALL_DOWN,
  TOPSCORER_WITH_PHOTOS,
  TOPSCORER_NO_PHOTOS,
  SPOTLIGHT_ONE,
  SPOTLIGHT_MANY,
  TRADES_DEFAULT,
  TRADES_EMPTY,
  TRADES_NO_MATCH,
  FOLLOW_NONE,
  FOLLOW_CHELSEA,
  FOLLOW_PSG_NOMATCH,
  STATS_DEFAULT,
  STATS_FLAT,
  STATS_LOSING,
  STATS_ZERO,
  STATS_BIG_CLAIM,
  DAY_COUNTS_VARIED,
  DAY_COUNTS_EMPTY,
} from "@/data/style-guide-fixtures";

export const Route = createFileRoute("/style-guide-homepage")({
  head: () => ({
    meta: [
      { title: "Homepage Playground — Stadium Neon" },
      {
        name: "description",
        content:
          "Every homepage module rendered against every meaningful state, side-by-side, for design and engineering review.",
      },
    ],
  }),
  component: HomepagePlayground,
});

const SECTIONS = [
  ["topbar", "AppTopBar"],
  ["fanzone-header", "FanZoneHeader"],
  ["fanzone-body", "Fans Zone body"],
  ["match-card", "MatchMarketCard"],
  ["fan-post", "FanPostCard"],
  ["activity", "LiveActivityCard"],
  ["section-header", "PageSectionHeader"],
  ["day-strip", "DayStripCalendar"],
  ["event-tile", "EventMarketTileCard"],
  ["show-more", "ShowMoreEventsButton"],
  ["events-empty", "Empty events"],
  ["winner", "LeagueWinnerMarketCard"],
  ["scorer", "TopScorerMarketCard"],
  ["spotlight", "PlayerPropsSpotlight"],
  ["bridge", "BridgeStrip"],
] as const;

function HomepagePlayground() {
  return (
    <div className="min-h-screen bg-background bg-ambient text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/style-guide"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-white/10 transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Style Guide
            </Link>
            <span className="font-display text-lg font-semibold">Homepage Playground</span>
          </div>
          <Link
            to="/"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View real homepage →
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-[200px_minmax(0,1fr)] gap-8 px-6 py-10">
        {/* Sticky TOC */}
        <nav className="sticky top-20 h-fit self-start text-sm">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Modules
          </div>
          <ul className="flex flex-col gap-1">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="block rounded-lg px-2 py-1 text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex min-w-0 flex-col gap-16">
          <Intro />

          <Section id="topbar" title="AppTopBar" hint="Sticky page header with equity tile + user menu.">
            <Variant caption="default — equity, name, avatar">
              <AppTopBar
                userName="Jeremy"
                userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
                equity={ACCOUNT_STATS.available}
              />
            </Variant>
            <Variant caption="zero equity">
              <AppTopBar
                userName="Jeremy"
                userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
                equity="$0.00"
              />
            </Variant>
            <Variant caption="long username (truncation)">
              <AppTopBar
                userName="alexander-from-portugal"
                userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
                equity="$1,240.50"
              />
            </Variant>
          </Section>

          <Section id="fanzone-header" title="FanZoneHeader" hint="Title + manage-teams CTA / chip showing how many teams are followed.">
            <Variant caption="following = 0 (Add team CTA)">
              <FanZoneHeader followingCount={0} suggested={SUGGESTED_TEAMS} followedNames={[]} />
            </Variant>
            <Variant caption="following = 1">
              <FanZoneHeader
                followingCount={1}
                suggested={SUGGESTED_TEAMS}
                followedNames={[FOLLOWED_TEAMS[0].name]}
              />
            </Variant>
            <Variant caption="following = 5">
              <FanZoneHeader
                followingCount={5}
                suggested={SUGGESTED_TEAMS}
                followedNames={SUGGESTED_TEAMS.slice(0, 5).map((t) => t.name)}
              />
            </Variant>
          </Section>

          <Section
            id="fanzone-body"
            title="Fans Zone body"
            hint="Mutually exclusive: editorial empty state when no teams followed, personalized stack when at least one is."
          >
            <Variant caption="empty — no teams followed (editor pick + onboarding)">
              <div className="max-w-[420px]">
                <FansZoneEmpty editorPick={FEATURED_MATCH} suggested={SUGGESTED_TEAMS} />
              </div>
            </Variant>
            <Variant caption="filled — featured match + fan post">
              <div className="flex max-w-[420px] flex-col gap-4">
                <MatchMarketCard market={FEATURED_MATCH} />
                <FanPostCard {...FAN_POST} />
              </div>
            </Variant>
          </Section>

          <Section id="match-card" title="MatchMarketCard" hint="Two crests + outcome list; supports 1X2 or binary.">
            <Variant caption="3-way (1X2 with Draw)">
              <div className="max-w-[420px]"><MatchMarketCard market={MATCH_THREE_WAY} /></div>
            </Variant>
            <Variant caption="binary (YES / NO over two teams)">
              <div className="max-w-[420px]"><MatchMarketCard market={MATCH_BINARY} /></div>
            </Variant>
          </Section>

          <Section id="fan-post" title="FanPostCard" hint="Editorial fan content block, links to source.">
            <Variant caption="default">
              <div className="max-w-[420px]"><FanPostCard {...FAN_POST} /></div>
            </Variant>
          </Section>

          <Section id="activity" title="LiveActivityCard" hint="Vertical marquee of recent trades. Filters by followed teams when present.">
            <Variant caption="no followed teams (shows all trades)">
              <div className="h-[420px] w-[340px]">
                <LiveActivityCard
                  trades={TRADES_DEFAULT}
                  followedTeams={FOLLOW_NONE.followedTeams}
                  followedKeys={FOLLOW_NONE.followedKeys}
                />
              </div>
            </Variant>
            <Variant caption="following Chelsea — matches in feed">
              <div className="h-[420px] w-[340px]">
                <LiveActivityCard
                  trades={TRADES_DEFAULT}
                  followedTeams={FOLLOW_CHELSEA.followedTeams}
                  followedKeys={FOLLOW_CHELSEA.followedKeys}
                />
              </div>
            </Variant>
            <Variant caption="following PSG only, but feed filtered to non-matches → component returns null">
              <div className="h-[420px] w-[340px]">
                <LiveActivityCard
                  trades={TRADES_NO_MATCH}
                  followedTeams={FOLLOW_PSG_NOMATCH.followedTeams}
                  followedKeys={FOLLOW_PSG_NOMATCH.followedKeys}
                />
                <EmptyFallback label="LiveActivityCard renders nothing when filter yields 0 trades" />
              </div>
            </Variant>
            <Variant caption="no trades at all → component returns null">
              <div className="h-[120px] w-[340px]">
                <LiveActivityCard
                  trades={TRADES_EMPTY}
                  followedTeams={FOLLOW_NONE.followedTeams}
                  followedKeys={FOLLOW_NONE.followedKeys}
                />
                <EmptyFallback label="LiveActivityCard renders nothing when trades = []" />
              </div>
            </Variant>
          </Section>

          <Section id="section-header" title="PageSectionHeader" hint="Title + italic accent, optional live dot, optional inline stats.">
            <Variant caption="live, no stats (current homepage)">
              <PageSectionHeader title="Live & upcoming" accent="Events" as="h1" live />
            </Variant>
            <Variant caption="static, no stats">
              <PageSectionHeader title="Season" accent="Events" />
            </Variant>
            <Variant caption="with stats (legacy prop)">
              <PageSectionHeader
                title="Your"
                accent="Positions"
                stats={{ positions: 7, pnl: "+$142.20" }}
              />
            </Variant>
            <Variant caption="with custom right slot">
              <PageSectionHeader
                title="Markets"
                accent="Today"
                right={
                  <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                    See all →
                  </a>
                }
              />
            </Variant>
          </Section>

          <Section id="day-strip" title="DayStripCalendar" hint="7-day strip + ALL pill. Active day glows; dots mark days with events.">
            <DayStripDemo initial={null} counts={DAY_COUNTS_VARIED} caption="ALL selected — varied counts" />
            <DayStripDemo initial={0} counts={DAY_COUNTS_VARIED} caption="today selected" />
            <DayStripDemo initial={1} counts={DAY_COUNTS_VARIED} caption="tomorrow selected" />
            <DayStripDemo initial={-1} counts={DAY_COUNTS_VARIED} caption="yesterday selected" />
            <DayStripDemo initial={null} counts={DAY_COUNTS_EMPTY} caption="no events on any day" />
          </Section>

          <Section id="event-tile" title="EventMarketTileCard" hint="Compact tile for the upcoming-events grid. Top-right shows HOT / TRENDING when thresholds hit.">
            <TileVariant caption="3-way · neutral · no badge" market={TILE_THREE_WAY} />
            <TileVariant caption="binary YES/NO · no fixture" market={TILE_BINARY} />
            <TileVariant caption="HOT badge · participants ≥ 2000" market={TILE_HOT} />
            <TileVariant caption="TRENDING badge · |Δ| ≥ 5¢" market={TILE_TRENDING} />
            <TileVariant caption="low-volume neutral" market={TILE_NEUTRAL} />
            <TileVariant caption="all outcomes up (green)" market={TILE_ALL_UP} />
            <TileVariant caption="all outcomes down (red)" market={TILE_ALL_DOWN} />
          </Section>

          <Section id="show-more" title="ShowMoreEventsButton" hint="Toggle below the event grid.">
            <Variant caption="collapsed">
              <ShowMoreEventsButton expanded={false} total={9} onToggle={() => {}} />
            </Variant>
            <Variant caption="expanded">
              <ShowMoreEventsButton expanded={true} total={9} onToggle={() => {}} />
            </Variant>
          </Section>

          <Section id="events-empty" title="Empty events state" hint="Inline placeholder used when a day filter yields no events.">
            <Variant caption="empty day">
              <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center text-sm text-muted-foreground">
                No events scheduled for tomorrow.
              </div>
            </Variant>
          </Section>

          <Section id="winner" title="LeagueWinnerMarketCard" hint="Futures market in a league-table layout.">
            <Variant caption="default (4 outcomes)"><LeagueWinnerMarketCard market={WINNER_DEFAULT} /></Variant>
            <Variant caption="short (2 outcomes)"><LeagueWinnerMarketCard market={WINNER_SHORT} /></Variant>
            <Variant caption="all deltas up"><LeagueWinnerMarketCard market={WINNER_ALL_UP} /></Variant>
            <Variant caption="all deltas down"><LeagueWinnerMarketCard market={WINNER_ALL_DOWN} /></Variant>
          </Section>

          <Section id="scorer" title="TopScorerMarketCard" hint="Same row layout as the winner card, but with player photos.">
            <Variant caption="with photos">
                <TopScorerMarketCard
                  market={TOPSCORER_WITH_PHOTOS.market}
                  photos={TOPSCORER_WITH_PHOTOS.photos}
                />
              </Variant>
            <Variant caption="no photos — initials fallback">
                <TopScorerMarketCard
                  market={TOPSCORER_NO_PHOTOS.market}
                  photos={TOPSCORER_NO_PHOTOS.photos}
                />
              </Variant>
          </Section>

          <Section id="spotlight" title="PlayerPropsSpotlight" hint="Carousel of player prop bundles.">
            <Variant caption="single player (chevrons loop on same player)">
              <div className="w-[340px]"><PlayerPropsSpotlight players={SPOTLIGHT_ONE} /></div>
            </Variant>
            <Variant caption={`${SPOTLIGHT_MANY.length} players (carousel)`}>
              <div className="w-[340px]"><PlayerPropsSpotlight players={SPOTLIGHT_MANY} /></div>
            </Variant>
          </Section>

          <Section id="bridge" title="BridgeStrip" hint="Footer strip bridging the sports zone back to OmenX portfolio. Color tone reflects today's P&L.">
            <Variant caption="default — winning day, has claim">
              <BridgeStrip {...STATS_DEFAULT} portfolioHref={omenxUrl.portfolio()} />
            </Variant>
            <Variant caption="flat — P&L is exactly $0">
              <BridgeStrip {...STATS_FLAT} portfolioHref={omenxUrl.portfolio()} />
            </Variant>
            <Variant caption="losing day">
              <BridgeStrip {...STATS_LOSING} portfolioHref={omenxUrl.portfolio()} />
            </Variant>
            <Variant caption="no open positions (zero state)">
              <BridgeStrip {...STATS_ZERO} portfolioHref={omenxUrl.portfolio()} />
            </Variant>
            <Variant caption="large numbers (digit-width validation)">
              <BridgeStrip {...STATS_BIG_CLAIM} portfolioHref={omenxUrl.portfolio()} />
            </Variant>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Intro() {
  void TEAMS;
  return (
    <section className="rounded-3xl border border-border bg-surface p-6">
      <h1 className="font-display text-3xl font-semibold leading-tight">
        Homepage <span className="font-serif-display italic text-neon">Playground</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every module on <code className="font-mono text-xs text-foreground">/</code> rendered against every
        meaningful state. Use this to verify empty / filled / extreme variants without seeding mock data
        into the real homepage.
      </p>
    </section>
  );
}

function Section({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <a
          href={`#${id}`}
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          #{id}
        </a>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Variant({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {caption}
      </div>
      <div className="rounded-xl border border-dashed border-border/60 bg-background/40 p-4">
        {children}
      </div>
    </div>
  );
}

function TileVariant({
  caption,
  market,
}: {
  caption: string;
  market: Parameters<typeof EventMarketTileCard>[0]["market"];
}) {
  return (
    <Variant caption={caption}>
      <EventMarketTileCard market={market} />
    </Variant>
  );
}

function DayStripDemo({
  initial,
  counts,
  caption,
}: {
  initial: number | null;
  counts: Record<number, number>;
  caption: string;
}) {
  const [sel, setSel] = useState<number | null>(initial);
  return (
    <Variant caption={caption}>
      <DayStripCalendar selectedOffset={sel} onSelect={setSel} countsByOffset={counts} />
    </Variant>
  );
}

function EmptyFallback({ label }: { label: string }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-border/60 bg-background/40 px-3 py-4 text-center text-[11px] text-muted-foreground">
      {label}
    </div>
  );
}
