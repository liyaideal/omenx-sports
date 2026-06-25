/**
 * OmenX main-wallet bridge (mock).
 *
 * Pinpoint is a separate sub-account: users explicitly transfer "play money"
 * from their main OmenX wallet into Pinpoint. This isolates the high-volatility
 * grid game from the rest of the user's funds — a liquidation only wipes the
 * Pinpoint sub-account, never the main wallet.
 *
 * Real cash-in / cash-out lives in the main OmenX wallet app
 * (https://omenx.lovable.app/wallet); this module only models the *internal*
 * transfer between main wallet and the Pinpoint sub-account.
 *
 * Storage is keyed separately from `omenx.pinpoint.v1` so the two balances
 * never collide.
 */

import { useEffect, useState } from "react";

const WALLET_KEY = "omenx.wallet.v1";
/** Seed balance for first-time users so the demo wallet isn't empty. */
const SEED_WALLET_BALANCE = 5000;

export const OMENX_WALLET_URL = "https://omenx.lovable.app/wallet";

interface WalletState {
  balance: number;
}

function read(): WalletState {
  if (typeof window === "undefined") return { balance: SEED_WALLET_BALANCE };
  try {
    const raw = window.localStorage.getItem(WALLET_KEY);
    if (!raw) return { balance: SEED_WALLET_BALANCE };
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return { balance: Number.isFinite(parsed.balance) ? Number(parsed.balance) : SEED_WALLET_BALANCE };
  } catch {
    return { balance: SEED_WALLET_BALANCE };
  }
}

function write(s: WalletState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WALLET_KEY, JSON.stringify(s));
    // notify same-tab listeners
    window.dispatchEvent(new Event("omenx-wallet-change"));
  } catch {
    // ignore
  }
}

export function getWalletBalance(): number {
  return read().balance;
}

/**
 * Move `amount` from the main OmenX wallet into the Pinpoint sub-account.
 * Returns `{ ok: false, reason: "insufficient" }` if the wallet can't cover it.
 * The Pinpoint-side credit is the caller's responsibility (handled by
 * `usePinpointSession.deposit`).
 */
export function debitWallet(amount: number): { ok: boolean; reason?: "insufficient" | "invalid" } {
  if (!(amount > 0)) return { ok: false, reason: "invalid" };
  const s = read();
  if (s.balance < amount) return { ok: false, reason: "insufficient" };
  write({ balance: s.balance - amount });
  return { ok: true };
}

/** Subscribe to wallet changes (same-tab + cross-tab). Returns unsub. */
export function subscribeWallet(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("omenx-wallet-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("omenx-wallet-change", handler);
    window.removeEventListener("storage", handler);
  };
}

/** Hook-friendly snapshot — components can re-read on each render. */
export function useWalletBalance(): number {
  const [bal, setBal] = useState<number>(() => getWalletBalance());
  useEffect(() => subscribeWallet(() => setBal(getWalletBalance())), []);
  return bal;
}