import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Outer dashboard frame: a big rounded purple-black slab with a soft neon
 * halo across the top edge — the whole dashboard sits inside this card.
 */
export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div
        className={cn(
          "relative mx-auto max-w-[1480px] overflow-hidden rounded-[32px] border border-border bg-surface bg-ambient shadow-card",
          className,
        )}
      >
        {/* top ambient halo */}
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(60%_100%_at_70%_100%,oklch(0.7_0.28_340/0.35),transparent_70%)]" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
