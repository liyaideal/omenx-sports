import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { MobileChrome } from "@/components/sports/mobile/MobileChrome";
import { EventMarketTileCard } from "@/components/sports/dashboard/EventMarketTileCard";
import { LiveStreamCard } from "@/components/sports/dashboard/LiveStreamCard";
import { LeagueHubHero } from "@/components/sports/league/LeagueHubHero";
import { HubTabs, type HubTab, type HubView } from "@/components/sports/league/HubTabs";
import {
  getLeagueBySlug,
  getMatchMarketsByLeagueSlug,
  getSeasonGroupByLeagueSlug,
  getSpotlightsByLeagueSlug,
  getBinaryQuestionsByLeagueSlug,
  LEAGUES,
  type LeagueHub,
} from "@/data/leagues";
import {
  getGroupsByLeagueSlug,
  getBracketByLeagueSlug,
} from "@/data/tournament";
import { PropsGrid } from "@/components/sports/league/PropsGrid";
import { BracketView } from "@/components/sports/league/BracketView";
import { ACCOUNT_STATS, type SportsMarket } from "@/data/sports-markets";

const USER_NAME = "Jeremy";
const USER_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80";

interface SearchShape {
  view: HubView;
}

function normalizeView(raw: unknown): HubView {
  if (raw === "props" || raw === "bracket") return raw;
  return "games";
}

export const Route = createFileRoute("/league/$slug")({
  validateSearch: (raw: Record<string, unknown>): SearchShape => ({
    view: normalizeView(raw.view),
  }),
  loader: ({ params }) => {
    const league = getLeagueBySlug(params.slug);
    if (!league) throw notFound();
    return { league };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.league.name ?? "League";
    return {
      meta: [
        { title: `${name} — Stadium Neon` },
        {
          name: "description",
          content: `All ${name} prediction markets on OmenX Stadium Neon: games, props, bracket.`,
        },
        { property: "og:title", content: `${name} — Stadium Neon` },
        {
          property: "og:description",
          content: `Live, upcoming and futures markets for ${name}.`,
        },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="grid min-h-[60vh] place-items-center px-6">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold">League not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Try one of these: {LEAGUES.map((l) => l.name).join(" · ")}
          </p>
        </div>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <div className="grid min-h-[60vh] place-items-center px-6">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 break-words text-sm text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    </AppShell>
  ),
  component: LeagueHubPage,
});

function LeagueHubPage() {
  const { league } = Route.useLoaderData();
  const { view } = Route.useSearch();

  const matches = useMemo(
    () => getMatchMarketsByLeagueSlug(league.slug),
    [league.slug],
  );
  const liveStream = useMemo(() => matches.filter((m) => m.isLiveStream), [matches]);
  const grid = useMemo(() => matches.filter((m) => !m.isLiveStream), [matches]);
  const seasonGroup = useMemo(
    () => getSeasonGroupByLeagueSlug(league.slug),
    [league.slug],
  );
  const groups = useMemo(() => getGroupsByLeagueSlug(league.slug), [league.slug]);
  const spotlights = useMemo(
    () => getSpotlightsByLeagueSlug(league.slug),
    [league.slug],
  );
  const binaryQuestions = useMemo(
    () => getBinaryQuestionsByLeagueSlug(league.slug),
    [league.slug],
  );
  const bracket = useMemo(() => getBracketByLeagueSlug(league.slug), [league.slug]);

  const propsCount =
    groups.length +
    (seasonGroup?.winner ? 1 : 0) +
    (seasonGroup?.topScorer ? 1 : 0) +
    spotlights.length +
    binaryQuestions.length;

  const tabs: HubTab[] = [
    { view: "games", label: "Games", count: matches.length },
    { view: "props", label: "Props", count: propsCount || undefined },
    ...(league.kind === "tournament"
      ? [{ view: "bracket" as const, label: "Bracket", count: bracket.length || undefined }]
      : []),
  ];

  return (
    <AppShell>
      <div className="hidden md:block">
        <AppTopBar userName={USER_NAME} userAvatar={USER_AVATAR} equity={ACCOUNT_STATS.available} />
      </div>

      <MobileChrome>
        <HubContent
          league={league}
          view={view}
          matches={matches}
          liveStream={liveStream}
          grid={grid}
          tabs={tabs}
          groups={groups}
          seasonGroup={seasonGroup}
          spotlights={spotlights}
          binaryQuestions={binaryQuestions}
          bracket={bracket}
        />
      </MobileChrome>

      <div className="hidden flex-col gap-5 px-6 pb-10 pt-8 md:flex md:px-8 md:pt-10">
        <HubContent
          league={league}
          view={view}
          matches={matches}
          liveStream={liveStream}
          grid={grid}
          tabs={tabs}
          groups={groups}
          seasonGroup={seasonGroup}
          spotlights={spotlights}
          binaryQuestions={binaryQuestions}
          bracket={bracket}
        />
      </div>
    </AppShell>
  );
}

function HubContent({
  league,
  view,
  matches,
  liveStream,
  grid,
  tabs,
  groups,
  seasonGroup,
  spotlights,
  binaryQuestions,
  bracket,
}: {
  league: LeagueHub;
  view: HubView;
  matches: SportsMarket[];
  liveStream: SportsMarket[];
  grid: SportsMarket[];
  tabs: HubTab[];
  groups: ReturnType<typeof getGroupsByLeagueSlug>;
  seasonGroup: ReturnType<typeof getSeasonGroupByLeagueSlug>;
  spotlights: ReturnType<typeof getSpotlightsByLeagueSlug>;
  binaryQuestions: SportsMarket[];
  bracket: ReturnType<typeof getBracketByLeagueSlug>;
}) {
  return (
    <div className="space-y-5">
      <LeagueHubHero league={league} matchCount={matches.length} />
      <HubTabs slug={league.slug} current={view} tabs={tabs} />

      {view === "games" && (
        <section className="space-y-4">
          {matches.length === 0 ? (
            <EmptyState>No upcoming games for {league.name} yet.</EmptyState>
          ) : (
            <>
              {liveStream.length > 0 && (
                <div className="space-y-3">
                  {liveStream.map((m) => (
                    <LiveStreamCard key={m.id} market={m} />
                  ))}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {grid.map((m) => (
                  <EventMarketTileCard key={m.id} market={m} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {view === "props" && (
        <PropsGrid
          league={league}
          groups={groups}
          winner={seasonGroup?.winner}
          topScorer={seasonGroup?.topScorer}
          scorerPhotos={seasonGroup?.photos}
          spotlights={spotlights}
          binaryQuestions={binaryQuestions}
        />
      )}

      {view === "bracket" && (
        <BracketView rounds={bracket} />
      )}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}