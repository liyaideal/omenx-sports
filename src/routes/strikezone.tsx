import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ArrowLeft, Info, OctagonAlert, Undo2, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MATCH_MARKETS } from "@/data/sports-markets";
import { useStrikezoneSession } from "@/features/strikezone/hooks/useStrikezoneSession";
import { useLiveTicker } from "@/features/strikezone/hooks/useLiveTicker";
import { MarketSidebar, type SidebarItem } from "@/features/strikezone/MarketSidebar";
import { PriceChart } from "@/features/strikezone/PriceChart";
import { Grid } from "@/features/strikezone/Grid";
import { BetSizeBar } from "@/features/strikezone/BetSizeBar";
import { PositionsPanel } from "@/features/strikezone/PositionsPanel";

export const Route = createFileRoute("/strikezone")({
  head: () => ({
    meta: [
      { title: "Strikezone — OmenX" },
      {
        name: "description",
        content:
          "Bettle-style price × time grid betting on live sports markets. Click a cell, win the multiplier when the price crosses it.",
      },
      { property: "og:title", content: "Strikezone — OmenX" },
      {
        property: "og:description",
        content: "Price × time grid betting on live sports markets.",
      },
    ],
  }),
  component: StrikezonePage,
});

function StrikezonePage() {
  // Live matches (must be in-play)
  const liveMarkets = useMemo(
    () => MATCH_MARKETS.filter((m) => m.isLiveStream && m.liveScore),
    []
  );

  // Build sidebar items: one row per (market × outcome)
  const sidebarItems: SidebarItem[] = useMemo(() => {
    const items: SidebarItem[] = [];
    for (const m of liveMarkets) {
      for (const o of m.outcomes) {
        items.push({ market: m, outcome: o, id: `${m.id}::${o.id}` });
      }
    }
    return items;
  }, [liveMarkets]);

  const [activeId, setActiveId] = useState(sidebarItems[0]?.id ?? "");
  const active = sidebarItems.find((it) => it.id === activeId);

  if (sidebarItems.length === 0 || !active) {
    return <EmptyState />;
  }

  return <StrikezoneInner sidebarItems={sidebarItems} activeId={activeId} setActiveId={setActiveId} />;
}

function StrikezoneInner({
  sidebarItems,
  activeId,
  setActiveId,
}: {
  sidebarItems: SidebarItem[];
  activeId: string;
  setActiveId: (id: string) => void;
}) {
  const active = sidebarItems.find((it) => it.id === activeId)!;
  const seedPrice = active.outcome.price * 100;

  const { price, history, tickSec } = useLiveTicker(active.id, seedPrice);
  const {
    state,
    placeBet,
    settlePosition,
    undoLast,
    stopAll,
    setBetSize,
    cycleBetSize,
    lastBetExpiryRef,
    lastBetIdRef,
  } = useStrikezoneSession();

  const [recentHits, setRecentHits] = useState<{ id: string; at: number }[]>([]);
  const [now, setNow] = useState(Date.now());
  const [showStop, setShowStop] = useState(false);

  // Per-second now refresh (positions panel countdowns)
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  // Settlement loop — run after each tick (price changes)
  const priceRef = useRef(price);
  priceRef.current = price;
  useEffect(() => {
    const t = Date.now();
    const settled: { id: string; at: number; won: boolean }[] = [];
    for (const p of state.positions) {
      if (p.status !== "open") continue;
      if (p.targetAt <= t) {
        const hit =
          priceRef.current >= p.cellCenter - 0.5 && priceRef.current < p.cellCenter + 0.5;
        settlePosition(p.id, hit ? "won" : "lost", priceRef.current);
        settled.push({ id: p.id, at: t, won: hit });
      }
    }
    if (settled.length) {
      const wins = settled.filter((s) => s.won);
      if (wins.length) {
        setRecentHits((h) => [...wins.map((w) => ({ id: w.id, at: w.at })), ...h].slice(0, 20));
        const winningP = state.positions.find((p) => p.id === wins[0].id);
        if (winningP)
          toast.success(`HIT! +$${(winningP.stake * winningP.mult - winningP.stake).toFixed(0)}`, {
            duration: 2000,
          });
        setTimeout(() => {
          setRecentHits((h) =>
            h.filter((x) => !wins.some((w) => w.id === x.id))
          );
        }, 800);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickSec]);

  // Place a bet on a grid cell
  const handlePlace = useCallback(
    (cellCenter: number, distanceCents: number, secondsAhead: number, mult: number) => {
      if (state.balance < state.betSize) {
        toast.error("Insufficient balance");
        return;
      }
      placeBet({
        marketId: active.market.id,
        outcomeId: active.outcome.id,
        marketLabel: active.market.fixture
          ? `${active.market.fixture.home.short} vs ${active.market.fixture.away.short}`
          : active.market.title,
        outcomeLabel: active.outcome.label,
        targetAt: Date.now() + secondsAhead * 1000,
        cellCenter,
        secondsAhead,
        distanceCents,
        stake: state.betSize,
        mult,
      });
    },
    [active, state.balance, state.betSize, placeBet]
  );

  const handleUndo = useCallback(() => {
    const ok = undoLast();
    toast[ok ? "success" : "error"](ok ? "Bet undone — refunded" : "Nothing to undo");
  }, [undoLast]);

  const handleStop = () => setShowStop(true);
  const confirmStop = () => {
    stopAll();
    setShowStop(false);
    toast.success("All open bets cancelled & refunded");
  };

  // Hotkeys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case "a":
        case "arrowleft":
          e.preventDefault();
          cycleBetSize(-1);
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          cycleBetSize(1);
          break;
        case "z":
          e.preventDefault();
          handleUndo();
          break;
        case "escape":
          e.preventDefault();
          if (showStop) setShowStop(false);
          else handleStop();
          break;
        case "1":
          setBetSize(10);
          break;
        case "2":
          setBetSize(100);
          break;
        case "5":
          setBetSize(500);
          break;
        case "0":
          setBetSize(1000);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cycleBetSize, setBetSize, handleUndo, showStop]);

  // Live prices per sidebar item (so other markets show a live-ish number too — for v1 use static)
  const livePrices = useMemo(() => {
    const map: Record<string, number> = {};
    for (const it of sidebarItems) map[it.id] = it.outcome.price * 100;
    map[active.id] = price;
    return map;
  }, [sidebarItems, active.id, price]);

  const openCountPerItem = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of state.positions) {
      if (p.status !== "open") continue;
      const k = `${p.marketId}::${p.outcomeId}`;
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [state.positions]);

  // Undo countdown
  const [undoMsLeft, setUndoMsLeft] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!lastBetIdRef.current) return setUndoMsLeft(0);
      const ms = lastBetExpiryRef.current - Date.now();
      setUndoMsLeft(Math.max(0, ms));
      if (ms <= 0) lastBetIdRef.current = null;
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPositionsForMarket = state.positions.filter(
    (p) =>
      p.status === "open" &&
      p.marketId === active.market.id &&
      p.outcomeId === active.outcome.id
  );

  const allPositions = state.positions;

  const priceChange = price - active.outcome.price * 100;

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-950 text-zinc-100">
      {/* Topbar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-emerald-400" />
          <span
            className="font-bold tracking-[0.25em] text-emerald-300"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            STRIKEZONE
          </span>
          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-300">
            BETA
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4 font-mono text-xs tabular-nums">
          <div className="text-zinc-400">
            BAL{" "}
            <span className="text-zinc-100">${state.balance.toFixed(0).toLocaleString()}</span>
          </div>
          <div
            className={cn(
              "rounded px-2 py-0.5",
              state.sessionPL > 0 && "bg-emerald-400/15 text-emerald-300",
              state.sessionPL < 0 && "bg-rose-500/15 text-rose-300",
              state.sessionPL === 0 && "text-zinc-500"
            )}
          >
            P/L {state.sessionPL >= 0 ? "+" : ""}${state.sessionPL.toFixed(0)}
          </div>
          <button
            onClick={() =>
              toast.info(
                "Click a grid cell to bet $X that the price will be in that cell's range at T+Ns. Win = bet × multiplier."
              )
            }
            className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
            aria-label="How it works"
          >
            <Info className="size-3.5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <aside className="hidden w-[260px] shrink-0 border-r border-zinc-800 md:flex md:flex-col">
          <div className="flex-1 overflow-hidden">
            <MarketSidebar
              items={sidebarItems}
              activeId={activeId}
              onPick={setActiveId}
              livePrices={livePrices}
              openCountPerItem={openCountPerItem}
            />
          </div>
          <div className="border-t border-zinc-800 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Positions
            </div>
            <div className="max-h-[200px]">
              <PositionsPanel positions={allPositions} now={now} />
            </div>
          </div>
          <div className="border-t border-zinc-800 p-3">
            <button
              onClick={handleStop}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-bold uppercase tracking-wider text-rose-300 hover:bg-rose-500/20"
            >
              <OctagonAlert className="size-3.5" />
              STOP · refund all
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile market picker */}
          <div className="border-b border-zinc-800 bg-zinc-950 p-2 md:hidden">
            <select
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100"
            >
              {sidebarItems.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.market.fixture
                    ? `${it.market.fixture.home.short}–${it.market.fixture.away.short}`
                    : it.market.title}
                  {" · "}
                  {it.outcome.label}
                </option>
              ))}
            </select>
          </div>

          {/* Market header */}
          <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-100">
                {active.market.fixture
                  ? `${active.market.fixture.home.name} vs ${active.market.fixture.away.name}`
                  : active.market.title}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block size-1.5 animate-pulse rounded-full bg-rose-500" />
                  LIVE {active.market.liveClock}
                </span>
                <span>·</span>
                <span>
                  {active.market.liveScore?.home}–{active.market.liveScore?.away}
                </span>
                <span>·</span>
                <span>
                  Outcome: <span className="text-zinc-300">{active.outcome.label}</span>
                </span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div
                className="font-mono text-2xl tabular-nums text-emerald-300"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {price.toFixed(1)}¢
              </div>
              <div
                className={cn(
                  "font-mono text-[10px] tabular-nums",
                  priceChange > 0 ? "text-emerald-400" : priceChange < 0 ? "text-rose-400" : "text-zinc-500"
                )}
              >
                {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}¢
              </div>
            </div>
          </div>

          {/* Price chart + grid */}
          <div className="flex-1 space-y-2 overflow-auto p-3">
            <PriceChart history={history} current={price} />
            <Grid
              currentPrice={price}
              tickSec={tickSec}
              positions={openPositionsForMarket}
              betSize={state.betSize}
              onPlace={handlePlace}
              recentHits={recentHits}
            />

            {/* BET SIZE + actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-800 bg-zinc-950 p-3">
              <BetSizeBar value={state.betSize} onChange={setBetSize} />
              <div className="flex items-center gap-2">
                {undoMsLeft > 0 && (
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1 rounded border border-amber-400/50 bg-amber-400/15 px-2.5 py-1 text-xs text-amber-200 hover:bg-amber-400/25"
                  >
                    <Undo2 className="size-3" />
                    Undo ({(undoMsLeft / 1000).toFixed(1)}s)
                  </button>
                )}
                <span className="hidden font-mono text-[10px] text-zinc-600 sm:inline">
                  hotkeys: A/D bet · Z undo · Esc stop
                </span>
              </div>
            </div>

            {/* Mobile positions */}
            <div className="md:hidden">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Positions
              </div>
              <PositionsPanel positions={allPositions} now={now} />
              <button
                onClick={handleStop}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-bold uppercase tracking-wider text-rose-300"
              >
                <OctagonAlert className="size-3.5" />
                STOP · refund all
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* STOP confirm */}
      {showStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-lg border border-rose-500/40 bg-zinc-950 p-5">
            <div className="mb-2 flex items-center gap-2 text-rose-300">
              <OctagonAlert className="size-5" />
              <span className="font-bold uppercase tracking-wider">Stop all bets?</span>
            </div>
            <p className="text-xs text-zinc-400">
              All open positions will be cancelled and stakes refunded immediately.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowStop(false)}
                className="flex-1 rounded border border-zinc-700 py-2 text-xs text-zinc-300 hover:bg-zinc-900"
              >
                Keep playing
              </button>
              <button
                onClick={confirmStop}
                className="flex-1 rounded bg-rose-500 py-2 text-xs font-bold text-white hover:bg-rose-600"
              >
                STOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md text-center">
        <Zap className="mx-auto size-10 text-emerald-400" />
        <h1
          className="mt-4 text-2xl font-bold tracking-[0.25em] text-emerald-300"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          STRIKEZONE
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Grids open only when a match is live. No matches in play right now — check back during a
          live fixture.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
        >
          <ArrowLeft className="size-3.5" />
          Back to events
        </Link>
      </div>
    </div>
  );
}