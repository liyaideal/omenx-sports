import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Lock, X, ChevronRight, Play } from "lucide-react";
import { toast } from "sonner";
import {
  LEGEND_ROUNDS,
  LEGEND_COUNTRIES,
  LEGEND_SIGNED_IMAGES,
  LEGEND_MYSTERY_PORTRAIT,
  PREWARM_LEGENDS,
  type LegendRound,
  type LegendCandidate,
  type LegendClue,
  type LegendRoundStatus,
} from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";
import * as FlatFlags from "country-flag-icons/react/3x2";
import { LegendRevealOverlay } from "./LegendRevealOverlay";
import { useLegendRevealQueue } from "@/hooks/useLegendRevealQueue";
import { AnimatePresence } from "motion/react";

const ACCENT = "#4ade80";
const AMBER = "#facc15";
const MISS = "#f87171";

function FlagSvg({
  code,
  title,
  className,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  const key = code.replace(/-/g, "_");
  const Cmp = (FlatFlags as Record<string, React.ComponentType<{ title?: string; className?: string }> | undefined>)[key];
  if (!Cmp) return null;
  return <Cmp title={title} className={className} />;
}

/* ----------------------------------------------------------------------- */
/*  Tab root — Scoreboard chassis                                           */
/* ----------------------------------------------------------------------- */

/**
 * `/promo/world-cup?tab=legend`. Whole tab is rendered inside an industrial
 * scoreboard chassis (12px frame + corner bolts + faint scanlines). One
 * country per round, 4 candidate guesses, 3 split-flap clue rows.
 */
export function GuessTheLegendTab() {
  const rounds = LEGEND_ROUNDS;
  const currentRound = rounds.find((r) => r.status === "voting") ?? rounds[0];

  const [activeRoundId, setActiveRoundId] = useState<string>(currentRound.id);
  const [pickByRound, setPickByRound] = useState<Record<string, string>>({});
  const [lockedRounds, setLockedRounds] = useState<Record<string, boolean>>({});

  const revealedIds = useMemo(
    () =>
      rounds
        .filter(
          (r) => r.status === "revealed-hit" || r.status === "revealed-miss",
        )
        .map((r) => r.id),
    [rounds],
  );
  const { queue, markSeen } = useLegendRevealQueue(revealedIds);
  const [replayRoundId, setReplayRoundId] = useState<string | null>(null);

  // Auto-play head of queue; replay overrides (manual user trigger).
  const playingRoundId = replayRoundId ?? queue[0] ?? null;
  const playingRound = playingRoundId
    ? rounds.find((r) => r.id === playingRoundId)
    : null;
  const isReplay = !!replayRoundId;

  function handleOverlayClose() {
    if (replayRoundId) {
      setReplayRoundId(null);
      return;
    }
    const id = queue[0];
    if (id) markSeen(id);
  }

  const activeRound = rounds.find((r) => r.id === activeRoundId) ?? currentRound;

  const effectiveStatus: LegendRoundStatus =
    activeRound.status === "voting" && lockedRounds[activeRound.id]
      ? "locked-in"
      : activeRound.status;

  const effectivePickId =
    activeRound.status === "voting"
      ? pickByRound[activeRound.id]
      : activeRound.userPickId;

  const hits = useMemo(
    () => rounds.filter((r) => r.status === "revealed-hit").length,
    [rounds],
  );
  const completed = useMemo(
    () =>
      rounds.filter(
        (r) => r.status === "revealed-hit" || r.status === "revealed-miss",
      ).length,
    [rounds],
  );

  function selectCandidate(id: string) {
    if (effectiveStatus !== "voting") return;
    setPickByRound((m) => ({ ...m, [activeRound.id]: id }));
  }

  function lockIn() {
    if (effectiveStatus !== "voting") return;
    if (!effectivePickId) {
      toast.error("Pick a candidate first");
      return;
    }
    setLockedRounds((m) => ({ ...m, [activeRound.id]: true }));
    toast.success("Pick locked — hit on reveal day unlocks 1 Lucky Box spin");
  }

  return (
    <div className="w-full">
      <ScoreboardChassis>
        <div className="mx-auto w-full max-w-3xl">
          <MissionBrief />
          <RoundProgressHud
            rounds={rounds}
            activeRoundId={activeRound.id}
            hits={hits}
            completed={completed}
            onSelectRound={setActiveRoundId}
          />

          <ActiveRoundBay
            round={activeRound}
            effectiveStatus={effectiveStatus}
            onReplayReveal={
              activeRound.status === "revealed-hit" ||
              activeRound.status === "revealed-miss"
                ? () => setReplayRoundId(activeRound.id)
                : undefined
            }
          />

          <CandidateBoard
            round={activeRound}
            effectiveStatus={effectiveStatus}
            effectivePickId={effectivePickId}
            onSelectCandidate={selectCandidate}
            onLockIn={lockIn}
          />

          <SignedArchiveStrip rounds={rounds} />
        </div>
      </ScoreboardChassis>
      <AnimatePresence>
        {playingRound && (
          <LegendRevealOverlay
            key={playingRound.id + (isReplay ? "-replay" : "-auto")}
            round={playingRound}
            onClose={handleOverlayClose}
            isReplay={isReplay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Mission Brief — answers "what am I playing for?" in one strip          */
/* ----------------------------------------------------------------------- */

export function MissionBrief() {
  return (
    <div className="border-b-2 border-[#161616] bg-[#0d0d0d] px-5 py-4 sm:px-7 sm:py-5">
      <div className="mb-2 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.3em] text-zinc-600">
        <span>MISSION</span>
        <span className="text-zinc-700">HOW IT WORKS</span>
      </div>
      <p className="mb-3 font-pitch text-sm leading-snug text-zinc-300 sm:text-[15px]">
        Crack the signed-jersey vault — one retired legend per round. Read the
        clues, lock the right name before reveal day, and the vault pays you back.
      </p>
      <ul className="space-y-1.5 font-scoreboard text-[10px] font-bold tracking-[0.22em] text-zinc-400 sm:text-[11px]">
        <li className="flex items-start gap-2">
          <span
            className="mt-0.5 inline-block h-2 w-2 shrink-0"
            style={{ background: AMBER, boxShadow: `0 0 6px ${AMBER}` }}
          />
          <span>
            PICK 1 OF 4 LEGENDS · 3 CLUES UNLOCK BY COMMUNITY VOTE
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span
            className="mt-0.5 inline-block h-2 w-2 shrink-0"
            style={{ background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }}
          />
          <span>
            HIT ON REVEAL DAY ={" "}
            <span style={{ color: ACCENT }}>+1 LUCKY BOX TIER-01 SPIN</span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 inline-block h-2 w-2 shrink-0 bg-zinc-600" />
          <span className="flex flex-wrap items-center gap-1">
            <span>THE SIGNED JERSEY ITSELF DROPS INTO THE LUCKY BOX POOL</span>
            <Link
              to="/promo/world-cup"
              search={{ tab: "luckybox" }}
              className="inline-flex items-center gap-1 border border-amber-400/40 px-1.5 py-0.5 text-amber-400 transition-colors hover:bg-amber-400 hover:text-black"
            >
              OPEN LUCKY BOX
              <ChevronRight className="h-3 w-3" />
            </Link>
          </span>
        </li>
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Chassis                                                                 */
/* ----------------------------------------------------------------------- */

export function ScoreboardChassis({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative border-[10px] border-[#1a1a1a] bg-[#0a0a0a] shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(250,204,21,0.05)]"
      style={{ contain: "paint" }}
    >
      {/* Corner bolts */}
      <Bolt className="left-1.5 top-1.5" />
      <Bolt className="right-1.5 top-1.5" />
      <Bolt className="bottom-1.5 left-1.5" />
      <Bolt className="bottom-1.5 right-1.5" />

      {/* Subtle CRT scanlines — capped at 8% opacity per DESIGN.md §7 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(transparent 50%, rgba(0,0,0,0.7) 50%)",
          backgroundSize: "100% 3px",
        }}
      />
      {/* Top glare */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-30"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)",
        }}
      />

      <div className="relative">{children}</div>
    </div>
  );
}

function Bolt({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute z-10 h-3 w-3 rounded-full border border-[#2a2a2a] bg-[#0a0a0a] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.95)]",
        className,
      )}
    />
  );
}

/* ----------------------------------------------------------------------- */
/*  Round progress HUD (top)                                                */
/* ----------------------------------------------------------------------- */

export function RoundProgressHud({
  rounds,
  activeRoundId,
  hits,
  completed,
  onSelectRound,
}: {
  rounds: LegendRound[];
  activeRoundId: string;
  hits: number;
  completed: number;
  onSelectRound: (id: string) => void;
}) {
  const active = rounds.find((r) => r.id === activeRoundId);
  return (
    <div className="border-b-2 border-[#161616] bg-[#0d0d0d] px-5 py-4 sm:px-7 sm:py-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.3em] text-zinc-600">
            SERIES PROGRESS
          </div>
          <div className="mt-1 font-pitch text-base font-bold uppercase tracking-wide text-white sm:text-lg">
            Guess the Legend
          </div>
        </div>
        <div className="text-right">
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.3em] text-zinc-600">
            LIVE FEED
          </div>
          <div
            className="mt-1 font-scoreboard text-base font-bold tracking-[0.18em]"
            style={{ color: AMBER }}
          >
            GUES-{String(active?.roundNumber ?? 1).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
        {rounds.map((r) => (
          <RoundLedTile
            key={r.id}
            round={r}
            active={r.id === activeRoundId}
            onClick={() => onSelectRound(r.id)}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.25em]">
        <span className="text-zinc-600">
          {hits} / {completed} HIT · {rounds.length - completed} TBA
        </span>
        <span className="flex items-center gap-3 text-zinc-600">
          <LegendSwatch color={ACCENT} label="HIT" />
          <LegendSwatch color={AMBER} label="LIVE" />
          <LegendSwatch color={MISS} label="MISS" />
        </span>
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className="h-1.5 w-3"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-zinc-500">{label}</span>
    </span>
  );
}

function RoundLedTile({
  round,
  active,
  onClick,
}: {
  round: LegendRound;
  active: boolean;
  onClick: () => void;
}) {
  const isHit = round.status === "revealed-hit";
  const isMiss = round.status === "revealed-miss";
  const isLive = round.status === "voting" || round.status === "locked-in";
  const color = isHit ? ACCENT : isMiss ? MISS : isLive ? AMBER : "rgb(39 39 42)";

  const country = LEGEND_COUNTRIES[round.country];
  const correct = round.candidates.find((c) => c.id === round.correctCandidateId);
  const titleLabel = isLive
    ? `Round #${round.roundNumber} — ${country.name} · live`
    : isHit
      ? `Round #${round.roundNumber} — ${correct?.name ?? country.name} · you hit it`
      : isMiss
        ? `Round #${round.roundNumber} — ${correct?.name ?? country.name} · you missed`
        : `Round #${round.roundNumber} — TBA`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={titleLabel}
      aria-label={titleLabel}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group relative flex aspect-[5/6] flex-col items-center justify-between border bg-[#080808] px-1 py-1.5 transition-all sm:py-2",
        active && "ring-2 ring-offset-1 ring-offset-[#0a0a0a]",
        round.status === "upcoming" && "border-dashed",
      )}
      style={{
        borderColor: active ? AMBER : isLive || isHit || isMiss ? color : "#1f1f1f",
        // @ts-expect-error — Tailwind ring uses --tw-ring-color
        "--tw-ring-color": AMBER,
      }}
    >
      <div
        className="font-scoreboard text-[9px] font-bold tracking-[0.18em] sm:text-[10px]"
        style={{ color }}
      >
        {String(round.roundNumber).padStart(2, "0")}
      </div>
      {round.status === "upcoming" ? (
        <div className="grid h-10 w-full place-items-center text-base font-scoreboard text-zinc-700 sm:h-12">
          ?
        </div>
      ) : (
        <div
          className="relative h-9 w-full overflow-hidden rounded-[3px] border border-black/70 sm:h-11"
          style={{
            boxShadow: isHit
              ? `inset 0 1px 0 rgba(74,222,128,0.35), inset 0 0 0 1px rgba(0,0,0,0.6)`
              : isLive
                ? `inset 0 1px 0 rgba(250,204,21,0.35), inset 0 0 0 1px rgba(0,0,0,0.6)`
                : `inset 0 0 0 1px rgba(0,0,0,0.6)`,
            filter: isMiss ? "grayscale(0.55) opacity(0.7)" : undefined,
          }}
        >
          <FlagSvg
            code={country.iso2}
            title={country.name}
            className="block h-full w-full"
          />
        </div>
      )}
      <div
        className="h-1 w-full"
        style={{
          background: color,
          boxShadow: isLive || isHit ? `0 0 6px ${color}` : undefined,
        }}
      />
    </button>
  );
}

/* ----------------------------------------------------------------------- */
/*  Active round bay (flag + split-flap clues)                              */
/* ----------------------------------------------------------------------- */

export function ActiveRoundBay({
  round,
  effectiveStatus,
}: {
  round: LegendRound;
  effectiveStatus: LegendRoundStatus;
}) {
  if (round.status === "upcoming") {
    return <UpcomingBay round={round} />;
  }

  const country = LEGEND_COUNTRIES[round.country];
  const isRevealed =
    effectiveStatus === "revealed-hit" || effectiveStatus === "revealed-miss";
  const revealedCount = round.clues.filter((c) => c.state === "revealed").length;

  return (
    <div className="border-b-2 border-[#161616] bg-[#0a0a0a] px-5 py-5 sm:px-7 sm:py-6">
      <div className="mb-3 flex items-center justify-between gap-3 font-scoreboard text-[10px] font-bold tracking-[0.3em] text-zinc-600">
        <span style={{ color: AMBER }}>
          ROUND #{String(round.roundNumber).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-3">
          {!isRevealed && (
            <span className="hidden sm:inline" style={{ color: ACCENT }}>
              HIT → +1 SPIN
            </span>
          )}
          <span>
            {isRevealed ? "REVEALED" : `${revealedCount} / 3 CLUES LIVE`}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {/* Flag plate */}
        <div className="sm:col-span-2">
          <div className="relative aspect-[5/3] overflow-hidden border border-[#1f1f1f] bg-black">
            <img
              src={country.flagImage}
              alt={`${country.name} flag`}
              loading="lazy"
              width={768}
              height={512}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            {/* Reveal: replace the flag silhouette with the country's signed portrait */}
            {isRevealed && (
              <img
                src={LEGEND_SIGNED_IMAGES[round.country]}
                alt={`Signed portrait — ${LEGEND_COUNTRIES[round.country].name}`}
                loading="lazy"
                width={512}
                height={768}
                className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-top"
              />
            )}
            {!isRevealed && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 grid place-items-center"
              >
                <span
                  className="font-scoreboard text-7xl font-bold text-white/15 mix-blend-overlay"
                  style={{ textShadow: "0 4px 16px rgba(0,0,0,0.6)" }}
                >
                  ?
                </span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center">
              <span className="bg-black/70 px-1.5 py-0.5 font-scoreboard text-[9px] font-bold tracking-[0.22em] text-white backdrop-blur-sm">
                {country.name.toUpperCase()}
              </span>
            </div>
          </div>
          {isRevealed && (
            <RevealBanner
              status={effectiveStatus as "revealed-hit" | "revealed-miss"}
            />
          )}
        </div>

        {/* Clue stack */}
        <div className="space-y-2 sm:col-span-3">
          {round.clues.map((c) => (
            <ClueRow key={c.idx} clue={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function UpcomingBay({ round }: { round: LegendRound }) {
  return (
    <div className="border-b-2 border-[#161616] bg-[#0a0a0a] px-5 py-10 text-center sm:px-7">
      <div className="font-scoreboard text-[10px] font-bold tracking-[0.3em] text-zinc-600">
        ROUND #{String(round.roundNumber).padStart(2, "0")} · TBA
      </div>
      <div className="mt-4 inline-grid h-16 w-16 place-items-center border border-dashed border-zinc-700 font-scoreboard text-3xl text-zinc-700">
        ?
      </div>
      <p className="mx-auto mt-4 max-w-md text-sm text-zinc-500">
        Country not yet announced. Reveals run on the legend's signing window —
        there's no fixed schedule.
      </p>
    </div>
  );
}

function RevealBanner({ status }: { status: "revealed-hit" | "revealed-miss" }) {
  const hit = status === "revealed-hit";
  const color = hit ? ACCENT : MISS;
  return (
    <div
      className="mt-2 flex items-center gap-2 border px-2 py-1.5"
      style={{
        borderColor: color,
        background: hit ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.08)",
      }}
    >
      {hit ? (
        <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} />
      ) : (
        <X className="h-3.5 w-3.5 shrink-0" style={{ color }} />
      )}
      <span className="font-scoreboard text-[10px] font-bold tracking-[0.18em] text-white">
        {hit ? "YOU HIT IT · TIER-01 SPIN GRANTED" : "BETTER LUCK NEXT ROUND"}
      </span>
    </div>
  );
}

function ClueRow({ clue }: { clue: LegendClue }) {
  const revealed = clue.state === "revealed";
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 border bg-[#0d0d0d] px-3 py-3 transition-colors",
        revealed ? "border-[#1f1f1f]" : "border-dashed border-[#1f1f1f]",
      )}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: revealed ? AMBER : "#262626" }}
      />
      <div
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center font-scoreboard text-[10px] font-bold",
          revealed ? "text-black" : "text-zinc-600",
        )}
        style={{
          background: revealed ? AMBER : "transparent",
          border: revealed ? "none" : "1px dashed #2a2a2a",
        }}
      >
        {revealed ? clue.idx : <Lock className="h-3 w-3" />}
      </div>
      <div className="font-scoreboard text-[10px] font-bold tracking-[0.22em] text-zinc-500">
        {clue.label}
      </div>
      <div className="ml-auto min-w-0 text-right">
        {revealed ? (
          <span
            className="font-pitch text-sm font-bold uppercase tracking-wide"
            style={{ color: AMBER }}
          >
            {clue.value}
          </span>
        ) : (
          <span className="font-scoreboard text-[10px] font-bold tracking-[0.18em] text-zinc-600">
            {clue.unlockHint ?? "ENCRYPTED"}
          </span>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Candidate board                                                         */
/* ----------------------------------------------------------------------- */

export function CandidateBoard({
  round,
  effectiveStatus,
  effectivePickId,
  onSelectCandidate,
  onLockIn,
}: {
  round: LegendRound;
  effectiveStatus: LegendRoundStatus;
  effectivePickId?: string;
  onSelectCandidate: (id: string) => void;
  onLockIn: () => void;
}) {
  if (round.status === "upcoming") return null;

  const isRevealed =
    effectiveStatus === "revealed-hit" || effectiveStatus === "revealed-miss";

  return (
    <div className="border-b-2 border-[#161616] bg-[#0a0a0a] px-5 py-5 sm:px-7 sm:py-6">
      <div className="mb-3 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.3em] text-zinc-600">
        <span>SELECT CANDIDATE</span>
        <span>4 OPTIONS · 1 PICK</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {round.candidates.map((cand) => {
          const isPick = effectivePickId === cand.id;
          const isCorrect = isRevealed && cand.id === round.correctCandidateId;
          const isWrongPick =
            isRevealed && isPick && cand.id !== round.correctCandidateId;
          return (
            <CandidateCard
              key={cand.id}
              candidate={cand}
              picked={isPick}
              correct={isCorrect}
              wrongPick={isWrongPick}
              dimmed={
                (effectiveStatus === "locked-in" && !isPick) ||
                (isRevealed && !isCorrect && !isWrongPick)
              }
              disabled={effectiveStatus !== "voting"}
              onClick={() => onSelectCandidate(cand.id)}
            />
          );
        })}
      </div>

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={onLockIn}
          disabled={effectiveStatus !== "voting"}
          className="w-full border-2 px-4 py-3 font-pitch text-sm font-bold uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed"
          style={{
            borderColor: effectiveStatus === "voting" ? AMBER : "#1f1f1f",
            background: effectiveStatus === "voting" ? AMBER : "transparent",
            color: effectiveStatus === "voting" ? "black" : "rgb(113 113 122)",
          }}
        >
          {effectiveStatus === "voting"
            ? "Lock in · win 1 Lucky Box spin"
            : effectiveStatus === "locked-in"
              ? "Pick locked · waiting for reveal"
              : "Round closed"}
        </button>
        <p className="text-center font-scoreboard text-[10px] font-bold tracking-[0.22em] text-zinc-600">
          CORRECT → 1× TIER-01 BASIC VAULT SPIN ON REVEAL DAY
        </p>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  picked,
  correct,
  wrongPick,
  dimmed,
  disabled,
  onClick,
}: {
  candidate: LegendCandidate;
  picked: boolean;
  correct: boolean;
  wrongPick: boolean;
  dimmed: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const borderColor = correct
    ? ACCENT
    : wrongPick
      ? MISS
      : picked
        ? AMBER
        : "#1f1f1f";
  const pctColor = correct ? ACCENT : picked ? AMBER : "rgb(82 82 91)";
  const pct = Math.round(candidate.votePct * 100);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative border bg-[#0d0d0d] p-3 text-left transition-all",
        !disabled && "hover:border-amber-500/60",
        dimmed && "opacity-50",
        disabled && "cursor-not-allowed",
      )}
      style={{ borderColor }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-pitch text-sm font-bold uppercase tracking-wide text-white">
            {candidate.name}
          </div>
        </div>
        {correct && (
          <span
            className="grid h-5 w-5 shrink-0 place-items-center"
            style={{ background: ACCENT, color: "black" }}
            aria-label="Correct"
          >
            <Check className="h-3 w-3" />
          </span>
        )}
        {wrongPick && (
          <span
            className="grid h-5 w-5 shrink-0 place-items-center text-white"
            style={{ background: MISS }}
            aria-label="Wrong"
          >
            <X className="h-3 w-3" />
          </span>
        )}
        {picked && !correct && !wrongPick && (
          <span
            className="grid h-5 w-5 shrink-0 place-items-center"
            style={{ background: AMBER, color: "black" }}
            aria-label="Picked"
          >
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="h-1.5 flex-1 overflow-hidden border border-[#1f1f1f] bg-black">
          <div
            className="h-full transition-all"
            style={{
              width: `${pct}%`,
              background: pctColor,
              boxShadow: picked || correct ? `0 0 6px ${pctColor}` : undefined,
            }}
          />
        </div>
        <span
          className="font-scoreboard text-[10px] font-bold tabular-nums tracking-[0.15em]"
          style={{ color: pctColor }}
        >
          {pct}%
        </span>
      </div>
    </button>
  );
}

/* ----------------------------------------------------------------------- */
/*  Signed archive strip (bottom)                                           */
/* ----------------------------------------------------------------------- */

interface SignedArchiveEntry {
  id: string;
  name: string;
  countryLabel: string;
  roundLabel: string;
  image: string;
  active?: boolean;
  bonus?: boolean;
}

export function SignedArchiveStrip({ rounds }: { rounds: LegendRound[] }) {
  const fromRounds: SignedArchiveEntry[] = rounds
    .filter(
      (r) => r.status === "revealed-hit" || r.status === "revealed-miss",
    )
    .map((r) => {
      const country = LEGEND_COUNTRIES[r.country];
      const correct = r.candidates.find(
        (c) => c.id === r.correctCandidateId,
      );
      return {
        id: r.id,
        name: correct?.name ?? country.name,
        countryLabel: country.name.toUpperCase(),
        roundLabel: `R${String(r.roundNumber).padStart(2, "0")}`,
        image: LEGEND_SIGNED_IMAGES[r.country],
      };
    });

  const fromPrewarm: SignedArchiveEntry[] = PREWARM_LEGENDS
    .filter((p) => !p.inMainPool) // in-pool ones are already covered by revealed rounds
    .map((p) => ({
      id: p.id,
      name: p.name,
      countryLabel: p.country.toUpperCase(),
      roundLabel: "BONUS",
      image: p.signedImage,
      bonus: true,
    }));

  const entries = [...fromRounds, ...fromPrewarm];
  if (entries.length > 0) entries[entries.length - 1].active = true;

  return (
    <div className="bg-[#080808] px-5 py-4 sm:px-7 sm:py-5">
      <div className="mb-3 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.3em] text-zinc-600">
        <span>SIGNED ARCHIVE</span>
        <Link
          to="/promo/world-cup"
          search={{ tab: "luckybox" }}
          className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-amber-400"
        >
          BACK TO LUCKY BOX
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {entries.map((e) => (
          <ArchiveCard key={e.id} entry={e} />
        ))}
        {/* one empty slot to hint "more coming" */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center border-2 border-dashed border-[#1f1f1f] text-zinc-700">
          <div className="font-scoreboard text-[9px] font-bold tracking-[0.22em]">
            NEXT
          </div>
          <div className="mt-1 text-2xl leading-none">?</div>
        </div>
      </div>
    </div>
  );
}

function ArchiveCard({ entry }: { entry: SignedArchiveEntry }) {
  return (
    <div
      className={cn(
        "group relative w-24 shrink-0 overflow-hidden border bg-[#0d0d0d] transition-all",
        entry.active
          ? "border-amber-400 shadow-[0_0_15px_rgba(250,204,21,0.25)]"
          : "border-[#1f1f1f]",
      )}
    >
      <div className="relative aspect-[5/7] overflow-hidden bg-black">
        <img
          src={entry.image}
          alt={entry.name}
          loading="lazy"
          width={512}
          height={768}
          className={cn(
            "h-full w-full object-cover transition-all",
            entry.active
              ? "grayscale-0"
              : "grayscale group-hover:grayscale-0",
          )}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
        <div className="absolute inset-x-1 bottom-1 space-y-0.5">
          <div
            className="truncate font-pitch text-[10px] font-bold uppercase leading-tight tracking-wide text-white"
            title={entry.name}
          >
            {entry.name}
          </div>
          <div className="truncate font-scoreboard text-[8px] font-bold tracking-[0.18em] text-zinc-400">
            {entry.countryLabel}
          </div>
        </div>
        <div
          className="absolute left-1 top-1 px-1 py-px font-scoreboard text-[8px] font-bold tracking-[0.2em]"
          style={{
            background: entry.bonus ? "rgba(167,139,250,0.85)" : "rgba(250,204,21,0.9)",
            color: "black",
          }}
        >
          {entry.roundLabel}
        </div>
        {entry.active && (
          <div
            aria-hidden
            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
            style={{ background: AMBER, boxShadow: `0 0 6px ${AMBER}` }}
          />
        )}
      </div>
    </div>
  );
}
