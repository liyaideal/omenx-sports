import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";

/**
 * Big tap target used at the bottom of each mobile homepage teaser to
 * jump into the full section (Events, Fans, etc).
 */
export function MobileSeeMoreCard({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: "/events" | "/fans";
  icon: LucideIcon;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-4 shadow-card transition active:scale-[0.99] hover:border-primary/40"
    >
      <span className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex flex-col">
          <span className="font-display text-sm font-semibold text-foreground">
            {label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {hint}
          </span>
        </span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}