import { Bell, Compass, Headset, Home, ListChecks, Search, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: Home, key: "home", active: true },
  { icon: Compass, key: "discover" },
  { icon: Headset, key: "support" },
  { icon: ListChecks, key: "bets" },
  { icon: Wallet, key: "wallet" },
];

export function AppTopBar({
  userName,
  userAvatar,
}: {
  userName: string;
  userAvatar: string;
}) {
  return (
    <header className="flex items-center gap-4 px-6 pt-6 md:px-8 md:pt-7">
      {/* logo */}
      <a href="/" aria-label="OmenX Sports" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-neon shadow-glow">
        <span className="font-display text-lg font-bold text-white">⚽</span>
      </a>

      {/* search */}
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search"
          className="h-11 w-full rounded-full border border-border bg-white/[0.04] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
        />
      </div>

      {/* nav */}
      <nav className="mx-auto hidden items-center gap-2 rounded-full border border-border bg-white/[0.03] px-2 py-1.5 md:flex">
        {NAV.map(({ icon: Icon, key, active }) => (
          <button
            key={key}
            aria-label={key}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full transition",
              active
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </nav>

      {/* user */}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground md:inline">Hi, {userName}</span>
        <div className="relative">
          <img
            src={userAvatar}
            alt={userName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
          />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-loss ring-2 ring-surface" />
        </div>
        <button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white/[0.03] text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <button aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white/[0.03] text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
