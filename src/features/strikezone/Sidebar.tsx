import { Volume2, BookOpen, Info, Square } from "lucide-react";
import { BET_SIZE_OPTIONS } from "./hooks/useStrikezoneSession";
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
  // market group (e.g. the live match the user is currently on)
  groups: { market: SportsMarket; outcomes: OutcomeChoice[] }[];
  activeMarketId: string;
  activeOutcomeId: string;
  onPickMarket: (marketId: string) => void;
  onPickOutcome: (id: string) => void;
  // bet
  betSize: number;
  onBetSize: (n: number) => void;
  // stop
  onStop: () => void;
  onShowRules: () => void;
}

export function Sidebar({
  balance,
  sessionPL,
  openCount,
  groups,
  activeMarketId,
  activeOutcomeId,
  onPickMarket,
  onPickOutcome,
  betSize,
  onBetSize,
  onStop,
  onShowRules,
}: Props) {
  const activeGroup = groups.find((g) => g.market.id === activeMarketId) ?? groups[0];
  const plPositive = sessionPL >= 0;

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
        </div>
      </div>

      {/* MARKET picker */}
      <div className="sz-card p-3">
        {/* tier 1: match list as MATCH/STREAK tabs */}
        <div className="grid grid-cols-2 gap-2">
          {groups.slice(0, 2).map((g) => (
            <button
              key={g.market.id}
              onClick={() => onPickMarket(g.market.id)}
              className={`sz-chip sz-pixel py-2 text-[9px] ${
                g.market.id === activeMarketId ? "sz-chip-cyan-active" : ""
              }`}
              style={{
                color:
                  g.market.id === activeMarketId ? "var(--sz-cyan)" : "var(--sz-muted)",
              }}
            >
              {g.market.fixture
                ? `${g.market.fixture.home.short}-${g.market.fixture.away.short}`
                : g.market.title.slice(0, 8)}
            </button>
          ))}
          {groups.length < 2 && (
            <div
              className="sz-chip sz-pixel flex items-center justify-center py-2 text-[9px] opacity-30"
              style={{ color: "var(--sz-muted)" }}
            >
              SOON
            </div>
          )}
        </div>

        {/* tier 2: outcome chips */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {activeGroup?.outcomes.map((o) => {
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