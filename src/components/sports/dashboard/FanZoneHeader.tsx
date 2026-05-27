import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { toast } from "sonner";
import type { TeamLite } from "@/data/sports-mock";
import { TeamPickerSheet, type TeamGroup } from "./TeamPickerSheet";

export function FanZoneHeader({
  title = "Fans zone",
  followingCount,
  suggested,
  followedNames,
  groups,
  onFollowedChange,
}: {
  title?: string;
  followingCount: number;
  suggested: TeamLite[];
  followedNames?: string[];
  /** Optional grouped catalog. If omitted, `suggested` is wrapped as a single "Suggested" group. */
  groups?: TeamGroup[];
  /** Notified whenever the user saves a new follow set from the picker. */
  onFollowedChange?: (names: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [followed, setFollowed] = useState<string[]>(followedNames ?? []);
  // Local picker state is the source of truth once mounted; falls back to the
  // initial followingCount prop only when the parent didn't pass a list.
  const effectiveCount = followedNames !== undefined ? followed.length : followingCount;
  const label =
    effectiveCount > 0
      ? `${effectiveCount} team${effectiveCount === 1 ? "" : "s"}`
      : "Add team";
  const resolvedGroups: TeamGroup[] =
    groups ?? [{ label: "Suggested", teams: suggested }];
  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <h2 className="min-w-0 truncate font-display text-2xl font-semibold leading-9">
        {title}
      </h2>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-foreground"
      >
        <Users className="h-3 w-3" />
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
      <TeamPickerSheet
        open={open}
        onOpenChange={setOpen}
        variant="dialog"
        groups={resolvedGroups}
        initialFollowed={followed}
        title="Manage teams you follow"
        description="Tap a crest to follow or unfollow. We'll surface their matches, polls, and fan posts here."
        onSave={(names) => {
          setFollowed(names);
          onFollowedChange?.(names);
          toast.success(
            names.length > 0
              ? `Following ${names.length} team${names.length === 1 ? "" : "s"}`
              : "Cleared your followed teams",
          );
        }}
      />
    </div>
  );
}
