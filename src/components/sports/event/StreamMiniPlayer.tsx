import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { SportsMarket, Outcome } from "@/data/sports-markets";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { cn } from "@/lib/utils";

interface StreamMiniPlayerProps {
  market: SportsMarket;
  selected: Outcome;
  /** When true the floater becomes visible (page already detected the
   *  main stage scrolled out of view). */
  visible: boolean;
  /** Scroll the user back to the in-page Stage. */
  onRestore?: () => void;
}

/**
 * Floating bottom-right mini player rendered via portal so it escapes the
 * AppShell padding stack. Shows the live poster, score bug, and a one-tap
 * Buy button wired to the global TradeDrawer — so the user can keep the
 * stream visible AND place trades from anywhere on the page.
 *
 * Once the user dismisses the mini player, it stays hidden until the
 * Stage scrolls back into view (a fresh "offscreen" → visible cycle
 * brings it back). Mobile (<sm) is intentionally suppressed to avoid
 * stealing screen real estate from the sticky trade bar.
 */
export function StreamMiniPlayer({ market, selected, visible, onRestore }: StreamMiniPlayerProps) {
  const fixture = market.fixture;
  const { openTrade } = useTradeDrawer();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => setMounted(true), []);
  // Re-show when stage comes back into view, then leaves again.
  useEffect(() => {
    if (!visible) setDismissed(false);
  }, [visible]);

  if (!mounted) return null;
  if (!market.isLiveStream || !fixture) return null;

  const show = visible && !dismissed;
  const cents = Math.round(selected.price * 100);
  const selectedLabel = selected.team?.short ?? selected.label;

  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed bottom-4 right-4 z-50 hidden sm:block",
        "transition-all duration-300",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
      aria-hidden={!show}
    >
      <div className="pointer-events-auto w-[320px] overflow-hidden rounded-2xl border border-[color:var(--accent)]/40 bg-black/90 shadow-2xl ring-1 ring-[color:var(--accent)]/30 backdrop-blur">
        <button
          type="button"
          onClick={onRestore}
          aria-label="Back to stream"
          className="relative block aspect-[16/9] w-full overflow-hidden"
        >
          {market.livePoster && (
            <img
              src={market.livePoster}
              alt=""
              className="h-full w-full object-cover transition-transform duration-[10000ms] hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--accent)] px-1.5 py-[1px] font-mono text-[9px] font-bold uppercase tracking-widest text-[color:var(--accent-foreground)]">
            <span className="relative grid h-1 w-1 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
              <span className="relative h-1 w-1 rounded-full bg-current" />
            </span>
            LIVE
          </span>

          {market.liveClock && (
            <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-[1px] font-mono text-[9px] tabular-nums text-white ring-1 ring-white/15">
              {market.liveClock}
            </span>
          )}

          {market.liveScore && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/70 px-2 py-0.5 ring-1 ring-white/15">
              <img src={fixture.home.logo} alt="" className="h-3.5 w-3.5 object-contain" />
              <span className="font-display text-xs font-semibold tabular-nums text-white">
                {market.liveScore.home}
              </span>
              <span className="text-[10px] text-white/50">–</span>
              <span className="font-display text-xs font-semibold tabular-nums text-white">
                {market.liveScore.away}
              </span>
              <img src={fixture.away.logo} alt="" className="h-3.5 w-3.5 object-contain" />
            </div>
          )}
        </button>

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-2.5 py-2">
          <div className="min-w-0">
            <div className="truncate font-mono text-[9px] uppercase tracking-widest text-white/50">
              {selectedLabel}
            </div>
            <div className="font-display text-sm font-semibold tabular-nums text-white">
              {cents}
              <span className="text-white/50">¢</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              openTrade({ marketId: market.id, outcomeId: selected.id })
            }
            className="shrink-0 rounded-md bg-[oklch(0.78_0.18_155_/_0.18)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[oklch(0.85_0.16_155)] ring-1 ring-[oklch(0.78_0.18_155_/_0.35)] transition hover:bg-[oklch(0.78_0.18_155_/_0.3)]"
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Hide mini player"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}