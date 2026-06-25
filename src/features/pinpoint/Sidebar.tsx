import { Volume2, VolumeX, BookOpen, Info, Square, Zap } from "lucide-react";
import { BET_SIZE_OPTIONS, LEVERAGE_OPTIONS } from "./hooks/usePinpointSession";
import type { SportsMarket, Outcome } from "@/data/sports-markets";
import { PlayerHUD } from "./PlayerHUD";
import type { GameStats, Trophy } from "./hooks/useGameStats";

export interface OutcomeChoice {
  market: SportsMarket;
  outcome: Outcome;
  id: string;
}

interface Props {
  balance: number;
  sessionPL: number;
  openCount: number;
  /** Active event (single match). Outcomes are its markets. */
  activeEvent: SportsMarket;
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
  onShowRules: () => void;
  // cross-margin live metrics
  equity: number;
  maintenance: number;
  lockedStake: number;
  initialBalance: number;
  // arcade HUD
  stats: GameStats;
  trophies: (Trophy & { unlocked: boolean })[];
  muted: boolean;
  onToggleMute: () => void;
}

export function Sidebar({
  balance,
  sessionPL,
  openCount,
  activeEvent,
  outcomes,
  activeOutcomeId,
  onPickOutcome,
  betSize,
  onBetSize,
  leverage,
  onLeverage,
  onStop,
  onShowRules,
  equity,
  maintenance,
  lockedStake,
  initialBalance,
  stats,
  trophies,
  muted,
  onToggleMute,
}: Props) {
  const plPositive = sessionPL >= 0;
  const highRisk = leverage >= 3;
  const eventLabel = activeEvent.fixture
    ? `${activeEvent.fixture.home.short} VS ${activeEvent.fixture.away.short}`
    : activeEvent.title.toUpperCase();
  const notional = betSize * leverage;
  const levCopy =
    leverage === 1
      ? "NO LEVERAGE · SAFE"
      : leverage === 2
        ? "2× PAYOUT · CROSS RISK"
        : "⚠ 3× PAYOUT · HIGH CROSS RISK";

  // Margin-health bar: 1 when equity == initialBalance (or above), 0 at maintenance.
  const denom = Math.max(1, initialBalance - 0);
  const health = lockedStake > 0
    ? Math.max(0, Math.min(1, (equity - maintenance) / Math.max(1, denom - maintenance)))
    : 1;
  const healthColor = health > 0.6 ? "var(--pp-green)" : health > 0.3 ? "#ffcc4d" : "var(--pp-red)";
  const healthLabel = health > 0.6 ? "HEALTHY" : health > 0.3 ? "WARN" : "DANGER";

  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-4 p-4">
      {/* PLAYER HUD — Lv / XP / Streak / Trophies */}
      <PlayerHUD stats={stats} trophies={trophies} />

      {/* BALANCE / SESSION card */}
      <div className="pp-card p-4">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{
              background: "var(--pp-yellow)",
              boxShadow: "2px 2px 0 #000",
            }}
          />
          <span
            className="pp-stencil text-[10px]"
            style={{ color: "var(--pp-yellow)" }}
          >
            BALANCE
          </span>
        </div>
        <div
          className="pp-headline pp-stamp-green mt-2 text-4xl"
          style={{ color: "var(--pp-green)" }}
        >
          ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>

        <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--pp-card-border)" }}>
          <div className="flex items-center justify-between">
            <span
              className="pp-stencil text-[10px]"
              style={{ color: "var(--pp-yellow)" }}
            >
              SESSION
            </span>
            <span
              className="pp-stencil text-[9px]"
              style={{ color: "var(--pp-mute)" }}
            >
              {openCount} OPEN
            </span>
          </div>
          <div
            className="pp-headline mt-1 text-2xl"
            style={{
              color: plPositive ? "var(--pp-green)" : "var(--pp-red)",
              textShadow: "2px 2px 0 #000",
            }}
          >
            {plPositive ? "+" : "−"}${Math.abs(sessionPL).toFixed(0)}
          </div>

        {/* MARGIN HEALTH (cross-margin) */}
        <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--pp-card-border)" }}>
          <div className="flex items-center justify-between">
            <span className="pp-stencil text-[10px]" style={{ color: "var(--pp-yellow)" }}>
              MARGIN
            </span>
            <span
              className="pp-stencil text-[9px]"
              style={{ color: healthColor, textShadow: "1px 1px 0 #000" }}
            >
              {healthLabel}
            </span>
          </div>
          <div
            className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--pp-card-border)" }}
          >
            <div
              className={health <= 0.3 ? "animate-pulse" : ""}
              style={{
                width: `${health * 100}%`,
                height: "100%",
                background: healthColor,
                boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.35)",
                transition: "width 200ms linear",
              }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between pp-stencil text-[8px]" style={{ color: "var(--pp-mute)" }}>
            <span>EQ ${equity.toFixed(0)}</span>
            <span>MAINT ${maintenance.toFixed(0)}</span>
          </div>
        </div>
        </div>
      </div>

      {/* MARKETS for active event */}
      <div className="pp-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="pp-stencil text-[10px]" style={{ color: "var(--pp-yellow)" }}>
            {eventLabel}
          </span>
          {activeEvent.liveClock && (
            <span className="pp-stencil text-[8px]" style={{ color: "var(--pp-mute)" }}>
              {activeEvent.liveClock}
            </span>
          )}
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
                className={`pp-chip flex flex-col items-center justify-center gap-1 py-2.5 ${
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
      <div className="pp-card pp-card-orange p-3">
        <div className="flex items-center justify-between">
          <span
            className="pp-stencil text-[10px]"
            style={{ color: "var(--pp-red)" }}
          >
            BET SIZE
          </span>
          <span
            className="pp-stencil text-[8px]"
            style={{ color: "var(--pp-mute)" }}
          >
            A/D
          </span>
        </div>

        <div
          className="pp-headline pp-stamp-red mt-2 rounded-md py-3 text-center text-3xl"
          style={{
            color: "var(--pp-yellow)",
            background: "rgba(0,0,0,0.4)",
            border: "1.5px solid rgba(255,107,26,0.4)",
          }}
        >
          {betSize >= 1000 ? `${betSize / 1000}K` : betSize}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {BET_SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onBetSize(s)}
              className={`pp-chip pp-stencil py-2 text-[9px] ${
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

      {/* LEVERAGE card */}
      <div
        className="pp-card p-3"
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
        <div className="flex items-center justify-between">
          <span className="pp-stencil flex items-center gap-1 text-[10px]" style={{ color: highRisk ? "#ffcc4d" : "var(--pp-yellow)" }}>
            <Zap className="size-3" />
            LEVERAGE
          </span>
          <span className="pp-stencil text-[8px]" style={{ color: "var(--pp-mute)" }}>
            Q/E
          </span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {LEVERAGE_OPTIONS.map((l) => {
            const active = leverage === l;
            return (
              <button
                key={l}
                onClick={() => onLeverage(l)}
                className={`pp-chip pp-stencil py-2 text-[10px] ${active ? "pp-chip-active" : ""}`}
                style={{
                  color: active ? "var(--pp-yellow)" : "var(--pp-mute)",
                }}
              >
                {l}×
              </button>
            );
          })}
        </div>
        <div
          className="pp-stencil mt-2 text-center text-[8px]"
          style={{ color: highRisk ? "#ffcc4d" : "var(--pp-mute)" }}
        >
          {levCopy}
        </div>
        <div
          className="pp-stencil mt-1 text-center text-[8px]"
          style={{ color: "var(--pp-mute)" }}
        >
          MARGIN ${betSize} · NOTIONAL ${notional}
        </div>
      </div>

      {/* STOP */}
      <button
        onClick={onStop}
        className="pp-stop pp-stencil flex items-center justify-center gap-2 py-4 text-sm"
        style={{ color: "#fff" }}
      >
        <Square className="size-4 fill-current" />
        STOP
      </button>

      {/* footer trio */}
      <div className="mt-auto grid grid-cols-3 gap-2">
        <button
          onClick={onToggleMute}
          className={`pp-chip pp-stencil flex items-center justify-center gap-1 py-2 text-[9px] ${
            muted ? "" : "pp-chip-active-yellow"
          }`}
          style={{ color: muted ? "var(--pp-mute)" : "var(--pp-yellow)" }}
          title={muted ? "Sound off — click to enable 8-bit FX" : "Sound on"}
        >
          {muted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
          {muted ? "OFF" : "ON"}
        </button>
        <button
          onClick={onShowRules}
          className="pp-chip pp-stencil flex items-center justify-center gap-1 py-2 text-[9px]"
          style={{ color: "var(--pp-mute)" }}
        >
          <BookOpen className="size-3" />
          RULES
        </button>
        <button
          className="pp-chip pp-stencil flex items-center justify-center py-2"
          style={{ color: "var(--pp-mute)" }}
        >
          <Info className="size-3.5" />
        </button>
      </div>
    </div>
  );
}