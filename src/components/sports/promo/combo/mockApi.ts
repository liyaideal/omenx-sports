import {
  COMBO_MAX_ODDS,
  COMBO_QUOTE_TTL_SEC,
  COMBO_REQUOTE_DRIFT_RANGE,
  COMBO_REQUOTE_PROBABILITY,
} from "@/data/world-cup-carnival";

/**
 * Tiny in-memory mock API for the World Cup Combo activity page. Mirrors the
 * PRD §3 endpoints (preview / submit / requote) but everything resolves
 * client-side after a setTimeout so the FE state machine can be exercised
 * without a backend.
 */

export interface PreviewLeg {
  matchId: string;
  outcomeId: string;
  probability: number;
}

export interface PreviewQuote {
  quoteId: string;
  rawComboOdds: number;
  activityOdds: number;
  oddsCapApplied: boolean;
  stakeU: number;
  grossPayoutU: number;
  netLiabilityU: number;
  quoteExpiresAtMs: number;
}

export type SubmitResult =
  | {
      result: "ACCEPTED";
      ticketId: string;
      lockedActivityOdds: number;
      stakeU: number;
      grossPayoutU: number;
      acceptedAtMs: number;
    }
  | {
      result: "REQUOTE_REQUIRED";
      quoteId: string;
      oldActivityOdds: number;
      newActivityOdds: number;
      oldGrossPayoutU: number;
      newGrossPayoutU: number;
      quoteExpiresAtMs: number;
    };

function wait<T>(ms: number, value: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

let quoteCounter = 0;
let ticketCounter = 0;

export function previewQuote(legs: PreviewLeg[], stakeU: number): Promise<PreviewQuote> {
  // Raw fair odds = product of (1 / probability), then capped to activity_odds_cap.
  const rawComboOdds = legs.reduce((acc, l) => acc * (1 / l.probability), 1);
  const activityOdds = Math.min(rawComboOdds, COMBO_MAX_ODDS);
  const grossPayoutU = activityOdds * stakeU;
  const quote: PreviewQuote = {
    quoteId: `q_${++quoteCounter}_${Date.now()}`,
    rawComboOdds,
    activityOdds,
    oddsCapApplied: rawComboOdds > COMBO_MAX_ODDS,
    stakeU,
    grossPayoutU,
    netLiabilityU: grossPayoutU - stakeU,
    quoteExpiresAtMs: Date.now() + COMBO_QUOTE_TTL_SEC * 1000,
  };
  return wait(700, quote);
}

/**
 * Submit. With `COMBO_REQUOTE_PROBABILITY` chance returns REQUOTE_REQUIRED
 * with a new quote whose odds are 5–15% below the preview. The caller is
 * expected to surface the modal and re-submit with the new quote.
 */
export function submitTicket(
  quote: PreviewQuote,
  opts?: { forceRequote?: boolean },
): Promise<SubmitResult> {
  const shouldRequote =
    opts?.forceRequote ?? Math.random() < COMBO_REQUOTE_PROBABILITY;

  if (shouldRequote) {
    const [lo, hi] = COMBO_REQUOTE_DRIFT_RANGE;
    const drift = lo + Math.random() * (hi - lo);
    const newActivityOdds = quote.activityOdds * (1 - drift);
    return wait(700, {
      result: "REQUOTE_REQUIRED",
      quoteId: `q_${++quoteCounter}_${Date.now()}`,
      oldActivityOdds: quote.activityOdds,
      newActivityOdds,
      oldGrossPayoutU: quote.grossPayoutU,
      newGrossPayoutU: newActivityOdds * quote.stakeU,
      quoteExpiresAtMs: Date.now() + COMBO_QUOTE_TTL_SEC * 1000,
    });
  }

  return wait(900, {
    result: "ACCEPTED",
    ticketId: `t_${++ticketCounter}_${Date.now().toString(36).slice(-5)}`,
    lockedActivityOdds: quote.activityOdds,
    stakeU: quote.stakeU,
    grossPayoutU: quote.grossPayoutU,
    acceptedAtMs: Date.now(),
  });
}