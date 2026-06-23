import { useCallback, useEffect, useState } from "react";

/**
 * Tracks which Guess-the-Legend rounds the current user has already
 * watched the reveal sequence for. Backed by localStorage so the
 * cinematic only auto-plays the first time a user lands on the tab
 * after a round flips to revealed. Manual replays do NOT clear the flag.
 */
const STORAGE_KEY = "legend.revealSeen.v1";

function readSeen(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, true>) : {};
  } catch {
    return {};
  }
}

function writeSeen(map: Record<string, true>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors */
  }
}

export function useLegendRevealQueue(revealedRoundIds: string[]) {
  // Hydrate on mount only — keeps SSR markup deterministic.
  const [seen, setSeen] = useState<Record<string, true>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSeen(readSeen());
    setHydrated(true);
  }, []);

  const queue = hydrated
    ? revealedRoundIds.filter((id) => !seen[id])
    : [];

  const markSeen = useCallback((roundId: string) => {
    setSeen((prev) => {
      if (prev[roundId]) return prev;
      const next = { ...prev, [roundId]: true as const };
      writeSeen(next);
      return next;
    });
  }, []);

  const skipAll = useCallback(() => {
    setSeen((prev) => {
      const next = { ...prev };
      for (const id of revealedRoundIds) next[id] = true;
      writeSeen(next);
      return next;
    });
  }, [revealedRoundIds]);

  const resetSeen = useCallback(() => {
    setSeen({});
    writeSeen({});
  }, []);

  return { queue, markSeen, skipAll, resetSeen, hydrated };
}