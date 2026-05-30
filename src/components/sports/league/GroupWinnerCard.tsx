import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GroupMarket } from "@/data/tournament";
import { outcomeMarketIdFor } from "@/data/tournament";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";

/**
 * Compact card for a tournament group's "winner" market. Header shows
 * the group letter as a big monogram; body is a 4-team rank list with
 * implied probability + Δ24h. The whole card and each row deep-links
 * to the underlying /event/$id market.
 */
export function GroupWinnerCard({ market }: { market: GroupMarket }) {
  const sorted = [...market.standings].sort((a, b) => b.price - a.price);
  const { openTrade } = useTradeDrawer();
  const MAX_VISIBLE = 3;
  const [expanded, setExpanded] = useState(false);
  const hasMore = sorted.length > MAX_VISIBLE;
  const visible = expanded || !hasMore ? sorted : sorted.slice(0, MAX_VISIBLE);
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card">
      <header className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] font-display text-lg font-bold text-foreground ring-1 ring-white/10">
            {market.group}
          </span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {market.kicker ?? "Group winner"}
            </div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              {market.title}
            </h3>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Vol {market.volume}
        </span>
      </header>

      <div className="flex flex-1 flex-col divide-y divide-white/[0.04]">
        {visible.map((row, i) => {
          const hue = row.team.hue ?? 220;
          const marketId = row.marketId ?? outcomeMarketIdFor(market.id, row.team.short);
          const yesPct = Math.round(row.price * 100);
          const noPct = 100 - yesPct;
          return (
            <div
              key={`${market.id}-${i}`}
              className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 py-2.5"
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openTrade({ marketId, outcomeId: "y" })}
                  className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.78_0.18_155_/_0.12)] px-2 py-1 font-mono text-[11px] font-semibold tabular-nums text-[oklch(0.85_0.16_155)] ring-1 ring-[oklch(0.78_0.18_155_/_0.3)] transition hover:bg-[oklch(0.78_0.18_155_/_0.22)]"
                  aria-label={`Buy YES on ${row.team.name}`}
                >
                  <span className="opacity-70">Y</span>
                  <span>{yesPct}¢</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTrade({ marketId, outcomeId: "n" })}
                  className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.7_0.22_25_/_0.12)] px-2 py-1 font-mono text-[11px] font-semibold tabular-nums text-[oklch(0.82_0.16_25)] ring-1 ring-[oklch(0.7_0.22_25_/_0.3)] transition hover:bg-[oklch(0.7_0.22_25_/_0.22)]"
                  aria-label={`Buy NO on ${row.team.name}`}
                >
                  <span className="opacity-70">N</span>
                  <span>{noPct}¢</span>
                </button>
              </div>
            </div>
          );
        })}
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-md py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
          >
            <span>
              {expanded ? "Show less" : `Show all ${sorted.length}`}
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      <footer className="mt-2 border-t border-border pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {market.endsLabel}
      </footer>
    </section>
  );
}