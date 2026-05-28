import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CalendarDays, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  key: "events" | "fans" | "me";
  label: string;
  icon: typeof Home;
  to?: "/events" | "/fans";
};

const TABS: Tab[] = [
  { key: "events", label: "Events", icon: CalendarDays, to: "/events" },
  { key: "fans", label: "Fans", icon: Users, to: "/fans" },
  { key: "me", label: "Me", icon: User },
];

const triggerHaptic = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
};

/**
 * Fixed bottom navigation for the mobile sports zone. 4 tabs — Home,
 * Events, Fans, Me. The first three are real TanStack Router routes; "Me"
 * opens a bottom sheet (account + bridge back to OmenX) owned by the
 * parent chrome.
 */
export function MobileBottomNav({ onMeClick }: { onMeClick: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.to ? pathname === tab.to : false;

          const inner = (
            <>
              {isActive && (
                <span className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_8px_var(--primary)]" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "text-primary drop-shadow-[0_0_6px_var(--primary)]",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest",
                  isActive ? "font-semibold text-foreground" : "font-medium",
                )}
              >
                {tab.label}
              </span>
            </>
          );

          const className = cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 px-2 transition-transform active:scale-95",
            isActive ? "text-foreground" : "text-muted-foreground",
          );

          if (tab.key === "me") {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onMeClick();
                }}
                className={className}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={tab.key}
              to={tab.to!}
              onClick={triggerHaptic}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}