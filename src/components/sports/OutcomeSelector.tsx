import { cn } from "@/lib/utils";
import { OutcomePill, type OutcomeTone } from "./OutcomePill";
import type { Team } from "@/lib/teams";

interface OutcomeSelectorProps {
  options: [
    { team?: Team; label?: string; probability: number },
    { team?: Team; label?: string; probability: number },
  ];
  /** Currently selected tone, or null. */
  value: OutcomeTone | null;
  onChange: (v: OutcomeTone) => void;
  className?: string;
}

export function OutcomeSelector({ options, value, onChange, className }: OutcomeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <OutcomePill
        team={options[0].team}
        label={options[0].label}
        probability={options[0].probability}
        tone="yes"
        size="lg"
        selected={value === "yes"}
        onClick={() => onChange("yes")}
      />
      <OutcomePill
        team={options[1].team}
        label={options[1].label}
        probability={options[1].probability}
        tone="no"
        size="lg"
        selected={value === "no"}
        onClick={() => onChange("no")}
      />
    </div>
  );
}