import type { Outcome, SportsMarket } from "@/data/sports-markets";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { cn } from "@/lib/utils";

interface MobileTradeBarProps {
  market: SportsMarket;
  selected: Outcome;
  /** Scroll to the in-page TradeForm — used as the secondary action. */
  onOpenForm?: () => void;
}

/**
 * Fixed bottom action bar shown on <lg screens. The desktop `TradeForm`
 * is hidden below the fold on mobile (the right column stacks under the
 * main column), so this bar gives users a one-thumb path to either pop
 * the global TradeDrawer for a fast bet or jump to the full form on the
 * page for sizing + leverage.
 */
export function MobileTradeBar({ market, selected, onOpenForm }: MobileTradeBarProps) {
  const { openTrade } = useTradeDrawer();
  const cents = Math.round(selected.price * 100);
  const delta = typeof selected.delta24h === "number" ? Math.round(selected.delta24h * 100) : 0;
  const label = selected.team?.name ?? selected.label;
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-3 backdrop-blur lg:hidden",
      )}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <button
          type="button"
          onClick={onOpenForm}
          className="min-w-0 flex-1 rounded-xl bg-white/[0.04] px-3 py-2 text-left ring-1 ring-white/[0.06] transition hover:bg-white/[0.08]"
        >
          <div className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Trading · {label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tabular-nums text-foreground">
              {cents}
              <span className="text-xs text-muted-foreground">¢</span>
            </span>
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums",
                delta > 0 ? "text-win" : delta < 0 ? "text-loss" : "text-muted-foreground",
              )}
            >
              {delta > 0 ? `+${delta}¢` : delta < 0 ? `−${Math.abs(delta)}¢` : "0¢"}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => openTrade({ marketId: market.id, outcomeId: selected.id })}
          className="shrink-0 rounded-xl bg-[oklch(0.78_0.18_155_/_0.2)] px-5 py-3 font-display text-sm font-semibold text-[oklch(0.9_0.16_155)] ring-1 ring-[oklch(0.78_0.18_155_/_0.4)] transition hover:bg-[oklch(0.78_0.18_155_/_0.32)]"
        >
          Quick buy
        </button>
      </div>
    </div>
  );
}