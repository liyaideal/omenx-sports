import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LiveTrade, TeamKey, TeamLite } from "@/data/sports-mock";

interface LiveActivityCardProps {
  trades: LiveTrade[];
  /** Currently followed teams — used for filtering and the subtitle. */
  followedTeams: TeamLite[];
  /** Stable keys for filtering trades by `eventTeams`. */
  followedKeys: TeamKey[];
  /** Max rows to render. */
  limit?: number;
  seeAllHref: string;
}

export function LiveActivityCard({
  trades,
  followedTeams,
  followedKeys,
  limit = 5,
  seeAllHref,
}: LiveActivityCardProps) {
  const isFollowing = followedKeys.length > 0;
  const pool = useMemo(
    () =>
      isFollowing
        ? trades.filter((t) => t.eventTeams.some((k) => followedKeys.includes(k)))
        : trades,
    [trades, followedKeys, isFollowing],
  );

  // Live feed: deque of `limit` rows. Every `ROTATE_MS` we prepend the next
  // pool entry (cycling) with secondsAgo=0 and drop the tail. `tick` bumps
  // every second so timestamps age in real time.
  const ROTATE_MS = 4500;
  const [tick, setTick] = useState(0);
  const [cursor, setCursor] = useState(limit);
  const [feed, setFeed] = useState<LiveTrade[]>(() => pool.slice(0, limit));

  // Reset feed when the filter changes.
  useEffect(() => {
    setFeed(pool.slice(0, limit));
    setCursor(limit);
    setTick(0);
  }, [pool, limit]);

  // 1s aging tick.
  useEffect(() => {
    if (pool.length === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [pool.length]);

  // Rotation tick.
  useEffect(() => {
    if (pool.length <= limit) return;
    const id = setInterval(() => {
      setFeed((prev) => {
        const next = pool[cursor % pool.length];
        if (!next) return prev;
        const fresh: LiveTrade = { ...next, id: `${next.id}-${cursor}`, secondsAgo: 0 };
        return [fresh, ...prev].slice(0, limit);
      });
      setCursor((c) => c + 1);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [pool, cursor, limit]);

  if (feed.length === 0) return null;

  const subtitle = isFollowing
    ? `Following · ${followedTeams.map((t) => t.name).join(", ")}`
    : "Across all markets";
  const windowMin = Math.max(
    1,
    Math.round((pool[pool.length - 1]?.secondsAgo ?? 60) / 60),
  );

  return (
    <article className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card">
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

      <ul className="mt-4 divide-y divide-white/[0.05]">
        {feed.map((trade, idx) => (
          <li
            key={trade.id}
            className={
              idx === 0
                ? "animate-in fade-in slide-in-from-top-2 duration-500"
                : undefined
            }
          >
            <a
              href={trade.tradeHref}
              className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0 hover:bg-white/[0.02]"
            >
              <Avatar avatar={trade.avatar} handle={trade.handle} hue={trade.hue} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {trade.handle}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formatAgo(trade.secondsAgo + tick)}
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
        ))}
      </ul>

      <a
        href={seeAllHref}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        See all activity <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </article>
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