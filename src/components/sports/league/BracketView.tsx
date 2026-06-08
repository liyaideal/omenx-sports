import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { BracketMatchup, BracketRound, BracketTeam } from "@/data/tournament";

/**
 * Tournament knockout bracket.
 *
 * Desktop (md+): symmetric funnel layout. Each round is split into top/bottom
 * halves and laid out as [left R32 … left SF | Final | right SF … right R32],
 * with the final centered. Column widths shrink toward the outer rounds so
 * the entire tree fits in a typical desktop content width (~1000px) without
 * horizontal scrolling. Right-half cards are mirrored (logo on the right)
 * to reinforce the funnel.
 *
 * Mobile (<md): single-direction horizontal scroll — bracket integrity
 * beats wrapping on narrow screens.
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
    <>
      {/* Desktop — symmetric funnel */}
      <div className="hidden md:block">
        <SymmetricBracket rounds={rounds} />
      </div>
      {/* Mobile — original horizontal scroll */}
      <div className="md:hidden">
        <LinearBracket rounds={rounds} />
      </div>
    </>
  );
}

/* ---------------- Symmetric (desktop) ---------------- */

// Outer→inner column widths. Index 0 = outermost (R32), last = round before final.
const OUTER_WIDTHS = [96, 104, 112, 120];
const FINAL_WIDTH = 132;

function SymmetricBracket({ rounds }: { rounds: BracketRound[] }) {
  // Final = last round when it has exactly 1 matchup; otherwise treat as
  // non-final tree (no center) and just render left/right halves.
  const last = rounds[rounds.length - 1];
  const hasFinal = !!last && last.matchups.length === 1;
  const outerRounds = hasFinal ? rounds.slice(0, -1) : rounds;

  // Pick widths: align outermost shown round to OUTER_WIDTHS[0], stepping in.
  // If fewer rounds than slots, use the inner slots so cards stay readable.
  const widths = outerRounds.map((_, i) => {
    const slot = OUTER_WIDTHS.length - outerRounds.length + i;
    return OUTER_WIDTHS[Math.max(0, slot)] ?? OUTER_WIDTHS[OUTER_WIDTHS.length - 1];
  });

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-card">
      <div className="flex items-stretch justify-center gap-1">
        {/* Left half */}
        {outerRounds.map((round, i) => {
          const half = Math.ceil(round.matchups.length / 2);
          const top = round.matchups.slice(0, half);
          return (
            <HalfColumn
              key={`L-${round.id}`}
              label={round.label}
              count={round.matchups.length}
              matchups={top}
              width={widths[i]}
              mirrored={false}
            />
          );
        })}

        {/* Final */}
        {hasFinal && (
          <HalfColumn
            key="F"
            label={last!.label}
            count={1}
            matchups={last!.matchups}
            width={FINAL_WIDTH}
            mirrored={false}
            centered
          />
        )}

        {/* Right half (reversed: SF → … → R32) */}
        {[...outerRounds].reverse().map((round, idx) => {
          const i = outerRounds.length - 1 - idx;
          const half = Math.ceil(round.matchups.length / 2);
          const bottom = round.matchups.slice(half);
          return (
            <HalfColumn
              key={`R-${round.id}`}
              label={round.label}
              count={round.matchups.length}
              matchups={bottom}
              width={widths[i]}
              mirrored
            />
          );
        })}
      </div>
    </div>
  );
}

function HalfColumn({
  label,
  count,
  matchups,
  width,
  mirrored,
  centered,
}: {
  label: string;
  count: number;
  matchups: BracketMatchup[];
  width: number;
  mirrored: boolean;
  centered?: boolean;
}) {
  const compact = width <= 104;
  return (
    <div className="flex shrink-0 flex-col" style={{ width }}>
      <div className="mb-2 flex items-baseline justify-between px-0.5">
        <span className="truncate font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {compact ? shortLabel(label) : label}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {count}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5",
          centered ? "justify-center" : "justify-around",
        )}
      >
        {matchups.map((m) => (
          <MatchupCard
            key={m.id}
            matchup={m}
            compact={compact}
            mirrored={mirrored}
          />
        ))}
      </div>
    </div>
  );
}

function shortLabel(label: string) {
  // "Round of 32" → "R32", "Quarterfinals" → "QF", etc.
  const m = label.match(/Round of (\d+)/i);
  if (m) return `R${m[1]}`;
  if (/quarter/i.test(label)) return "QF";
  if (/semi/i.test(label)) return "SF";
  if (/^final/i.test(label)) return "F";
  return label;
}

/* ---------------- Linear (mobile fallback) ---------------- */

function LinearBracket({ rounds }: { rounds: BracketRound[] }) {
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
          <MatchupCard key={m.id} matchup={m} compact={false} mirrored={false} />
        ))}
      </div>
    </div>
  );
}

function MatchupCard({
  matchup,
  compact,
  mirrored,
}: {
  matchup: BracketMatchup;
  compact: boolean;
  mirrored: boolean;
}) {
  return (
    <Link
      to="/event/$id"
      params={{ id: matchup.id }}
      className={cn(
        "group block rounded-lg border border-border bg-background/40 transition hover:border-white/15 hover:bg-white/[0.03]",
        compact ? "p-1" : "p-2",
      )}
    >
      <TeamRow
        team={matchup.home}
        price={matchup.homePrice}
        settled={matchup.winner === "home"}
        compact={compact}
        mirrored={mirrored}
      />
      <div className="my-1 h-px bg-white/[0.04]" />
      <TeamRow
        team={matchup.away}
        price={matchup.awayPrice}
        settled={matchup.winner === "away"}
        compact={compact}
        mirrored={mirrored}
      />
      {matchup.kickoffLabel && !compact && (
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
  compact,
  mirrored,
}: {
  team?: BracketTeam;
  price?: number;
  settled?: boolean;
  compact: boolean;
  mirrored: boolean;
}) {
  if (!team) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 py-1 opacity-50",
          mirrored && "flex-row-reverse",
        )}
      >
        <span
          className={cn(
            "shrink-0 place-items-center rounded-full border border-dashed border-white/15",
            compact ? "h-4 w-4" : "h-5 w-5",
          )}
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-mono uppercase tracking-widest text-muted-foreground",
            compact ? "text-[9px]" : "text-[11px]",
            mirrored && "text-right",
          )}
        >
          TBD
        </span>
      </div>
    );
  }
  const hue = team.hue ?? 220;
  const displayName = compact ? team.short : team.name;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 py-1",
        mirrored && "flex-row-reverse",
        settled && "rounded-md bg-[oklch(0.78_0.18_155_/_0.12)] px-1",
      )}
    >
      {team.logo ? (
        <span
          className={cn(
            "grid shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.05]",
            compact ? "h-4 w-4" : "h-5 w-5",
          )}
          style={{ boxShadow: `0 0 10px -3px oklch(0.7 0.18 ${hue} / 0.5)` }}
        >
          <img src={team.logo} alt="" className="h-full w-full object-cover" />
        </span>
      ) : (
        <span
          className={cn(
            "shrink-0 rounded-full bg-white/[0.05]",
            compact ? "h-4 w-4" : "h-5 w-5",
          )}
        />
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium text-foreground",
          compact ? "text-[10px]" : "text-xs",
          mirrored && "text-right",
        )}
        title={team.name}
      >
        {displayName}
      </span>
      {typeof price === "number" && !settled && (
        <span
          className={cn(
            "font-mono font-semibold tabular-nums text-foreground",
            compact ? "text-[10px]" : "text-[11px]",
          )}
        >
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