import { useCallback, useEffect, useRef, useState } from "react";
import { sndLevelUp, sndStreak } from "../sounds";

/** Persisted stats — XP, streak, longest streak, totals. localStorage-backed. */
const KEY = "omenx.pinpoint.stats.v1";

export interface GameStats {
  xp: number;
  level: number;
  streak: number;       // current consecutive wins
  longest: number;      // longest streak ever
  wins: number;
  losses: number;
  bestMult: number;     // best multiplier ever hit
  bestPayout: number;   // best single payout
}

const DEFAULT: GameStats = {
  xp: 0, level: 1, streak: 0, longest: 0,
  wins: 0, losses: 0, bestMult: 0, bestPayout: 0,
};

/** XP needed to reach the *next* level — generous early, slower later. */
export function xpForNext(level: number): number {
  return 100 + (level - 1) * 60;
}

/** Trophy catalog — id → { icon, label, predicate(stats) }. */
export interface Trophy { id: string; icon: string; label: string; got: (s: GameStats) => boolean; }
export const TROPHIES: Trophy[] = [
  { id: "first-win", icon: "🥇", label: "First Win",    got: (s) => s.wins >= 1 },
  { id: "streak-3",  icon: "🔥", label: "3-Win Streak", got: (s) => s.longest >= 3 },
  { id: "streak-10", icon: "⚡", label: "10 Streak",     got: (s) => s.longest >= 10 },
  { id: "big-mult",  icon: "💎", label: "10× Hit",      got: (s) => s.bestMult >= 10 },
  { id: "huge-mult", icon: "👑", label: "50× Hit",      got: (s) => s.bestMult >= 50 },
  { id: "level-5",   icon: "⭐", label: "Level 5",       got: (s) => s.level >= 5 },
];

function loadStats(): GameStats {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { return DEFAULT; }
}
function saveStats(s: GameStats) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

/**
 * Hook for arcade-style stats.
 * `onLevelUp` fires a transient level-up banner toggle in the consumer.
 */
export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [levelUpFlash, setLevelUpFlash] = useState<number | null>(null);
  const lastSeen = useRef<Set<string>>(new Set());

  useEffect(() => { setStats(loadStats()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveStats(stats); }, [stats, hydrated]);

  /** Record a settled bet — pass `payout` (gross, includes stake) and `stake`/`mult` for stats. */
  const recordSettle = useCallback((args: {
    won: boolean;
    stake: number;
    mult: number;
    payout: number; // gross
  }) => {
    setStats((s) => {
      const xpGain = args.won ? 12 + Math.round(Math.min(40, args.mult)) : 3;
      let xp = s.xp + xpGain;
      let level = s.level;
      while (xp >= xpForNext(level)) {
        xp -= xpForNext(level);
        level += 1;
      }
      const leveled = level > s.level;
      const streak = args.won ? s.streak + 1 : 0;
      const longest = Math.max(s.longest, streak);
      const bestMult = args.won ? Math.max(s.bestMult, args.mult) : s.bestMult;
      const bestPayout = args.won ? Math.max(s.bestPayout, args.payout) : s.bestPayout;
      if (leveled) { sndLevelUp(); setTimeout(() => setLevelUpFlash(null), 1700); setLevelUpFlash(level); }
      if (args.won && streak >= 3 && streak > s.streak) sndStreak();
      return {
        xp,
        level,
        streak,
        longest,
        wins: s.wins + (args.won ? 1 : 0),
        losses: s.losses + (args.won ? 0 : 1),
        bestMult,
        bestPayout,
      };
    });
  }, []);

  /** Break the streak without recording win/loss (e.g. on liquidation wipe). */
  const breakStreak = useCallback(() => {
    setStats((s) => ({ ...s, streak: 0 }));
  }, []);

  /** List of trophies the user has unlocked + the next locked one. */
  const trophies = TROPHIES.map((t) => {
    const unlocked = t.got(stats);
    const isNew = unlocked && !lastSeen.current.has(t.id);
    if (unlocked) lastSeen.current.add(t.id);
    return { ...t, unlocked, isNew };
  });

  return { stats, trophies, recordSettle, breakStreak, levelUpFlash };
}