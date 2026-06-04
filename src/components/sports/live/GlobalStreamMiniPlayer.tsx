import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { GripHorizontal, Maximize2, SquareArrowOutUpRight, X } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { AudioTrackToggle } from "./AudioTrackToggle";
import { LiveDelayInfo } from "./LiveDelayInfo";

interface GlobalStreamMiniPlayerProps {
  market: SportsMarket;
  outcomeId?: string;
  onDismiss: () => void;
  onFullscreen: () => void;
  onSelectOutcome: (id: string) => void;
}

const STORAGE_KEY = "omenx.miniPlayer.pos";
const PLAYER_W = 340;
const PLAYER_H = 252; // approx: 340 * 9/16 (191) + handle (20) + action bar (~41)
const EDGE_PAD = 8;
const SNAP_THRESHOLD = 24;

function clampPos(x: number, y: number) {
  const maxX = Math.max(EDGE_PAD, window.innerWidth - PLAYER_W - EDGE_PAD);
  const maxY = Math.max(EDGE_PAD, window.innerHeight - PLAYER_H - EDGE_PAD);
  return {
    x: Math.min(Math.max(EDGE_PAD, x), maxX),
    y: Math.min(Math.max(EDGE_PAD, y), maxY),
  };
}

function defaultPos() {
  return clampPos(
    window.innerWidth - PLAYER_W - 16,
    window.innerHeight - PLAYER_H - 16,
  );
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
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    let initial = defaultPos();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { x: number; y: number };
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          initial = clampPos(parsed.x, parsed.y);
        }
      }
    } catch {
      /* ignore */
    }
    setPos(initial);

    const onResize = () => setPos((p) => (p ? clampPos(p.x, p.y) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pos) return;
    e.preventDefault();
    dragOffset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const off = dragOffset.current;
      if (!off) return;
      setPos(clampPos(e.clientX - off.dx, e.clientY - off.dy));
    };
    const onUp = () => {
      setDragging(false);
      dragOffset.current = null;
      setPos((p) => {
        if (!p) return p;
        let { x, y } = p;
        const rightEdge = window.innerWidth - PLAYER_W - EDGE_PAD;
        if (x - EDGE_PAD < SNAP_THRESHOLD) x = EDGE_PAD;
        else if (rightEdge - x < SNAP_THRESHOLD) x = rightEdge;
        const snapped = { x, y };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped));
        } catch {
          /* ignore */
        }
        return snapped;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  if (!mounted) return null;

  // Mini player keeps the bottom bar minimal — only a Trade CTA + nav
  // controls. Outcome selection happens in the fullscreen overlay or in
  // the trade drawer itself, so cramming chips here just made them
  // illegible (especially on three-way markets).
  const selectedId = outcomeId ?? market.outcomes[0].id;

  return createPortal(
    <div
      className="pointer-events-none fixed z-50 hidden sm:block"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        transition: dragging ? "none" : "left 160ms ease, top 160ms ease",
      }}
    >
      <div
        className="pointer-events-auto w-[340px] overflow-hidden rounded-2xl border border-[color:var(--accent)]/40 bg-black/90 shadow-2xl ring-1 ring-[color:var(--accent)]/30 backdrop-blur"
        style={{ touchAction: "none" }}
      >
        {/* Drag handle */}
        <div
          role="toolbar"
          aria-label="Drag to move"
          title="Drag to move"
          onPointerDown={onPointerDown}
          className={`flex h-5 items-center justify-center border-b border-white/[0.04] bg-white/[0.03] text-white/40 transition hover:text-white/70 ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <GripHorizontal className="h-3 w-3" />
        </div>
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
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-[1px] font-mono text-[9px] tabular-nums text-white ring-1 ring-white/15">
              {market.liveClock}
              <LiveDelayInfo variant="score" tone="onMedia" />
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

        {/* Action bar — Trade CTA + nav controls (no outcome chips). */}
        <div className="flex items-center gap-1.5 border-t border-white/[0.06] px-2 py-2">
          <AudioTrackToggle size="sm" className="shrink-0" />
          <button
            type="button"
            onClick={() =>
              openTrade({ marketId: market.id, outcomeId: selectedId })
            }
            className="flex-1 rounded-md bg-primary px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90"
          >
            Trade
          </button>
          <IconBtn label="Fullscreen" onClick={onFullscreen}>
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
          <IconBtn label="Hide mini player" onClick={onDismiss}>
            <X className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>
    </div>,
    document.body,
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