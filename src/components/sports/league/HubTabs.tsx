import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type HubView = "games" | "props" | "bracket";

export interface HubTab {
  view: HubView;
  label: string;
  /** Optional count shown as a small badge after the label. */
  count?: number;
}

/**
 * League hub sub-navigation. Driven by the `?view=` search param so URLs
 * are shareable. `bracket` is only rendered for tournament-kind leagues.
 */
export function HubTabs({
  slug,
  current,
  tabs,
}: {
  slug: string;
  current: HubView;
  tabs: HubTab[];
}) {
  return (
    <nav
      role="tablist"
      aria-label="League view"
      className="sticky top-0 z-30 -mx-1 flex gap-1 overflow-x-auto border-b border-border bg-background/85 px-1 py-2 backdrop-blur"
    >
      {tabs.map((t) => {
        const active = t.view === current;
        return (
          <Link
            key={t.view}
            to="/league/$slug"
            params={{ slug }}
            search={{ view: t.view }}
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition",
              active
                ? "bg-foreground text-background shadow-[0_0_18px_-4px_var(--primary)]"
                : "bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] hover:text-foreground",
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[9px] leading-none",
                  active
                    ? "bg-background/15 text-background"
                    : "bg-white/[0.06] text-muted-foreground",
                )}
              >
                {t.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}