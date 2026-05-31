import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Unified "type" chip used at the top-left of every card inside a
 * single league / tournament hub. Replaces the older mix of league
 * chips, kicker captions and inline stage pills.
 *
 * Tone vocabulary:
 *   • amber  — stage / season-award markets (Group, Round, Season winner, Top scorer)
 *   • violet — derivative / editorial picks  (Player props, Featured props)
 */
export type CardChipTone = "amber" | "violet";

const TONE: Record<CardChipTone, string> = {
  amber:
    "bg-amber-300/10 text-amber-200 ring-amber-300/25",
  violet:
    "bg-[oklch(0.7_0.2_300_/_0.12)] text-[oklch(0.85_0.14_300)] ring-[oklch(0.7_0.2_300_/_0.28)]",
};

export function TypeChip({
  icon: Icon,
  label,
  tone = "amber",
}: {
  icon?: LucideIcon;
  label: string;
  tone?: CardChipTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ring-1 ${TONE[tone]}`}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}

/**
 * Canonical card header. Locks the "kicker row + title (+ optional
 * subtitle)" anatomy across every market card so chips never end up
 * in the top-right or floating centered above the title.
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ [chip]                              [status] │  kicker row
 *   │ Title goes here                              │
 *   │ optional subtitle                            │
 *   └──────────────────────────────────────────────┘
 *
 * • chip   — left-aligned TypeChip (or any kicker node). Omit for none.
 * • status — right-aligned status badge (Hot / Trending). Omit for none.
 * • title  — required. Pass a string for the default `font-display` heading,
 *            or a node for richer layouts (e.g. fixture rows).
 */
export function CardHeader({
  chip,
  status,
  title,
  subtitle,
  titleSize = "base",
  className = "",
}: {
  chip?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Controls the default text size when `title` is a string. */
  titleSize?: "sm" | "base" | "lg";
  className?: string;
}) {
  const hasKicker = Boolean(chip || status);
  const titleClass =
    titleSize === "lg"
      ? "text-lg"
      : titleSize === "sm"
        ? "text-sm"
        : "text-base";
  return (
    <header className={`min-w-0 ${className}`}>
      {hasKicker && (
        <div className="flex min-h-[22px] items-center justify-between gap-2">
          <div className="min-w-0">{chip}</div>
          <div className="shrink-0">{status}</div>
        </div>
      )}
      {typeof title === "string" ? (
        <h3
          className={`truncate font-display ${titleClass} font-semibold leading-tight text-foreground ${
            hasKicker ? "mt-2" : ""
          }`}
        >
          {title}
        </h3>
      ) : (
        <div className={hasKicker ? "mt-2" : ""}>{title}</div>
      )}
      {subtitle && (
        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {subtitle}
        </div>
      )}
    </header>
  );
}