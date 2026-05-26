import { ArrowUpRight } from "lucide-react";
import type { Outcome, SportsMarket } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * One option of the Top Scorer multi-outcome market rendered as a hero
 * row — keeps the dashed-ring portrait from the old PlayerScorerCard,
 * but the right side now exposes price + Δ24h instead of jersey trivia.
 */
export function TopScorerMarketRow({
  market,
  outcome,
  photo,
}: {
  market: SportsMarket;
  outcome: Outcome;
  photo: string;
}) {
  const team = outcome.team;
  const hue = team?.hue ?? 305;
  return (
    <a
      href={market.tradeHref}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:border-white/15"
    >
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border border-dashed border-white/20" />
        <div
          className="absolute inset-1 overflow-hidden rounded-full"
          style={{ boxShadow: `0 0 24px -4px oklch(0.7 0.22 ${hue} / 0.6)` }}
        >
          <img src={photo} alt={outcome.label} className="h-full w-full object-cover" />
        </div>
        {team && (
          <img
            src={team.logo}
            alt=""
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-surface p-0.5 ring-2 ring-surface"
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {market.league.short} · TOP SCORER
        </div>
        <div className="font-display text-2xl font-semibold leading-tight text-foreground">{outcome.label}</div>
        {outcome.meta && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
            {outcome.meta}
          </span>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full border border-border bg-white/[0.04] text-muted-foreground group-hover:text-foreground">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        <PricePill price={outcome.price} delta={outcome.delta24h} size="lg" />
        <span className="font-mono text-[10px] text-muted-foreground">Vol {market.volume}</span>
      </div>
    </a>
  );
}