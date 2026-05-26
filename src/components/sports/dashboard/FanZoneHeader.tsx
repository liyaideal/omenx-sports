import { CalendarDays, ChevronDown, Plus } from "lucide-react";

export function FanZoneHeader({ title = "Fan Zone" }: { title?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-neon px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow">
          <CalendarDays className="h-3.5 w-3.5" />
          Newest
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button aria-label="New post" className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-white/20 text-muted-foreground hover:text-foreground">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
