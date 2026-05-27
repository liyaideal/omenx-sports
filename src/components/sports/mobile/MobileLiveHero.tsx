import { Link } from "@tanstack/react-router";
import { Play, ArrowRight } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
import { cn } from "@/lib/utils";

/**
 * Mobile-only "Live Scores" hero — the first thing the user sees on the
 * homepage. Big crests + score in the spirit of the reference design,
 * with a horizontal rail of additional live matches below when more than
 * one is streaming.
 */
export function MobileLiveHero({ markets }: { markets: SportsMarket[] }) {
  if (markets.length === 0) return null;
  const [hero, ...rest] = markets;

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

      <HeroCard market={hero} />

      {rest.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2.5">
            {rest.map((m) => (
              <RailCard key={m.id} market={m} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function HeroCard({ market }: { market: SportsMarket }) {
  const fixture = market.fixture;
  const score = market.liveScore;
  if (!fixture || !score) return null;

  return (
    <Link
      to="/event/$id"
      params={{ id: market.id }}
      className="group relative block overflow-hidden rounded-[28px] border border-[color:var(--accent)]/40 bg-surface p-5 shadow-card ring-1 ring-[color:var(--accent)]/20 transition active:scale-[0.99]"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 35%, transparent), transparent 70%)",
        }}
      />

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Crest team={fixture.home} />
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-baseline gap-2 font-display text-4xl font-bold tabular-nums text-foreground">
            <span>{score.home}</span>
            <span className="text-muted-foreground">–</span>
            <span>{score.away}</span>
          </div>
          {market.liveClock && (
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {market.liveClock}
            </span>
          )}
        </div>
        <Crest team={fixture.away} align="right" />
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
        <span className="truncate font-mono text-[11px] uppercase tracking-widest text-foreground">
          {fixture.home.short}
        </span>
        <span className="inline-flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[color:var(--accent)]">
          <span className="relative grid h-1.5 w-1.5 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          Live
        </span>
        <span className="truncate font-mono text-[11px] uppercase tracking-widest text-foreground">
          {fixture.away.short}
        </span>
      </div>

      <footer className="relative mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-background/60 ring-1 ring-white/15">
            <Play className="h-2.5 w-2.5 translate-x-px fill-foreground text-foreground" />
          </span>
          Streaming · {market.league.short}
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground">
          Open market <ArrowRight className="h-3 w-3" />
        </span>
      </footer>
    </Link>
  );
}

function Crest({
  team,
  align = "left",
}: {
  team: { name: string; short: string; logo: string; hue: number };
  align?: "left" | "right";
}) {
  return (
    <div className={cn("flex flex-col items-center gap-1.5", align === "right" && "")}>
      <div
        className="grid h-20 w-20 place-items-center rounded-full bg-white/[0.05] p-2.5 ring-1 ring-white/10"
        style={{
          boxShadow: `0 0 28px -6px oklch(0.7 0.22 ${team.hue} / 0.55)`,
        }}
      >
        <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
      </div>
    </div>
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
      className="flex w-44 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-surface p-3 shadow-card transition active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-[color:var(--accent)]">
          <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
          Live
        </span>
        {market.liveClock && (
          <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
            {market.liveClock}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <img src={fixture.home.logo} alt="" className="h-8 w-8 object-contain" />
        <span className="font-display text-base font-semibold tabular-nums text-foreground">
          {score.home} – {score.away}
        </span>
        <img src={fixture.away.logo} alt="" className="h-8 w-8 object-contain" />
      </div>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{fixture.home.short}</span>
        <span>{fixture.away.short}</span>
      </div>
    </Link>
  );
}