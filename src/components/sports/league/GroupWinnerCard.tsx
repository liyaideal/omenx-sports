import { Link } from "@tanstack/react-router";
import { PricePill } from "@/components/sports/dashboard/PricePill";
import type { GroupMarket } from "@/data/tournament";

/**
 * Compact card for a tournament group's "winner" market. Header shows
 * the group letter as a big monogram; body is a 4-team rank list with
 * implied probability + Δ24h. The whole card and each row deep-links
 * to the underlying /event/$id market.
 */
export function GroupWinnerCard({ market }: { market: GroupMarket }) {
  const sorted = [...market.standings].sort((a, b) => b.price - a.price);
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card">
      <header className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] font-display text-lg font-bold text-foreground ring-1 ring-white/10">
            {market.group}
          </span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Group winner
            </div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Group {market.group}
            </h3>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Vol {market.volume}
        </span>
      </header>

      <div className="flex flex-1 flex-col divide-y divide-white/[0.04]">
        {sorted.map((row, i) => {
          const hue = row.team.hue ?? 220;
          return (
            <Link
              key={`${market.id}-${i}`}
              to="/event/$id"
              params={{ id: market.id }}
              className="grid grid-cols-[20px_1fr_auto] items-center gap-3 py-2 transition hover:bg-white/[0.02]"
            >
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <div className="flex min-w-0 items-center gap-2.5">
                {row.team.logo && (
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.05] p-0.5"
                    style={{ boxShadow: `0 0 12px -4px oklch(0.7 0.18 ${hue} / 0.5)` }}
                  >
                    <img src={row.team.logo} alt="" className="h-full w-full object-cover" />
                  </span>
                )}
                <span className="truncate text-sm font-medium text-foreground">
                  {row.team.name}
                </span>
              </div>
              <PricePill price={row.price} delta={row.delta24h} size="sm" />
            </Link>
          );
        })}
      </div>

      <footer className="mt-2 border-t border-border pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {market.endsLabel}
      </footer>
    </section>
  );
}