import { Clock, MoreHorizontal, Users } from "lucide-react";
import type { SportsMarket, TeamLite } from "@/data/sports-markets";
import { PricePill } from "./PricePill";
import { LeagueChip } from "../LeagueBadge";

/**
 * Featured match market — replaces the old FanPollCard. Two crests, a
 * 3-way 1X2 outcome list (or 2-way for binary), each outcome shows price
 * and routes into the OmenX trade screen.
 */
export function MatchMarketCard({ market }: { market: SportsMarket }) {
  if (!market.fixture) return null;
  const { home, away } = market.fixture;
  const total = market.outcomes.reduce((s, o) => s + o.price, 0) || 1;
  const hueFor = (o: typeof market.outcomes[number], isDraw: boolean): string =>
    isDraw ? "280" : o.team ? String(o.team.hue) : "305";
  return (
    <article className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_100%_at_50%_100%,oklch(0.7_0.28_340/0.18),transparent_70%)]" />

      <header className="relative flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <LeagueChip short={market.league.short} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· MATCH</span>
        </div>
        <button aria-label="More" className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      <h3 className="relative mt-3 font-display text-lg font-semibold text-foreground">{market.title}</h3>

      <div className="relative mt-5 flex items-center justify-center gap-6">
        <CrestBubble team={home} />
        <span className="font-serif-display italic text-xl text-muted-foreground">vs</span>
        <CrestBubble team={away} />
      </div>

      <a href={market.tradeHref} className="relative mt-5 block">
        <div className="flex h-2 gap-[2px] overflow-hidden rounded-full bg-white/[0.05]">
          {market.outcomes.map((o) => {
            const isDraw = !o.team;
            const hue = hueFor(o, isDraw);
            const chroma = isDraw ? "0.04" : "0.2";
            return (
              <div
                key={o.id}
                style={{
                  width: `${(o.price / total) * 100}%`,
                  background: `linear-gradient(90deg, oklch(0.55 ${chroma} ${hue}), oklch(0.72 ${chroma} ${hue}))`,
                }}
              />
            );
          })}
        </div>
        <div className="mt-4 space-y-2.5">
          {market.outcomes.map((o) => {
            const isDraw = !o.team;
            const hue = hueFor(o, isDraw);
            const chroma = isDraw ? "0.04" : "0.2";
            return (
              <div key={o.id} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: `oklch(0.68 ${chroma} ${hue})` }}
                />
                <span className="min-w-0 flex-1 truncate font-display text-sm font-medium text-foreground">
                  {o.team?.name ?? o.label}
                </span>
                <PricePill price={o.price} delta={o.delta24h} size="sm" />
              </div>
            );
          })}
        </div>
      </a>

      <footer className="relative mt-5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {market.endsLabel}</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {market.participants.toLocaleString()}</span>
          <span className="text-foreground">Vol {market.volume}</span>
        </div>
      </footer>
    </article>
  );
}

function CrestBubble({ team }: { team: TeamLite }) {
  return (
    <div
      className="grid h-20 w-20 place-items-center rounded-full bg-white/[0.05] p-2 ring-1 ring-white/10"
      style={{ boxShadow: `0 0 30px -6px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
    >
      <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
    </div>
  );
}