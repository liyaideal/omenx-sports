import { useState } from "react";
import { Check, Copy, Lock } from "lucide-react";
import { toast } from "sonner";
import { NEWBIE_TASKS, INVITE_PROGRESS } from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

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

function TaskCard({ task }: { task: (typeof NEWBIE_TASKS)[number] }) {
  const done = task.status === "done";
  return (
    <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      <div className="flex items-start justify-between">
        <span className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
          {task.code}
        </span>
        <StatusPill status={task.status} />
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
            className="h-full bg-[oklch(0.7_0.18_145)]"
            style={{
              width: `${Math.round(task.progress * 100)}%`,
              boxShadow: "0 0 10px oklch(0.7 0.18 145 / 0.6)",
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {task.newOnly ? "New users only" : "All users"}
        </span>
        <button
          type="button"
          disabled={done}
          onClick={() => {
            if (done) return;
            toast.success(`${task.title} — opening flow`);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 border px-3 py-1.5 font-pitch text-[11px] font-bold uppercase tracking-[0.2em] transition-colors",
            done
              ? "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600"
              : "border-[oklch(0.7_0.18_145)] bg-transparent text-[oklch(0.7_0.18_145)] hover:bg-[oklch(0.7_0.18_145)] hover:text-black",
          )}
        >
          {done && <Check className="h-3 w-3" />}
          {task.cta}
        </button>
      </div>

      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5",
          done ? "bg-[oklch(0.7_0.18_145)]" : "bg-zinc-800",
        )}
      />
    </div>
  );
}

function StatusPill({ status }: { status: "todo" | "in-progress" | "done" }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-[oklch(0.7_0.18_145)]/40 bg-[oklch(0.7_0.18_145)]/10 px-2 py-0.5 font-pitch text-[9px] font-bold uppercase tracking-widest text-[oklch(0.7_0.18_145)]">
        <Check className="h-2.5 w-2.5" /> Claimed
      </span>
    );
  }
  if (status === "todo") {
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