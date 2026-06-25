import type { StrikezoneState } from "../hooks/useStrikezoneSession";

const KEY = "omenx.strikezone.v1";

export function loadState(): Partial<StrikezoneState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<StrikezoneState>) : null;
  } catch {
    return null;
  }
}

export function saveState(state: StrikezoneState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}