import type { PinpointState } from "../hooks/usePinpointSession";

const KEY = "omenx.pinpoint.v1";

export function loadState(): Partial<PinpointState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<PinpointState>) : null;
  } catch {
    return null;
  }
}

export function saveState(state: PinpointState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}