import type { SportsMarket } from "@/data/sports-markets";
import type { LeagueHub } from "@/data/leagues";
import type { GroupMarket } from "@/data/tournament";
import { LeagueWinnerMarketCard } from "@/components/sports/dashboard/LeagueWinnerMarketCard";
import { TopScorerMarketCard } from "@/components/sports/dashboard/TopScorerMarketCard";
import { PlayerPropsSpotlight } from "@/components/sports/dashboard/PlayerPropsSpotlight";
import { GroupWinnerCard } from "./GroupWinnerCard";
import { BinaryQuestionCard } from "./BinaryQuestionCard";
import type { PlayerSpotlight } from "@/data/sports-markets";

/**
 * Hub Props tab — orchestrates every non-1X2 market for a league:
 *   1. Group winners (tournament only)
 *   2. Season futures (winner + top-scorer)
 *   3. Player spotlights (carousel of binary prop bundles)
 *   4. Binary questions (loose YES/NO gauge cards)
 */
export interface PropsGridProps {
  league: LeagueHub;
  groups: GroupMarket[];
  winner?: SportsMarket;
  topScorer?: SportsMarket;
  scorerPhotos?: Record<string, string>;
  spotlights: PlayerSpotlight[];
  binaryQuestions: SportsMarket[];
}

export function PropsGrid({
  league,
  groups,
  winner,
  topScorer,
  scorerPhotos,
  spotlights,
  binaryQuestions,
}: PropsGridProps) {
  const hasFutures = Boolean(winner || topScorer);
  const hasAnything =
    groups.length > 0 ||
    hasFutures ||
    spotlights.length > 0 ||
    binaryQuestions.length > 0;

  if (!hasAnything) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-10 text-center text-sm text-muted-foreground">
        No futures or props live for {league.name} yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.length > 0 && (
        <PropsSection
          title="Group winners"
          subtitle="Pick the team that finishes top of each group"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((g) => (
              <GroupWinnerCard key={g.id} market={g} />
            ))}
          </div>
        </PropsSection>
      )}

      {hasFutures && (
        <PropsSection title="Season futures" subtitle="Long-running league markets">
          <div className="grid gap-3 md:grid-cols-2">
            {winner && <LeagueWinnerMarketCard market={winner} />}
            {topScorer && <TopScorerMarketCard market={topScorer} photos={scorerPhotos} />}
          </div>
        </PropsSection>
      )}

      {spotlights.length > 0 && (
        <PropsSection title="Player spotlights" subtitle="Bundled prop markets per player">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {spotlights.map((s) => (
              <PlayerPropsSpotlight key={s.handle} players={[s]} />
            ))}
          </div>
        </PropsSection>
      )}

      {binaryQuestions.length > 0 && (
        <PropsSection title="Binary questions" subtitle="Single YES/NO markets">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {binaryQuestions.map((m) => (
              <BinaryQuestionCard key={m.id} market={m} />
            ))}
          </div>
        </PropsSection>
      )}
    </div>
  );
}

function PropsSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <header>
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}