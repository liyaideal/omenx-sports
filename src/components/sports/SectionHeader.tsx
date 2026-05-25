import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string };
  tabs?: { label: string; active?: boolean }[];
  className?: string;
}

export function SectionHeader({ kicker, title, description, action, tabs, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {kicker && (
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neon">{kicker}</div>
        )}
        <h2 className="mt-1 font-display font-bold text-2xl text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {tabs && (
          <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/5">
            {tabs.map((t) => (
              <button
                key={t.label}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  t.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        {action && (
          <a
            href={action.href ?? "#"}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {action.label}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}