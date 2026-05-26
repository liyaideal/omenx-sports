import { ArrowUpRight } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * Multi-outcome futures market presented in a league-table layout. Rows
 * are sorted by implied probability descending; "P/W/D/L" columns are
 * replaced with "Price ¢ / Δ24h" — the underlying OmenX market shape.
 */
export function LeagueWinnerMarketCard({ market }: { market: SportsMarket }) {
  const rows = [...market.outcomes].sort((a, b) => b.price - a.price);
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <header className="flex items-center justify-between pb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {market.league.short} · FUTURES
          </div>
          <h3 className="mt-0.5 font-display text-base font-semibold text-foreground">{market.title}</h3>
        </div>
        <a href={market.tradeHref} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          Trade <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </header>

      <div className="grid grid-cols-[24px_1fr_auto] items-center gap-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>#</span>
        <span>Outcome</span>
        <span className="text-right">Price</span>
      </div>

      <div className="flex flex-col divide-y divide-white/[0.04]">
        {rows.map((o, i) => (
          <a
            key={o.id}
            href={market.tradeHref}
            className="grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5 transition hover:bg-white/[0.02]"
          >
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{i + 1}</span>
            <div className="flex items-center gap-2.5">
              {o.team && (
                <div
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.05] p-0.5"
                  style={{ boxShadow: `0 0 14px -4px oklch(0.7 0.22 ${o.team.hue} / 0.55)` }}
                >
                  <img src={o.team.logo} alt="" className="h-full w-full object-contain" />
                </div>
              )}
              <span className="text-sm font-medium text-foreground">{o.label}</span>
            </div>
            <PricePill price={o.price} delta={o.delta24h} size="sm" />
          </a>
        ))}
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
        <span>{market.endsLabel}</span>
        <span className="text-foreground">Vol {market.volume}</span>
      </footer>
    </section>
  );
}