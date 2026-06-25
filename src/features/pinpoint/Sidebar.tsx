import { Lock, Zap } from "lucide-react";
import { BET_SIZE_OPTIONS, LEVERAGE_OPTIONS } from "./hooks/usePinpointSession";
import { TRADING_FEE_RATE } from "./constants";
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
  // v3 session controls
  frozen: boolean;
  mmr: number;
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
  frozen,
  mmr,
}: Props) {
  const highRisk = leverage >= 3;
  const notional = betSize * leverage;
  const fee = Math.round(notional * TRADING_FEE_RATE * 100) / 100;
  const riskLabel =
    leverage === 1
      ? "1× · CONSERVATIVE"
      : leverage === 2
        ? "2× · CROSS MARGIN"
        : "3× · HIGH RISK CROSS";

  return (
    <div className="pp-sidebar-scroll flex min-h-0 w-[288px] shrink-0 flex-col gap-3 overflow-y-auto p-4">
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
      <div className="pp-card p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="pp-stencil text-[11px]" style={{ color: "var(--pp-yellow)" }}>
            MARKET
          </span>
          <span className="pp-stencil text-[9px]" style={{ color: "var(--pp-mute)" }}>
            PICK OUTCOME
          </span>
        </div>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${outcomes.length}, minmax(0,1fr))` }}
        >
          {outcomes.map((o) => {
            const isActive = o.id === activeOutcomeId;
            return (
              <button
                key={o.id}
                onClick={() => onPickOutcome(o.id)}
                className={`pp-chip flex flex-col items-center justify-center gap-0.5 py-2.5 ${
                  isActive ? "pp-chip-active-yellow" : ""
                }`}
              >
                <span
                  className="pp-stencil text-[11px]"
                  style={{ color: isActive ? "var(--pp-yellow)" : "var(--pp-mute)" }}
                >
                  {o.outcome.label}
                </span>
                <span
                  className="pp-num text-[11px] tabular-nums"
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
      <div className={`pp-card pp-card-orange p-3.5 ${frozen ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-center justify-between">
          <span className="pp-stencil text-[11px]" style={{ color: "var(--pp-red)" }}>
            BET SIZE
          </span>
          <span className="pp-headline text-base" style={{ color: "var(--pp-yellow)" }}>
            ${betSize >= 1000 ? `${betSize / 1000}K` : betSize}
            <span className="pp-stencil ml-2 text-[9px]" style={{ color: "var(--pp-mute)" }}>A/D</span>
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {BET_SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onBetSize(s)}
              disabled={frozen}
              className={`pp-chip pp-stencil py-2.5 text-[11px] ${
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

      {/* LEVERAGE card — 1–3× account-level, applies to new bets only. */}
      <div
        className={`pp-card p-3.5 ${frozen ? "opacity-50 pointer-events-none" : ""}`}
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
            className="pp-stencil flex items-center gap-1 text-[11px]"
            style={{ color: highRisk ? "#ffcc4d" : "var(--pp-yellow)" }}
          >
            <Zap className="size-3" />
            LEVERAGE
          </span>
          <span
            className="pp-headline text-base"
            style={{ color: highRisk ? "#ffcc4d" : "var(--pp-yellow)" }}
          >
            {leverage}×
          </span>
        </div>

        {/* Row 2 — chip selector */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {LEVERAGE_OPTIONS.map((l) => {
            const active = leverage === l;
            return (
              <button
                key={l}
                onClick={() => onLeverage(l)}
                disabled={frozen}
                className={`pp-chip pp-stencil py-2.5 text-[11px] ${active ? "pp-chip-active" : ""}`}
                style={{ color: active ? "var(--pp-yellow)" : "var(--pp-mute)" }}
              >
                {l}×
              </button>
            );
          })}
        </div>

        {/* Row 3 — three-number disclosure: margin / notional / fee */}
        <div
          className="pp-stencil mt-2.5 flex items-baseline justify-between text-[10px]"
          style={{ color: "var(--pp-mute)" }}
        >
          <span>
            MARGIN <span style={{ color: "var(--pp-yellow)" }}>${betSize}</span>
          </span>
          <span>
            NOTIONAL <span style={{ color: "var(--pp-yellow)" }}>${notional}</span>
          </span>
          <span>
            FEE <span style={{ color: "var(--pp-yellow)" }}>${fee.toFixed(fee < 10 ? 2 : 0)}</span>
          </span>
        </div>

        {/* Row 4 — caption + "win amount depends on cell odds" hint */}
        <div
          className="pp-stencil mt-2 flex items-baseline justify-between text-[10px]"
          style={{ color: highRisk ? "#ffcc4d" : "var(--pp-mute)" }}
        >
          <span>{riskLabel}</span>
          <span style={{ color: "var(--pp-mute)" }}>NEW BETS ONLY</span>
        </div>
        <div
          className="pp-stencil mt-1 text-[9px]"
          style={{ color: "var(--pp-mute)" }}
        >
          WIN IF HIT = q × (1−p) · SHOWN PER CELL
        </div>
      </div>

      {/* v3: no STOP / active close. Frozen-session indicator instead. */}
      {frozen ? (
        <div
          className="pp-stencil flex items-center justify-center gap-2 py-3 text-sm"
          style={{
            color: "#fff",
            background: "var(--pp-red)",
            border: "2px solid #000",
            borderRadius: 4,
            boxShadow: "3px 3px 0 #000",
          }}
        >
          <Lock className="size-4" />
          SESSION FROZEN · MMR {(mmr * 100).toFixed(0)}%
        </div>
      ) : (
        <div
          className="pp-stencil flex items-center justify-center py-2 text-[9px]"
          style={{ color: "var(--pp-mute)" }}
          title="Bets resolve at judgement or via liquidation — no manual close."
        >
          NO MANUAL CLOSE · BETS RESOLVE AT JUDGEMENT
        </div>
      )}
    </div>
  );
}