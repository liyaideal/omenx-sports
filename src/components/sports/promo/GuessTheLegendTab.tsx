import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Lock, Crown, X, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  LEGEND_ROUNDS,
  LEGEND_COUNTRIES,
  PREWARM_LEGENDS,
  type LegendRound,
  type LegendCandidate,
  type LegendClue,
  type LegendRoundStatus,
} from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

const ACCENT = "oklch(0.7 0.18 145)";
const AMBER = "#facc15";

/* ----------------------------------------------------------------------- */
/*  Tab root                                                                */
/* ----------------------------------------------------------------------- */

/**
 * Independent tab on /promo/world-cup. Each round shows ONE country and
 * 4 retired-legend candidates — never all 8 at once. The current round
 * runs in local state so a user can flip from `voting` → `locked-in`
 * inside the demo, but reveal outcomes (`revealed-hit` / `revealed-miss`)
 * stay fixture-driven.
 */
export function GuessTheLegendTab() {
  const rounds = LEGEND_ROUNDS;
  const currentRound = rounds.find((r) => r.status === "voting") ?? rounds[0];

  const [activeRoundId, setActiveRoundId] = useState<string>(currentRound.id);
  const [pickByRound, setPickByRound] = useState<Record<string, string>>({});
  const [lockedRounds, setLockedRounds] = useState<Record<string, boolean>>({});

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
    toast.success("Pick locked — waiting for reveal day");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <SectionIntro />

      <RoundCard
        round={activeRound}
        effectiveStatus={effectiveStatus}
        effectivePickId={effectivePickId}
        onSelectCandidate={selectCandidate}
        onLockIn={lockIn}
      />

      <RevealWall
        rounds={rounds}
        activeRoundId={activeRound.id}
        onSelectRound={setActiveRoundId}
        hits={hits}
        completed={completed}
      />

      <PrewarmStrip />
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Intro                                                                   */
/* ----------------------------------------------------------------------- */

function SectionIntro() {
  return (
    <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-amber-400/10"
      />
      <div className="relative font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
        SEC-04 · GUESS THE LEGEND
      </div>
      <h3 className="relative mt-1 font-pitch text-xl font-bold uppercase tracking-wide text-white">
        One country. Four legends. One signed jersey.
      </h3>
      <p className="relative mt-1 text-sm text-zinc-400">
        Every few weeks we announce the country whose retired star has signed
        for OmenX, then drop three clues. Pick the right legend before reveal
        day to score a free Tier-01 Basic Vault spin.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Round card                                                              */
/* ----------------------------------------------------------------------- */

export function RoundCard({
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
  if (round.status === "upcoming") {
    return <UpcomingRoundCard round={round} />;
  }

  const country = LEGEND_COUNTRIES[round.country];
  const revealedCount = round.clues.filter((c) => c.state === "revealed").length;
  const isRevealed =
    effectiveStatus === "revealed-hit" || effectiveStatus === "revealed-miss";

  return (
    <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a]">
      {/* Header */}
      <div className="relative border-b-2 border-zinc-800 px-5 pb-5 pt-5">
        <div className="flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
          <span style={{ color: AMBER }}>
            ROUND #{String(round.roundNumber).padStart(2, "0")}
          </span>
          <span>
            {isRevealed
              ? "REVEALED"
              : `CLUE ${revealedCount} OF 3 LIVE`}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <span className="text-5xl leading-none">{country.flag}</span>
          <div className="min-w-0">
            <div className="font-pitch text-2xl font-bold uppercase tracking-wide text-white">
              {country.name}
            </div>
            <div className="font-scoreboard text-[10px] font-bold tracking-[0.22em] text-zinc-500">
              NEXT REVEAL · TBA
            </div>
          </div>
        </div>

        {effectiveStatus === "revealed-hit" && (
          <BannerHit />
        )}
        {effectiveStatus === "revealed-miss" && (
          <BannerMiss />
        )}
      </div>

      {/* Clues */}
      <div className="space-y-2 border-b-2 border-zinc-800 px-5 py-5">
        {round.clues.map((c) => (
          <ClueRow key={c.idx} clue={c} />
        ))}
      </div>

      {/* Candidates */}
      <div className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-2">
        {round.candidates.map((cand) => {
          const isPick = effectivePickId === cand.id;
          const isCorrect = isRevealed && cand.id === round.correctCandidateId;
          const isWrongPick =
            isRevealed &&
            effectivePickId === cand.id &&
            cand.id !== round.correctCandidateId;
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

      {/* CTA */}
      <div className="space-y-2 border-t-2 border-zinc-800 px-5 py-5">
        <button
          type="button"
          onClick={onLockIn}
          disabled={effectiveStatus !== "voting"}
          className="w-full border-2 px-4 py-3 font-pitch text-sm font-bold uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed"
          style={{
            borderColor:
              effectiveStatus === "voting" ? AMBER : "rgb(39 39 42)",
            background:
              effectiveStatus === "voting" ? AMBER : "transparent",
            color:
              effectiveStatus === "voting" ? "black" : "rgb(113 113 122)",
          }}
        >
          {effectiveStatus === "voting"
            ? "Lock in pick"
            : effectiveStatus === "locked-in"
              ? "Pick locked · waiting for reveal"
              : "Round closed"}
        </button>
        <p className="text-center font-scoreboard text-[10px] font-bold tracking-[0.22em] text-zinc-500">
          CORRECT → 1× TIER-01 BASIC VAULT SPIN ON REVEAL DAY
        </p>
      </div>
    </div>
  );
}

function UpcomingRoundCard({ round }: { round: LegendRound }) {
  return (
    <div className="relative overflow-hidden border-2 border-dashed border-zinc-800 bg-[#0a0a0a] p-6 text-center">
      <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
        ROUND #{String(round.roundNumber).padStart(2, "0")}
      </div>
      <div className="mt-3 text-5xl">🔒</div>
      <h4 className="mt-2 font-pitch text-lg font-bold uppercase tracking-wide text-zinc-300">
        Country not yet announced
      </h4>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
        Reveals run on the legend's signing window — there's no fixed
        schedule. Check back when the round opens.
      </p>
    </div>
  );
}

function BannerHit() {
  return (
    <div
      className="mt-4 flex items-center gap-3 border-2 px-3 py-2"
      style={{ borderColor: ACCENT, background: "oklch(0.7 0.18 145 / 0.15)" }}
    >
      <Check className="h-4 w-4" style={{ color: ACCENT }} />
      <div className="flex-1 font-scoreboard text-[11px] font-bold tracking-[0.18em] text-white">
        YOU HIT IT — 1× TIER-01 BASIC VAULT SPIN GRANTED
      </div>
    </div>
  );
}

function BannerMiss() {
  return (
    <div className="mt-4 flex items-center gap-3 border-2 border-zinc-700 bg-zinc-900/50 px-3 py-2">
      <X className="h-4 w-4 text-zinc-400" />
      <div className="flex-1 font-scoreboard text-[11px] font-bold tracking-[0.18em] text-zinc-300">
        BETTER LUCK NEXT ROUND
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Clue row                                                                */
/* ----------------------------------------------------------------------- */

function ClueRow({ clue }: { clue: LegendClue }) {
  const revealed = clue.state === "revealed";
  return (
    <div
      className={cn(
        "flex items-start gap-3 border px-3 py-2.5 transition-colors",
        revealed
          ? "border-zinc-800 bg-zinc-950"
          : "border-dashed border-zinc-800 bg-black/40",
      )}
    >
      <div
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center font-scoreboard text-[10px] font-bold",
          revealed ? "text-black" : "text-zinc-500",
        )}
        style={{
          background: revealed ? AMBER : "transparent",
          border: revealed ? "none" : "1px dashed rgb(63 63 70)",
        }}
      >
        {revealed ? `C${clue.idx}` : <Lock className="h-3 w-3" />}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            revealed ? "text-zinc-100" : "text-zinc-600",
          )}
        >
          {revealed
            ? clue.text
            : clue.unlockHint ?? "Locked — community vote required."}
        </p>
      </div>
      {revealed && <Check className="h-4 w-4 shrink-0 text-zinc-500" />}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Candidate card                                                          */
/* ----------------------------------------------------------------------- */

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
      ? "#f87171"
      : picked
        ? AMBER
        : "rgb(39 39 42)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden border-2 bg-zinc-950 p-4 text-left transition-all",
        !disabled && "hover:-translate-y-0.5 hover:border-zinc-600",
        dimmed && "opacity-50",
        disabled && "cursor-not-allowed",
      )}
      style={{ borderColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-pitch text-base font-bold uppercase tracking-wide text-white">
            {candidate.name}
          </div>
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
            {candidate.club.toUpperCase()}
          </div>
        </div>
        {correct && (
          <div
            className="grid h-7 w-7 place-items-center"
            style={{ background: ACCENT, color: "black" }}
            aria-label="Correct"
          >
            <Crown className="h-4 w-4" />
          </div>
        )}
        {wrongPick && (
          <div
            className="grid h-7 w-7 place-items-center text-white"
            style={{ background: "#f87171" }}
            aria-label="Wrong pick"
          >
            <X className="h-4 w-4" />
          </div>
        )}
        {picked && !correct && !wrongPick && (
          <div
            className="grid h-7 w-7 place-items-center"
            style={{ background: AMBER, color: "black" }}
            aria-label="Selected"
          >
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Community vote bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          <span>COMMUNITY</span>
          <span className="tabular-nums" style={{ color: picked ? AMBER : undefined }}>
            {Math.round(candidate.votePct * 100)}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden border border-zinc-800 bg-zinc-900">
          <div
            className="h-full"
            style={{
              width: `${Math.round(candidate.votePct * 100)}%`,
              background: picked ? AMBER : "rgb(82 82 91)",
            }}
          />
        </div>
      </div>
    </button>
  );
}

/* ----------------------------------------------------------------------- */
/*  Reveal wall                                                             */
/* ----------------------------------------------------------------------- */

export function RevealWall({
  rounds,
  activeRoundId,
  onSelectRound,
  hits,
  completed,
}: {
  rounds: LegendRound[];
  activeRoundId: string;
  onSelectRound: (id: string) => void;
  hits: number;
  completed: number;
}) {
  return (
    <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      <div className="flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
        <span>REVEAL WALL · 8 ROUNDS</span>
        <span style={{ color: ACCENT }}>
          YOUR RECORD · {hits} / {completed} HITS
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rounds.map((r) => (
          <RevealWallDot
            key={r.id}
            round={r}
            active={r.id === activeRoundId}
            onClick={() => onSelectRound(r.id)}
          />
        ))}
      </div>
    </div>
  );
}

function RevealWallDot({
  round,
  active,
  onClick,
}: {
  round: LegendRound;
  active: boolean;
  onClick: () => void;
}) {
  const country = LEGEND_COUNTRIES[round.country];
  const correct = round.candidates.find(
    (c) => c.id === round.correctCandidateId,
  );
  const pick = round.candidates.find((c) => c.id === round.userPickId);

  const color =
    round.status === "revealed-hit"
      ? ACCENT
      : round.status === "revealed-miss"
        ? "#f87171"
        : round.status === "voting" || round.status === "locked-in"
          ? AMBER
          : "rgb(63 63 70)";

  const hoverTitle =
    round.status === "upcoming"
      ? `Round #${round.roundNumber} — TBA`
      : `Round #${round.roundNumber} · ${country.name}${
          correct ? ` · ${correct.name}` : ""
        }${
          pick && pick.id !== correct?.id
            ? ` (you picked ${pick.name})`
            : pick
              ? " (you picked correctly)"
              : ""
        }`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={hoverTitle}
      aria-label={hoverTitle}
      className={cn(
        "group relative flex shrink-0 flex-col items-center gap-1.5 border-2 bg-zinc-950 px-3 py-2 transition-all",
        active && "shadow-[0_0_18px_rgba(250,204,21,0.45)]",
      )}
      style={{
        borderColor: active ? AMBER : "rgb(39 39 42)",
        borderStyle: round.status === "upcoming" ? "dashed" : "solid",
      }}
    >
      <div
        className="grid h-8 w-8 place-items-center text-lg"
        style={{ filter: round.status === "upcoming" ? "grayscale(1)" : undefined }}
      >
        {round.status === "upcoming" ? "?" : country.flag}
      </div>
      <div
        className="font-scoreboard text-[9px] font-bold tracking-[0.18em]"
        style={{ color }}
      >
        #{String(round.roundNumber).padStart(2, "0")}
      </div>
      <div
        className="h-1 w-full"
        style={{
          background: color,
          boxShadow:
            round.status === "revealed-hit" || round.status === "voting"
              ? `0 0 8px ${color}`
              : undefined,
        }}
      />
    </button>
  );
}

/* ----------------------------------------------------------------------- */
/*  Pre-warm strip                                                          */
/* ----------------------------------------------------------------------- */

function PrewarmStrip() {
  return (
    <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      <div className="flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
        <span>✦ ALREADY SIGNED FOR OMENX</span>
        <Link
          to="/promo/world-cup"
          search={{ tab: "luckybox" }}
          className="flex items-center gap-1 text-zinc-400 hover:text-white"
        >
          BACK TO LUCKY BOX
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PREWARM_LEGENDS.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 border border-zinc-800 bg-zinc-950 p-3"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center border border-zinc-800 bg-black text-2xl">
              {p.flag}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-pitch text-sm font-bold uppercase tracking-wide text-white">
                  {p.name}
                </span>
                {!p.inMainPool && (
                  <span className="border border-zinc-700 px-1.5 py-px font-scoreboard text-[8px] font-bold tracking-[0.22em] text-zinc-400">
                    BONUS
                  </span>
                )}
              </div>
              <div className="font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
                {p.country.toUpperCase()}
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">{p.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}