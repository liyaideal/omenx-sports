import { useEffect, useRef, useState } from "react";
import { on } from "./effects/effectsBus";

/**
 * Corner streak pill: 🔥 N. Bumps on every increment, flashes at thresholds,
 * shows a STREAK LOST microtag on break. Never blocks input.
 */
export function StreakPill({ streak }: { streak: number }) {
  const prevRef = useRef<number>(streak);
  const [bump, setBump] = useState<number>(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [lost, setLost] = useState<boolean>(false);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = streak;
    if (streak > prev) {
      setBump((b) => b + 1);
      if ([3, 5, 10, 20].includes(streak)) setFlash(streak);
    }
    // External break event (covers liquidation breakStreak).
    if (prev > 0 && streak === 0) {
      setLost(true);
      const t = setTimeout(() => setLost(false), 800);
      return () => clearTimeout(t);
    }
  }, [streak]);

  useEffect(() => {
    if (flash == null) return;
    const t = setTimeout(() => setFlash(null), 1100);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    return on("streakBreak", () => {
      setLost(true);
      setTimeout(() => setLost(false), 800);
    });
  }, []);

  if (streak <= 0 && !lost) return null;

  const size = Math.min(24, 14 + streak * 0.5);
  return (
    <div
      className="pp-streak-pill"
      data-bump={bump}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {lost ? (
        <div className="pp-streak-lost">STREAK LOST</div>
      ) : (
        <div
          className={`pp-streak-body ${flash ? "pp-streak-flash" : ""}`}
          key={bump}
        >
          <span className="pp-streak-flame" style={{ fontSize: size }}>
            🔥
          </span>
          <span className="pp-streak-num">{streak}</span>
        </div>
      )}
      {flash != null && (
        <div className="pp-streak-tag">{flash} WIN STREAK</div>
      )}
    </div>
  );
}
