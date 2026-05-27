import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { TeamLite } from "@/data/sports-mock";

/**
 * Reusable "Follow your team" crest grid. Used both in FansZoneEmpty
 * (onboarding) and the FanZoneHeader manage-teams dialog.
 */
export function FollowTeamsPanel({
  suggested,
  initialFollowed,
  onSave,
  title = "Follow your team",
  description = "Pick a few clubs and we'll surface their matches, polls, and fan posts here.",
  saveLabel = "Save preferences",
}: {
  suggested: TeamLite[];
  initialFollowed?: Set<string>;
  onSave?: (names: string[]) => void;
  title?: string;
  description?: string;
  saveLabel?: string;
}) {
  const [followed, setFollowed] = useState<Set<string>>(
    () => new Set(initialFollowed ?? []),
  );
  const toggle = (name: string) =>
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      <ul className="mt-4 grid grid-cols-5 gap-2">
        {suggested.map((team) => {
          const isFollowing = followed.has(team.name);
          return (
            <li key={team.name}>
              <button
                type="button"
                onClick={() => toggle(team.name)}
                aria-pressed={isFollowing}
                className="group flex w-full flex-col items-center gap-1.5"
              >
                <span
                  className="relative grid h-12 w-12 place-items-center rounded-full bg-white/[0.05] p-1.5 ring-1 ring-white/10 transition group-hover:ring-white/25"
                  style={{ boxShadow: `0 0 18px -6px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
                >
                  <img src={team.logo} alt="" className="h-full w-full object-contain" />
                  <span
                    className={`absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full ring-2 ring-surface transition ${
                      isFollowing
                        ? "bg-gradient-neon text-primary-foreground"
                        : "bg-white/[0.08] text-muted-foreground"
                    }`}
                  >
                    {isFollowing ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                  </span>
                </span>
                <span className="truncate text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                  {team.short}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground">
          {followed.size > 0 ? `${followed.size} selected` : "Tap a crest to follow"}
        </span>
        <button
          type="button"
          disabled={followed.size === 0}
          onClick={() => onSave?.([...followed])}
          className="rounded-full bg-gradient-neon px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-glow transition disabled:opacity-40"
        >
          {saveLabel}
        </button>
      </div>
    </section>
  );
}