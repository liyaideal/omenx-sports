import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import type { TeamLite } from "@/data/sports-mock";
import { TeamPickerSheet, type TeamGroup } from "./TeamPickerSheet";

/**
 * Compact Fans Zone follow card for large catalogs (e.g. World Cup).
 * Shows a "Following (n)" header with up to 5 crest avatars; tapping
 * "+ Add teams" opens a full-screen TeamPickerSheet with search +
 * grouped multi-select.
 */
export function FollowTeamsCompact({
  groups,
  initialFollowed = [],
  title = "Follow your team",
  description,
  emptyHint = "Tap below to pick the squads you'll be cheering for.",
}: {
  groups: TeamGroup[];
  initialFollowed?: string[];
  title?: string;
  description?: string;
  emptyHint?: string;
}) {
  const allTeams: TeamLite[] = groups.flatMap((g) => g.teams);
  const [followed, setFollowed] = useState<string[]>(initialFollowed);
  const [open, setOpen] = useState(false);

  const followedTeams = allTeams.filter((t) => followed.includes(t.name));
  const totalAvailable = allTeams.length;

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {description ?? `${totalAvailable} teams · search by name or country code`}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/10">
          <Users className="h-3 w-3" />
          {followedTeams.length} following
        </span>
      </div>

      {followedTeams.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-center text-xs text-muted-foreground">
          {emptyHint}
        </p>
      ) : (
        <ul className="mt-4 flex items-center gap-2 overflow-x-auto">
          {followedTeams.slice(0, 6).map((team) => (
            <li key={team.name} className="flex shrink-0 flex-col items-center gap-1">
              <span
                className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10"
                style={{ boxShadow: `0 0 14px -6px oklch(0.7 0.22 ${team.hue} / 0.6)` }}
              >
                <img src={team.logo} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-[9px] font-medium text-muted-foreground">{team.short}</span>
            </li>
          ))}
          {followedTeams.length > 6 && (
            <li className="flex shrink-0 flex-col items-center gap-1">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] text-[10px] font-semibold text-foreground ring-1 ring-white/10">
                +{followedTeams.length - 6}
              </span>
              <span className="text-[9px] font-medium text-muted-foreground">more</span>
            </li>
          )}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-neon px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" />
        {followedTeams.length === 0 ? "Add teams" : "Manage teams"}
      </button>

      <TeamPickerSheet
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        initialFollowed={followed}
        onSave={(names) => {
          setFollowed(names);
          toast.success(
            names.length === 0
              ? "Cleared your followed teams"
              : `Following ${names.length} team${names.length === 1 ? "" : "s"}`,
          );
        }}
      />
    </section>
  );
}