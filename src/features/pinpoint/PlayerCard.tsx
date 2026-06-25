import type { GameStats, Trophy } from "./hooks/useGameStats";
import { TROPHIES, xpForNext } from "./hooks/useGameStats";
import "./pp-player-card.css";

interface Props {
  stats: GameStats;
  trophies?: (Trophy & { unlocked: boolean })[];
}

/**
 * Top-right arcade Member ID plate — laminated plastic / pressed-metal
 * vibe, not a dashboard card. Career-scope data only (LV, XP, W/L/Best,
 * trophies). Per-session money lives in the left sidebar.
 */
export function PlayerCard({ stats, trophies }: Props) {
  const ts = trophies ?? TROPHIES.map((t) => ({ ...t, unlocked: t.got(stats) }));
  const need = xpForNext(stats.level);
  const pct = Math.min(100, Math.round((stats.xp / need) * 100));

  return (
    <div className="pp-player-card" title="Lifetime player record">
      {/* Avatar tile */}
      <div className="pp-pc-avatar" aria-hidden>P1</div>

      {/* LV + XP bar */}
      <div className="pp-pc-mid">
        <div className="flex items-baseline gap-1.5">
          <span className="pp-stencil text-[8px]" style={{ color: "var(--pp-yellow-2)" }}>LV</span>
          <span className="pp-stencil text-[14px]" style={{ color: "var(--pp-yellow)" }}>
            {String(stats.level).padStart(2, "0")}
          </span>
        </div>
        <div className="pp-pc-xp-track">
          <div className="pp-pc-xp-fill" style={{ width: `${pct}%` }} />
        </div>
        <span
          className="pp-marker mt-0.5 text-[7px]"
          style={{ color: "rgba(244,236,216,0.55)" }}
        >
          XP {stats.xp}/{need}
        </span>
      </div>

      {/* W / L / Best + trophies */}
      <div className="pp-pc-right">
        <div className="pp-pc-stats">
          <span className="pp-pc-stat">
            <span className="pp-pc-stat-label">W</span>
            <span style={{ color: "var(--pp-green-2)" }}>{stats.wins}</span>
          </span>
          <span className="pp-pc-stat">
            <span className="pp-pc-stat-label">L</span>
            <span style={{ color: "var(--pp-red)" }}>{stats.losses}</span>
          </span>
          <span className="pp-pc-stat">
            <span className="pp-pc-stat-label">BEST</span>
            <span style={{ color: "var(--pp-yellow)" }}>{stats.bestMult.toFixed(1)}×</span>
          </span>
        </div>
        <div className="pp-pc-trophies" aria-label="Trophies">
          {ts.map((t) => (
            <span
              key={t.id}
              className={`pp-pc-trophy ${t.unlocked ? "unlocked" : ""}`}
              title={`${t.label}${t.unlocked ? " ✓" : " — locked"}`}
            >
              {t.icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}