import { Link } from "@tanstack/react-router";
import { Captions, Cast, Play, Clock, Users } from "lucide-react";
import type { SportsMarket, TeamLite } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * Prominent "we are streaming this match right now" card. Sits at the top
 * of the Live & upcoming events grid, one per active stream. Consolidates
 * the live badge, video poster, score header, match clock and a couple of
 * key markets into a single visually weighted unit.
 *
 * Visual only — no real player, no real captions / cast. The Trade CTA
 * deep-links into the existing event detail route.
 */
export function LiveStreamCard({ market }: { market: SportsMarket }) {
  const fixture = market.fixture;
  if (!fixture || !market.liveScore) return null;

  const progress = clockToProgress(market.liveClock);
  // Pick at most two "headline" outcomes — for a three-way 1X2 we surface
  // home + away (skip Draw); for binary we keep both sides as-is.
  const headline = market.outcomes.filter((o) => o.label !== "Draw").slice(0, 2);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[color:var(--accent)]/40 bg-surface shadow-card ring-1 ring-[color:var(--accent)]/20">
      {/* Top bar: LIVE pill + league + utility icons */}
      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--accent-foreground)]">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-current" />
            </span>
            LIVE
          </span>
          <span className="truncate font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {market.league.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton label="Captions"><Captions className="h-3.5 w-3.5" /></IconButton>
          <IconButton label="Cast"><Cast className="h-3.5 w-3.5" /></IconButton>
        </div>
      </header>

      {/* Video poster */}
      <div className="relative mt-3 aspect-video w-full overflow-hidden">
        {market.livePoster ? (
          <img
            src={market.livePoster}
            alt={`${fixture.home.name} vs ${fixture.away.name} live stream`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-transparent" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        <button
          type="button"
          aria-label="Play live stream"
          className="absolute inset-0 grid place-items-center transition hover:bg-background/10"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-background/60 ring-1 ring-white/30 backdrop-blur-md transition group-hover:scale-105">
            <Play className="h-6 w-6 translate-x-0.5 fill-foreground text-foreground" />
          </span>
        </button>
      </div>

      {/* Score + clock */}
      <div className="flex items-center gap-4 px-5 pt-4">
        <TeamScore team={fixture.home} score={market.liveScore.home} align="left" />
        <span className="font-serif-display text-base italic text-muted-foreground">vs</span>
        <TeamScore team={fixture.away} score={market.liveScore.away} align="right" />
        <div className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] tabular-nums text-foreground ring-1 ring-white/[0.06]">
          <Clock className="h-3 w-3 text-[color:var(--accent)]" />
          {market.liveClock ?? "—"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[color:var(--accent)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Markets + Trade CTA */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {headline.map((o) => (
            <div
              key={o.id}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]"
            >
              <span className="truncate text-xs font-medium text-muted-foreground">
                {o.team?.short ?? o.label}
              </span>
              <PricePill price={o.price} delta={o.delta24h} size="sm" />
            </div>
          ))}
        </div>
        <Link
          to="/event/$id"
          params={{ id: market.id }}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-[color:var(--accent-foreground)] transition hover:brightness-110"
        >
          Trade
        </Link>
      </div>

      {/* Meta footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3 w-3" /> {market.participants.toLocaleString()} trading
        </span>
        <span className="text-foreground">Vol {market.volume}</span>
      </div>
    </article>
  );
}

function TeamScore({
  team,
  score,
  align,
}: {
  team: TeamLite;
  score: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2.5 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 16px -4px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
      >
        <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
      </div>
      <div className={`flex min-w-0 flex-col ${align === "right" ? "items-end" : "items-start"}`}>
        <span className="truncate text-xs font-medium text-foreground">{team.short}</span>
        <span className="font-display text-2xl font-semibold leading-none tabular-nums text-foreground">
          {score}
        </span>
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] transition hover:bg-white/[0.08] hover:text-foreground"
    >
      {children}
    </button>
  );
}

/** Parse "MM:SS" or "HH:MM:SS" into a 0–100 progress percentage assuming a
 *  90-minute regulation match. Anything past 90 caps at 100. */
function clockToProgress(clock?: string): number {
  if (!clock) return 0;
  const parts = clock.split(":").map((p) => Number(p));
  if (parts.some(Number.isNaN)) return 0;
  let minutes = 0;
  if (parts.length === 3) {
    minutes = parts[0] * 60 + parts[1] + parts[2] / 60;
  } else if (parts.length === 2) {
    minutes = parts[0] + parts[1] / 60;
  } else {
    minutes = parts[0];
  }
  return Math.max(0, Math.min(100, (minutes / 90) * 100));
}