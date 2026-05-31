import type { LucideIcon } from "lucide-react";

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