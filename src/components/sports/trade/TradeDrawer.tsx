import { Link } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TradeForm } from "@/components/sports/TradeForm";
import { LeagueChip } from "@/components/sports/LeagueBadge";
import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";

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
  // TradeForm distinguishes accent by "yes" vs "no" — map first outcome → yes.
  const formOutcome: "yes" | "no" =
    isYesNoMarket ? (selected.label.toUpperCase() === "NO" ? "no" : "yes") :
    selected.id === market.outcomes[0]?.id ? "yes" : "no";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto border-l-border bg-background p-0 sm:max-w-md"
      >
        {/* Custom header — replace the default sheet padding */}
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <LeagueChip short={market.league.short} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                · {market.endsLabel}
              </span>
            </div>
            <h2 className="mt-1.5 font-display text-base font-semibold leading-tight text-foreground">
              {market.title}
            </h2>
            <div className="mt-1 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
              <span>Vol {market.volume}</span>
              <span>·</span>
              <span>{market.participants.toLocaleString()} traders</span>
              <Link
                to="/event/$id"
                params={{ id: market.id }}
                onClick={() => onOpenChange(false)}
                className="ml-auto inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
              >
                Full market <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
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
        <div className="border-b border-border px-5 py-4">
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

        {/* Trade form */}
        <div className="px-5 py-4">
          <TradeForm
            key={`${market.id}-${selected.id}`}
            outcome={formOutcome}
            outcomeLabel={selected.team?.name ?? selected.label}
            price={Math.round(selected.price * 100)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}