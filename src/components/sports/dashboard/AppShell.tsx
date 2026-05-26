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
      <div className="relative">{children}</div>
    </div>
  );
}
