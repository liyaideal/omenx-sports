import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";

interface RelatedMarketsBarProps {
  /** Other real events related to the current one. Excludes the current event. */
  markets: SportsMarket[];
  className?: string;
}

/**
 * Horizontal chip row of OTHER real events tied to the current event by
 * shared team / fixture. Each chip is a `<Link>` to that event's detail
 * page — no in-page swap. Renders nothing when the list is empty.
 */
export function RelatedMarketsBar({ markets, className }: RelatedMarketsBarProps) {
  if (markets.length === 0) return null;
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Related events
        </span>
        <div className="-mx-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {markets.map((m) => (
            <Link
              key={m.id}
              to="/event/$id"
              params={{ id: m.id }}
              className="shrink-0 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-foreground"
            >
              {m.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}