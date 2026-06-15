import { Link } from "@tanstack/react-router";
import { CARNIVAL_TABS, type CarnivalTab } from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

/**
 * LED-styled tab strip for the World Cup Carnival hub. Each tab renders as
 * a bordered cell with an Orbitron section code on top and the label
 * beneath. The active tab lights its bottom edge accent-green.
 */
export function CarnivalTabs({ current }: { current: CarnivalTab }) {
  return (
    <nav
      role="tablist"
      aria-label="Carnival sections"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
    >
      {CARNIVAL_TABS.map((t) => {
        const active = t.id === current;
        return (
          <Link
            key={t.id}
            to="/promo/world-cup"
            search={{ tab: t.id }}
            role="tab"
            aria-selected={active}
            className={cn(
              "group relative flex flex-col items-start gap-1 overflow-hidden border-2 bg-[#0a0a0a] px-3 py-3 transition-colors",
              active
                ? "border-[oklch(0.7_0.18_145)]"
                : "border-zinc-800 hover:border-zinc-600",
            )}
          >
            <span
              className={cn(
                "font-scoreboard text-[9px] font-bold tracking-[0.25em]",
                active ? "text-[oklch(0.7_0.18_145)]" : "text-zinc-500",
              )}
            >
              {t.sec}
            </span>
            <span
              className={cn(
                "font-pitch text-sm font-bold uppercase tracking-wide",
                active ? "text-white" : "text-zinc-300 group-hover:text-white",
              )}
            >
              {t.label}
            </span>
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 bottom-0 h-1 transition-all",
                active
                  ? "bg-[oklch(0.7_0.18_145)] shadow-[0_0_12px_oklch(0.7_0.18_145)]"
                  : "bg-zinc-800",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}