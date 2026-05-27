import { Link } from "@tanstack/react-router";
import type { SportsMarket } from "@/data/sports-markets";
import { PricePill } from "./PricePill";
import { LeagueChip } from "../LeagueBadge";

/**
 * Multi-outcome futures market for top scorer awards. Visually identical
 * to LeagueWinnerMarketCard so users immediately recognize the shape:
 * one market, many candidate outcomes. Uses player photos instead of
 * team crests as the primary row glyph.
 */
export function TopScorerMarketCard({
  market,
  photos,
}: {
  market: SportsMarket;
  photos?: Record<string, string>;
}) {
  const rows = [...market.outcomes].sort((a, b) => b.price - a.price);
  return (
    <section className="flex h-full flex-col rounded-3xl border border-border bg-surface p-5 shadow-card">
      <header className="flex items-center justify-between pb-3">
        <div>
          <div className="inline-flex items-center gap-2">
            <LeagueChip short={market.league.short} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· TOP SCORER</span>
          </div>
          <h3 className="mt-1.5 font-display text-base font-semibold text-foreground">{market.title}</h3>
        </div>
      </header>

      <div className="grid grid-cols-[24px_1fr_auto] items-center gap-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Price</span>
      </div>

      <div className="flex flex-1 flex-col divide-y divide-white/[0.04]">
        {rows.map((o, i) => {
          const hue = o.team?.hue ?? 305;
          const photo = photos?.[o.id] ?? o.team?.logo;
          const initials = o.label
            .split(/\s+/)
            .map((p) => p.replace(/[^A-Za-z]/g, "").charAt(0))
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <Link
              key={o.id}
              to="/event/$id"
              params={{ id: market.id }}
              className="grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5 transition hover:bg-white/[0.02]"
            >
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 shrink-0">
                  <div
                    className="h-full w-full overflow-hidden rounded-full"
                    style={{ boxShadow: `0 0 14px -4px oklch(0.7 0.22 ${hue} / 0.55)` }}
                  >
                    {photo ? (
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-white/[0.06] font-mono text-[10px] font-bold text-muted-foreground">
                        {initials || "?"}
                      </div>
                    )}
                  </div>
                  {o.team && (
                    <img
                      src={o.team.logo}
                      alt=""
                      className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-surface p-px ring-2 ring-surface"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{o.label}</div>
                  {o.meta && (
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {o.meta} this season
                    </div>
                  )}
                </div>
              </div>
              <PricePill price={o.price} delta={o.delta24h} size="sm" />
            </Link>
          );
        })}
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
        <span>{market.endsLabel}</span>
        <span className="text-foreground">Vol {market.volume}</span>
      </footer>
    </section>
  );
}