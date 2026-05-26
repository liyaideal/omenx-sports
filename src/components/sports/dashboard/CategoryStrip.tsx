import { CATEGORIES } from "@/data/sports-markets";

export function CategoryStrip({ active = "all" }: { active?: string }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-6 pb-2 md:px-8">
      {CATEGORIES.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              isActive
                ? "bg-gradient-neon text-primary-foreground shadow-glow"
                : "bg-white/[0.04] text-muted-foreground ring-1 ring-white/10 hover:text-foreground"
            }`}
          >
            {("live" in c && c.live) && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.7_0.22_25)]" />}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}