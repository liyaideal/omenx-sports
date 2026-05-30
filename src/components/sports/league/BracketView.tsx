import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { BracketMatchup, BracketRound, BracketTeam } from "@/data/tournament";

/**
 * Tournament knockout bracket. Renders each round as a column; matchups
 * within a round vertically distribute so the lines visually converge
 * toward the final on the right. Each matchup is a pair of team pills
 * with their advance-probability, deep-linking to a stand-in market.
 *
 * Layout intentionally horizontally scrolls on mobile rather than
 * collapsing — bracket integrity beats wrapping. On desktop (md+) the
 * full tree fits in one row of columns up to ~5 rounds.
 */
export function BracketView({ rounds }: { rounds: BracketRound[] }) {
  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-10 text-center text-sm text-muted-foreground">
        Bracket not seeded yet — check back after the group stage.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-4 shadow-card md:p-6">
      <div className="flex min-w-fit gap-4 md:gap-6">
        {rounds.map((round, ri) => (
          <RoundColumn key={round.id} round={round} stretch={ri > 0} columnIndex={ri} />
        ))}
      </div>
    </div>
  );
}

function RoundColumn({
  round,
  stretch,
  columnIndex,
}: {
  round: BracketRound;
  stretch: boolean;
  columnIndex: number;
}) {
  return (
    <div className="flex w-[240px] shrink-0 flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {round.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {round.matchups.length}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col",
          // Each subsequent column doubles the gap → visual convergence.
          stretch ? "justify-around" : "gap-3",
        )}
        style={stretch ? { gap: `${columnIndex * 24}px` } : undefined}
      >
        {round.matchups.map((m) => (
          <MatchupCard key={m.id} matchup={m} />
        ))}
      </div>
    </div>
  );
}

function MatchupCard({ matchup }: { matchup: BracketMatchup }) {
  return (
    <Link
      to="/event/$id"
      params={{ id: matchup.id }}
      className="group block rounded-xl border border-border bg-background/40 p-2 transition hover:border-white/15 hover:bg-white/[0.03]"
    >
      <TeamRow team={matchup.home} price={matchup.homePrice} settled={matchup.winner === "home"} />
      <div className="my-1 h-px bg-white/[0.04]" />
      <TeamRow team={matchup.away} price={matchup.awayPrice} settled={matchup.winner === "away"} />
      {matchup.kickoffLabel && (
        <div className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {matchup.kickoffLabel}
        </div>
      )}
    </Link>
  );
}

function TeamRow({
  team,
  price,
  settled,
}: {
  team?: BracketTeam;
  price?: number;
  settled?: boolean;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 py-1.5 opacity-50">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-dashed border-white/15" />
        <span className="flex-1 truncate font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          TBD
        </span>
      </div>
    );
  }
  const hue = team.hue ?? 220;
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5",
        settled && "rounded-md bg-[oklch(0.78_0.18_155_/_0.12)] px-1",
      )}
    >
      {team.logo ? (
        <span
          className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.05]"
          style={{ boxShadow: `0 0 10px -3px oklch(0.7 0.18 ${hue} / 0.5)` }}
        >
          <img src={team.logo} alt="" className="h-full w-full object-cover" />
        </span>
      ) : (
        <span className="h-5 w-5 shrink-0 rounded-full bg-white/[0.05]" />
      )}
      <span className="flex-1 truncate text-xs font-medium text-foreground">{team.name}</span>
      {typeof price === "number" && !settled && (
        <span className="font-mono text-[11px] font-semibold tabular-nums text-foreground">
          {Math.round(price * 100)}¢
        </span>
      )}
      {settled && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-[oklch(0.78_0.18_155)]">
          ✓
        </span>
      )}
    </div>
  );
}