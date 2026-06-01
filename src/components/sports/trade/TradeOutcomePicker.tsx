import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";

/**
 * Derive what to feed into `<TradeForm>` from the current market + selection.
 * Mirrors the logic the drawer and the event detail page share.
 */
export function deriveTradeFormProps({
  market,
  outcomeId,
  side,
}: {
  market: SportsMarket;
  outcomeId?: string;
  side: "yes" | "no";
}) {
  const ranked = [...market.outcomes].sort((a, b) => b.price - a.price);
  const selected =
    market.outcomes.find((o) => o.id === outcomeId) ?? ranked[0] ?? market.outcomes[0];
  const isYesNoMarket =
    market.outcomes.length === 2 &&
    market.outcomes.some((o) => o.label.toUpperCase() === "YES");
  const needsSideToggle = market.outcomes.length >= 3;
  const yesCents = Math.round(selected.price * 100);
  const noCents = 100 - yesCents;

  const formOutcome: "yes" | "no" = needsSideToggle
    ? side
    : isYesNoMarket
      ? selected.label.toUpperCase() === "NO" ? "no" : "yes"
      : selected.id === market.outcomes[0]?.id ? "yes" : "no";
  const formLabel = needsSideToggle
    ? `${selected.team?.short ?? selected.label} ${side === "yes" ? "YES" : "NO"}`
    : selected.team?.name ?? selected.label;
  const formPrice = needsSideToggle
    ? side === "yes" ? yesCents : noCents
    : Math.round(selected.price * 100);

  return { selected, needsSideToggle, formOutcome, formLabel, formPrice };
}

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

  // Auto-scroll selected outcome into view when it changes.
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(
      `[data-outcome-id="${selected.id}"]`,
    );
    el?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [selected.id]);

  // ≤3 outcomes fit naturally; ≥4 will overflow and become scrollable.
  const fitsWithoutScroll = market.outcomes.length <= 3;

  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Pick outcome
        </div>
        <div
          ref={scrollerRef}
          className={cn(
            "flex gap-2 overflow-x-auto snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            fitsWithoutScroll
              ? ""
              : "[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]",
          )}
        >
          {market.outcomes.map((o) => {
            const active = o.id === selected.id;
            const cents = Math.round(o.price * 100);
            return (
              <button
                key={o.id}
                data-outcome-id={o.id}
                type="button"
                onClick={() => onOutcomeChange(o.id)}
                className={cn(
                  "flex shrink-0 snap-start items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition",
                  fitsWithoutScroll ? "flex-1 basis-0" : "min-w-[112px]",
                  active
                    ? "bg-foreground/95 text-background ring-1 ring-foreground"
                    : "bg-white/[0.04] text-foreground ring-1 ring-white/[0.06] hover:bg-white/[0.08]",
                )}
              >
                <span className="truncate font-mono text-[10px] uppercase tracking-widest">
                  {o.team?.short ?? o.label}
                </span>
                <span className="font-display text-sm font-semibold tabular-nums">
                  {cents}¢
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {needsSideToggle && (
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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
                    "flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition",
                    active
                      ? "bg-foreground/95 text-background ring-1 ring-foreground"
                      : "bg-white/[0.04] text-foreground ring-1 ring-white/[0.06] hover:bg-white/[0.08]",
                  )}
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    {s === "yes" ? "Yes" : "No"}
                  </span>
                  <span className="font-display text-sm font-semibold tabular-nums">
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