import { ChevronDown, Users } from "lucide-react";

export function FanZoneHeader({
  title = "Fans zone",
  followingCount,
}: {
  title?: string;
  followingCount: number;
}) {
  const label =
    followingCount > 0
      ? `${followingCount} team${followingCount === 1 ? "" : "s"}`
      : "Add team";
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="min-w-0 truncate font-display text-2xl font-semibold leading-none">
        {title}
      </h2>
      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ring-1 ring-white/10 hover:text-foreground"
      >
        <Users className="h-3 w-3" />
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  );
}
