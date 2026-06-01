import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Minimize2, SquareArrowOutUpRight, X } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { cn } from "@/lib/utils";
import { AudioTrackToggle } from "./AudioTrackToggle";

interface FullscreenStreamOverlayProps {
  market: SportsMarket;
  outcomeId?: string;
  onClose: () => void;
  onSelectOutcome: (id: string) => void;
}

/**
 * Theatrical full-viewport stream surface. Reuses the live poster as a
 * placeholder for the future `<video>` source. Pinned bottom trade strip
 * lets the user keep betting without leaving fullscreen.
 */
export function FullscreenStreamOverlay({
  market,
  outcomeId,
  onClose,
  onSelectOutcome,
}: FullscreenStreamOverlayProps) {
  const { openTrade } = useTradeDrawer();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onEventPage = pathname === `/event/${market.id}`;

  // ESC to close + body scroll lock.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const fixture = market.fixture;
  const outcomes = market.outcomes;
  const selectedId = outcomeId ?? outcomes[0].id;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur">
      {/* Top chrome */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--accent-foreground)]">
            <span className="relative grid h-1.5 w-1.5 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            LIVE
          </span>
          {market.liveClock && (
            <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white/80 ring-1 ring-white/15">
              {market.liveClock}
            </span>
          )}
          <div className="ml-2 truncate font-display text-sm font-semibold text-white">
            {market.title}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <AudioTrackToggle size="lg" className="mr-1" />
          {!onEventPage && (
            <ChromeBtn
              label="Open event"
              onClick={() => {
                onClose();
                navigate({ to: "/event/$id", params: { id: market.id } });
              }}
            >
              <SquareArrowOutUpRight className="h-4 w-4" />
            </ChromeBtn>
          )}
          <ChromeBtn label="Exit fullscreen" onClick={onClose}>
            <Minimize2 className="h-4 w-4" />
          </ChromeBtn>
          <ChromeBtn label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </ChromeBtn>
        </div>
      </div>

      {/* Video surface */}
      <div className="relative flex-1 overflow-hidden">
        {market.livePoster ? (
          <img
            src={market.livePoster}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-transparent" />
        )}
        {/* Score bug */}
        {fixture && market.liveScore && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 ring-1 ring-white/20 backdrop-blur">
              <img src={fixture.home.logo} alt="" className="h-8 w-8 object-contain" />
              <span className="font-display text-2xl font-semibold tabular-nums text-white">
                {market.liveScore.home}
              </span>
              <span className="text-white/40">–</span>
              <span className="font-display text-2xl font-semibold tabular-nums text-white">
                {market.liveScore.away}
              </span>
              <img src={fixture.away.logo} alt="" className="h-8 w-8 object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom trade strip */}
      <div className="border-t border-white/10 bg-black/80 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {outcomes.map((o) => (
              <ChipLg
                key={o.id}
                label={o.team?.name ?? o.label}
                cents={Math.round(o.price * 100)}
                selected={selectedId === o.id}
                onClick={() => onSelectOutcome(o.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              // TradeDrawer sits at z-[70] (see ui/sheet.tsx) so it
              // overlays the fullscreen layer (z-60) directly — keep
              // the stream visible behind the drawer.
              openTrade({ marketId: market.id, outcomeId: selectedId })
            }
            className="shrink-0 rounded-xl bg-primary px-5 py-3 font-display text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Trade
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ChromeBtn({
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
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
    >
      {children}
    </button>
  );
}

function ChipLg({
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
        "flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left ring-1 transition",
        selected
          ? "bg-primary/15 ring-primary/50"
          : "bg-white/[0.05] ring-white/10 hover:bg-white/[0.1]",
      )}
    >
      <span className="truncate font-mono text-[10px] uppercase tracking-widest text-white/70">
        {label}
      </span>
      <span className="font-display text-base font-semibold tabular-nums text-white">
        {cents}
        <span className="text-white/50">¢</span>
      </span>
    </button>
  );
}