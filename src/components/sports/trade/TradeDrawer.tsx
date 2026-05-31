import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TradeForm } from "@/components/sports/TradeForm";
import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";
import { DrawIcon, isDrawOutcome } from "@/components/sports/draw";

/**
 * Right-edge sliding trade drawer. On mobile (< md) it fills the screen
 * width; on desktop it pins to ~420px on the right. Content:
 *   - Market header (chip + title + endsLabel)
 *   - Outcome chooser (every market.outcome as a selectable pill)
 *   - TradeForm pre-wired to the selected outcome (Buy YES / Buy NO etc.)
 *   - Deep link to /event/$id for the full market page
 *
 * State is fully controlled by `TradeDrawerProvider` so the drawer is a
 * dumb renderer.
 */
export function TradeDrawer({
  open,
  market,
  outcomeId,
  onOpenChange,
  onOutcomeChange,
}: {
  open: boolean;
  market: SportsMarket | null;
  outcomeId?: string;
  onOpenChange: (open: boolean) => void;
  onOutcomeChange: (outcomeId: string) => void;
}) {
  if (!market) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full border-l-border bg-background p-0 sm:max-w-md">
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            No market selected.
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Default to the highest-priced outcome.
  const ranked = [...market.outcomes].sort((a, b) => b.price - a.price);
  const selected =
    market.outcomes.find((o) => o.id === outcomeId) ?? ranked[0] ?? market.outcomes[0];
  const isYesNoMarket =
    market.outcomes.length === 2 &&
    market.outcomes.some((o) => o.label.toUpperCase() === "YES");
  // Two-outcome markets (binary YES/NO or two-team head-to-head) are a single
  // market — picking one outcome IS the YES/NO choice. Markets with 3+ outcomes
  // (e.g. 1X2) are actually multiple binary sub-markets, so we add a second
  // YES/NO toggle for the selected outcome.
  const needsSideToggle = market.outcomes.length >= 3;
  const [side, setSide] = useState<"yes" | "no">("yes");
  // Reset side back to YES whenever the user picks a different outcome.
  useEffect(() => {
    setSide("yes");
  }, [selected.id]);

  const yesCents = Math.round(selected.price * 100);
  const noCents = 100 - yesCents;

  // TradeForm distinguishes accent by "yes" vs "no".
  const formOutcome: "yes" | "no" = needsSideToggle
    ? side
    : isYesNoMarket
      ? (selected.label.toUpperCase() === "NO" ? "no" : "yes")
      : selected.id === market.outcomes[0]?.id ? "yes" : "no";
  const formLabel = needsSideToggle
    ? `${selected.team?.short ?? selected.label} ${side === "yes" ? "YES" : "NO"}`
    : (selected.team?.name ?? selected.label);
  const formPrice = needsSideToggle ? (side === "yes" ? yesCents : noCents) : Math.round(selected.price * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto border-l-border bg-background p-0 sm:max-w-md"
      >
        {/* Slim header — title + Full market link + close */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
          <h2 className="min-w-0 flex-1 truncate font-display text-base font-semibold leading-tight text-foreground">
            {market.title}
          </h2>
          <Link
            to="/event/$id"
            params={{ id: market.id }}
            onClick={() => onOpenChange(false)}
            className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            Full market <ExternalLink className="h-3 w-3" />
          </Link>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.04] text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Outcome chooser */}
        <div className="border-b border-border px-5 py-3">
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
              const draw = isDrawOutcome(o);
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
                  <span className="inline-flex items-center gap-1 truncate font-mono text-[10px] uppercase tracking-widest">
                    {draw && <DrawIcon className="h-3 w-3" />}
                    {o.team?.short ?? (draw ? "Draw" : o.label)}
                  </span>
                  <span className="font-display text-lg font-semibold tabular-nums">
                    {cents}¢
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side chooser — only for 3+ outcome markets, where each outcome is
            its own binary sub-market with YES/NO sides. */}
        {needsSideToggle && (
          <div className="border-b border-border px-5 py-3">
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
                    onClick={() => setSide(s)}
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

        {/* Trade form */}
        <div className="px-5 py-3 pb-0">
          <TradeForm
            key={`${market.id}-${selected.id}-${needsSideToggle ? side : "single"}`}
            outcome={formOutcome}
            outcomeLabel={formLabel}
            price={formPrice}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}