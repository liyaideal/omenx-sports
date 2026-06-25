import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ArrowLeft, X, Zap, Volume2, VolumeX, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { MATCH_MARKETS } from "@/data/sports-markets";
import {
  usePinpointSession,
  computeEquity,
  MARGIN_HEALTH_ANCHOR,
} from "@/features/pinpoint/hooks/usePinpointSession";
import { LIQ_TRIGGER_MMR } from "@/features/pinpoint/constants";
import { useLiveTicker } from "@/features/pinpoint/hooks/useLiveTicker";
import { Sidebar, type OutcomeChoice } from "@/features/pinpoint/Sidebar";
import { Grid } from "@/features/pinpoint/Grid";
import { DepositSheet } from "@/features/pinpoint/DepositSheet";
import { useGameStats } from "@/features/pinpoint/hooks/useGameStats";
import {
  isMuted as soundsIsMuted,
  setMuted as soundsSetMuted,
  sndCoin,
  sndWinTier,
  sndLose,
  sndGameOver,
  sndClick,
  sndCombo,
  sndStreakLost,
} from "@/features/pinpoint/sounds";
import { EffectsLayer } from "@/features/pinpoint/effects/EffectsLayer";
import { StreakPill } from "@/features/pinpoint/StreakPill";
import { emit, tierFromRatio, tierBumpForStreak } from "@/features/pinpoint/effects/effectsBus";
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
    cancelPosition,
    liquidateAll,
    deposit,
    setBetSize,
    cycleBetSize,
    setLeverage,
    cycleLeverage,
  } = usePinpointSession();

  // Arcade HUD stats (XP, level, streak, trophies)
  const gameStats = useGameStats();
  // Sound mute state
  const [muted, setMutedState] = useState<boolean>(true);
  useEffect(() => {
    setMutedState(soundsIsMuted());
  }, []);
  const toggleMute = useCallback(() => {
    setMutedState((m) => { const next = !m; soundsSetMuted(next); if (!next) sndClick(); return next; });
  }, []);

  const [recentHits, setRecentHits] = useState<{ id: string; at: number }[]>([]);
  const [recentLiqs, setRecentLiqs] = useState<{ id: string; at: number }[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showLiquidated, setShowLiquidated] = useState<{
    liquidatedCount: number;
    lossAmount: number;
    mmrAtFreeze: number;
  } | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const liqArmedRef = useRef(false);

  // Settlement on tick
  const priceRef = useRef(price);
  priceRef.current = price;
  useEffect(() => {
    const t = Date.now();
    const settled: { id: string; at: number; won: boolean; payout: number }[] = [];
    let hadLoss = false;
    const wonDetails: { netWin: number; stake: number; lev: number }[] = [];
    const streakBefore = gameStats.stats.streak;
    for (const p of state.positions) {
      if (p.status !== "open") continue;
      if (p.targetAt <= t) {
        const hit =
          priceRef.current >= p.cellCenter - 0.5 && priceRef.current < p.cellCenter + 0.5;
        settlePosition(p.id, hit ? "won" : "lost", priceRef.current);
        const netWin = p.q * (1 - p.pEntry);
        const payout = hit ? p.stake + netWin : 0;
        gameStats.recordSettle({ won: hit, stake: p.stake, mult: p.odds, payout });
        if (hit) {
          wonDetails.push({ netWin, stake: p.stake, lev: p.leverage ?? 1 });
        } else {
          hadLoss = true;
          sndLose();
        }
        settled.push({
          id: p.id,
          at: t,
          won: hit,
          payout,
        });
      }
    }
    const wins = settled.filter((s) => s.won);
    if (wins.length) {
      setRecentHits((h) => [...wins.map((w) => ({ id: w.id, at: w.at })), ...h].slice(0, 20));
      // Aggregate audio: one tiered chord per tick (not N "dings").
      // Tier = best single ratio in the batch, bumped by current streak.
      let bestTier = tierFromRatio(0);
      let totalNet = 0;
      for (const w of wonDetails) {
        const ratio = w.netWin / Math.max(1, w.stake);
        const tier = tierFromRatio(ratio, w.lev);
        if (tierWeight(tier) > tierWeight(bestTier)) bestTier = tier;
        totalNet += w.netWin;
      }
      const lifted = tierBumpForStreak(bestTier, streakBefore + wins.length);
      sndWinTier(lifted);
      if (wins.length >= 2) {
        emit("combo", { count: wins.length, totalAmount: totalNet, tier: lifted });
        sndCombo(wins.length);
      }
      setTimeout(() => {
        setRecentHits((h) => h.filter((x) => !wins.some((w) => w.id === x.id)));
      }, 1200);
    }
    // Streak break feedback (lose without any win on same tick, when prior streak > 0).
    if (hadLoss && wins.length === 0 && streakBefore > 0) {
      emit("streakBreak", undefined);
      sndStreakLost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickSec]);

  const handlePlace = useCallback(
    (cellCenter: number, distanceCents: number, secondsAhead: number, _mult: number) => {
      if (state.sessionStatus === "frozen") {
        toast.error("Session frozen — liquidation in progress");
        return;
      }
      const result = placeBet({
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
        currentPrice: priceRef.current,
      });
      if (result.id) sndCoin();
      else if (result.reason === "balance") toast.error("Insufficient balance (margin + fee)");
      else if (result.reason === "frozen") toast.error("Session frozen");
      // duplicate → silent (one bet per cell, marker already visible)
    },
    [activeChoice, state.betSize, state.sessionStatus, placeBet]
  );

  const handleCancel = useCallback(
    (id: string) => {
      const r = cancelPosition(id);
      if (!r.ok) {
        if (r.reason === "locked") toast.error("Locked — too close to judgement");
        else if (r.reason === "frozen") toast.error("Session frozen");
      }
    },
    [cancelPosition]
  );

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
        case "escape":
          e.preventDefault();
          if (showRules) setShowRules(false);
          break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cycleBetSize, cycleLeverage, showRules]);

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
  const { equity, lockedStake, maintenance, mmr } = computeEquity(state, priceByOutcome);

  // Cross-margin liquidation trigger (debounced 2 frames via ref).
  useEffect(() => {
    if (lockedStake <= 0 || state.sessionStatus === "frozen") {
      liqArmedRef.current = false;
      return;
    }
    const breach = mmr >= LIQ_TRIGGER_MMR;
    if (!breach) {
      liqArmedRef.current = false;
      return;
    }
    if (!liqArmedRef.current) {
      liqArmedRef.current = true;
      return; // require 2 consecutive ticks
    }
    const mmrAtFreeze = mmr;
    const { liquidatedIds } = liquidateAll({ mmr: mmrAtFreeze });
    if (liquidatedIds.length > 0) {
      sndGameOver();
      gameStats.breakStreak();
      const at = Date.now();
      setRecentLiqs((h) => [...liquidatedIds.map((id) => ({ id, at })), ...h].slice(0, 40));
      const lossAmount = state.positions
        .filter((p) => p.status === "open" && liquidatedIds.includes(p.id))
        .reduce((s, p) => s + p.stake, 0);
      setShowLiquidated({
        liquidatedCount: liquidatedIds.length,
        lossAmount,
        mmrAtFreeze,
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
      <EffectsLayer />

      {/* Topbar */}
      <header className="relative z-10 flex h-14 items-center gap-4 px-4">
        <Link
          to="/"
          className="pp-stencil flex items-center gap-2 rounded px-2 py-1.5 text-[10px] hover:opacity-80"
          style={{ color: "var(--pp-ink)" }}
        >
          <ArrowLeft className="size-3.5" />
          BACK
        </Link>
        {/* PINPOINT sticker logo */}
        <div className="ml-2 flex items-center gap-2">
          <span
            className="pp-stencil px-3 py-1 text-2xl pp-tilt-l"
            style={{
              background: "var(--pp-yellow)",
              color: "#000",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              borderRadius: "4px",
            }}
          >
            PINPOINT
          </span>
          <span
            className="pp-marker text-sm pp-tilt-r"
            style={{ color: "var(--pp-red)" }}
          >
            beta
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {state.sessionStatus === "frozen" && (
            <span
              className="pp-stencil px-3 py-1.5 text-[10px]"
              style={{
                color: "#fff",
                background: "var(--pp-red)",
                border: "2px solid #000",
                borderRadius: "4px",
                boxShadow: "2px 2px 0 #000",
              }}
            >
              SESSION FROZEN
            </span>
          )}
          <button
            onClick={toggleMute}
            className={`pp-chip pp-stencil flex items-center gap-1 px-2.5 py-1.5 text-[9px] ${
              muted ? "" : "pp-chip-active-yellow"
            }`}
            style={{ color: muted ? "var(--pp-mute)" : "var(--pp-yellow)" }}
            title={muted ? "Sound off — click to enable 8-bit FX" : "Sound on"}
          >
            {muted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
            {muted ? "OFF" : "ON"}
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="pp-chip pp-stencil flex items-center gap-1 px-2.5 py-1.5 text-[9px]"
            style={{ color: "var(--pp-mute)" }}
            title="How to play"
          >
            <BookOpen className="size-3" />
            RULES
          </button>
        </div>
      </header>

      <div className="relative z-10 flex h-[calc(100vh-56px)] gap-3 px-3 pb-4">
        {/* Sidebar */}
        <Sidebar
          stats={gameStats.stats}
          trophies={gameStats.trophies}
          balance={state.balance}
          sessionPL={state.sessionPL}
          openCount={openCount}
          equity={equity}
          maintenance={maintenance}
          lockedStake={lockedStake}
          initialBalance={Math.max(state.balance + lockedStake, MARGIN_HEALTH_ANCHOR)}
          events={groups.map((g) => g.market)}
          activeEventId={activeEventId}
          onPickEvent={onPickEvent}
          openCountByEvent={openCountByEvent}
          outcomes={activeGroup.outcomes}
          activeOutcomeId={activeOutcomeId}
          onPickOutcome={onPickOutcome}
          betSize={state.betSize}
          onBetSize={setBetSize}
          leverage={state.leverage}
          onLeverage={setLeverage}
          frozen={state.sessionStatus === "frozen"}
          mmr={mmr}
          onDeposit={() => setShowDeposit(true)}
        />

        {/* Main */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-2">
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
          <div className="relative min-h-0 flex-1">
            <StreakPill streak={gameStats.stats.streak} />
            <Grid
            currentPrice={price}
            history={history}
            positions={openPositions}
            betSize={state.betSize}
            leverage={state.leverage}
            onPlace={handlePlace}
            onCancel={handleCancel}
            recentHits={recentHits}
            recentLiquidations={recentLiqs}
            frozen={state.sessionStatus === "frozen"}
            mmr={mmr}
            />
          </div>

          {/* Help line */}
          <div className="flex items-center justify-between">
            <span
              className="pp-stencil text-[8px]"
              style={{ color: "var(--pp-mute)" }}
            >
              CLICK CELL = BET · CLICK YOUR BET = CANCEL (LOCKS 1.5s BEFORE JUDGEMENT) · A/D SIZE · Q/E LEVERAGE
            </span>
            <span
              className="pp-stencil text-[8px]"
              style={{ color: "var(--pp-mute)" }}
            >
              ODDS CAPPED AT 100×
            </span>
          </div>
        </main>
      </div>

      {/* LEVEL UP flash banner */}
      {gameStats.levelUpFlash != null && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center">
          <div
            className="pp-card pp-card-cream pp-level-up px-8 py-4 text-center"
            style={{ boxShadow: "var(--pp-shadow-coin)" }}
          >
            <div className="pp-marker text-[10px]" style={{ color: "#1a1a1a" }}>LEVEL UP!</div>
            <div className="pp-headline mt-1 text-3xl" style={{ color: "var(--pp-red)" }}>
              LV {String(gameStats.levelUpFlash).padStart(2, "0")}
            </div>
          </div>
        </div>
      )}

      {/* STOP-ALL removed (v3 spec: no active closing — bets resolve at judgement or are liquidated). */}

      {/* LIQUIDATED — cross-margin wipe */}
      {showLiquidated && (
        <ModalShell onClose={() => setShowLiquidated(null)}>
          <div
            className="pp-card pp-lcd overflow-hidden p-0 text-center"
            style={{
              borderColor: "var(--pp-red)",
              boxShadow: "var(--pp-sticker-shadow-red)",
            }}
          >
            <div className="pp-hazard-stripes-red" />
            <div className="px-6 py-8">
              <div
                className="pp-headline pp-flicker text-4xl"
                style={{
                  color: "var(--pp-red)",
                  textShadow: "3px 3px 0 #000, 0 0 12px rgba(255,59,59,0.6)",
                }}
              >
                SESSION<br />FROZEN
              </div>
              <p className="pp-marker mt-4 text-[10px]" style={{ color: "var(--pp-yellow)" }}>
                MMR {(showLiquidated.mmrAtFreeze * 100).toFixed(0)}% · CROSS-MARGIN WIPE
              </p>
              <div className="pp-lcd mx-auto mt-5 inline-block px-4 py-2 text-left">
                <p className="pp-num text-base" style={{ color: "var(--pp-green-2)" }}>
                  POSITIONS .... {String(showLiquidated.liquidatedCount).padStart(2, "0")}
                </p>
                <p className="pp-num text-base" style={{ color: "var(--pp-red)" }}>
                  MARGIN LOST . −${showLiquidated.lossAmount.toFixed(0)}
                </p>
                <p className="pp-num text-base" style={{ color: "var(--pp-yellow)" }}>
                  PINPOINT BAL ${state.balance.toFixed(0)}
                </p>
              </div>
              <p
                className="pp-stencil mt-5 text-[9px] leading-relaxed"
                style={{ color: "var(--pp-mute)" }}
              >
                YOUR MAIN OMENX WALLET WAS NOT TOUCHED.<br />
                FUND PINPOINT TO KEEP PLAYING.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => { sndClick(); setShowLiquidated(null); }}
                  className="pp-chip pp-stencil flex-1 py-3 text-[10px]"
                  style={{ color: "var(--pp-mute)" }}
                >
                  CLOSE
                </button>
                <button
                  onClick={() => { sndClick(); setShowLiquidated(null); setShowDeposit(true); }}
                  className="pp-btn pp-btn-mint flex-1 py-3 text-[10px]"
                >
                  DEPOSIT
                </button>
              </div>
            </div>
            <div className="pp-hazard-stripes-red" />
          </div>
        </ModalShell>
      )}

      {/* DEPOSIT — main wallet → Pinpoint sub-account transfer */}
      <DepositSheet
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        pinpointBalance={state.balance}
        onDeposit={(amount) => deposit(amount)}
      />

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
                Pick an outcome on the left. The YES price (¢) is the line you're chasing.
              </li>
              <li>
                <span className="pp-stencil mr-2 text-[9px]" style={{ color: "var(--pp-red)" }}>
                  02
                </span>
                Each cell is a digital option: "YES, price lands in this 1¢ band N seconds from now". The AMM quotes a probability p and locks odds = 1/p the moment you click.
              </li>
              <li>
                <span className="pp-stencil mr-2 text-[9px]" style={{ color: "var(--pp-red)" }}>
                  03
                </span>
                Margin = stake × leverage (notional). Win = q × (1−p) on top of your margin. Miss = lose stake. Odds cap 100×, leverage 1–3×.
              </li>
              <li>
                <span className="pp-stencil mr-2 text-[9px]" style={{ color: "var(--pp-red)" }}>
                  04
                </span>
                Click your own bet to cancel & refund the margin (locks 1.5s before judgement; fee is not refunded). No active close — bets resolve at judgement or get liquidated if account MMR ≥ 100%.
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
  return null as never;
}
function _unused() {
  return null;
}
// helper: tier ordering for "highest in batch"
const TIER_ORDER = { S: 0, M: 1, L: 2, XL: 3 } as const;
function tierWeight(t: "S" | "M" | "L" | "XL"): number { return TIER_ORDER[t]; }
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