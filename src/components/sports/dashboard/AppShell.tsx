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
    <div className={cn("relative min-h-screen bg-background bg-ambient", className)}>
      {/* top ambient halo */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(60%_100%_at_70%_100%,oklch(0.7_0.28_340/0.35),transparent_70%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}
