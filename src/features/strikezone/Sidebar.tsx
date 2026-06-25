import { Volume2, BookOpen, Info, Square, Zap } from "lucide-react";
import { BET_SIZE_OPTIONS, LEVERAGE_OPTIONS } from "./hooks/useStrikezoneSession";
import type { SportsMarket, Outcome } from "@/data/sports-markets";

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
}: Props) {
  const plPositive = sessionPL >= 0;
  const highRisk = leverage >= 3;
  const eventLabel = activeEvent.fixture
    ? `${activeEvent.fixture.home.short} VS ${activeEvent.fixture.away.short}`
    : activeEvent.title.toUpperCase();
  const notional = betSize * leverage;
  const liqDist = (4.5 / Math.max(1, leverage)).toFixed(2);
  const levCopy =
    leverage === 1
      ? "NO LEVERAGE · SAFE"
      : leverage === 2
        ? "2× PAYOUT · CROSS RISK"
        : "⚠ 3× PAYOUT · HIGH CROSS RISK";
  // unused now that cross-margin replaced per-position liq lines
  void liqDist;
  void notional;

  // Margin-health bar: 1 when equity == initialBalance (or above), 0 at maintenance.
  const denom = Math.max(1, initialBalance - 0);
  const health = lockedStake > 0
    ? Math.max(0, Math.min(1, (equity - maintenance) / Math.max(1, denom - maintenance)))
    : 1;
  const healthColor = health > 0.6 ? "var(--sz-green)" : health > 0.3 ? "#ffcc4d" : "var(--sz-red)";
  const healthLabel = health > 0.6 ? "HEALTHY" : health > 0.3 ? "WARN" : "DANGER";

  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-4 p-4">
      {/* BALANCE / SESSION card */}
      <div className="sz-card p-4">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{
              background: "var(--sz-cyan)",
              boxShadow: "0 0 8px var(--sz-cyan)",
            }}
          />
          <span
            className="sz-pixel text-[10px]"
            style={{ color: "var(--sz-cyan)" }}
          >
            BALANCE
          </span>
        </div>
        <div
          className="sz-display sz-glow-green mt-2 text-4xl"
          style={{ color: "var(--sz-green)" }}
        >
          ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>

        <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--sz-cyan-dim)" }}>
          <div className="flex items-center justify-between">
            <span
              className="sz-pixel text-[10px]"
              style={{ color: "var(--sz-cyan)" }}
            >
              SESSION
            </span>
            <span
              className="sz-pixel text-[9px]"
              style={{ color: "var(--sz-muted)" }}
            >
              {openCount} OPEN
            </span>
          </div>
          <div
            className="sz-display mt-1 text-2xl"
            style={{
              color: plPositive ? "var(--sz-green)" : "var(--sz-red)",
              textShadow: plPositive
                ? "0 0 8px rgba(0,255,157,0.6)"
                : "0 0 8px rgba(255,45,74,0.6)",
            }}
          >
            {plPositive ? "+" : "−"}${Math.abs(sessionPL).toFixed(0)}
          </div>

        {/* MARGIN HEALTH (cross-margin) */}
        <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--sz-cyan-dim)" }}>
          <div className="flex items-center justify-between">
            <span className="sz-pixel text-[10px]" style={{ color: "var(--sz-cyan)" }}>
              MARGIN
            </span>
            <span
              className="sz-pixel text-[9px]"
              style={{ color: healthColor, textShadow: `0 0 6px ${healthColor}` }}
            >
              {healthLabel}
            </span>
          </div>
          <div
            className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--sz-cyan-dim)" }}
          >
            <div
              className={health <= 0.3 ? "animate-pulse" : ""}
              style={{
                width: `${health * 100}%`,
                height: "100%",
                background: healthColor,
                boxShadow: `0 0 8px ${healthColor}`,
                transition: "width 200ms linear",
              }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between sz-pixel text-[8px]" style={{ color: "var(--sz-muted)" }}>
            <span>EQ ${equity.toFixed(0)}</span>
            <span>MAINT ${maintenance.toFixed(0)}</span>
          </div>
        </div>
        </div>
      </div>

      {/* MARKETS for active event */}
      <div className="sz-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="sz-pixel text-[10px]" style={{ color: "var(--sz-cyan)" }}>
            {eventLabel}
          </span>
          {activeEvent.liveClock && (
            <span className="sz-pixel text-[8px]" style={{ color: "var(--sz-muted)" }}>
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
                className={`sz-chip flex flex-col items-center justify-center gap-1 py-2.5 ${
                  isActive ? "sz-chip-cyan-active" : ""
                }`}
              >
                <span
                  className="sz-pixel text-[9px]"
                  style={{ color: isActive ? "var(--sz-cyan)" : "var(--sz-muted)" }}
                >
                  {o.outcome.label}
                </span>
                <span
                  className="sz-num text-[11px] tabular-nums"
                  style={{ color: isActive ? "#fff" : "var(--sz-muted)" }}
                >
                  {(o.outcome.price * 100).toFixed(0)}¢
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BET SIZE card */}
      <div className="sz-card sz-card-orange p-3">
        <div className="flex items-center justify-between">
          <span
            className="sz-pixel text-[10px]"
            style={{ color: "var(--sz-orange)" }}
          >
            BET SIZE
          </span>
          <span
            className="sz-pixel text-[8px]"
            style={{ color: "var(--sz-muted)" }}
          >
            A/D
          </span>
        </div>

        <div
          className="sz-display sz-glow-orange mt-2 rounded-md py-3 text-center text-3xl"
          style={{
            color: "var(--sz-orange-bright)",
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
              className={`sz-chip sz-pixel py-2 text-[9px] ${
                betSize === s ? "sz-chip-active" : ""
              }`}
              style={{
                color: betSize === s ? "var(--sz-orange-bright)" : "var(--sz-muted)",
              }}
            >
              ${s >= 1000 ? `${s / 1000}K` : s}
            </button>
          ))}
        </div>
      </div>

      {/* LEVERAGE card */}
      <div
        className="sz-card p-3"
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
          <span className="sz-pixel flex items-center gap-1 text-[10px]" style={{ color: highRisk ? "#ffcc4d" : "var(--sz-cyan)" }}>
            <Zap className="size-3" />
            LEVERAGE
          </span>
          <span className="sz-pixel text-[8px]" style={{ color: "var(--sz-muted)" }}>
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
                className={`sz-chip sz-pixel py-2 text-[10px] ${active ? "sz-chip-active" : ""}`}
                style={{
                  color: active ? "var(--sz-orange-bright)" : "var(--sz-muted)",
                }}
              >
                {l}×
              </button>
            );
          })}
        </div>
        <div
          className="sz-pixel mt-2 text-center text-[8px]"
          style={{ color: highRisk ? "#ffcc4d" : "var(--sz-muted)" }}
        >
          {levCopy}
        </div>
        <div
          className="sz-pixel mt-1 text-center text-[8px]"
          style={{ color: "var(--sz-muted)" }}
        >
          MARGIN ${betSize} · NOTIONAL ${notional}
        </div>
      </div>

      {/* STOP */}
      <button
        onClick={onStop}
        className="sz-stop sz-pixel flex items-center justify-center gap-2 py-4 text-sm"
        style={{ color: "#fff" }}
      >
        <Square className="size-4 fill-current" />
        STOP
      </button>

      {/* footer trio */}
      <div className="mt-auto grid grid-cols-3 gap-2">
        <button
          className="sz-chip sz-chip-cyan-active sz-pixel flex items-center justify-center gap-1 py-2 text-[9px]"
          style={{ color: "var(--sz-cyan)" }}
        >
          <Volume2 className="size-3" />
          ON
        </button>
        <button
          onClick={onShowRules}
          className="sz-chip sz-pixel flex items-center justify-center gap-1 py-2 text-[9px]"
          style={{ color: "var(--sz-muted)" }}
        >
          <BookOpen className="size-3" />
          RULES
        </button>
        <button
          className="sz-chip sz-pixel flex items-center justify-center py-2"
          style={{ color: "var(--sz-muted)" }}
        >
          <Info className="size-3.5" />
        </button>
      </div>
    </div>
  );
}