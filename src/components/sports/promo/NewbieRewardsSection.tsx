import { useState } from "react";
import { Check, Copy, Lock, ArrowUpRight, Gift } from "lucide-react";
import { toast } from "sonner";
import {
  NEWBIE_TASKS,
  INVITE_PROGRESS,
  type NewbieTask,
} from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

type TaskStatus = NewbieTask["status"];

export function NewbieRewardsSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {NEWBIE_TASKS.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>
      <InvitePanel />
    </div>
  );
}

/**
 * Welcome-pack task card. Rewards are NEVER auto-credited — even when the
 * threshold is met, the user MUST click `Claim` to receive the voucher.
 * Four states: locked → in-progress → claimable → claimed.
 */
export function TaskCard({ task }: { task: NewbieTask }) {
  const claimed = task.status === "claimed";
  const claimable = task.status === "claimable";
  const locked = task.status === "locked";
  const [hasClaimed, setHasClaimed] = useState(false);
  const effectiveClaimed = claimed || hasClaimed;
  return (
    <div className="relative flex h-full flex-col overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      <div className="flex items-start justify-between">
        <span className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
          {task.code}
        </span>
        <StatusPill status={effectiveClaimed ? "claimed" : task.status} />
      </div>
      <h3 className="mt-3 font-pitch text-lg font-bold uppercase tracking-wide text-white">
        {task.title}
      </h3>
      <p className="mt-1 text-sm text-zinc-400">{task.description}</p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          <span className="text-[oklch(0.7_0.18_145)]">{task.rewardLabel}</span>
          <span>{Math.round(task.progress * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className={cn(
              "h-full",
              locked ? "bg-zinc-700" : "bg-[oklch(0.7_0.18_145)]",
            )}
            style={{
              width: `${Math.round(task.progress * 100)}%`,
              boxShadow: locked ? "none" : "0 0 10px oklch(0.7 0.18 145 / 0.6)",
            }}
          />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {task.newOnly ? "New users only" : "All users"}
        </span>
        <TaskCta
          task={task}
          claimed={effectiveClaimed}
          claimable={claimable}
          locked={locked}
          onClaim={() => {
            setHasClaimed(true);
            toast.success(`${task.rewardLabel} credited to your Wallet`);
          }}
        />
      </div>

      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5",
          effectiveClaimed || claimable ? "bg-[oklch(0.7_0.18_145)]" : "bg-zinc-800",
        )}
      />
    </div>
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  if (status === "claimed") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-[oklch(0.7_0.18_145)]/40 bg-[oklch(0.7_0.18_145)]/10 px-2 py-0.5 font-pitch text-[9px] font-bold uppercase tracking-widest text-[oklch(0.7_0.18_145)]">
        <Check className="h-2.5 w-2.5" /> Claimed
      </span>
    );
  }
  if (status === "claimable") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-[oklch(0.7_0.18_145)]/60 bg-[oklch(0.7_0.18_145)]/15 px-2 py-0.5 font-pitch text-[9px] font-bold uppercase tracking-widest text-[oklch(0.7_0.18_145)] animate-pulse">
        <Gift className="h-2.5 w-2.5" /> Ready to claim
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-pitch text-[9px] font-bold uppercase tracking-widest text-zinc-500">
        <Lock className="h-2.5 w-2.5" /> Locked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-pitch text-[9px] font-bold uppercase tracking-widest text-amber-400">
      In progress
    </span>
  );
}

function TaskCta({
  task,
  claimed,
  claimable,
  locked,
  onClaim,
}: {
  task: NewbieTask;
  claimed: boolean;
  claimable: boolean;
  locked: boolean;
  onClaim: () => void;
}) {
  const baseClass =
    "inline-flex items-center gap-1.5 border px-3 py-1.5 font-pitch text-[11px] font-bold uppercase tracking-[0.2em] transition-colors";

  if (claimed) {
    return (
      <button
        type="button"
        disabled
        className={cn(baseClass, "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600")}
      >
        <Check className="h-3 w-3" />
        Claimed
      </button>
    );
  }

  if (locked) {
    return (
      <button
        type="button"
        disabled
        className={cn(baseClass, "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600")}
      >
        <Lock className="h-3 w-3" />
        Locked
      </button>
    );
  }

  if (claimable) {
    return (
      <button
        type="button"
        onClick={onClaim}
        className={cn(
          baseClass,
          "border-[oklch(0.7_0.18_145)] bg-[oklch(0.7_0.18_145)] text-black hover:brightness-110",
        )}
      >
        <Gift className="h-3 w-3" />
        Claim {task.rewardLabel.replace(" Position Voucher", "")}
      </button>
    );
  }

  // in-progress — link to action surface
  const actionClass = cn(
    baseClass,
    "border-[oklch(0.7_0.18_145)] bg-transparent text-[oklch(0.7_0.18_145)] hover:bg-[oklch(0.7_0.18_145)] hover:text-black",
  );

  if (task.ctaHref && task.ctaExternal) {
    return (
      <a
        href={task.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={actionClass}
      >
        {task.cta}
        <ArrowUpRight className="h-3 w-3" />
      </a>
    );
  }

  if (task.ctaHref) {
    // Internal sports sub-domain link. Use <a> with hard nav so query strings
    // and route activation behave consistently with the league page.
    return (
      <a href={task.ctaHref} className={actionClass}>
        {task.cta}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toast.success(`${task.title} — opening flow`)}
      className={actionClass}
    >
      {task.cta}
    </button>
  );
}

function InvitePanel() {
  const [copied, setCopied] = useState(false);
  const pct = (INVITE_PROGRESS.current / INVITE_PROGRESS.max) * 100;
  const earned = INVITE_PROGRESS.current * INVITE_PROGRESS.voucherPerFriend;
  const max = INVITE_PROGRESS.max * INVITE_PROGRESS.voucherPerFriend;
  function copy() {
    navigator.clipboard?.writeText("https://omenx.app/invite/JEREMY-WC26").catch(() => {});
    setCopied(true);
    toast.success("Invite link copied");
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <div className="border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
            INVITE PROGRESS
          </div>
          <h3 className="font-pitch text-lg font-bold uppercase tracking-wide text-white">
            {INVITE_PROGRESS.current} / {INVITE_PROGRESS.max} friends · earned{" "}
            <span className="text-[oklch(0.7_0.18_145)]">{earned} U</span> of {max} U
          </h3>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex w-full items-center justify-center gap-2 border border-[oklch(0.7_0.18_145)] bg-[oklch(0.7_0.18_145)] px-4 py-2 font-pitch text-xs font-bold uppercase tracking-[0.2em] text-black hover:brightness-110 sm:w-auto"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy invite link"}
        </button>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
        <div
          className="h-full bg-[oklch(0.7_0.18_145)]"
          style={{ width: `${pct}%`, boxShadow: "0 0 10px oklch(0.7 0.18 145 / 0.6)" }}
        />
      </div>
    </div>
  );
}