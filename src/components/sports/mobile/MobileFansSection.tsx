import { MatchMarketCard } from "@/components/sports/dashboard/MatchMarketCard";
import { FansZoneEmpty } from "@/components/sports/dashboard/FansZoneEmpty";
import { LiveActivityCard } from "@/components/sports/dashboard/LiveActivityCard";
import { FanZoneHeader } from "@/components/sports/dashboard/FanZoneHeader";
import { FEATURED_MATCH } from "@/data/sports-markets";
import {
  FOLLOWED_TEAMS,
  LIVE_TRADES,
  SUGGESTED_TEAMS,
  TEAMS,
  type TeamKey,
} from "@/data/sports-mock";

/**
 * Full mobile Fans page section. Pure presentational — no internal state.
 */
export function MobileFansSection() {
  const followedKeys = (Object.keys(TEAMS) as TeamKey[]).filter((k) =>
    FOLLOWED_TEAMS.includes(TEAMS[k]),
  );
  return (
    <section className="space-y-3">
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
      <LiveActivityCard
        trades={LIVE_TRADES}
        followedTeams={FOLLOWED_TEAMS}
        followedKeys={followedKeys}
      />
    </section>
  );
}