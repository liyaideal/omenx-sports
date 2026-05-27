import { Link } from "@tanstack/react-router";
import { Play, ArrowRight } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";

/**
 * Mobile-only "Live Scores" hero. All live matches render as equal-sized
 * 16/9 broadcast cards stacked vertically — no main/secondary hierarchy,
 * so two live games get two equally prominent posters.
 */
export function MobileLiveHero({ markets }: { markets: SportsMarket[] }) {
  if (markets.length === 0) return null;

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold leading-9">
          Live
          <span className="font-serif-display italic text-neon"> Scores</span>
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.7_0.22_25_/_0.12)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_45)] ring-1 ring-[oklch(0.7_0.22_25_/_0.25)]">
          <span className="relative grid h-1.5 w-1.5 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          {markets.length} {markets.length === 1 ? "match" : "matches"}
        </span>
      </header>

      <div className="space-y-3">
        {markets.map((m) => (
          <LiveMatchCard key={m.id} market={m} />
        ))}
      </div>
    </section>
  );
}

function LiveMatchCard({ market }: { market: SportsMarket }) {
  const fixture = market.fixture;
  const score = market.liveScore;
  if (!fixture || !score) return null;

  return (
    <Link
      to="/event/$id"
      params={{ id: market.id }}
      className="group relative block aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[color:var(--accent)]/40 bg-surface shadow-card ring-1 ring-[color:var(--accent)]/20 transition active:scale-[0.99]"
    >
      {/* Poster fills the whole card */}
      {market.livePoster ? (
        <img
          src={market.livePoster}
          alt={`${fixture.home.name} vs ${fixture.away.name} live`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />
      )}

      {/* Legibility gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface/90 via-surface/55 to-transparent" />

      {/* Top row: LIVE + league / clock */}
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--accent-foreground)]">
          <span className="relative grid h-1.5 w-1.5 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          LIVE
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/85">
          {market.league.short}
        </span>
      </div>
      {market.liveClock && (
        <span className="absolute right-3 top-3 rounded-full bg-background/60 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white ring-1 ring-white/20 backdrop-blur">
          {market.liveClock}
        </span>
      )}

      {/* Center play */}
      <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background/55 ring-1 ring-white/30 backdrop-blur-md transition group-active:scale-95">
        <Play className="h-4 w-4 translate-x-0.5 fill-foreground text-foreground" />
      </span>

      {/* Bottom row: scoreboard bug + open link */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-full bg-background/75 px-2.5 py-1.5 ring-1 ring-white/15 backdrop-blur">
          <img src={fixture.home.logo} alt="" className="h-6 w-6 shrink-0 object-contain" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {fixture.home.short}
          </span>
          <span className="font-display text-base font-semibold leading-none tabular-nums text-foreground">
            {score.home}
          </span>
          <span className="text-muted-foreground">–</span>
          <span className="font-display text-base font-semibold leading-none tabular-nums text-foreground">
            {score.away}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {fixture.away.short}
          </span>
          <img src={fixture.away.logo} alt="" className="h-6 w-6 shrink-0 object-contain" />
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/85">
          Open <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function RailCard({ market }: { market: SportsMarket }) {
  const fixture = market.fixture;
  const score = market.liveScore;
  if (!fixture || !score) return null;
  return (
    <Link
      to="/event/$id"
      params={{ id: market.id }}
      className="flex w-48 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition active:scale-[0.98]"
    >
      {/* Mini poster */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {market.livePoster ? (
          <img
            src={market.livePoster}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-transparent" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--accent)] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[color:var(--accent-foreground)]">
          <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
          Live
        </span>
        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-background/60 ring-1 ring-white/25 backdrop-blur">
          <Play className="h-2.5 w-2.5 translate-x-px fill-foreground text-foreground" />
        </span>
        {market.liveClock && (
          <span className="absolute bottom-1.5 right-2 font-mono text-[9px] tabular-nums text-white/90">
            {market.liveClock}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <img src={fixture.home.logo} alt="" className="h-7 w-7 object-contain" />
          <span className="font-display text-base font-semibold tabular-nums text-foreground">
            {score.home} – {score.away}
          </span>
          <img src={fixture.away.logo} alt="" className="h-7 w-7 object-contain" />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>{fixture.home.short}</span>
          <span>{fixture.away.short}</span>
        </div>
      </div>
    </Link>
  );
}