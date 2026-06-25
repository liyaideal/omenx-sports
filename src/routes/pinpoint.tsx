import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ArrowLeft, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { MATCH_MARKETS } from "@/data/sports-markets";
import {
  usePinpointSession,
  computeEquity,
  INITIAL_BALANCE,
} from "@/features/pinpoint/hooks/usePinpointSession";
import { useLiveTicker } from "@/features/pinpoint/hooks/useLiveTicker";
import { Sidebar, type OutcomeChoice } from "@/features/pinpoint/Sidebar";
import { Grid } from "@/features/pinpoint/Grid";
import { EventTabs } from "@/features/pinpoint/EventTabs";
import "@/features/pinpoint/pp-theme.css";

export const Route = createFileRoute("/pinpoint")({
  head: () => ({
    meta: [
      { title: "Pinpoint — OmenX" },
      {
        name: "description",
        content:
          "Bettle-style price × time grid betting on live sports markets. Click a cell, win the multiplier when the price hits it.",
      },
      { property: "og:title", content: "Pinpoint — OmenX" },
      {
        property: "og:description",
        content: "Price × time grid betting on live sports markets.",
      },
    ],
  }),
  component: PinpointPage,
});

function PinpointPage() {
  const liveMarkets = useMemo(
    () => MATCH_MARKETS.filter((m) => m.isLiveStream && m.liveScore),
    []
  );

  // Each live market is one EVENT; its outcomes are the markets you trade.
  const groups = useMemo(() => {
    return liveMarkets.map((m) => ({
      market: m,
      outcomes: m.outcomes.map((o) => ({
        market: m,
        outcome: o,
        id: `${m.id}::${o.id}`,
      })) as OutcomeChoice[],
    }));
  }, [liveMarkets]);

  const [activeEventId, setActiveEventId] = useState(groups[0]?.market.id ?? "");
  const [activeOutcomeId, setActiveOutcomeId] = useState(
    groups[0]?.outcomes[0]?.id ?? ""
  );

  const handlePickEvent = (eid: string) => {
    setActiveEventId(eid);
    const g = groups.find((x) => x.market.id === eid);
    if (g) setActiveOutcomeId(g.outcomes[0].id);
  };

  if (groups.length === 0) return <EmptyState />;

  return (
    <PinpointInner
      groups={groups}
      activeEventId={activeEventId}
      activeOutcomeId={activeOutcomeId}
      onPickEvent={handlePickEvent}
      onPickOutcome={setActiveOutcomeId}
    />
  );
}

function PinpointInner({
  groups,
  activeEventId,
  activeOutcomeId,
  onPickEvent,
  onPickOutcome,
}: {
  groups: ReturnType<typeof usePinpointGroups>;
  activeEventId: string;
  activeOutcomeId: string;
  onPickEvent: (id: string) => void;
  onPickOutcome: (id: string) => void;
}) {
  const activeGroup = groups.find((g) => g.market.id === activeEventId) ?? groups[0];
  const activeChoice =
    activeGroup.outcomes.find((o) => o.id === activeOutcomeId) ?? activeGroup.outcomes[0];

  const seedPrice = activeChoice.outcome.price * 100;
  const { price, history, tickSec } = useLiveTicker(activeChoice.id, seedPrice);
  const {
    state,
    placeBet,
    settlePosition,
    undoLast,
    stopAll,
    cancelPosition,
    liquidateAll,
    reset,
    setBetSize,
    cycleBetSize,
    setLeverage,
    cycleLeverage,
    lastBetExpiryRef,
    lastBetIdRef,
  } = usePinpointSession();

  const [recentHits, setRecentHits] = useState<{ id: string; at: number }[]>([]);
  const [recentLiqs, setRecentLiqs] = useState<{ id: string; at: number }[]>([]);
  const [showStop, setShowStop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showLiquidated, setShowLiquidated] = useState<{
    liquidatedCount: number;
    lossAmount: number;
  } | null>(null);
  const liqArmedRef = useRef(false);

  // Settlement on tick
  const priceRef = useRef(price);
  priceRef.current = price;
  useEffect(() => {
    const t = Date.now();
    const settled: { id: string; at: number; won: boolean; payout: number }[] = [];
    for (const p of state.positions) {
      if (p.status !== "open") continue;
      if (p.targetAt <= t) {
        const hit =
          priceRef.current >= p.cellCenter - 0.5 && priceRef.current < p.cellCenter + 0.5;
        settlePosition(p.id, hit ? "won" : "lost", priceRef.current);
        const lev = p.leverage ?? 1;
        settled.push({
          id: p.id,
          at: t,
          won: hit,
          payout: hit ? p.stake * p.mult * lev : 0,
        });
      }
    }
    const wins = settled.filter((s) => s.won);
    if (wins.length) {
      setRecentHits((h) => [...wins.map((w) => ({ id: w.id, at: w.at })), ...h].slice(0, 20));
      const big = Math.max(...wins.map((w) => w.payout));
      toast.success(`HIT! +$${big.toFixed(0)}`, { duration: 2000 });
      setTimeout(() => {
        setRecentHits((h) => h.filter((x) => !wins.some((w) => w.id === x.id)));
      }, 1200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickSec]);

  const handlePlace = useCallback(
    (cellCenter: number, distanceCents: number, secondsAhead: number, mult: number) => {
      if (state.balance < state.betSize) {
        toast.error("Insufficient balance");
        return;
      }
      placeBet({
        marketId: activeChoice.market.id,
        outcomeId: activeChoice.outcome.id,
        marketLabel: activeChoice.market.fixture
          ? `${activeChoice.market.fixture.home.short} vs ${activeChoice.market.fixture.away.short}`
          : activeChoice.market.title,
        outcomeLabel: activeChoice.outcome.label,
        targetAt: Date.now() + secondsAhead * 1000,
        cellCenter,
        secondsAhead,
        distanceCents,
        stake: state.betSize,
        mult,
        leverage: state.leverage,
      });
    },
    [activeChoice, state.balance, state.betSize, state.leverage, placeBet]
  );

  const handleUndo = useCallback(() => {
    const ok = undoLast();
    if (ok) toast.success("Bet refunded");
  }, [undoLast]);

  const confirmStop = () => {
    stopAll();
    setShowStop(false);
    toast.success("All open bets refunded");
  };

  // Hotkeys
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
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
        case "q":
          e.preventDefault();
          cycleLeverage(-1);
          break;
        case "e":
          e.preventDefault();
          cycleLeverage(1);
          break;
        case "z":
          e.preventDefault();
          handleUndo();
          break;
        case "escape":
          e.preventDefault();
          if (showStop) setShowStop(false);
          else if (showRules) setShowRules(false);
          else setShowStop(true);
          break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cycleBetSize, cycleLeverage, handleUndo, showStop, showRules]);

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

  const openPositions = state.positions.filter(
    (p) =>
      p.status === "open" &&
      p.marketId === activeChoice.market.id &&
      p.outcomeId === activeChoice.outcome.id
  );
  const openCount = state.positions.filter((p) => p.status === "open").length;
  const openCountByEvent = useMemo(() => {
    const out: Record<string, number> = {};
    for (const p of state.positions) {
      if (p.status !== "open") continue;
      out[p.marketId] = (out[p.marketId] ?? 0) + 1;
    }
    return out;
  }, [state.positions]);
  const priceChange = price - activeChoice.outcome.price * 100;

  // ── Cross-margin equity & maintenance ─────────────────────────────────
  // Simplification: mark every open position against the active outcome's
  // live price (multi-event mark-to-market is a follow-up).
  const priceByOutcome = useMemo(
    () => ({ [activeChoice.outcome.id]: price }),
    [activeChoice.outcome.id, price]
  );
  const { equity, lockedStake, maintenance } = computeEquity(state, priceByOutcome);

  // Cross-margin liquidation trigger (debounced 2 frames via ref).
  useEffect(() => {
    if (lockedStake <= 0) {
      liqArmedRef.current = false;
      return;
    }
    const breach = equity <= maintenance;
    if (!breach) {
      liqArmedRef.current = false;
      return;
    }
    if (!liqArmedRef.current) {
      liqArmedRef.current = true;
      return; // require 2 consecutive ticks
    }
    // Trigger account-wide liquidation.
    const { liquidatedIds } = liquidateAll(priceByOutcome);
    if (liquidatedIds.length > 0) {
      const at = Date.now();
      setRecentLiqs((h) => [...liquidatedIds.map((id) => ({ id, at })), ...h].slice(0, 40));
      const lossAmount = state.positions
        .filter((p) => p.status === "open" && liquidatedIds.includes(p.id))
        .reduce((s, p) => s + p.stake, 0);
      setShowLiquidated({
        liquidatedCount: liquidatedIds.length,
        lossAmount,
      });
      setTimeout(() => {
        setRecentLiqs((h) => h.filter((x) => !liquidatedIds.includes(x.id)));
      }, 1400);
    }
    liqArmedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickSec]);

  return (
    <div className="pp-root relative min-h-screen w-full overflow-hidden">
      <div className="pp-stars" />

      {/* Topbar */}
      <header className="relative z-10 flex h-14 items-center gap-4 px-4">
        <Link
          to="/"
          className="pp-stencil flex items-center gap-2 rounded px-2 py-1.5 text-[10px] hover:opacity-80"
          style={{ color: "var(--pp-yellow)" }}
        >
          <ArrowLeft className="size-3.5" />
          BACK
        </Link>
        <div className="ml-2 flex items-center gap-2">
          <Zap className="size-5" style={{ color: "var(--pp-green)" }} />
          <span
            className="pp-headline pp-stamp-green text-xl"
            style={{ color: "var(--pp-green)" }}
          >
            PINPOINT
          </span>
          <span
            className="pp-stencil rounded px-1.5 py-0.5 text-[8px]"
            style={{
              color: "var(--pp-red)",
              border: "1px solid var(--pp-red)",
            }}
          >
            BETA
          </span>
        </div>

        {undoMsLeft > 0 && (
          <button
            onClick={handleUndo}
            className="pp-stencil ml-auto rounded px-3 py-1.5 text-[9px]"
            style={{
              color: "var(--pp-yellow)",
              border: "1px solid var(--pp-red)",
              background: "rgba(255,107,26,0.1)",
            }}
          >
            UNDO {(undoMsLeft / 1000).toFixed(1)}S [Z]
          </button>
        )}
      </header>

      {/* Event tabs */}
      <EventTabs
        events={groups.map((g) => g.market)}
        activeEventId={activeEventId}
        onPick={onPickEvent}
        openCountByEvent={openCountByEvent}
      />

      <div className="relative z-10 flex gap-2 px-2 pb-4">
        {/* Sidebar */}
        <Sidebar
          balance={state.balance}
          sessionPL={state.sessionPL}
          openCount={openCount}
          activeEvent={activeGroup.market}
          outcomes={activeGroup.outcomes}
          activeOutcomeId={activeOutcomeId}
          onPickOutcome={onPickOutcome}
          betSize={state.betSize}
          onBetSize={setBetSize}
          leverage={state.leverage}
          onLeverage={setLeverage}
          onStop={() => setShowStop(true)}
          onShowRules={() => setShowRules(true)}
          equity={equity}
          maintenance={maintenance}
          lockedStake={lockedStake}
          initialBalance={INITIAL_BALANCE}
        />

        {/* Main */}
        <main className="flex flex-1 flex-col gap-3 p-2">
          {/* Match header — small line above grid */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="size-2 animate-pulse rounded-full"
                style={{
                  background: "var(--pp-red)",
                  boxShadow: "2px 2px 0 #000",
                }}
              />
              <span
                className="pp-stencil text-[10px]"
                style={{ color: "var(--pp-red)" }}
              >
                LIVE {activeChoice.market.liveClock}
              </span>
              <span
                className="pp-headline text-sm"
                style={{ color: "var(--pp-yellow)" }}
              >
                {activeChoice.market.fixture
                  ? `${activeChoice.market.fixture.home.name.toUpperCase()} VS ${activeChoice.market.fixture.away.name.toUpperCase()}`
                  : activeChoice.market.title.toUpperCase()}
              </span>
              <span
                className="pp-num text-xs tabular-nums"
                style={{ color: "var(--pp-mute)" }}
              >
                {activeChoice.market.liveScore?.home}–
                {activeChoice.market.liveScore?.away}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="pp-stencil text-[9px]"
                style={{ color: "var(--pp-mute)" }}
              >
                {activeChoice.outcome.label} TO WIN
              </span>
              <span
                className="pp-headline pp-stamp-red text-2xl"
                style={{ color: "var(--pp-yellow)" }}
              >
                {price.toFixed(1)}¢
              </span>
              <span
                className="pp-num text-xs tabular-nums"
                style={{
                  color:
                    priceChange >= 0 ? "var(--pp-green)" : "var(--pp-red)",
                }}
              >
                {priceChange >= 0 ? "▲" : "▼"}
                {Math.abs(priceChange).toFixed(2)}¢
              </span>
            </div>
          </div>

          {/* Grid */}
          <Grid
            currentPrice={price}
            history={history}
            positions={openPositions}
            betSize={state.betSize}
            leverage={state.leverage}
            onPlace={handlePlace}
            onCancel={cancelPosition}
            recentHits={recentHits}
            recentLiquidations={recentLiqs}
          />

          {/* Help line */}
          <div className="flex items-center justify-between">
            <span
              className="pp-stencil text-[8px]"
              style={{ color: "var(--pp-mute)" }}
            >
              CLICK A CELL · A/D BET SIZE · Q/E LEVERAGE · Z UNDO · ESC STOP
            </span>
            <span
              className="pp-stencil text-[8px]"
              style={{ color: "var(--pp-mute)" }}
            >
              MULT × LEV CAPPED AT 999x
            </span>
          </div>
        </main>
      </div>

      {/* STOP confirm */}
      {showStop && (
        <ModalShell onClose={() => setShowStop(false)}>
          <div className="pp-card p-5" style={{ borderColor: "var(--pp-red)" }}>
            <div className="pp-stencil mb-3 text-xs" style={{ color: "var(--pp-red)" }}>
              STOP ALL BETS?
            </div>
            <p className="text-xs" style={{ color: "#aaa" }}>
              All open positions will be cancelled and stakes refunded immediately.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowStop(false)}
                className="pp-chip pp-stencil flex-1 py-3 text-[10px]"
                style={{ color: "var(--pp-yellow)" }}
              >
                KEEP PLAYING
              </button>
              <button
                onClick={confirmStop}
                className="pp-stop pp-stencil flex-1 py-3 text-[10px]"
                style={{ color: "#fff" }}
              >
                STOP
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* LIQUIDATED — cross-margin wipe */}
      {showLiquidated && (
        <ModalShell onClose={() => setShowLiquidated(null)}>
          <div
            className="pp-card p-6 text-center"
            style={{
              borderColor: "var(--pp-red)",
              boxShadow: "var(--pp-sticker-shadow-red)",
            }}
          >
            <div
              className="pp-headline text-3xl"
              style={{
                color: "var(--pp-red)",
                textShadow: "3px 3px 0 #000",
              }}
            >
              LIQUIDATED
            </div>
            <p className="pp-stencil mt-2 text-[10px]" style={{ color: "#ffcc4d" }}>
              ACCOUNT EQUITY FELL BELOW MAINTENANCE
            </p>
            <p className="mt-4 text-xs" style={{ color: "#bbb" }}>
              {showLiquidated.liquidatedCount} OPEN POSITION
              {showLiquidated.liquidatedCount === 1 ? "" : "S"} FORCE-CLOSED.
              <br />
              MARGIN LOST:{" "}
              <span style={{ color: "var(--pp-red)" }}>
                −${showLiquidated.lossAmount.toFixed(0)}
              </span>
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowLiquidated(null)}
                className="pp-chip pp-stencil flex-1 py-3 text-[10px]"
                style={{ color: "var(--pp-yellow)" }}
              >
                CONTINUE (${state.balance.toFixed(0)})
              </button>
              <button
                onClick={() => {
                  reset();
                  setShowLiquidated(null);
                }}
                className="pp-stop pp-stencil flex-1 py-3 text-[10px]"
                style={{ color: "#fff" }}
              >
                RESET ACCOUNT
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* RULES modal */}
      {showRules && (
        <ModalShell onClose={() => setShowRules(false)}>
          <div className="pp-card max-w-md p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="pp-stencil text-xs" style={{ color: "var(--pp-yellow)" }}>
                HOW TO PLAY
              </span>
              <button onClick={() => setShowRules(false)}>
                <X className="size-4" style={{ color: "var(--pp-mute)" }} />
              </button>
            </div>
            <ol className="space-y-2 text-[11px]" style={{ color: "#bbb" }}>
              <li>
                <span className="pp-stencil mr-2 text-[9px]" style={{ color: "var(--pp-red)" }}>
                  01
                </span>
                Pick an outcome on the left. Its YES price (¢) is your moving target.
              </li>
              <li>
                <span className="pp-stencil mr-2 text-[9px]" style={{ color: "var(--pp-red)" }}>
                  02
                </span>
                Each grid cell is a bet that the price will land in that 1¢ range exactly N seconds from now.
              </li>
              <li>
                <span className="pp-stencil mr-2 text-[9px]" style={{ color: "var(--pp-red)" }}>
                  03
                </span>
                Click a cell to bet your BET SIZE. Win = stake × multiplier. Miss = lose stake. Caps at 95.00x.
              </li>
              <li>
                <span className="pp-stencil mr-2 text-[9px]" style={{ color: "var(--pp-red)" }}>
                  04
                </span>
                A/D switch bet size, Z undoes the last bet within 5s, Esc opens STOP.
              </li>
            </ol>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="pp-root relative flex min-h-screen items-center justify-center px-4">
      <div className="pp-stars" />
      <div className="relative max-w-md text-center">
        <Zap className="mx-auto size-12" style={{ color: "var(--pp-green)" }} />
        <h1
          className="pp-headline pp-stamp-green mt-4 text-3xl"
          style={{ color: "var(--pp-green)" }}
        >
          PINPOINT
        </h1>
        <p className="pp-stencil mt-4 text-[10px] leading-loose" style={{ color: "var(--pp-yellow)" }}>
          GRIDS OPEN ONLY DURING LIVE MATCHES.
          <br />
          NOTHING IN PLAY RIGHT NOW.
        </p>
        <Link
          to="/"
          className="pp-stencil mt-6 inline-flex items-center gap-2 rounded px-4 py-2 text-[10px]"
          style={{ color: "var(--pp-yellow)", border: "1px solid var(--pp-card-border)" }}
        >
          <ArrowLeft className="size-3" />
          BACK
        </Link>
      </div>
    </div>
  );
}

// helper type alias
type GroupedMarkets = {
  market: import("@/data/sports-markets").SportsMarket;
  outcomes: OutcomeChoice[];
}[];
function usePinpointGroups(): GroupedMarkets {
  return [] as GroupedMarkets;
}