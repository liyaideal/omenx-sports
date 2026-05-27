import type { TeamLite } from "@/data/sports-mock";
import type { SportsMarket } from "@/data/sports-markets";
import { MatchMarketCard } from "./MatchMarketCard";
import { FollowTeamsPanel } from "./FollowTeamsPanel";

/**
 * Shown in the Fans Zone slot when the user has not followed any teams
 * yet. Combines an editorial featured match (so the visual real estate
 * is not wasted) with one-tap follow chips for onboarding.
 */
export function FansZoneEmpty({
  editorPick,
  suggested,
}: {
  editorPick: SportsMarket;
  suggested: TeamLite[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Editor's pick · follow your team to personalize
      </div>

      <MatchMarketCard market={editorPick} />

      <FollowTeamsPanel suggested={suggested} />
    </div>
  );
}