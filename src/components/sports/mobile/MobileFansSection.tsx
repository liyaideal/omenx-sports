import { useState } from "react";
import { Check, Clock, Plus, TrendingDown, TrendingUp, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { TeamPickerSheet } from "@/components/sports/dashboard/TeamPickerSheet";
import {
  FOLLOWED_TEAMS,
  LIVE_TRADES,
  TEAMS,
  type LiveTrade,
  type TeamLite,
} from "@/data/sports-mock";

// Figma roster: KOR / CAN / CZE / USA / BIH (overrides desktop SUGGESTED_TEAMS
// just for this mobile shelf — desktop unchanged).
const FANS_SUGGESTED: TeamLite[] = [
  TEAMS.koreaRep,
  TEAMS.canada,
  TEAMS.czechia,
  TEAMS.usa,
  TEAMS.bosnia,
];

/**
 * Mobile /fans page — 1:1 Figma frame 1:10216.
 * Desktop/data/business logic unchanged; this is a presentation-only mobile
 * rebuild. Interactions (Add Teams → TeamPickerSheet, crest toggle, Save toast)
 * mirror the desktop FanZoneHeader / FollowTeamsPanel.
 */
export function MobileFansSection() {
  return (
    <div className="space-y-4 px-4 pt-4 pb-6">
      <FansZoneHeaderBlock />
      <EditorPickCard />
      <FollowTeamCard />
      <LiveActivityBlock trades={LIVE_TRADES} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-3.5 w-[3px] rounded-sm bg-[#00e676]" />
      <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-[#00e676]">
        {children}
      </h2>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fans zone header                                                    */
/* ------------------------------------------------------------------ */

function FansZoneHeaderBlock() {
  const [open, setOpen] = useState(false);
  const [followed, setFollowed] = useState<string[]>(
    FOLLOWED_TEAMS.map((t) => t.name),
  );
  return (
    <header className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Fans zone</SectionLabel>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center rounded-full border border-white/20 bg-transparent px-3 py-1 text-[11px] font-medium text-white/85 transition hover:bg-white/[0.04]"
        >
          Add Teams
        </button>
      </div>
      <p className="text-[12px] text-white/50">
        Editor's pick · follow your team to personalize
      </p>
      <TeamPickerSheet
        open={open}
        onOpenChange={setOpen}
        variant="dialog"
        groups={[{ label: "Suggested", teams: FANS_SUGGESTED }]}
        initialFollowed={followed}
        title="Manage teams you follow"
        description="Tap a crest to follow or unfollow. We'll surface their matches, polls, and fan posts here."
        onSave={(names) => {
          setFollowed(names);
          toast.success(
            names.length > 0
              ? `Following ${names.length} team${names.length === 1 ? "" : "s"}`
              : "Cleared your followed teams",
          );
        }}
      />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Editor's pick — CAN vs BIH three-way card                           */
/* ------------------------------------------------------------------ */

interface PickOutcome {
  name: string;
  short: string;
  cents: number;
  delta: number;
  color: "blue" | "green" | "grey" | "red";
}

const PICK_HOME = TEAMS.canada;
const PICK_AWAY = TEAMS.bosnia;
const PICK_OUTCOMES: PickOutcome[] = [
  // Figma palette: Canada=blue, Draw=grey, Bosnia=green.
  { name: "Canada", short: "CAN", cents: 53, delta: 2, color: "blue" },
  { name: "Draw", short: "X", cents: 26, delta: 0, color: "grey" },
  { name: "Bosnia and Herzegovina", short: "BIH", cents: 22, delta: -2, color: "green" },
];

function EditorPickCard() {
  const dotColor = (c: PickOutcome["color"]) =>
    c === "blue"
      ? "bg-[#3b82f6]"
      : c === "green"
        ? "bg-[#00e676]"
        : c === "red"
          ? "bg-[#ff4c4d]"
          : "bg-white/40";
  const barColor = (c: PickOutcome["color"]) =>
    c === "blue"
      ? "bg-[#3b82f6]"
      : c === "green"
        ? "bg-[#00e676]"
        : c === "red"
          ? "bg-[#ff4c4d]"
          : "bg-white/25";

  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1318]">
      {/* Header strip with team flags */}
      <div className="relative">
        <div className="absolute inset-0 grid grid-cols-2">
          <div
            className="opacity-40"
            style={{
              backgroundImage: `url(${PICK_HOME.logo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="opacity-40"
            style={{
              backgroundImage: `url(${PICK_AWAY.logo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-[#0f1318]" />
        <div className="relative px-4 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#00e676]/60 bg-[#00e676]/[0.08] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#00e676]">
            <Trophy className="h-3 w-3" />
            World Cup
          </span>
          <div className="mt-3 flex items-center justify-between pb-5">
            <div className="flex items-center gap-2">
              <img
                src={PICK_HOME.logo}
                alt=""
                className="h-6 w-8 rounded-sm object-cover ring-1 ring-white/20"
              />
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                {PICK_HOME.short}
              </span>
            </div>
            <span className="text-xs uppercase tracking-wider text-white/45">
              vs
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                {PICK_AWAY.short}
              </span>
              <img
                src={PICK_AWAY.logo}
                alt=""
                className="h-6 w-8 rounded-sm object-cover ring-1 ring-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Probability bar */}
      <div className="flex h-[3px] w-full overflow-hidden">
        {PICK_OUTCOMES.map((o) => (
          <span
            key={o.short}
            className={barColor(o.color)}
            style={{ width: `${o.cents}%` }}
          />
        ))}
      </div>

      {/* Outcome rows */}
      <ul className="px-4 pt-1">
        {PICK_OUTCOMES.map((o) => (
          <li
            key={o.short}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`h-2 w-2 rounded-full ${dotColor(o.color)}`} />
              <span className="truncate text-sm text-white/85">{o.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-display text-base font-bold tabular-nums text-white">
                {o.cents}¢
              </span>
              <TrendPill delta={o.delta} />
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/[0.05] px-4 py-3 text-[11px] text-white/50">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Tomorrow 3:00pm
        </span>
        <span className="inline-flex items-center gap-3 font-mono">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            1,840
          </span>
          <span>Vol $208K</span>
        </span>
      </div>
    </article>
  );
}

function TrendPill({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex min-w-[42px] items-center justify-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/55">
        — 0¢
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex min-w-[46px] items-center justify-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
        up
          ? "bg-[#00e676]/12 text-[#00e676]"
          : "bg-[#ff4c4d]/12 text-[#ff4c4d]"
      }`}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
      ) : (
        <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
      )}
      {up ? "+" : ""}{delta}¢
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Follow your team                                                    */
/* ------------------------------------------------------------------ */

function FollowTeamCard() {
  const [followed, setFollowed] = useState<Set<string>>(
    () => new Set([TEAMS.koreaRep.name, TEAMS.czechia.name]),
  );
  const toggle = (name: string) =>
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  const save = () => {
    toast.success(
      followed.size > 0
        ? `Following ${followed.size} team${followed.size === 1 ? "" : "s"}`
        : "Cleared your followed teams",
    );
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0f1318] p-4">
      <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-white/55">
        Follow your team
      </h3>
      <p className="mt-1 text-[11px] leading-relaxed text-white/40">
        Pick a few clubs and we'll surface their matches, polls, and fan posts
        here.
      </p>

      <ul className="mt-4 grid grid-cols-5 gap-2">
        {FANS_SUGGESTED.map((team) => (
          <li key={team.name}>
            <CrestButton
              team={team}
              following={followed.has(team.name)}
              onClick={() => toggle(team.name)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[12px] text-white/45">
          Tap a crest to follow
        </span>
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-[#00e676] px-5 py-2 text-[13px] font-bold text-black transition active:scale-95 disabled:opacity-40"
          disabled={followed.size === 0}
        >
          Save
        </button>
      </div>
    </section>
  );
}

function CrestButton({
  team,
  following,
  onClick,
}: {
  team: TeamLite;
  following: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={following}
      className="group flex w-full flex-col items-center gap-2"
    >
      <span
        className={`relative grid h-12 w-12 place-items-center rounded-full bg-[#1a2026] p-1 ring-2 transition ${
          following ? "ring-[#00e676]" : "ring-white/10 group-hover:ring-white/25"
        }`}
      >
        <img
          src={team.logo}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full ring-2 ring-[#0f1318] ${
            following
              ? "bg-[#00e676] text-black"
              : "bg-white/[0.12] text-white/70"
          }`}
        >
          {following ? (
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            <Plus className="h-2.5 w-2.5" strokeWidth={3} />
          )}
        </span>
      </span>
      <span className="text-[11px] font-medium text-white/55 group-hover:text-white">
        {team.short}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Live activity                                                       */
/* ------------------------------------------------------------------ */

function LiveActivityBlock({ trades }: { trades: LiveTrade[] }) {
  const recent = trades.slice(0, 6);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Live activity</SectionLabel>
        <span className="rounded-full border border-white/15 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/70">
          9 in 5m
        </span>
      </div>
      <p className="text-[12px] text-white/55">
        Following · <span className="font-semibold text-white/85">United States, Mexico</span>
      </p>
      <ul className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1318]">
        {recent.map((t, i) => (
          <li
            key={t.id}
            className={
              i === 0 ? "px-3 py-2.5" : "border-t border-white/[0.05] px-3 py-2.5"
            }
          >
            <LiveTradeRow trade={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LiveTradeRow({ trade }: { trade: LiveTrade }) {
  const t = trade;
  return (
    <div className="flex items-start gap-2.5">
      {t.avatar ? (
        <img
          src={t.avatar}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
          style={{ background: `oklch(0.55 0.18 ${t.hue})` }}
        >
          {t.handle.replace("@", "").charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-semibold text-white">
            {t.handle}
          </span>
          <span className="shrink-0 font-mono text-[10px] uppercase text-white/40">
            {formatAgo(t.secondsAgo)}
          </span>
        </div>
        <div className="mt-px flex items-center gap-2">
          <span
            className={`text-[12px] font-bold ${
              t.side === "bought" ? "text-[#00e676]" : "text-[#ff4c4d]"
            }`}
          >
            {t.side === "bought" ? "Bought" : "Sold"}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-px font-mono text-[10px] ${
              t.side === "bought"
                ? "border border-[#00e676]/30 bg-[#00e676]/10 text-[#00e676]"
                : "border border-[#ff4c4d]/30 bg-[#ff4c4d]/10 text-[#ff4c4d]"
            }`}
          >
            {t.outcomeLabel} · {t.price}¢
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-white/40">
          {t.eventTitle}
        </p>
      </div>
    </div>
  );
}

function formatAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}