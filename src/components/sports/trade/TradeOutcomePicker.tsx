import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";

/**
 * Shared "Pick outcome (+ Pick side)" selector used by both the global
 * `TradeDrawer` and the in-page trade column on the event detail page.
 * Keeping a single component guarantees both surfaces stay visually and
 * behaviorally in sync.
 *
 * - Always shows the outcome pill grid (2 cols for ≤2 outcomes, 3 cols otherwise).
 * - When the market has 3+ outcomes (e.g. 1X2), also shows a YES/NO side
 *   toggle for the selected outcome, since each is its own binary sub-market.
 * Fully controlled — caller owns `outcomeId` and `side` state.
 */
export function TradeOutcomePicker({
  market,
  outcomeId,
  onOutcomeChange,
  side,
  onSideChange,
  className,
}: {
  market: SportsMarket;
  outcomeId?: string;
  onOutcomeChange: (outcomeId: string) => void;
  side: "yes" | "no";
  onSideChange: (side: "yes" | "no") => void;
  className?: string;
}) {
  const selected =
    market.outcomes.find((o) => o.id === outcomeId) ?? market.outcomes[0];
  const needsSideToggle = market.outcomes.length >= 3;
  const yesCents = Math.round(selected.price * 100);
  const noCents = 100 - yesCents;

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Pick outcome
        </div>
        <div
          className={cn(
            "grid gap-2",
            market.outcomes.length <= 2 ? "grid-cols-2" : "grid-cols-3",
          )}
        >
          {market.outcomes.map((o) => {
            const active = o.id === selected.id;
            const cents = Math.round(o.price * 100);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onOutcomeChange(o.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl px-3 py-2 text-left transition",
                  active
                    ? "bg-foreground/95 text-background ring-1 ring-foreground"
                    : "bg-white/[0.04] text-foreground ring-1 ring-white/[0.06] hover:bg-white/[0.08]",
                )}
              >
                <span className="truncate font-mono text-[10px] uppercase tracking-widest">
                  {o.team?.short ?? o.label}
                </span>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {cents}¢
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {needsSideToggle && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Pick side · {selected.team?.short ?? selected.label}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["yes", "no"] as const).map((s) => {
              const active = s === side;
              const cents = s === "yes" ? yesCents : noCents;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSideChange(s)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl px-3 py-2 text-left transition",
                    active
                      ? "bg-foreground/95 text-background ring-1 ring-foreground"
                      : "bg-white/[0.04] text-foreground ring-1 ring-white/[0.06] hover:bg-white/[0.08]",
                  )}
                >
                  <span className="truncate font-mono text-[10px] uppercase tracking-widest">
                    {s === "yes" ? "Yes" : "No"}
                  </span>
                  <span className="font-display text-lg font-semibold tabular-nums">
                    {cents}¢
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}