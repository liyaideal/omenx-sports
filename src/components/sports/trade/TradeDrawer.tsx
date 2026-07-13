import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Info, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TradeForm } from "@/components/sports/TradeForm";
import { TradeOutcomePicker, deriveTradeFormProps } from "./TradeOutcomePicker";
import type { SportsMarket } from "@/data/sports-markets";
import {
  getMappingByMarketId,
  useLiveOutcomePrices,
} from "@/lib/demoEngineEvents";
import { placeDemoOrder, totalBalance } from "@/lib/demoEngine";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { DemoSignInSheet } from "@/components/sports/auth/DemoSignInSheet";
import { omenxUrl } from "@/lib/omenx";

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

  const [side, setSide] = useState<"yes" | "no">("yes");
  const [showSignIn, setShowSignIn] = useState(false);
  const mapping = getMappingByMarketId(market.id);
  const isMapped = !!mapping;
  const live = useLiveOutcomePrices(isMapped ? market.id : null);
  const auth = useDemoAuth();

  // For mapped events, override each outcome's price with the live value.
  const liveMarket: SportsMarket = isMapped
    ? {
        ...market,
        outcomes: market.outcomes.map((o) =>
          live.byOutcomeId[o.id] != null
            ? { ...o, price: live.byOutcomeId[o.id] }
            : o,
        ),
      }
    : market;

  const { selected, needsSideToggle, formOutcome, formLabel, formPrice } =
    deriveTradeFormProps({ market: liveMarket, outcomeId, side });
  // Reset side back to YES whenever the user picks a different outcome.
  useEffect(() => {
    setSide("yes");
  }, [selected.id]);

  const liveBalance = totalBalance(auth.profile);
  // For mapped events we require sign-in and use the live wallet balance.
  // Unmapped events keep the legacy demo balance default (5000 USDC).
  const balance = isMapped && auth.user ? liveBalance : 5000;

  const handlePlaceOrder = async () => {
    if (!isMapped || !mapping) return; // legacy demo path handled by TradeForm toast
    if (!auth.user || !auth.profile) {
      setShowSignIn(true);
      throw new Error("Sign in to place a real order");
    }
    const outcomeMap = mapping.outcomes[selected.id];
    if (!outcomeMap) throw new Error("Outcome not mapped");
    // TradeForm calls onPlaceOrder synchronously with a fee already computed.
    // We ignore that shape and re-run the small-white flow (no leverage, no fee).
  };

  const onPlaceOrder = async (o: {
    margin: number;
    price: number;
    outcome: "yes" | "no";
  }) => {
    await handlePlaceOrder();
    if (!isMapped || !mapping || !auth.user || !auth.profile) return;
    const outcomeMap = mapping.outcomes[selected.id];
    try {
      await placeDemoOrder({
        userId: auth.user.id,
        eventName: mapping.eventName,
        optionId: outcomeMap.optionId,
        optionLabel: outcomeMap.optionLabel,
        price: live.byOptionId[outcomeMap.optionId] ?? o.price / 100,
        amount: o.margin,
        profile: auth.profile,
      });
      await auth.refreshProfile();
      toast.success("Filled · saved to OmenX main-site", {
        action: {
          label: "View in Portfolio ↗",
          onClick: () => window.open(omenxUrl.portfolio(), "_blank"),
        },
      });
    } catch (e) {
      toast.error("Order failed", {
        description: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  };

  return (
    <>
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

        {isMapped && (
          <div className="mx-5 mt-3 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/[0.06] px-3 py-2 text-[11px]">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
              <span className="min-w-0 truncate font-mono uppercase tracking-widest text-primary/90">
                Live · OmenX main-site
              </span>
            </div>
            {auth.user ? (
              <span className="shrink-0 font-mono text-muted-foreground">
                Wallet <span className="text-foreground">${liveBalance.toFixed(2)}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowSignIn(true)}
                className="shrink-0 rounded-md bg-primary/20 px-2 py-1 font-mono uppercase tracking-widest text-primary hover:bg-primary/30"
              >
                Sign in
              </button>
            )}
          </div>
        )}

        <div className="border-b border-border px-5 py-3">
          <TradeOutcomePicker
            market={liveMarket}
            outcomeId={selected.id}
            onOutcomeChange={onOutcomeChange}
            side={side}
            onSideChange={setSide}
          />
        </div>

        {market.isLiveStream && (
          <div className="mx-5 mt-3 flex items-start gap-2 rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-2 text-[11px] leading-relaxed text-[#fbbf24]">
            <Info className="mt-[1px] h-3.5 w-3.5 shrink-0" />
            <span>
              Live scores and stream may lag the venue by{" "}
              <span className="font-semibold">30–60 seconds</span>. Trade
              accordingly — settlement uses the official result.
            </span>
          </div>
        )}

        {/* Trade form */}
        <div className="px-5 py-3 pb-0">
          <TradeForm
            key={`${market.id}-${selected.id}-${needsSideToggle ? side : "single"}`}
            outcome={formOutcome}
            outcomeLabel={formLabel}
            price={formPrice}
            balance={balance}
            onPlaceOrder={isMapped ? (o) => void onPlaceOrder(o) : undefined}
          />
        </div>

        {isMapped && (
          <div className="mt-3 border-t border-border px-5 py-3">
            <a
              href={omenxUrl.portfolio()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
            >
              <span>View filled orders in OmenX Portfolio</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
    <DemoSignInSheet
      open={showSignIn}
      onOpenChange={setShowSignIn}
      onSignedIn={() => auth.refreshProfile()}
    />
    </>
  );
}