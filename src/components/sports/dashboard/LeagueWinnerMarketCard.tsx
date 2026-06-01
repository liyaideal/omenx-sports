import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
import { PricePill } from "./PricePill";
import { CardHeader, TypeChip } from "@/components/sports/CardChip";

/**
 * Multi-outcome futures market presented in a league-table layout. Rows
 * are sorted by implied probability descending; "P/W/D/L" columns are
 * replaced with "Price ¢ / Δ24h" — the underlying OmenX market shape.
 */
export function LeagueWinnerMarketCard({ market }: { market: SportsMarket }) {
  const rows = [...market.outcomes].sort((a, b) => b.price - a.price);
  return (
    <section className="flex h-full flex-col rounded-3xl border border-border bg-surface p-5 shadow-card">
      <CardHeader
        className="pb-3"
        chip={<TypeChip icon={Trophy} label="Season winner" tone="amber" />}
        title={market.title}
      />

      <div className="grid grid-cols-[24px_1fr_auto] items-center gap-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>#</span>
        <span>Market</span>
        <span className="text-right">Price</span>
      </div>

      <div className="flex flex-1 flex-col divide-y divide-white/[0.04]">
        {rows.map((o, i) => (
          <Link
            key={o.id}
            to="/event/$id"
            params={{ id: market.id }}
            search={{ outcome: o.id }}
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
          </Link>
        ))}
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
        <span>{market.endsLabel}</span>
        <span className="text-foreground">Vol {market.volume}</span>
      </footer>
    </section>
  );
}