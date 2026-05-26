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
      ? `Following · ${followingCount} team${followingCount === 1 ? "" : "s"}`
      : "Not following anyone";
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-semibold">
        {title}
        <span className="font-serif-display italic text-neon"> you</span>
      </h2>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ring-1 ring-white/10 hover:text-foreground"
      >
        <Users className="h-3 w-3" />
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  );
}
