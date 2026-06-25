import type { GameStats, Trophy } from "./hooks/useGameStats";
import { TROPHIES, xpForNext } from "./hooks/useGameStats";

/** Compact balance formatter — keeps the row inside ~240px even at 7+ digits. */
function formatBalance(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  return `$${Math.round(n).toLocaleString()}`;
}

interface Props {
  // identity / lifetime
  stats: GameStats;
  trophies?: (Trophy & { unlocked: boolean })[];
  // session / account
  balance: number;
  sessionPL: number;
  openCount: number;
  equity: number;
  maintenance: number;
  lockedStake: number;
  initialBalance: number;
  /** Opens the deposit sheet (main wallet → Pinpoint transfer). */
  onDeposit?: () => void;
}

/**
 * Top-of-sidebar ACCOUNT card. Two zones in one frame:
 *   1. identity strip  — avatar · LV · XP · W/L/Best · trophies (lifetime)
 *   2. balance strip   — BAL · SESSION · MARGIN bar             (this session)
 * Hairline divider between them so they read as one "higher-dimension" unit
 * sitting above the per-bet stack.
 */
export function AccountBlock({
  stats,
  trophies,
  balance,
  sessionPL,
  openCount,
  equity,
  maintenance,
  lockedStake,
  initialBalance,
  onDeposit,
}: Props) {
  const ts = trophies ?? TROPHIES.map((t) => ({ ...t, unlocked: t.got(stats) }));
  const need = xpForNext(stats.level);
  const pct = Math.min(100, Math.round((stats.xp / need) * 100));

  const plPositive = sessionPL >= 0;
  const denom = Math.max(1, initialBalance);
  const health =
    lockedStake > 0
      ? Math.max(0, Math.min(1, (equity - maintenance) / Math.max(1, denom - maintenance)))
      : 1;
  const healthColor =
    health > 0.6 ? "var(--pp-green)" : health > 0.3 ? "#ffcc4d" : "var(--pp-red)";
  const healthLabel = health > 0.6 ? "HEALTHY" : health > 0.3 ? "WARN" : "DANGER";

  return (
    <div
      className="pp-card p-3.5"
      title={`Equity $${equity.toFixed(0)} · Maintenance $${maintenance.toFixed(0)}`}
    >
      {/* ── Identity zone ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div
          className="flex size-10 shrink-0 items-center justify-center"
          style={{
            background: "var(--pp-yellow)",
            color: "#1a1a1a",
            border: "2px solid #000",
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 12,
            boxShadow:
              "inset 0 -3px 0 rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.35)",
          }}
        >
          P1
        </div>

        {/* LV + XP */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="pp-stencil text-[11px]" style={{ color: "var(--pp-yellow-2)" }}>
              LV{" "}
              <span style={{ color: "var(--pp-yellow)" }}>
                {String(stats.level).padStart(2, "0")}
              </span>
            </span>
            <span className="pp-marker text-[9px]" style={{ color: "rgba(244,236,216,0.55)" }}>
              XP {stats.xp}/{need}
            </span>
          </div>
          <div
            className="mt-1.5 h-[6px] w-full overflow-hidden"
            style={{ background: "#000", border: "1px solid rgba(255,204,0,0.4)" }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background:
                  "repeating-linear-gradient(90deg, var(--pp-yellow) 0 4px, rgba(0,0,0,0.25) 4px 5px)",
                transition: "width 320ms cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
          <div
            className="mt-1.5 flex items-baseline gap-3"
            style={{ fontFamily: '"Silkscreen", monospace', fontSize: 10, letterSpacing: "0.06em" }}
          >
            <span>
              <span style={{ color: "rgba(244,236,216,0.5)" }}>W </span>
              <span style={{ color: "var(--pp-green-2)" }}>{stats.wins}</span>
            </span>
            <span>
              <span style={{ color: "rgba(244,236,216,0.5)" }}>L </span>
              <span style={{ color: "var(--pp-red)" }}>{stats.losses}</span>
            </span>
            <span>
              <span style={{ color: "rgba(244,236,216,0.5)" }}>BEST </span>
              <span style={{ color: "var(--pp-yellow)" }}>{stats.bestMult.toFixed(1)}×</span>
            </span>
          </div>
        </div>
      </div>

      {/* Trophy row */}
      <div className="mt-2.5 flex items-center gap-1.5" aria-label="Trophies">
        {ts.map((t) => (
          <span
            key={t.id}
            title={`${t.label}${t.unlocked ? " ✓" : " — locked"}`}
            className="inline-flex size-5 items-center justify-center text-[12px] leading-none"
            style={{
              filter: t.unlocked ? "none" : "grayscale(1) opacity(0.35)",
              transition: "filter 200ms ease",
            }}
          >
            {t.icon}
          </span>
        ))}
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div
        className="my-3 h-px w-full"
        style={{ background: "var(--pp-card-border)", opacity: 0.5 }}
      />

      {/* ── Balance zone ─────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between">
        <span className="pp-stencil text-[11px]" style={{ color: "var(--pp-yellow)" }}>
          PINPOINT BAL
        </span>
        <div className="flex items-center gap-2">
          {onDeposit ? (
            <button
              onClick={onDeposit}
              className="pp-stencil px-1.5 py-0.5 text-[9px] leading-none"
              style={{
                color: "#000",
                background: "var(--pp-yellow)",
                border: "1.5px solid #000",
                borderRadius: 3,
                boxShadow: "1.5px 1.5px 0 #000",
              }}
              title="Transfer from OmenX main wallet"
            >
              + FUND
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <div
          className="pp-headline pp-stamp-green truncate text-2xl leading-none tabular-nums"
          style={{ color: "var(--pp-green)" }}
          title={`$${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        >
          {formatBalance(balance)}
        </div>
        <span
          className="pp-stencil shrink-0 text-[9px]"
          style={{ color: "var(--pp-mute)" }}
        >
          {openCount} OPEN
        </span>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="pp-stencil text-[9px]" style={{ color: "var(--pp-mute)" }}>
          SESSION P/L
        </span>
        <span
          className="pp-headline text-sm tabular-nums"
          style={{
            color: plPositive ? "var(--pp-green)" : "var(--pp-red)",
            textShadow: "1px 1px 0 #000",
          }}
        >
          {plPositive ? "+" : "−"}${Math.abs(sessionPL).toFixed(0)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="pp-stencil text-[11px]" style={{ color: "var(--pp-yellow)" }}>
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
    </div>
  );
}