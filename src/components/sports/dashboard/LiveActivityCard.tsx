import { useMemo } from "react";
import type { LiveTrade, TeamKey, TeamLite } from "@/data/sports-mock";

interface LiveActivityCardProps {
  trades: LiveTrade[];
  /** Currently followed teams — used for filtering and the subtitle. */
  followedTeams: TeamLite[];
  /** Stable keys for filtering trades by `eventTeams`. */
  followedKeys: TeamKey[];
  /** Pixels-per-second scroll speed. */
  speed?: number;
}

export function LiveActivityCard({
  trades,
  followedTeams,
  followedKeys,
  speed = 24,
}: LiveActivityCardProps) {
  const isFollowing = followedKeys.length > 0;
  const pool = useMemo(
    () =>
      isFollowing
        ? trades.filter((t) => t.eventTeams.some((k) => followedKeys.includes(k)))
        : trades,
    [trades, followedKeys, isFollowing],
  );

  if (pool.length === 0) return null;

  const subtitle = isFollowing
    ? `Following · ${followedTeams.map((t) => t.name).join(", ")}`
    : "Across all markets";
  const windowMin = Math.max(
    1,
    Math.round((pool[pool.length - 1]?.secondsAgo ?? 60) / 60),
  );
  // Duration scales with content length so speed (px/s) stays consistent.
  // Approx row height ~76px including divider.
  const rowPx = 76;
  const trackPx = pool.length * rowPx;
  const durationS = Math.max(20, trackPx / speed);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card">
      <header className="flex items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <span
            aria-label="Live"
            className="h-2 w-2 animate-pulse rounded-full bg-[oklch(0.7_0.22_25)] shadow-[0_0_8px_oklch(0.7_0.22_25)]"
          />
          Live activity
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ring-1 ring-white/10">
          {trades.length} in {windowMin}m
        </span>
      </header>

      <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {subtitle}
      </p>

      <div className="group/marquee relative mt-4 min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]">
        <div className="absolute inset-x-0 top-0">
          <div
            className="flex flex-col will-change-transform group-hover/marquee:[animation-play-state:paused] motion-reduce:!animate-none"
            style={{ animation: `marquee-y ${durationS}s linear infinite` }}
          >
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1} className="divide-y divide-white/[0.05]">
                {pool.map((trade) => (
                  <TradeRow key={`${copy}-${trade.id}`} trade={trade} />
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes marquee-y { from { transform: translateY(0); } to { transform: translateY(-50%); } }`}</style>
    </article>
  );
}

function TradeRow({ trade }: { trade: LiveTrade }) {
  return (
    <li>
      <a
        href={trade.tradeHref}
        className="group flex items-start gap-3 py-3 hover:bg-white/[0.02]"
      >
        <Avatar avatar={trade.avatar} handle={trade.handle} hue={trade.hue} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {trade.handle}
            </span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {formatAgo(trade.secondsAgo)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span
              className={
                trade.side === "bought"
                  ? "shrink-0 font-medium text-win"
                  : "shrink-0 font-medium text-loss"
              }
            >
              {trade.side}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-foreground ring-1 ring-white/10">
              {trade.outcomeLabel}
              <span className="text-muted-foreground">·</span>
              {trade.price}¢
            </span>
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {trade.eventTitle}
          </div>
        </div>
      </a>
    </li>
  );
}

function Avatar({
  avatar,
  handle,
  hue,
}: {
  avatar: string | null;
  handle: string;
  hue: number;
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={handle}
        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10"
      />
    );
  }
  const initial = handle.replace(/^@/, "").charAt(0).toUpperCase();
  return (
    <div
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-foreground ring-1 ring-white/10"
      style={{ background: `oklch(0.35 0.12 ${hue})` }}
    >
      {initial}
    </div>
  );
}

function formatAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}