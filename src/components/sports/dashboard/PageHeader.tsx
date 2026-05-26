import { BarChart3, Filter, Users } from "lucide-react";

export function PageHeader({
  title,
  balance,
}: {
  title: string;
  balance: string;
}) {
  return (
    <div className="flex items-end justify-between px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">
      <h1 className="font-display text-4xl font-semibold md:text-5xl">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-black/30 text-xs">$</span>
          {balance}
        </div>
        <div className="hidden items-center gap-2 text-muted-foreground md:flex">
          <button aria-label="Friends" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.05] hover:text-foreground"><Users className="h-4 w-4" /></button>
          <button aria-label="Stats" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.05] hover:text-foreground"><BarChart3 className="h-4 w-4" /></button>
          <button aria-label="Filter" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.05] hover:text-foreground"><Filter className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
