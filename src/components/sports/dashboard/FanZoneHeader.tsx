import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { toast } from "sonner";
import type { TeamLite } from "@/data/sports-mock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FollowTeamsPanel } from "./FollowTeamsPanel";

export function FanZoneHeader({
  title = "Fans zone",
  followingCount,
  suggested,
  followedNames,
}: {
  title?: string;
  followingCount: number;
  suggested: TeamLite[];
  followedNames?: string[];
}) {
  const [open, setOpen] = useState(false);
  const label =
    followingCount > 0
      ? `${followingCount} team${followingCount === 1 ? "" : "s"}`
      : "Add team";
  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <h2 className="min-w-0 truncate font-display text-2xl font-semibold leading-9">
        {title}
      </h2>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-foreground"
          >
            <Users className="h-3 w-3" />
            {label}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage teams you follow</DialogTitle>
            <DialogDescription>
              Tap a crest to follow or unfollow. We&apos;ll surface their matches, polls, and fan posts here.
            </DialogDescription>
          </DialogHeader>
          <FollowTeamsPanel
            suggested={suggested}
            initialFollowed={new Set(followedNames ?? [])}
            title=""
            description=""
            saveLabel="Save"
            onSave={(names) => {
              setOpen(false);
              toast.success(
                names.length > 0
                  ? `Following ${names.length} team${names.length === 1 ? "" : "s"}`
                  : "Cleared your followed teams",
              );
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
