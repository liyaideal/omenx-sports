/**
 * Centralized cross-site URL map for OmenX (the parent product).
 *
 * This sports zone is a sub-section of OmenX. Wallet, account, portfolio,
 * settled history, KYC, and all category browsers other than Sports live
 * on the OmenX main site. When the deployment shape changes (sub-path,
 * sub-domain, or independent domain), only this file needs to change.
 */
export const OMENX_BASE = "https://omenx.app";

export const omenxUrl = {
  home: () => `${OMENX_BASE}/`,
  wallet: () => `${OMENX_BASE}/wallet`,
  account: () => `${OMENX_BASE}/account`,
  portfolio: () => `${OMENX_BASE}/portfolio`,
  history: () => `${OMENX_BASE}/portfolio/history`,
  markets: () => `${OMENX_BASE}/markets`,
  events: () => `${OMENX_BASE}/events`,
  crypto: () => `${OMENX_BASE}/crypto`,
  politics: () => `${OMENX_BASE}/politics`,
  terms: () => `${OMENX_BASE}/terms`,
  help: () => `${OMENX_BASE}/help`,
} as const;