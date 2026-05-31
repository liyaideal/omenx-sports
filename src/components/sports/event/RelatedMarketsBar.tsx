import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";
import { getRelatedChipLabel } from "./related-markets";

interface RelatedMarketsBarProps {
  markets: SportsMarket[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  className?: string;
}

/**
 * Horizontal chip row of related markets for the same fixture. Tapping a
 * chip swaps the chart / order book / trade form in-page to that market —
 * no navigation, no scroll. First chip is the originally loaded market.
 */
export function RelatedMarketsBar({
  markets,
  activeIdx,
  onSelect,
  className,
}: RelatedMarketsBarProps) {
  if (markets.length <= 1) return null;
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Markets
        </span>
        <div className="-mx-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {markets.map((m, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_0_18px_-6px_var(--primary)]"
                    : "bg-white/[0.04] text-muted-foreground ring-1 ring-white/10 hover:bg-white/[0.08] hover:text-foreground",
                )}
              >
                {getRelatedChipLabel(m, i)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}