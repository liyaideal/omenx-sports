import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StageTab {
  id: string;
  label: string;
  /** Optional badge / icon shown to the right of the label. */
  badge?: ReactNode;
  content: ReactNode;
}

interface StageTabsProps {
  tabs: StageTab[];
  /** Tab id to render first. Defaults to the first tab. */
  defaultTabId?: string;
  className?: string;
}

/**
 * Segmented tab bar used on the event detail page to share one vertical
 * slot between the live stream, the price chart and the order book. Keeps
 * the page from growing taller than a viewport on lg+ screens and lets the
 * user flip between contexts without scrolling.
 */
export function StageTabs({ tabs, defaultTabId, className }: StageTabsProps) {
  const initial = defaultTabId && tabs.some((t) => t.id === defaultTabId) ? defaultTabId : tabs[0]?.id;
  const [active, setActive] = useState<string | undefined>(initial);
  const activeTab = tabs.find((t) => t.id === active);
  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="tablist"
        aria-label="Event view"
        className="inline-flex rounded-full border border-border bg-surface/60 p-1 shadow-card"
      >
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition",
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {t.label}
              {t.badge}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{activeTab?.content}</div>
    </div>
  );
}