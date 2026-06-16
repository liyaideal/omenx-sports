import { useMemo, useState } from "react";
import {
  Check,
  Coins,
  Filter,
  Info,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  COMBO_MAX_COMBOS_PER_USER,
  COMBO_MAX_ODDS,
  COMBO_MAX_PICKS,
  COMBO_STAKE_MAX,
  COMBO_STAKE_MIN,
  COMBO_STAKE_STEP,
  WC_COMBO_MATCHES,
  WC_STAGES,
  type WCMarket,
  type WCMatch,
  type WCOutcome,
  type WCStage,
} from "@/data/world-cup-carnival";
import {
  useComboState,
  type ComboController,
  type RequoteState,
  type SelectedLeg,
  type SubmittedTicket,
} from "./combo/useComboState";
import { ShareTrigger, shareCombo } from "@/components/sports/share";
import omenxLogo from "@/assets/omenx-logo.svg";
import posterBgStadium from "@/assets/poster-bg-stadium.png.asset.json";

/* ============================================================
 * Top-level composition. Mirrors PRD §1.2:
 *   CampaignHero · FilterBar · MatchSelector · ComboBuilder ·
 *   QuotePreview · SubmitConfirmModal · RequoteModal ·
 *   TicketSuccessPanel · TicketStatusList · ShareCardPreview
 * ============================================================ */

export function ComboChallengeSection() {
  const ctrl = useComboState();
  const [stage, setStage] = useState<WCStage | "ALL">("ALL");
  const [matchday, setMatchday] = useState<string | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const matchdays = useMemo(() => {
    const set = new Set<string>();
    WC_COMBO_MATCHES.forEach((m) => set.add(m.matchday));
    return Array.from(set).sort();
  }, []);

  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WC_COMBO_MATCHES.filter((m) => {
      if (stage !== "ALL" && m.stage !== stage) return false;
      if (matchday !== "ALL" && m.matchday !== matchday) return false;
      if (onlyAvailable && m.matchComboStatus !== "AVAILABLE") return false;
      if (q) {
        const hay = `${m.home} ${m.away} ${m.homeCode} ${m.awayCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stage, matchday, query, onlyAvailable]);

  return (
    <div className="flex flex-col gap-6">
      <CampaignHero ctrl={ctrl} />

      <FilterBar
        stage={stage}
        setStage={setStage}
        matchday={matchday}
        setMatchday={setMatchday}
        matchdays={matchdays}
        query={query}
        setQuery={setQuery}
        onlyAvailable={onlyAvailable}
        setOnlyAvailable={setOnlyAvailable}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Left: MatchSelector */}
        <MatchSelector matches={filteredMatches} ctrl={ctrl} />

        {/* Right: Sticky Builder + Preview + CTA (desktop only — mobile uses bottom bar) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <ComboBuilder ctrl={ctrl} onCalculate={ctrl.requestPreview} onConfirm={() => setConfirmOpen(true)} />
            <QuotePreviewPanel ctrl={ctrl} />
          </div>
        </aside>
      </div>

      <TicketStatusList tickets={ctrl.tickets} />

      {/* Mobile sticky bottom bar */}
      <MobileStickyBar ctrl={ctrl} onCalculate={ctrl.requestPreview} onConfirm={() => setConfirmOpen(true)} />
      {/* Spacer so content isn't covered by the mobile bar */}
      <div className="h-24 lg:hidden" aria-hidden />

      {/* Modals */}
      <SubmitConfirmModal
        open={confirmOpen && ctrl.pageState === "PREVIEW_READY"}
        ctrl={ctrl}
        onClose={() => setConfirmOpen(false)}
        onSubmit={async () => {
          setConfirmOpen(false);
          await ctrl.submit();
        }}
      />
      <RequoteModal
        open={ctrl.pageState === "REQUOTE_REQUIRED" && !!ctrl.requote}
        requote={ctrl.requote}
        onConfirm={ctrl.confirmRequote}
        onRebuild={ctrl.dismissRequote}
      />
      <TicketAcceptedModal
        open={ctrl.pageState === "TICKET_ACCEPTED" && !!ctrl.lastAccepted}
        ticket={ctrl.lastAccepted}
        capReached={ctrl.participationCapReached}
        onAnother={ctrl.startNewCombo}
      />
    </div>
  );
}

/* ============================================================ */
/* CampaignHero                                                  */
/* ============================================================ */

function CampaignHero({ ctrl }: { ctrl: ComboController }) {
  return (
    <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(250,204,21,0.18) 0%, transparent 70%)" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-led-matrix opacity-[0.08]" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
            SEC-02 · COMBO CHALLENGE
          </div>
          <h3 className="mt-1 font-pitch text-2xl font-bold uppercase tracking-wide text-white">
            World Cup 4-Leg Combo
          </h3>
          <p className="mt-1 font-pitch text-sm font-semibold text-zinc-400">
            Pick 4 matches. All correct wins. 10 U can pay up to {COMBO_MAX_ODDS * 10} U.
          </p>
        </div>
        <div className="text-right">
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
            ENTRIES LEFT THIS PERIOD
          </div>
          <div className="font-scoreboard text-3xl font-black italic tabular-nums text-amber-400"
               style={{ filter: "drop-shadow(0 0 8px rgba(250,204,21,0.45))" }}>
            {ctrl.remainingEntries}
            <span className="ml-1 text-base text-zinc-500">/ {COMBO_MAX_COMBOS_PER_USER}</span>
          </div>
          <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            1 combo per matchday · QF+ total {COMBO_MAX_COMBOS_PER_USER}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/* FilterBar                                                     */
/* ============================================================ */

function FilterBar(props: {
  stage: WCStage | "ALL";
  setStage: (s: WCStage | "ALL") => void;
  matchday: string | "ALL";
  setMatchday: (m: string | "ALL") => void;
  matchdays: string[];
  query: string;
  setQuery: (q: string) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-2 border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="flex items-center gap-2 font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
        <Filter className="h-3 w-3" /> FILTERS
      </div>
      <div className="flex flex-wrap gap-1.5">
        {WC_STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => props.setStage(s.id)}
            className={cn(
              "border px-3 py-1.5 font-pitch text-xs font-bold uppercase tracking-widest",
              props.stage === s.id
                ? "border-amber-400 bg-amber-400 text-black"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-amber-400/60 hover:text-amber-400",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <MatchdayChip active={props.matchday === "ALL"} onClick={() => props.setMatchday("ALL")} label="All days" />
          {props.matchdays.map((d) => (
            <MatchdayChip
              key={d}
              active={props.matchday === d}
              onClick={() => props.setMatchday(d)}
              label={formatMatchdayLabel(d)}
            />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => props.setOnlyAvailable(!props.onlyAvailable)}
            className={cn(
              "border px-3 py-1.5 font-pitch text-[10px] font-bold uppercase tracking-widest",
              props.onlyAvailable
                ? "border-amber-400 bg-amber-400/10 text-amber-400"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600",
            )}
          >
            Available only
          </button>
          <label className="flex items-center gap-1 border-2 border-zinc-800 bg-black px-2">
            <Search className="h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={props.query}
              onChange={(e) => props.setQuery(e.target.value)}
              placeholder="Search team"
              className="w-32 bg-transparent py-1.5 font-pitch text-xs font-semibold text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function MatchdayChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-2.5 py-1 font-scoreboard text-[10px] font-bold tracking-widest tabular-nums",
        active ? "border-amber-400 bg-amber-400 text-black" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600",
      )}
    >
      {label}
    </button>
  );
}

function formatMatchdayLabel(d: string): string {
  const date = new Date(`${d}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Render an internal ticket id (e.g. "t_demo_won", "t_7_abc12") as a friendly
 *  short code shown to the user, e.g. "#DEMOWON" → trimmed to last 6 chars. */
function formatTicketCode(id: string): string {
  const tail = id.replace(/^t_/, "").replace(/[^a-zA-Z0-9]/g, "");
  const short = tail.slice(-6).toUpperCase() || "TICKET";
  return `#${short}`;
}

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const s = Math.max(1, Math.round(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

/* ============================================================ */
/* MatchSelector + MatchCard                                     */
/* ============================================================ */

function MatchSelector({ matches, ctrl }: { matches: WCMatch[]; ctrl: ComboController }) {
  if (matches.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center border-2 border-dashed border-zinc-800 bg-[#0a0a0a]">
        <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">NO MATCHES</div>
        <p className="mt-2 font-pitch text-sm font-semibold text-zinc-400">Try a different stage or matchday.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {matches.map((m) => (
        <MatchCard key={m.matchId} match={m} ctrl={ctrl} />
      ))}
    </div>
  );
}

function MatchCard({ match, ctrl }: { match: WCMatch; ctrl: ComboController }) {
  const moneyline = match.markets.find((mk) => mk.marketType === "MONEYLINE");
  const displayMarkets = match.markets.filter((mk) => mk.displayOnly);
  const selectedLeg = ctrl.selectedLegs.find((l) => l.matchId === match.matchId);
  const isLocked = match.matchComboStatus !== "AVAILABLE";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 border-2 bg-[#0a0a0a] p-4 transition-colors",
        selectedLeg ? "border-amber-400/70" : "border-zinc-800",
        isLocked && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StageBadge stage={match.stage} />
            <span className="font-scoreboard text-[10px] font-bold tracking-widest text-zinc-500 tabular-nums">
              {match.kickoff}
            </span>
          </div>
          <div className="mt-1.5 font-pitch text-base font-bold uppercase tracking-wide text-white">
            {match.home} <span className="text-zinc-600">vs</span> {match.away}
          </div>
        </div>
        {isLocked && (
          <span className="flex items-center gap-1 border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-pitch text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            <Lock className="h-2.5 w-2.5" /> Locked
          </span>
        )}
      </div>

      {moneyline?.outcomes && (
        <div className="grid grid-cols-3 gap-1.5">
          {moneyline.outcomes.map((o) => {
            const isSelected = selectedLeg?.outcomeId === o.outcomeId;
            return (
              <OutcomeButton
                key={o.outcomeId}
                outcome={o}
                selected={isSelected}
                disabled={isLocked}
                onClick={() => ctrl.selectOutcome(match, o)}
              />
            );
          })}
        </div>
      )}

      {displayMarkets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-zinc-800 pt-2">
          <span className="font-scoreboard text-[9px] font-bold tracking-widest text-zinc-600">
            REFERENCE
          </span>
          {displayMarkets.map((mk, i) => (
            <DisplayOnlyChip key={i} market={mk} />
          ))}
        </div>
      )}

      {selectedLeg && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400" />
      )}
    </div>
  );
}

function OutcomeButton({
  outcome,
  selected,
  disabled,
  onClick,
}: {
  outcome: WCOutcome;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const pct = Math.round(outcome.probability * 100);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex flex-col items-center justify-center gap-0.5 border px-2 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-amber-400 bg-amber-400/10"
          : "border-zinc-800 bg-black hover:border-amber-400/60",
      )}
    >
      <span
        className={cn(
          "max-w-full truncate font-pitch text-xs font-bold uppercase tracking-wide",
          selected ? "text-amber-400" : "text-white",
        )}
      >
        {outcome.label}
      </span>
      <span className="font-scoreboard text-[11px] font-bold tabular-nums text-zinc-500">
        {pct}%
      </span>
    </button>
  );
}

function DisplayOnlyChip({ market }: { market: WCMarket }) {
  return (
    <span className="inline-flex items-center gap-1 border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-pitch text-[9px] font-bold uppercase tracking-widest text-zinc-500">
      <span className="text-zinc-600">{market.marketType}</span>
      <span className="text-zinc-400">{market.summary}</span>
    </span>
  );
}

function StageBadge({ stage }: { stage: WCStage }) {
  return (
    <span className="border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 font-scoreboard text-[9px] font-bold tracking-widest text-amber-400">
      {stage}
    </span>
  );
}

/* ============================================================ */
/* ComboBuilder                                                  */
/* ============================================================ */

function ComboBuilder({
  ctrl,
  onCalculate,
  onConfirm,
}: {
  ctrl: ComboController;
  onCalculate: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="border-2 border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="flex items-center justify-between">
        <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
          MY COMBO · {ctrl.filled}/{COMBO_MAX_PICKS}
        </div>
        {ctrl.filled > 0 && (
          <button
            type="button"
            onClick={ctrl.resetLegs}
            className="font-pitch text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        {Array.from({ length: COMBO_MAX_PICKS }).map((_, i) => (
          <LegSlot key={i} index={i} leg={ctrl.selectedLegs[i]} onRemove={ctrl.removeLeg} />
        ))}
      </div>
      <StakeInput value={ctrl.stakeInput} onChange={ctrl.setStakeInput} valid={ctrl.stakeValid} />
      <BuilderCTA ctrl={ctrl} onCalculate={onCalculate} onConfirm={onConfirm} />
    </div>
  );
}

function LegSlot({
  index,
  leg,
  onRemove,
}: {
  index: number;
  leg?: SelectedLeg;
  onRemove: (matchId: string) => void;
}) {
  if (!leg) {
    return (
      <div className="flex items-center gap-2 border border-dashed border-zinc-800 bg-black px-2.5 py-2">
        <span className="grid h-6 w-6 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-600">
          <Plus className="h-3 w-3" />
        </span>
        <span className="font-scoreboard text-[10px] font-bold tracking-widest text-zinc-600">
          SLOT {index + 1}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 border border-amber-400/30 bg-black px-2.5 py-2">
      <span className="font-scoreboard text-[10px] font-bold tracking-widest text-amber-400">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-pitch text-xs font-bold uppercase tracking-wide text-white">
          {leg.teamLabel}
        </div>
        <div className="truncate font-pitch text-[10px] font-semibold text-zinc-500">
          {leg.matchLabel} · {leg.displayProbability}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(leg.matchId)}
        aria-label="Remove leg"
        className="grid h-6 w-6 place-items-center rounded border border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-red-500 hover:text-red-400"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function StakeInput({
  value,
  onChange,
  valid,
}: {
  value: string;
  onChange: (v: string) => void;
  valid: boolean;
}) {
  return (
    <div className="mt-3 border border-zinc-800 bg-black p-2.5">
      <div className="flex items-center justify-between">
        <span className="font-scoreboard text-[10px] font-bold tracking-widest text-zinc-500">
          STAKE (U)
        </span>
        <span className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          {COMBO_STAKE_MIN}–{COMBO_STAKE_MAX} · step {COMBO_STAKE_STEP}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="number"
          min={COMBO_STAKE_MIN}
          max={COMBO_STAKE_MAX}
          step={COMBO_STAKE_STEP}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-transparent font-scoreboard text-2xl font-black tabular-nums text-white focus:outline-none",
            !valid && "text-red-400",
          )}
        />
        <div className="flex gap-1">
          {[1, 5, 10].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(String(v))}
              className="border border-zinc-700 bg-zinc-900 px-2 py-1 font-pitch text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:border-amber-400 hover:text-amber-400"
            >
              {v}U
            </button>
          ))}
        </div>
      </div>
      {!valid && (
        <p className="mt-1 font-pitch text-[10px] font-semibold text-red-400">
          Stake must be {COMBO_STAKE_MIN}–{COMBO_STAKE_MAX} U in steps of {COMBO_STAKE_STEP}.
        </p>
      )}
    </div>
  );
}

function BuilderCTA({
  ctrl,
  onCalculate,
  onConfirm,
}: {
  ctrl: ComboController;
  onCalculate: () => void;
  onConfirm: () => void;
}) {
  const { filled, stakeValid, pageState, canPreview } = ctrl;
  if (ctrl.participationCapReached) {
    return (
      <div className="mt-3 border border-zinc-800 bg-zinc-950 p-2.5 text-center font-pitch text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        You've used all entries for this period.
      </div>
    );
  }

  let label = "Select 4 picks";
  let disabled = true;
  let onClick: () => void = () => {};

  if (filled < COMBO_MAX_PICKS) {
    label = `Add ${COMBO_MAX_PICKS - filled} more pick${COMBO_MAX_PICKS - filled > 1 ? "s" : ""}`;
  } else if (!stakeValid) {
    label = "Enter valid stake";
  } else if (pageState === "READY") {
    label = "Calculate odds";
    disabled = !canPreview;
    onClick = onCalculate;
  } else if (pageState === "PREVIEW_LOADING") {
    label = "Calculating…";
  } else if (pageState === "PREVIEW_READY") {
    label = "Confirm Combo";
    disabled = false;
    onClick = onConfirm;
  } else if (pageState === "PREVIEW_EXPIRED") {
    label = "Refresh odds";
    disabled = false;
    onClick = onCalculate;
  } else if (pageState === "SUBMITTING") {
    label = "Submitting…";
  } else if (pageState === "REQUOTE_REQUIRED") {
    label = "Review new odds";
    disabled = false;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 border-2 border-amber-400 bg-amber-400 py-2.5 font-pitch text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
    >
      {pageState === "PREVIEW_READY" ? <Lock className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      {label}
    </button>
  );
}

/* ============================================================ */
/* QuotePreviewPanel                                              */
/* ============================================================ */

function QuotePreviewPanel({ ctrl }: { ctrl: ComboController }) {
  const { quote, pageState, quoteSecondsLeft } = ctrl;

  if (!quote || (pageState !== "PREVIEW_READY" && pageState !== "PREVIEW_EXPIRED" && pageState !== "SUBMITTING" && pageState !== "REQUOTE_REQUIRED")) {
    return (
      <div className="border-2 border-dashed border-zinc-800 bg-[#0a0a0a] p-4">
        <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
          QUOTE PREVIEW
        </div>
        <p className="mt-2 font-pitch text-sm font-semibold text-zinc-500">
          Fill 4 picks + a valid stake, then tap <span className="text-amber-400">Calculate odds</span>.
        </p>
        <p className="mt-1 font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Max activity odds {COMBO_MAX_ODDS}× · payout caps at {COMBO_MAX_ODDS * COMBO_STAKE_MAX} U
        </p>
      </div>
    );
  }

  const expired = pageState === "PREVIEW_EXPIRED";

  return (
    <div className="border-2 border-amber-400/60 bg-[#0a0a0a] p-4">
      <div className="flex items-center justify-between">
        <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
          QUOTE PREVIEW
        </div>
        <div
          className={cn(
            "font-scoreboard text-[10px] font-bold tracking-widest tabular-nums",
            expired ? "text-red-400" : quoteSecondsLeft <= 10 ? "text-amber-400" : "text-zinc-500",
          )}
        >
          {expired ? "EXPIRED" : `LOCKS IN ${String(quoteSecondsLeft).padStart(2, "0")}s`}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Activity odds
          </div>
          <div
            className="font-scoreboard text-4xl font-black italic tabular-nums text-amber-400"
            style={{ filter: "drop-shadow(0 0 8px rgba(250,204,21,0.45))" }}
          >
            {quote.activityOdds.toFixed(2)}×
          </div>
          {quote.oddsCapApplied && (
            <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">
              Capped at {COMBO_MAX_ODDS}× max
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            All correct pays
          </div>
          <div className="font-scoreboard text-2xl font-black tabular-nums text-white">
            {quote.grossPayoutU.toFixed(2)} U
          </div>
          <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            stake {quote.stakeU.toFixed(2)} U
          </div>
        </div>
      </div>
      <p className="mt-3 flex items-start gap-1 border-t border-zinc-800 pt-2 font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
        Odds lock only after a successful submission.
      </p>
    </div>
  );
}

/* ============================================================ */
/* SubmitConfirmModal                                            */
/* ============================================================ */

function SubmitConfirmModal({
  open,
  ctrl,
  onClose,
  onSubmit,
}: {
  open: boolean;
  ctrl: ComboController;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-2 border-amber-400/60 bg-[#0a0a0a] p-0">
        <DialogTitle className="sr-only">Confirm 4-pick combo</DialogTitle>
        <div className="border-b border-zinc-800 p-4">
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
            CONFIRM 4-LEG COMBO
          </div>
          <p className="mt-1 font-pitch text-sm font-semibold text-zinc-300">
            All 4 picks must be correct to win. Odds lock only after submission.
          </p>
        </div>
        <div className="space-y-1 p-4">
          {ctrl.selectedLegs.map((l, i) => (
            <div key={l.matchId} className="flex items-center gap-2 border border-zinc-800 bg-black px-2 py-1.5">
              <span className="font-scoreboard text-[10px] font-bold tracking-widest text-amber-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate font-pitch text-xs font-bold uppercase tracking-wide text-white">
                {l.teamLabel}
              </span>
              <span className="font-scoreboard text-[10px] font-bold tabular-nums text-zinc-500">
                {l.displayProbability}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 p-4">
          <div>
            <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Activity odds
            </div>
            <div className="font-scoreboard text-2xl font-black tabular-nums text-amber-400">
              {ctrl.quote?.activityOdds.toFixed(2)}×
            </div>
          </div>
          <div className="text-right">
            <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              All correct pays
            </div>
            <div className="font-scoreboard text-2xl font-black tabular-nums text-white">
              {ctrl.quote?.grossPayoutU.toFixed(2)} U
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-4 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-zinc-700 bg-zinc-900 py-2 font-pitch text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-500"
          >
            Back to picks
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="border-2 border-amber-400 bg-amber-400 py-2 font-pitch text-xs font-bold uppercase tracking-widest text-black hover:brightness-110"
          >
            Submit Combo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================ */
/* RequoteModal                                                  */
/* ============================================================ */

function RequoteModal({
  open,
  requote,
  onConfirm,
  onRebuild,
}: {
  open: boolean;
  requote: RequoteState | null;
  onConfirm: () => void;
  onRebuild: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onRebuild()}>
      <DialogContent className="max-w-md border-2 border-red-500/60 bg-[#0a0a0a] p-0">
        <DialogTitle className="sr-only">Odds changed — confirm again</DialogTitle>
        <div className="border-b border-zinc-800 p-4">
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-red-400">
            ODDS CHANGED
          </div>
          <p className="mt-1 font-pitch text-sm font-semibold text-zinc-300">
            Please confirm again. Your old quote is no longer valid.
          </p>
        </div>
        {requote && (
          <div className="grid grid-cols-2 gap-3 p-4">
            <div className="border border-zinc-800 bg-black p-3">
              <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Old</div>
              <div className="mt-1 font-scoreboard text-2xl font-black tabular-nums text-zinc-400 line-through">
                {requote.oldActivityOdds.toFixed(2)}×
              </div>
              <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {requote.oldGrossPayoutU.toFixed(2)} U
              </div>
            </div>
            <div className="border border-red-500/40 bg-black p-3">
              <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-red-400">New</div>
              <div className="mt-1 font-scoreboard text-2xl font-black tabular-nums text-red-400">
                {requote.newActivityOdds.toFixed(2)}×
              </div>
              <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {requote.newGrossPayoutU.toFixed(2)} U
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 p-4">
          <button
            type="button"
            onClick={onRebuild}
            className="border-2 border-zinc-700 bg-zinc-900 py-2 font-pitch text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-500"
          >
            Rebuild combo
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="border-2 border-amber-400 bg-amber-400 py-2 font-pitch text-xs font-bold uppercase tracking-widest text-black hover:brightness-110"
          >
            Confirm new odds
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================ */
/* TicketAcceptedModal                                           */
/* ============================================================ */

function TicketAcceptedModal({
  open,
  ticket,
  capReached,
  onAnother,
}: {
  open: boolean;
  ticket: SubmittedTicket | null;
  capReached: boolean;
  onAnother: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onAnother()}>
      <DialogContent className="max-w-md border-2 border-emerald-500/60 bg-[#0a0a0a] p-0">
        <DialogTitle className="sr-only">Combo submitted</DialogTitle>
        <div className="border-b border-zinc-800 p-4 text-center">
          <Trophy className="mx-auto h-10 w-10 text-emerald-400" />
          <div className="mt-2 font-scoreboard text-[10px] font-bold tracking-[0.25em] text-emerald-400">
            COMBO SUBMITTED
          </div>
          <p className="mt-1 font-pitch text-sm font-semibold text-zinc-300">
            Ticket <span className="text-white">{ticket ? formatTicketCode(ticket.ticketId) : ""}</span>
          </p>
        </div>
        {ticket && (
          <div className="grid grid-cols-2 gap-3 p-4">
            <div>
              <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Locked odds</div>
              <div className="font-scoreboard text-2xl font-black tabular-nums text-amber-400">
                {ticket.lockedActivityOdds.toFixed(2)}×
              </div>
            </div>
            <div className="text-right">
              <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">All correct pays</div>
              <div className="font-scoreboard text-2xl font-black tabular-nums text-white">
                {ticket.grossPayoutU.toFixed(2)} U
              </div>
            </div>
          </div>
        )}
        <div className="space-y-2 border-t border-zinc-800 p-4">
          {ticket && (
            <ShareTrigger
              target={shareCombo({ ticket, poster: <ShareCardPreview ticket={ticket} /> })}
              variant="wide"
              label="Share my combo"
              className="border-2 border-amber-400 bg-amber-400/10"
            />
          )}
          {capReached ? (
            <p className="text-center font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              You have used all available combo entries for this matchday.
            </p>
          ) : (
            <button
              type="button"
              onClick={onAnother}
              className="inline-flex w-full items-center justify-center gap-2 border-2 border-zinc-700 bg-zinc-900 py-2 font-pitch text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-500"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Build another combo
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================ */
/* TicketStatusList                                              */
/* ============================================================ */

function TicketStatusList({
  tickets,
}: {
  tickets: SubmittedTicket[];
}) {
  if (tickets.length === 0) return null;
  return (
    <div className="border-2 border-zinc-800 bg-[#0a0a0a] p-4">
      <div className="flex items-center gap-2">
        <Ticket className="h-3.5 w-3.5 text-amber-400" />
        <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
          MY TICKETS
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {tickets.map((t) => (
          <TicketRow key={t.ticketId} ticket={t} />
        ))}
      </div>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: SubmittedTicket }) {
  const statusInfo = {
    ACCEPTED: { label: "Waiting for results", tone: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
    SETTLED_WON: { label: "4/4 Correct — Won!", tone: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
    SETTLED_LOST: {
      label: ticket.wonLegCount === 3 ? "So close — 3/4" : "Combo missed",
      tone: "text-zinc-400 border-zinc-700 bg-zinc-900",
    },
  }[ticket.status];

  return (
    <div className="border border-zinc-800 bg-black p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("border px-2 py-0.5 font-pitch text-[10px] font-bold uppercase tracking-widest", statusInfo.tone)}>
            {statusInfo.label}
          </span>
          <span className="font-scoreboard text-[10px] font-bold tracking-widest text-zinc-500">
            {formatTicketCode(ticket.ticketId)} · {formatRelativeTime(ticket.acceptedAtMs)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-scoreboard text-base font-black tabular-nums text-amber-400">
              {ticket.lockedActivityOdds.toFixed(2)}×
            </div>
            <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              pays {ticket.grossPayoutU.toFixed(0)} U
            </div>
          </div>
          <ShareTrigger
            target={shareCombo({ ticket, poster: <ShareCardPreview ticket={ticket} /> })}
            variant="chip"
          />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {ticket.legs.map((l, i) => (
          <span
            key={i}
            className="border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-pitch text-[10px] font-bold uppercase tracking-widest text-zinc-400"
          >
            {l.teamLabel}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ */
/* MobileStickyBar                                               */
/* ============================================================ */

function MobileStickyBar({
  ctrl,
  onCalculate,
  onConfirm,
}: {
  ctrl: ComboController;
  onCalculate: () => void;
  onConfirm: () => void;
}) {
  const { filled, quote, pageState, stake } = ctrl;
  let cta = "Select 4 picks";
  let onClick: (() => void) | null = null;
  if (filled < COMBO_MAX_PICKS) cta = `Add ${COMBO_MAX_PICKS - filled} more`;
  else if (pageState === "READY") {
    cta = "Calculate odds";
    onClick = onCalculate;
  } else if (pageState === "PREVIEW_LOADING") cta = "Calculating…";
  else if (pageState === "PREVIEW_READY") {
    cta = "Confirm combo";
    onClick = onConfirm;
  } else if (pageState === "PREVIEW_EXPIRED") {
    cta = "Refresh odds";
    onClick = onCalculate;
  } else if (pageState === "SUBMITTING") cta = "Submitting…";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-amber-400/60 bg-[#0a0a0a]/95 p-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="font-scoreboard text-[10px] font-bold tracking-widest text-zinc-500">
            {filled}/{COMBO_MAX_PICKS} · stake {stake.toFixed(1)} U
          </div>
          <div className="font-scoreboard text-lg font-black tabular-nums text-amber-400">
            {quote ? `${quote.activityOdds.toFixed(2)}× → ${quote.grossPayoutU.toFixed(0)} U` : "--"}
          </div>
        </div>
        <button
          type="button"
          onClick={onClick ?? undefined}
          disabled={!onClick}
          className="border-2 border-amber-400 bg-amber-400 px-4 py-2 font-pitch text-xs font-bold uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * ShareCardPreview — OMENX stadium share poster.
 *
 * 1:1 replica of the user's reference: black stadium night
 * background, neon yellow-green (#C6FF3D) ticket bracket, gold
 * (#F2D024) headline + reward, "OMENX" wordmark on top,
 * 10U → 500U hero, 4 picks with flag circles, STAKE/ODDS/REWARD
 * row, SHARE & INVITE referral ticket with QR placeholder.
 * Render surface is 1080×1350 (4:5); rendered via aspect-ratio
 * so it scales to any container width.
 * ============================================================ */

const POSTER_GOLD = "#F2D024";
const POSTER_NEON = "#C6FF3D";
const POSTER_BG = "#050505";

function countryToFlag(label: string): string {
  const map: Record<string, string> = {
    argentina: "🇦🇷",
    brazil: "🇧🇷",
    france: "🇫🇷",
    spain: "🇪🇸",
    portugal: "🇵🇹",
    netherlands: "🇳🇱",
    belgium: "🇧🇪",
    england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    germany: "🇩🇪",
    italy: "🇮🇹",
    croatia: "🇭🇷",
    morocco: "🇲🇦",
    japan: "🇯🇵",
    korea: "🇰🇷",
    mexico: "🇲🇽",
    usa: "🇺🇸",
    uruguay: "🇺🇾",
    "saudi arabia": "🇸🇦",
    poland: "🇵🇱",
    denmark: "🇩🇰",
    switzerland: "🇨🇭",
    serbia: "🇷🇸",
    senegal: "🇸🇳",
    canada: "🇨🇦",
    ecuador: "🇪🇨",
    ghana: "🇬🇭",
    iran: "🇮🇷",
    qatar: "🇶🇦",
    "costa rica": "🇨🇷",
    cameroon: "🇨🇲",
  };
  const key = label.trim().toLowerCase();
  for (const k of Object.keys(map)) {
    if (key.startsWith(k)) return map[k];
  }
  return "⚽";
}

function extractCountry(leg: SelectedLeg): { name: string; flag: string } {
  // teamLabel examples: "Brazil Win", "Draw", "Argentina Win".
  // For "Draw" pull first home team from matchLabel.
  let raw = leg.teamLabel.replace(/\s+(win|draw|lose|loss)$/i, "").trim();
  if (!raw || /^draw$/i.test(leg.teamLabel)) {
    raw = leg.matchLabel.split(" vs ")[0]?.trim() ?? raw;
  }
  return { name: raw.toUpperCase(), flag: countryToFlag(raw) };
}

function PosterTicketFrame({ children }: { children: React.ReactNode }) {
  // Clean neon-edged bracket — no decorative notches.
  return (
    <div
      className="relative"
      style={{
        border: `2px solid ${POSTER_NEON}`,
        borderRadius: 10,
        background: "rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}

export function ShareCardPreview({ ticket }: { ticket: SubmittedTicket }) {
  const legs = ticket.legs.slice(0, 4);
  const stakeStr = `${Math.round(ticket.stakeU)}U`;
  const rewardStr = `${Math.round(ticket.grossPayoutU)}U`;
  const oddsStr = `${ticket.lockedActivityOdds.toFixed(0)}x`;
  const referralCode = "ABCD2026";

  return (
    <div className="mx-auto w-full" style={{ aspectRatio: "4 / 5.85" }}>
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          containerType: "inline-size",
          background: POSTER_BG,
        }}
      >
        {/* stadium photographic background */}
        <img
          src={posterBgStadium.url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {/* subtle darken so text stays legible over bright spots */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(0,0,0,0.35)" }}
        />

        {/* dot grid overlay */}
        <div aria-hidden className="pointer-events-none absolute inset-0 poster-dot-grid opacity-[0.15]" />

        {/* === Frame border on entire poster === */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[3%] rounded-md"
          style={{ border: `1px solid ${POSTER_NEON}33` }}
        />

        <div className="relative flex h-full flex-col px-[7%] pb-[4.5%] pt-[8%]" style={{ containerType: "inline-size" }}>
          {/* === OMENX wordmark (official logo) === */}
          <img
            src={omenxLogo}
            alt="OMENX"
            className="mx-auto block w-auto"
            style={{
              height: "12cqw",
              filter: "drop-shadow(0 0 14px rgba(0,0,0,0.6))",
            }}
          />

          {/* trophy badge */}
          <div className="mt-[4%] flex flex-col items-center gap-[1.5%]">
            <div className="relative" style={{ padding: 6 }}>
              <Trophy
                style={{ color: POSTER_GOLD, width: "4.7cqw", height: "4.7cqw" }}
                strokeWidth={2}
              />
              <span aria-hidden className="absolute" style={{ top: 0, left: 0, width: 10, height: 10, borderTop: `2px solid ${POSTER_GOLD}`, borderLeft: `2px solid ${POSTER_GOLD}` }} />
              <span aria-hidden className="absolute" style={{ top: 0, right: 0, width: 10, height: 10, borderTop: `2px solid ${POSTER_GOLD}`, borderRight: `2px solid ${POSTER_GOLD}` }} />
              <span aria-hidden className="absolute" style={{ bottom: 0, left: 0, width: 10, height: 10, borderBottom: `2px solid ${POSTER_GOLD}`, borderLeft: `2px solid ${POSTER_GOLD}` }} />
              <span aria-hidden className="absolute" style={{ bottom: 0, right: 0, width: 10, height: 10, borderBottom: `2px solid ${POSTER_GOLD}`, borderRight: `2px solid ${POSTER_GOLD}` }} />
            </div>
            <div
              className="font-poster text-[1.65cqw] font-bold uppercase"
              style={{ color: POSTER_GOLD, letterSpacing: "0.25em" }}
            >
              World Cup 4-Leg Combo
            </div>
          </div>

          {/* === Hero stake → reward === */}
          <div
            className="mt-[4%] flex items-center justify-center gap-[2%] font-poster font-bold leading-none"
            style={{ fontSize: "9.4cqw" }}
          >
            <span className="text-white">{stakeStr}</span>
            <span style={{ color: POSTER_GOLD }}>→</span>
            <span style={{ color: POSTER_GOLD }}>{rewardStr}</span>
          </div>

          {/* subtitle */}
          <div
            className="mt-[1.5%] text-center font-poster text-[2.25cqw] font-bold uppercase"
            style={{ color: POSTER_NEON, letterSpacing: "0.18em" }}
          >
            <span style={{ color: POSTER_GOLD }}>4</span> Picks. Hit All{" "}
            <span style={{ color: POSTER_GOLD }}>4</span>.
          </div>

          {/* === Main ticket === */}
          <div className="mt-[4.5%]">
            <PosterTicketFrame>
              <div className="px-[4%] py-[3.5%]">
                {/* ticket title */}
                  <div className="mb-[2%] flex items-center justify-center gap-2">
                  <span style={{ color: POSTER_NEON, opacity: 0.7, fontSize: "2.4cqw" }}>
                    {"//"}
                  </span>
                  <span
                    className="font-poster font-bold uppercase"
                      style={{
                        color: POSTER_NEON,
                        fontSize: "2.6cqw",
                        letterSpacing: "0.18em",
                      }}
                  >
                    My 4-Leg Combo
                  </span>
                  <span style={{ color: POSTER_NEON, opacity: 0.7, fontSize: "2.4cqw" }}>
                    {"//"}
                  </span>
                </div>

                {/* legs */}
                <div
                  className="rounded"
                  style={{ border: `1px solid ${POSTER_NEON}66`, background: "rgba(0,0,0,0.35)" }}
                >
                  {legs.map((leg, i) => {
                    const c = extractCountry(leg);
                    const last = i === legs.length - 1;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-[2.5%] px-[2.5%] py-[1.8%]"
                        style={
                          last
                            ? undefined
                            : { borderBottom: `1px solid ${POSTER_NEON}33` }
                        }
                      >
                        {/* number chevron box */}
                        <div
                          className="grid place-items-center font-poster font-bold"
                          style={{
                            width: "6.3%",
                            aspectRatio: "1 / 1",
                            border: `2px solid ${POSTER_NEON}`,
                            color: POSTER_NEON,
                            fontSize: "2.5cqw",
                            clipPath:
                              "polygon(15% 0, 85% 0, 100% 50%, 85% 100%, 15% 100%, 0 50%)",
                          }}
                        >
                          {i + 1}
                        </div>
                        {/* flag circle */}
                        <div
                          className="grid place-items-center overflow-hidden rounded-full bg-white"
                          style={{
                            width: "7.2%",
                            aspectRatio: "1 / 1",
                            border: `2px solid ${POSTER_NEON}`,
                            fontSize: "4.2cqw",
                            lineHeight: 1,
                          }}
                        >
                          <span style={{ filter: "saturate(1.1)" }}>{c.flag}</span>
                        </div>
                        {/* team + WIN */}
                        <div className="flex flex-1 items-center gap-[2%]">
                          <span
                            className="font-poster font-bold uppercase text-white"
                            style={{ fontSize: "2.65cqw", letterSpacing: "0.04em" }}
                          >
                            {c.name}
                          </span>
                          <span
                            className="font-poster font-bold uppercase"
                            style={{ color: POSTER_NEON, fontSize: "2.65cqw" }}
                          >
                            Win
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* stats row */}
                <div
                  className="mt-[3%] grid grid-cols-3 rounded"
                  style={{
                    border: `1px solid ${POSTER_NEON}66`,
                    background: "rgba(0,0,0,0.35)",
                  }}
                >
                  {[
                    { icon: Coins, label: "Stake", value: stakeStr, color: "#FFFFFF" },
                    { icon: TrendingUp, label: "Odds", value: oddsStr, color: "#FFFFFF" },
                    { icon: Trophy, label: "Reward", value: rewardStr, color: POSTER_GOLD },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={i}
                          className="flex flex-col items-center gap-[2%] py-[2.2%]"
                        style={
                          i < 2
                            ? { borderRight: `1px solid ${POSTER_NEON}33` }
                            : undefined
                        }
                      >
                        <Icon
                          style={{ color: POSTER_NEON, width: "4cqw", height: "4cqw" }}
                          strokeWidth={2}
                        />
                        <div
                          className="font-poster uppercase"
                          style={{
                            color: "#9A9A9A",
                            fontSize: "1.9cqw",
                            letterSpacing: "0.2em",
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          className="font-poster font-bold"
                          style={{ color: s.color, fontSize: "4.4cqw" }}
                        >
                          {s.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PosterTicketFrame>
          </div>

          {/* === Bottom SHARE & INVITE ticket === */}
          <div className="mt-[3.5%]">
            <PosterTicketFrame>
              <div className="flex items-stretch gap-[3%] px-[4%] py-[3.5%]">
                {/* left: referral */}
                <div className="flex flex-1 flex-col justify-center gap-[3%]">
                  <div className="flex items-center gap-[2%]">
                    <Users style={{ color: POSTER_NEON, width: "3cqw", height: "3cqw" }} />
                    <span
                      className="font-poster font-bold uppercase text-white"
                      style={{ fontSize: "2.25cqw", letterSpacing: "0.16em" }}
                    >
                      Share &amp; Invite
                    </span>
                  </div>
                  <div
                    className="font-poster uppercase"
                    style={{
                      color: POSTER_NEON,
                      fontSize: "1.75cqw",
                      letterSpacing: "0.22em",
                    }}
                  >
                    Referral Code
                  </div>
                  <div
                    className="rounded font-poster font-bold"
                    style={{
                      color: POSTER_GOLD,
                      fontSize: "5.1cqw",
                      letterSpacing: "0.06em",
                      border: `1px solid ${POSTER_NEON}55`,
                      padding: "1% 3%",
                      background: "rgba(0,0,0,0.4)",
                    }}
                  >
                    {referralCode}
                  </div>
                </div>
                {/* right: QR */}
                <div className="flex flex-col items-center justify-center gap-[6%]">
                  <div
                    className="grid place-items-center bg-white"
                    style={{
                      width: "12cqw",
                      height: "12cqw",
                      padding: "4%",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundImage:
                          "conic-gradient(#000 25%, #fff 0 50%, #000 0 75%, #fff 0)",
                        backgroundSize: "20% 20%",
                      }}
                    />
                  </div>
                  <div
                    className="font-poster uppercase"
                    style={{
                      color: POSTER_NEON,
                      fontSize: "1.55cqw",
                      letterSpacing: "0.2em",
                    }}
                  >
                    Scan to Join
                  </div>
                </div>
              </div>
            </PosterTicketFrame>
          </div>
        </div>

      </div>
    </div>
  );
}

/* Helper to silence unused-import linting in cases above. */
void Check;