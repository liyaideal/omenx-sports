import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Maximize2, SquareArrowOutUpRight, X } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { cn } from "@/lib/utils";

interface GlobalStreamMiniPlayerProps {
  market: SportsMarket;
  outcomeId?: string;
  onDismiss: () => void;
  onFullscreen: () => void;
  onSelectOutcome: (id: string) => void;
}

/**
 * Floating bottom-right mini player rendered globally (via portal) by
 * `LiveStreamProvider`. Persists across route navigation so the user can
 * keep an eye on the stream while browsing other pages. Unlike the
 * single-side "Buy" variant this surfaces both outcomes inline plus a
 * neutral "Trade" CTA that opens the full trade drawer.
 */
export function GlobalStreamMiniPlayer({
  market,
  outcomeId,
  onDismiss,
  onFullscreen,
  onSelectOutcome,
}: GlobalStreamMiniPlayerProps) {
  const fixture = market.fixture;
  const { openTrade } = useTradeDrawer();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onEventPage = pathname === `/event/${market.id}`;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Render every outcome as a chip so three-way markets (e.g. football
  // home/draw/away) don't silently drop the third option.
  const outcomes = market.outcomes;
  const selectedId = outcomeId ?? outcomes[0].id;

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 hidden sm:block">
      <div className="pointer-events-auto w-[340px] overflow-hidden rounded-2xl border border-[color:var(--accent)]/40 bg-black/90 shadow-2xl ring-1 ring-[color:var(--accent)]/30 backdrop-blur">
        {/* Poster surface — click to fullscreen */}
        <button
          type="button"
          onClick={onFullscreen}
          aria-label="Open fullscreen"
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

          {market.liveScore && fixture && (
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

          <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100" />
        </button>

        {/* Action bar — both-side chips + Trade + nav controls */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] px-2 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {outcomes.map((o) => (
              <OutcomeChip
                key={o.id}
                label={o.team?.short ?? o.label}
                cents={Math.round(o.price * 100)}
                selected={selectedId === o.id}
                onClick={() => onSelectOutcome(o.id)}
              />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconBtn
              label="Fullscreen"
              onClick={onFullscreen}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </IconBtn>
            {!onEventPage && (
              <IconBtn
                label="Open event"
                onClick={() =>
                  navigate({ to: "/event/$id", params: { id: market.id } })
                }
              >
                <SquareArrowOutUpRight className="h-3.5 w-3.5" />
              </IconBtn>
            )}
            <button
              type="button"
              onClick={() =>
                openTrade({ marketId: market.id, outcomeId: selectedId })
              }
              className="shrink-0 rounded-md bg-primary px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90"
            >
              Trade
            </button>
            <IconBtn label="Hide mini player" onClick={onDismiss}>
              <X className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function OutcomeChip({
  label,
  cents,
  selected,
  onClick,
}: {
  label: string;
  cents: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-md px-2 py-1.5 text-left ring-1 transition",
        selected
          ? "bg-primary/15 ring-primary/50"
          : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]",
      )}
    >
      <span className="truncate font-mono text-[9px] uppercase tracking-widest text-white/70">
        {label}
      </span>
      <span className="font-display text-xs font-semibold tabular-nums text-white">
        {cents}
        <span className="text-white/50">¢</span>
      </span>
    </button>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}