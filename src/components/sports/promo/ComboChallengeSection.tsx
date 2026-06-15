import { useMemo, useState } from "react";
import { Plus, X, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import {
  COMBO_PICK_CATALOG,
  COMBO_SAMPLE_PICKS,
  COMBO_MAX_ODDS,
  COMBO_MAX_PICKS,
  COMBO_STAKE,
  COMBO_MAX_COMBOS_PER_USER,
  type ComboPick,
} from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

export function ComboChallengeSection() {
  const [picks, setPicks] = useState<(ComboPick | null)[]>(() => [
    COMBO_SAMPLE_PICKS[0],
    COMBO_SAMPLE_PICKS[1],
    null,
    null,
  ]);
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<ComboPick[][]>([]);

  const oddsRaw = picks.reduce<number>(
    (acc, p) => acc * (p ? p.odds : 1),
    1,
  );
  const odds = Math.min(oddsRaw, COMBO_MAX_ODDS);
  const cappedAt = oddsRaw > COMBO_MAX_ODDS;
  const filled = picks.filter(Boolean).length;
  const potential = Math.round(odds * COMBO_STAKE * 100) / 100;

  function setPick(i: number, p: ComboPick) {
    setPicks((prev) => {
      const next = [...prev];
      next[i] = p;
      return next;
    });
    setOpenSlot(null);
  }
  function clearPick(i: number) {
    setPicks((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  }
  function submit() {
    if (filled < COMBO_MAX_PICKS) {
      toast.error("Fill all 4 slots to submit a combo");
      return;
    }
    if (submitted.length >= COMBO_MAX_COMBOS_PER_USER) {
      toast.error(`Max ${COMBO_MAX_COMBOS_PER_USER} combos per user`);
      return;
    }
    setSubmitted((prev) => [...prev, picks.filter(Boolean) as ComboPick[]]);
    setPicks([null, null, null, null]);
    toast.success(`Combo locked at ${odds.toFixed(2)}× odds`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-2 border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
              SEC-02 · COMBO CHALLENGE
            </div>
            <h3 className="mt-1 font-pitch text-xl font-bold uppercase tracking-wide text-white">
              Stake 10 U · Land all 4 · Win up to {COMBO_MAX_ODDS}×
            </h3>
          </div>
          <div className="text-right">
            <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
              POTENTIAL PAYOUT
            </div>
            <div
              className="font-scoreboard text-3xl font-black italic tabular-nums text-amber-400"
              style={{ filter: "drop-shadow(0 0 8px rgba(250,204,21,0.5))" }}
            >
              {potential.toFixed(2)} U
            </div>
            <div className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              odds {odds.toFixed(2)}×{cappedAt && " (capped)"} · {filled}/4 picks
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {picks.map((p, i) => (
          <PickSlot
            key={i}
            index={i}
            pick={p}
            onPick={() => setOpenSlot(i)}
            onClear={() => clearPick(i)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-pitch text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {submitted.length}/{COMBO_MAX_COMBOS_PER_USER} combos submitted ·
          stake locks current odds
        </p>
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-2 border-2 border-amber-400 bg-amber-400 px-5 py-2.5 font-pitch text-sm font-bold uppercase tracking-[0.2em] text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={filled < COMBO_MAX_PICKS || submitted.length >= COMBO_MAX_COMBOS_PER_USER}
        >
          <Lock className="h-4 w-4" /> Lock in combo · 10 U
        </button>
      </div>

      {submitted.length > 0 && (
        <div className="border-2 border-zinc-800 bg-[#0a0a0a] p-5">
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-[oklch(0.7_0.18_145)]">
            LOCKED COMBOS
          </div>
          <div className="mt-3 space-y-3">
            {submitted.map((combo, idx) => {
              const o = Math.min(
                combo.reduce((a, p) => a * p.odds, 1),
                COMBO_MAX_ODDS,
              );
              return (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-2 border border-zinc-800 bg-black px-3 py-2"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {combo.map((p) => (
                      <span
                        key={p.marketId}
                        className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-pitch text-[10px] font-bold uppercase tracking-widest text-white"
                      >
                        {p.pickLabel} <span className="text-zinc-500">{p.odds.toFixed(2)}×</span>
                      </span>
                    ))}
                  </div>
                  <div className="font-scoreboard text-sm font-bold tabular-nums text-amber-400">
                    {o.toFixed(2)}× → {(o * COMBO_STAKE).toFixed(2)} U
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openSlot !== null && (
        <PickerSheet
          onClose={() => setOpenSlot(null)}
          onPick={(p) => setPick(openSlot, p)}
          taken={picks.filter(Boolean).map((p) => (p as ComboPick).marketId)}
        />
      )}
    </div>
  );
}

function PickSlot({
  index,
  pick,
  onPick,
  onClear,
}: {
  index: number;
  pick: ComboPick | null;
  onPick: () => void;
  onClear: () => void;
}) {
  if (!pick) {
    return (
      <button
        type="button"
        onClick={onPick}
        className="group flex h-44 flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-700 bg-[#0a0a0a] p-5 transition-colors hover:border-amber-400"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-500 group-hover:border-amber-400 group-hover:text-amber-400">
          <Plus className="h-5 w-5" />
        </span>
        <span className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
          SLOT {index + 1}
        </span>
        <span className="font-pitch text-xs font-semibold uppercase tracking-widest text-zinc-400 group-hover:text-amber-400">
          Pick an outcome
        </span>
      </button>
    );
  }
  return (
    <div className="relative flex h-44 flex-col justify-between border-2 border-amber-400/50 bg-[#0a0a0a] p-4">
      <div className="flex items-start justify-between">
        <span className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-amber-400">
          SLOT {index + 1}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="grid h-6 w-6 place-items-center rounded border border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-red-500 hover:text-red-500"
          aria-label="Clear slot"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div>
        <div className="font-pitch text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {pick.matchLabel}
        </div>
        <div className="mt-1 font-pitch text-lg font-bold uppercase tracking-wide text-white">
          {pick.pickLabel}
        </div>
        <div className="font-scoreboard text-[10px] font-bold tracking-widest text-zinc-500">
          {pick.kickoff}
        </div>
      </div>
      <div className="font-scoreboard text-2xl font-black italic tabular-nums text-amber-400">
        {pick.odds.toFixed(2)}×
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400" />
    </div>
  );
}

function PickerSheet({
  onClose,
  onPick,
  taken,
}: {
  onClose: () => void;
  onPick: (p: ComboPick) => void;
  taken: string[];
}) {
  const list = useMemo(
    () => COMBO_PICK_CATALOG.filter((p) => !taken.includes(p.marketId)),
    [taken],
  );
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border-2 border-zinc-800 bg-[#0a0a0a] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h4 className="font-pitch text-lg font-bold uppercase tracking-wide text-white">
            Pick an outcome
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <ul className="divide-y divide-zinc-800">
            {list.map((p) => (
              <li key={p.marketId}>
                <button
                  type="button"
                  onClick={() => onPick(p)}
                  className="group flex w-full items-center justify-between gap-4 px-1 py-3 text-left hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <div className="font-pitch text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      {p.matchLabel}
                    </div>
                    <div className="font-pitch text-sm font-bold uppercase tracking-wide text-white">
                      {p.pickLabel}{" "}
                      <span className="ml-1 font-mono text-[10px] text-zinc-500">
                        {p.kickoff}
                      </span>
                    </div>
                  </div>
                  <span className="font-scoreboard text-base font-bold tabular-nums text-amber-400">
                    {p.odds.toFixed(2)}×
                  </span>
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded border border-zinc-700 text-zinc-500",
                      "group-hover:border-amber-400 group-hover:text-amber-400",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}