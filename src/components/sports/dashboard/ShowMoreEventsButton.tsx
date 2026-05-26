import { ChevronDown, ChevronUp } from "lucide-react";

interface ShowMoreEventsButtonProps {
  expanded: boolean;
  total: number;
  onToggle: () => void;
}

export function ShowMoreEventsButton({ expanded, total, onToggle }: ShowMoreEventsButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/40 py-3 text-sm font-medium text-muted-foreground transition hover:border-border/80 hover:bg-surface/70 hover:text-foreground"
    >
      {expanded ? (
        <>
          Show less <ChevronUp className="h-4 w-4" />
        </>
      ) : (
        <>
          Show all {total} events <ChevronDown className="h-4 w-4" />
        </>
      )}
    </button>
  );
}