import { cn } from "@/lib/utils";
import type { SportsMarket, Outcome } from "@/data/sports-markets";

export interface SidebarItem {
  market: SportsMarket;
  outcome: Outcome;
  /** Composite id `${market.id}::${outcome.id}` */
  id: string;
}

interface Props {
  items: SidebarItem[];
  activeId: string;
  onPick: (id: string) => void;
  livePrices: Record<string, number>;
  openCountPerItem: Record<string, number>;
}

export function MarketSidebar({ items, activeId, onPick, livePrices, openCountPerItem }: Props) {
  // group by market
  const byMarket = new Map<string, { market: SportsMarket; rows: SidebarItem[] }>();
  for (const it of items) {
    if (!byMarket.has(it.market.id))
      byMarket.set(it.market.id, { market: it.market, rows: [] });
    byMarket.get(it.market.id)!.rows.push(it);
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-3">
      <div className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/70">
        Live · Markets
      </div>
      {Array.from(byMarket.values()).map(({ market, rows }) => (
        <div key={market.id} className="space-y-1">
          <div className="px-1 text-[11px] font-semibold text-zinc-400">
            {market.fixture
              ? `${market.fixture.home.short} vs ${market.fixture.away.short}`
              : market.title}
          </div>
          <div className="px-1 text-[10px] text-zinc-600">
            {market.league.short} · {market.liveClock ?? "LIVE"}
          </div>
          {rows.map((row) => {
            const isActive = row.id === activeId;
            const price = livePrices[row.id] ?? row.outcome.price * 100;
            const openCount = openCountPerItem[row.id] ?? 0;
            return (
              <button
                key={row.id}
                onClick={() => onPick(row.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left transition-colors",
                  isActive
                    ? "border-emerald-400/50 bg-emerald-400/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                )}
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-zinc-200">
                    {row.outcome.label}
                  </div>
                  {openCount > 0 && (
                    <div className="text-[10px] text-amber-300/80">{openCount} open</div>
                  )}
                </div>
                <div
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    isActive ? "text-emerald-300" : "text-zinc-300"
                  )}
                >
                  {price.toFixed(1)}¢
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}