import { Square, Zap } from "lucide-react";
import { BET_SIZE_OPTIONS, LEVERAGE_OPTIONS } from "./hooks/usePinpointSession";
import type { SportsMarket, Outcome } from "@/data/sports-markets";
import { AccountBlock } from "./AccountBlock";
import { EventSelector } from "./EventSelector";
import type { GameStats, Trophy } from "./hooks/useGameStats";

export interface OutcomeChoice {
  market: SportsMarket;
  outcome: Outcome;
  id: string;
}

interface Props {
  // lifetime / account
  stats: GameStats;
  trophies?: (Trophy & { unlocked: boolean })[];
  balance: number;
  sessionPL: number;
  openCount: number;
  equity: number;
  maintenance: number;
  lockedStake: number;
  initialBalance: number;
  // events
  events: SportsMarket[];
  activeEventId: string;
  onPickEvent: (id: string) => void;
  openCountByEvent: Record<string, number>;
  // markets within active event
  outcomes: OutcomeChoice[];
  activeOutcomeId: string;
  onPickOutcome: (id: string) => void;
  // bet
  betSize: number;
  onBetSize: (n: number) => void;
  leverage: number;
  onLeverage: (n: number) => void;
  // stop
  onStop: () => void;
}

export function Sidebar({
  stats,
  trophies,
  balance,
  sessionPL,
  openCount,
  equity,
  maintenance,
  lockedStake,
  initialBalance,
  events,
  activeEventId,
  onPickEvent,
  openCountByEvent,
  outcomes,
  activeOutcomeId,
  onPickOutcome,
  betSize,
  onBetSize,
  leverage,
  onLeverage,
  onStop,
}: Props) {
  const highRisk = leverage >= 3;
  const notional = betSize * leverage;
  const riskLabel =
    leverage === 1 ? "SAFE · 1× PAYOUT" : leverage === 2 ? "CROSS · 2× PAYOUT" : "HIGH RISK · CROSS · 3× PAYOUT";

  return (
    <div className="flex w-[260px] shrink-0 flex-col gap-2 p-3">
      {/* ── ACCOUNT block (lifetime + this session) ─────────────── */}
      <AccountBlock
        stats={stats}
        trophies={trophies}
        balance={balance}
        sessionPL={sessionPL}
        openCount={openCount}
        equity={equity}
        maintenance={maintenance}
        lockedStake={lockedStake}
        initialBalance={initialBalance}
      />

      {/* ── PER-BET stack: Event → Market → Size → Leverage → Stop */}
      <EventSelector
        events={events}
        activeEventId={activeEventId}
        onPick={onPickEvent}
        openCountByEvent={openCountByEvent}
      />

      {/* MARKET — outcomes inside the active event */}
      <div className="pp-card p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="pp-stencil text-[10px]" style={{ color: "var(--pp-yellow)" }}>
            MARKET
          </span>
          <span className="pp-stencil text-[8px]" style={{ color: "var(--pp-mute)" }}>
            PICK OUTCOME
          </span>
        </div>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${outcomes.length}, minmax(0,1fr))` }}
        >
          {outcomes.map((o) => {
            const isActive = o.id === activeOutcomeId;
            return (
              <button
                key={o.id}
                onClick={() => onPickOutcome(o.id)}
                className={`pp-chip flex flex-col items-center justify-center gap-0.5 py-1.5 ${
                  isActive ? "pp-chip-active-yellow" : ""
                }`}
              >
                <span
                  className="pp-stencil text-[9px]"
                  style={{ color: isActive ? "var(--pp-yellow)" : "var(--pp-mute)" }}
                >
                  {o.outcome.label}
                </span>
                <span
                  className="pp-num text-[10px] tabular-nums"
                  style={{ color: isActive ? "#fff" : "var(--pp-mute)" }}
                >
                  {(o.outcome.price * 100).toFixed(0)}¢
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BET SIZE card */}
      <div className="pp-card pp-card-orange p-2.5">
        <div className="flex items-center justify-between">
          <span className="pp-stencil text-[10px]" style={{ color: "var(--pp-red)" }}>
            BET SIZE
          </span>
          <span className="pp-headline text-sm" style={{ color: "var(--pp-yellow)" }}>
            ${betSize >= 1000 ? `${betSize / 1000}K` : betSize}
            <span className="pp-stencil ml-2 text-[8px]" style={{ color: "var(--pp-mute)" }}>A/D</span>
          </span>
        </div>

        <div className="mt-1.5 grid grid-cols-3 gap-1">
          {BET_SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onBetSize(s)}
              className={`pp-chip pp-stencil py-1.5 text-[9px] ${
                betSize === s ? "pp-chip-active" : ""
              }`}
              style={{
                color: betSize === s ? "var(--pp-yellow)" : "var(--pp-mute)",
              }}
            >
              ${s >= 1000 ? `${s / 1000}K` : s}
            </button>
          ))}
        </div>
      </div>

      {/* LEVERAGE card — 4 clean rows so labels never overlap */}
      <div
        className="pp-card p-2.5"
        style={
          highRisk
            ? {
                borderColor: "rgba(255,180,30,0.7)",
                boxShadow:
                  "inset 0 0 24px rgba(255,180,30,0.06), 0 0 18px rgba(255,180,30,0.18)",
              }
            : undefined
        }
      >
        {/* Row 1 — title + current value */}
        <div className="flex items-center justify-between">
          <span
            className="pp-stencil flex items-center gap-1 text-[10px]"
            style={{ color: highRisk ? "#ffcc4d" : "var(--pp-yellow)" }}
          >
            <Zap className="size-3" />
            LEVERAGE
          </span>
          <span
            className="pp-headline text-sm"
            style={{ color: highRisk ? "#ffcc4d" : "var(--pp-yellow)" }}
          >
            {leverage}×
          </span>
        </div>

        {/* Row 2 — chip selector */}
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          {LEVERAGE_OPTIONS.map((l) => {
            const active = leverage === l;
            return (
              <button
                key={l}
                onClick={() => onLeverage(l)}
                className={`pp-chip pp-stencil py-1.5 text-[10px] ${active ? "pp-chip-active" : ""}`}
                style={{ color: active ? "var(--pp-yellow)" : "var(--pp-mute)" }}
              >
                {l}×
              </button>
            );
          })}
        </div>

        {/* Row 3 — margin / notional readout */}
        <div
          className="pp-stencil mt-1.5 flex items-baseline justify-between text-[8px]"
          style={{ color: "var(--pp-mute)" }}
        >
          <span>
            MARGIN <span style={{ color: "var(--pp-yellow)" }}>${betSize}</span>
          </span>
          <span>
            NOTIONAL <span style={{ color: "var(--pp-yellow)" }}>${notional}</span>
          </span>
        </div>

        {/* Row 4 — caption */}
        <div
          className="pp-stencil mt-1 flex items-baseline justify-between text-[8px]"
          style={{ color: highRisk ? "#ffcc4d" : "var(--pp-mute)" }}
        >
          <span>{riskLabel}</span>
          <span style={{ color: "var(--pp-mute)" }}>Q/E</span>
        </div>
      </div>

      {/* STOP */}
      <button
        onClick={onStop}
        className="pp-stop pp-stencil flex items-center justify-center gap-2 py-2.5 text-xs"
        style={{ color: "#fff" }}
      >
        <Square className="size-3.5 fill-current" />
        STOP
      </button>
    </div>
  );
}