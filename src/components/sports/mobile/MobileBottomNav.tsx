import { Home, CalendarDays, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTab = "home" | "events" | "fans" | "me";

const TABS: { key: MobileTab; label: string; icon: typeof Home; anchor?: string }[] = [
  { key: "home", label: "Home", icon: Home, anchor: "top" },
  { key: "events", label: "Events", icon: CalendarDays, anchor: "events" },
  { key: "fans", label: "Fans", icon: Users, anchor: "fans" },
  { key: "me", label: "Me", icon: User },
];

const triggerHaptic = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
};

/**
 * Fixed bottom navigation for the mobile sports zone. Only 4 tabs — Home,
 * Events, Fans, Me — so the bar reads as a single-zone tool, not a
 * universal app shell. "Me" opens a bottom sheet (account + bridge back
 * to OmenX); the other three scroll-to-section on the homepage.
 */
export function MobileBottomNav({
  active,
  onTabChange,
  onMeClick,
}: {
  active: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onMeClick: () => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          const handleClick = () => {
            triggerHaptic();
            if (tab.key === "me") {
              onMeClick();
              return;
            }
            onTabChange(tab.key);
            if (tab.anchor) {
              if (tab.anchor === "top") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                document
                  .getElementById(tab.anchor)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }
          };
          return (
            <button
              key={tab.key}
              type="button"
              onClick={handleClick}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 px-2 transition-transform active:scale-95",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}