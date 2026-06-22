import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  COMBO_MAX_PICKS,
  COMBO_STAKE,
  COMBO_MAX_COMBOS_PER_USER,
  WC_COMBO_MATCHES,
  type OutcomeSide,
  type WCMarket,
  type WCMarketType,
  type WCMatch,
  type WCOutcome,
} from "@/data/world-cup-carnival";
import {
  previewQuote,
  submitTicket,
  type PreviewQuote,
  type SubmitResult,
} from "./mockApi";

export type PageState =
  | "READY"
  | "PREVIEW_LOADING"
  | "PREVIEW_READY"
  | "PREVIEW_EXPIRED"
  | "SUBMITTING"
  | "REQUOTE_REQUIRED"
  | "TICKET_ACCEPTED";

export interface SelectedLeg {
  matchId: string;
  marketId: string;
  marketType: WCMarketType;
  outcomeId: string;
  outcomeSide: OutcomeSide;
  teamLabel: string;
  /** Market subtitle (e.g. "Moneyline", "Spread · BRA -1.5", "Total · Over 2.5"). */
  marketLabel: string;
  matchLabel: string;
  kickoff: string;
  probability: number;
  displayProbability: string;
}

export interface SubmittedTicket {
  ticketId: string;
  legs: SelectedLeg[];
  stakeU: number;
  lockedActivityOdds: number;
  grossPayoutU: number;
  acceptedAtMs: number;
  /** Frozen status — mock varies for the demo list. */
  status: "ACCEPTED" | "SETTLED_WON" | "SETTLED_LOST";
  wonLegCount?: number;
}

function legFromOutcome(
  match: WCMatch,
  market: WCMarket,
  outcome: WCOutcome,
): SelectedLeg {
  const marketLabel =
    market.marketType === "MONEYLINE"
      ? "Moneyline"
      : market.marketType === "SPREAD"
        ? `Spread · ${outcome.label}`
        : `Total · ${outcome.label}`;
  return {
    matchId: match.matchId,
    marketId: market.marketId,
    marketType: market.marketType,
    outcomeId: outcome.outcomeId,
    outcomeSide: outcome.side,
    teamLabel: outcome.label,
    marketLabel,
    matchLabel: `${match.home} vs ${match.away}`,
    kickoff: match.kickoff,
    probability: outcome.probability,
    displayProbability: `${Math.round(outcome.probability * 100)}%`,
  };
}

/** Three sample tickets seeded for the TicketStatusList demo. */
function seedTickets(): SubmittedTicket[] {
  const find = (id: string) => WC_COMBO_MATCHES.find((m) => m.matchId === id)!;
  function legOf(matchId: string, side: OutcomeSide): SelectedLeg {
    const m = find(matchId);
    const market = m.markets[0];
    const o = (market.outcomes ?? []).find((x) => x.side === side)!;
    return legFromOutcome(m, market, o);
  }
  return [
    {
      ticketId: "t_demo_won",
      status: "SETTLED_WON",
      acceptedAtMs: Date.now() - 1000 * 60 * 60 * 6,
      stakeU: 10,
      lockedActivityOdds: 14.2,
      grossPayoutU: 142,
      wonLegCount: 4,
      legs: [
        legOf("WC26_GRPA_ARG_MEX", "HOME"),
        legOf("WC26_GRPB_BRA_JPN", "HOME"),
        legOf("WC26_GRPD_ESP_USA", "HOME"),
        legOf("WC26_GRPE_GER_CAN", "HOME"),
      ],
    },
    {
      ticketId: "t_demo_lost",
      status: "SETTLED_LOST",
      acceptedAtMs: Date.now() - 1000 * 60 * 60 * 28,
      stakeU: 10,
      lockedActivityOdds: 22.5,
      grossPayoutU: 225,
      wonLegCount: 3,
      legs: [
        legOf("WC26_GRPF_POR_GHA", "HOME"),
        legOf("WC26_GRPG_NED_KOR", "HOME"),
        legOf("WC26_GRPH_BEL_EGY", "HOME"),
        legOf("WC26_GRPI_ITA_AUS", "AWAY"),
      ],
    },
    {
      ticketId: "t_demo_pending",
      status: "ACCEPTED",
      acceptedAtMs: Date.now() - 1000 * 60 * 12,
      stakeU: 10,
      lockedActivityOdds: 18.9,
      grossPayoutU: 189,
      legs: [
        legOf("WC26_R16_BRA_POR", "HOME"),
        legOf("WC26_R16_ARG_NED", "HOME"),
        legOf("WC26_R16_FRA_BEL", "HOME"),
        legOf("WC26_QF_BRA_FRA", "HOME"),
      ],
    },
  ];
}

export interface RequoteState {
  oldActivityOdds: number;
  newActivityOdds: number;
  oldGrossPayoutU: number;
  newGrossPayoutU: number;
  newQuoteId: string;
  quoteExpiresAtMs: number;
}

export function useComboState() {
  const [selectedLegs, setSelectedLegs] = useState<SelectedLeg[]>([]);
  // Stake is fixed at COMBO_STAKE (10U). No user input.
  const stakeInput = String(COMBO_STAKE);
  const setStakeInput = useCallback((_v: string) => {
    /* no-op: stake is fixed */
  }, []);
  const [pageState, setPageState] = useState<PageState>("READY");
  const [quote, setQuote] = useState<PreviewQuote | null>(null);
  const [requote, setRequote] = useState<RequoteState | null>(null);
  const [tickets, setTickets] = useState<SubmittedTicket[]>(() => seedTickets());
  const [lastAccepted, setLastAccepted] = useState<SubmittedTicket | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Tick once a second so the quote countdown stays live.
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Auto-expire the preview when ttl hits zero.
  useEffect(() => {
    if (!quote) return;
    if (pageState !== "PREVIEW_READY") return;
    if (nowMs >= quote.quoteExpiresAtMs) setPageState("PREVIEW_EXPIRED");
  }, [nowMs, quote, pageState]);

  // Any change to the legs / stake invalidates an existing preview.
  const legSignatureRef = useRef<string>("");
  useEffect(() => {
    const sig = `${stakeInput}|${selectedLegs.map((l) => `${l.matchId}:${l.outcomeId}`).join(",")}`;
    if (sig !== legSignatureRef.current) {
      legSignatureRef.current = sig;
      if (pageState === "PREVIEW_READY" || pageState === "PREVIEW_EXPIRED") {
        setQuote(null);
        setPageState("READY");
      }
    }
  }, [selectedLegs, stakeInput, pageState]);

  const stake = COMBO_STAKE;
  const stakeValid = true;
  const filled = selectedLegs.length;
  const remainingEntries = Math.max(0, COMBO_MAX_COMBOS_PER_USER - tickets.filter((t) => !t.ticketId.startsWith("t_demo_")).length);
  const participationCapReached = remainingEntries <= 0;

  const selectOutcome = useCallback(
    (match: WCMatch, market: WCMarket, outcome: WCOutcome) => {
      if (match.matchComboStatus !== "AVAILABLE") {
        toast.error("This match starts soon and can't be added.");
        return;
      }
      if (!outcome.selectable) {
        toast.error(outcome.disabledReason ?? "This pick is no longer available. Please choose another one.");
        return;
      }
      setSelectedLegs((prev) => {
        // Uniqueness is per market — same market re-pick replaces; different
        // markets within the same match stack as separate legs (capped at 4).
        const sameMarketIdx = prev.findIndex((l) => l.marketId === market.marketId);
        if (sameMarketIdx >= 0) {
          const next = [...prev];
          next[sameMarketIdx] = legFromOutcome(match, market, outcome);
          return next;
        }
        if (prev.length >= COMBO_MAX_PICKS) {
          toast.error("You already have 4 picks. Remove one before adding another.");
          return prev;
        }
        return [...prev, legFromOutcome(match, market, outcome)];
      });
    },
    [],
  );

  const removeLeg = useCallback((marketId: string) => {
    setSelectedLegs((prev) => prev.filter((l) => l.marketId !== marketId));
  }, []);

  const resetLegs = useCallback(() => setSelectedLegs([]), []);

  const canPreview = filled === COMBO_MAX_PICKS && stakeValid;

  const requestPreview = useCallback(async () => {
    if (!canPreview) return;
    setPageState("PREVIEW_LOADING");
    try {
      const q = await previewQuote(
        selectedLegs.map((l) => ({ matchId: l.matchId, outcomeId: l.outcomeId, probability: l.probability })),
        stake,
      );
      setQuote(q);
      setPageState("PREVIEW_READY");
    } catch (e) {
      console.error(e);
      toast.error("Could not calculate odds. Please try again.");
      setPageState("READY");
    }
  }, [canPreview, selectedLegs, stake]);

  const finalizeAccepted = useCallback(
    (r: Extract<SubmitResult, { result: "ACCEPTED" }>) => {
      const ticket: SubmittedTicket = {
        ticketId: r.ticketId,
        status: "ACCEPTED",
        acceptedAtMs: r.acceptedAtMs,
        stakeU: r.stakeU,
        lockedActivityOdds: r.lockedActivityOdds,
        grossPayoutU: r.grossPayoutU,
        legs: selectedLegs,
      };
      setTickets((prev) => [ticket, ...prev]);
      setLastAccepted(ticket);
      setPageState("TICKET_ACCEPTED");
      setRequote(null);
    },
    [selectedLegs],
  );

  const submit = useCallback(
    async (opts?: { forceRequote?: boolean }) => {
      if (!quote || pageState !== "PREVIEW_READY") return;
      if (participationCapReached) {
        toast.error("You've used all available Combo entries for this period.");
        return;
      }
      setPageState("SUBMITTING");
      try {
        const r = await submitTicket(quote, opts);
        if (r.result === "REQUOTE_REQUIRED") {
          setRequote({
            oldActivityOdds: r.oldActivityOdds,
            newActivityOdds: r.newActivityOdds,
            oldGrossPayoutU: r.oldGrossPayoutU,
            newGrossPayoutU: r.newGrossPayoutU,
            newQuoteId: r.quoteId,
            quoteExpiresAtMs: r.quoteExpiresAtMs,
          });
          // Treat the new quote as the active one.
          setQuote({
            ...quote,
            quoteId: r.quoteId,
            activityOdds: r.newActivityOdds,
            grossPayoutU: r.newGrossPayoutU,
            netLiabilityU: r.newGrossPayoutU - quote.stakeU,
            quoteExpiresAtMs: r.quoteExpiresAtMs,
          });
          setPageState("REQUOTE_REQUIRED");
          return;
        }
        finalizeAccepted(r);
      } catch (e) {
        console.error(e);
        toast.error("Submit failed. Please try again.");
        setPageState("PREVIEW_READY");
      }
    },
    [quote, pageState, participationCapReached, finalizeAccepted],
  );

  const confirmRequote = useCallback(async () => {
    if (!quote) return;
    setRequote(null);
    setPageState("SUBMITTING");
    try {
      // Force acceptance on the requote-confirm leg so demo always lands.
      const r = await submitTicket(quote, { forceRequote: false });
      if (r.result === "ACCEPTED") finalizeAccepted(r);
      else setPageState("PREVIEW_READY"); // shouldn't hit, defensive
    } catch (e) {
      console.error(e);
      setPageState("PREVIEW_READY");
    }
  }, [quote, finalizeAccepted]);

  const dismissRequote = useCallback(() => {
    setRequote(null);
    setPageState("PREVIEW_READY");
  }, []);

  const startNewCombo = useCallback(() => {
    setSelectedLegs([]);
    setQuote(null);
    setRequote(null);
    setLastAccepted(null);
    setPageState("READY");
  }, []);

  const quoteSecondsLeft = useMemo(() => {
    if (!quote) return 0;
    return Math.max(0, Math.ceil((quote.quoteExpiresAtMs - nowMs) / 1000));
  }, [quote, nowMs]);

  return {
    // state
    pageState,
    selectedLegs,
    stakeInput,
    stake,
    stakeValid,
    filled,
    quote,
    requote,
    tickets,
    lastAccepted,
    remainingEntries,
    participationCapReached,
    canPreview,
    quoteSecondsLeft,
    // actions
    setStakeInput,
    selectOutcome,
    removeLeg,
    resetLegs,
    requestPreview,
    submit,
    confirmRequote,
    dismissRequote,
    startNewCombo,
  };
}

export type ComboController = ReturnType<typeof useComboState>;