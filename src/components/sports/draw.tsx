import { Equal, type LucideIcon } from "lucide-react";
import type { Outcome } from "@/data/sports-markets";

/** Canonical draw glyph for 1X2 markets. Use everywhere a Draw outcome
 *  needs an icon so the visual treatment stays consistent. */
export const DrawIcon: LucideIcon = Equal;

export function isDrawOutcome(o: Outcome): boolean {
  return !o.team && (o.label === "Draw" || o.meta === "X");
}