import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { BracketMatchup, BracketRound, BracketTeam } from "@/data/tournament";

/**
 * Tournament knockout bracket.
 *
 * Desktop (md+): symmetric funnel that stretches to fill the container.
 * Layout: [left R32 … left SF | Final | right SF … right R32]. Columns
 * flex equally; the Final column gets a slight bias for visual anchor.
 *
 * Each matchup card uses a vertical "versus" layout — both flags share a
 * row on top, both country names share a row below, prices share a third
 * row. This keeps columns narrow without truncating names per side cell.
 *
 * Mobile (<md): horizontal scroll fallback using the same versus card.
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
      <div className="hidden md:block">
        <SymmetricBracket rounds={rounds} />
      </div>
      <div className="md:hidden">
        <LinearBracket rounds={rounds} />
      </div>
    </>
  );
}

/* ---------------- Symmetric (desktop) ---------------- */

function SymmetricBracket({ rounds }: { rounds: BracketRound[] }) {
  const last = rounds[rounds.length - 1];
  const hasFinal = !!last && last.matchups.length === 1;
  const outerRounds = hasFinal ? rounds.slice(0, -1) : rounds;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-3 shadow-card">
      <div className="flex w-full min-w-[880px] items-stretch gap-2">
        {outerRounds.map((round) => {
          const half = Math.ceil(round.matchups.length / 2);
          return (
            <HalfColumn
              key={`L-${round.id}`}
              label={round.label}
              count={round.matchups.length}
              matchups={round.matchups.slice(0, half)}
              flex={1}
            />
          );
        })}

        {hasFinal && (
          <HalfColumn
            key="F"
            label={last!.label}
            count={1}
            matchups={last!.matchups}
            flex={1.3}
            centered
            isFinal
          />
        )}

        {[...outerRounds].reverse().map((round) => {
          const half = Math.ceil(round.matchups.length / 2);
          return (
            <HalfColumn
              key={`R-${round.id}`}
              label={round.label}
              count={round.matchups.length}
              matchups={round.matchups.slice(half)}
              flex={1}
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
  flex,
  centered,
  isFinal,
}: {
  label: string;
  count: number;
  matchups: BracketMatchup[];
  flex: number;
  centered?: boolean;
  isFinal?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col" style={{ flex: `${flex} 1 0` }}>
      <div className="mb-2 flex items-baseline justify-center gap-1.5 px-0.5">
        <span
          className={cn(
            "truncate font-mono text-[9px] uppercase tracking-widest",
            isFinal ? "text-primary" : "text-muted-foreground",
          )}
        >
          {isFinal ? "🏆 " : ""}
          {shortLabel(label)}
        </span>
        {!isFinal && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5",
          centered ? "justify-center" : "justify-around",
        )}
      >
        {matchups.map((m) => (
          <MatchupCard key={m.id} matchup={m} highlight={isFinal} />
        ))}
      </div>
    </div>
  );
}

function shortLabel(label: string) {
  if (/quarter/i.test(label)) return "QF";
  if (/semi/i.test(label)) return "SF";
  const m = label.match(/Round of (\d+)/i);
  if (m) return `R${m[1]}`;
  return label;
}

/* ---------------- Linear (mobile fallback) ---------------- */

function LinearBracket({ rounds }: { rounds: BracketRound[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex min-w-fit gap-4">
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
    <div className="flex w-[200px] shrink-0 flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {round.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {round.matchups.length}
        </span>
      </div>
      <div
        className={cn("flex flex-1 flex-col", stretch ? "justify-around" : "gap-3")}
        style={stretch ? { gap: `${columnIndex * 24}px` } : undefined}
      >
        {round.matchups.map((m) => (
          <MatchupCard key={m.id} matchup={m} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Versus card ---------------- */

function MatchupCard({
  matchup,
  highlight,
}: {
  matchup: BracketMatchup;
  highlight?: boolean;
}) {
  const { home, away, homePrice, awayPrice, winner, kickoffLabel } = matchup;
  return (
    <Link
      to="/event/$id"
      params={{ id: matchup.id }}
      className={cn(
        "group block rounded-lg border border-border bg-background/40 p-2 transition hover:border-white/15 hover:bg-white/[0.03]",
        highlight &&
          "border-primary/40 bg-[oklch(0.82_0.1_305_/_0.08)] shadow-[0_0_24px_-8px_oklch(0.82_0.1_305_/_0.6)] hover:border-primary/60",
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <Flag team={home} dim={winner === "away"} />
        <span className="font-serif text-[10px] italic text-muted-foreground">vs</span>
        <Flag team={away} dim={winner === "home"} />
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1">
        <NameCell team={home} settled={winner === "home"} />
        <NameCell team={away} settled={winner === "away"} />
      </div>
      <div className="mt-0.5 grid grid-cols-2 gap-1">
        <PriceCell price={homePrice} settled={winner === "home"} />
        <PriceCell price={awayPrice} settled={winner === "away"} />
      </div>
      {kickoffLabel && (
        <div className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {kickoffLabel}
        </div>
      )}
    </Link>
  );
}

function Flag({ team, dim }: { team?: BracketTeam; dim?: boolean }) {
  if (!team) {
    return <span className="h-7 w-7 shrink-0 rounded-full border border-dashed border-white/15" />;
  }
  const hue = team.hue ?? 220;
  return (
    <span
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.05] transition",
        dim && "opacity-40 grayscale",
      )}
      style={{ boxShadow: `0 0 12px -3px oklch(0.7 0.18 ${hue} / 0.55)` }}
    >
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="h-full w-full object-cover" />
      ) : null}
    </span>
  );
}

function NameCell({ team, settled }: { team?: BracketTeam; settled?: boolean }) {
  return (
    <span
      className={cn(
        "min-w-0 truncate text-center text-[11px] font-medium",
        settled ? "text-[oklch(0.78_0.18_155)]" : "text-foreground",
        !team && "text-muted-foreground",
      )}
      title={team?.name}
    >
      {team?.name ?? "TBD"}
    </span>
  );
}

function PriceCell({ price, settled }: { price?: number; settled?: boolean }) {
  if (settled) {
    return (
      <span className="text-center font-mono text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_155)]">
        ✓ won
      </span>
    );
  }
  if (typeof price !== "number") {
    return <span className="text-center font-mono text-[10px] text-muted-foreground">—</span>;
  }
  return (
    <span className="text-center font-mono text-[11px] font-semibold tabular-nums text-foreground">
      {Math.round(price * 100)}¢
    </span>
  );
}
