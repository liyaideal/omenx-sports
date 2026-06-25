import type { GameStats, Trophy } from "./hooks/useGameStats";
import { TROPHIES, xpForNext } from "./hooks/useGameStats";

interface Props {
  stats: GameStats;
  trophies?: (Trophy & { unlocked: boolean })[];
}

/** Y2K cartridge "player card" — Level, XP bar, streak flame, trophy row. */
export function PlayerHUD({ stats, trophies }: Props) {
  const ts = trophies ?? TROPHIES.map((t) => ({ ...t, unlocked: t.got(stats) }));
  const need = xpForNext(stats.level);
  const pct = Math.min(100, Math.round((stats.xp / need) * 100));
  const winRate = stats.wins + stats.losses > 0
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
    : 0;

  return (
    <div className="pp-card pp-card-cream relative p-3">
      {/* Top row: avatar + LV + streak */}
      <div className="flex items-center gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-md text-2xl"
          style={{
            background: "var(--pp-pink)",
            border: "3px solid #1a1a1a",
            boxShadow: "3px 3px 0 #1a1a1a",
          }}
        >
          🎮
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="pp-stencil text-[10px]" style={{ color: "#1a1a1a" }}>LV</span>
            <span className="pp-stencil text-xl" style={{ color: "#1a1a1a" }}>
              {String(stats.level).padStart(2, "0")}
            </span>
            {stats.streak >= 2 && (
              <span className="pp-streak ml-auto">
                <span>🔥</span>
                <span>×{stats.streak}</span>
              </span>
            )}
          </div>
          {/* XP bar */}
          <div className="pp-xp-track mt-1.5">
            <div className="pp-xp-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="pp-marker text-[8px]" style={{ color: "#1a1a1a" }}>
              XP {stats.xp}/{need}
            </span>
            <span className="pp-marker text-[8px]" style={{ color: "#5a5a5a" }}>
              WIN {winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Mini-stats row */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
        <Stat label="W" value={stats.wins} color="var(--pp-green-2)" />
        <Stat label="L" value={stats.losses} color="var(--pp-red)" />
        <Stat label="BEST" value={`${stats.bestMult.toFixed(1)}×`} color="var(--pp-yellow)" />
      </div>

      {/* Trophy row */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {ts.map((t) => (
          <span
            key={t.id}
            className={`pp-trophy ${t.unlocked ? "unlocked" : ""}`}
            title={`${t.label}${t.unlocked ? " ✓" : " — locked"}`}
          >
            {t.icon}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div
      className="pp-lcd flex flex-col items-center justify-center px-1 py-1.5"
      style={{ minHeight: 42 }}
    >
      <span className="pp-marker text-[8px]" style={{ color: "rgba(155,255,111,0.7)" }}>{label}</span>
      <span className="pp-num text-base leading-none" style={{ color }}>{value}</span>
    </div>
  );
}