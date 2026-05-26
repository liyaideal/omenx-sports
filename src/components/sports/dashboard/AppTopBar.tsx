import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { omenxUrl, OMENX_BASE } from "@/lib/omenx";
import omenxLogo from "@/assets/omenx-logo.svg";

const NAV = [
  { label: "Events", href: `${OMENX_BASE}/events` },
  { label: "Sports", href: "/", active: true },
  { label: "Portfolio", href: omenxUrl.portfolio() },
  { label: "Leaderboard", href: `${OMENX_BASE}/leaderboard` },
  { label: "Insights", href: `${OMENX_BASE}/insights` },
];

export function AppTopBar({
  userName,
  userAvatar,
  equity,
}: {
  userName: string;
  userAvatar: string;
  equity?: number;
}) {
  const equityLabel = (equity ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/30 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(180deg, hsl(222 47% 8% / 0.98) 0%, hsl(222 47% 6% / 0.95) 100%)",
      }}
    >
      {/* top neon hairline — matches OmenX EventsDesktopHeader */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-6 px-4 py-3 lg:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex min-w-0 items-center gap-4 xl:gap-8">
          <a
            href={omenxUrl.home()}
            aria-label="OmenX"
            className="flex flex-shrink-0 items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:opacity-80"
          >
            <img src={omenxLogo} alt="OMENX" className="h-8 w-auto" />
          </a>

          <nav className="flex min-w-0 items-center gap-1">
            {NAV.map((item) => {
              const isActive = !!item.active;
              const isInternal = item.href.startsWith("/");
              const Tag: "a" = "a";
              return (
                <Tag
                  key={item.label}
                  href={item.href}
                  {...(isInternal ? {} : { rel: "noopener" })}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 xl:px-4",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(260_60%_55%/0.3)]"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-3 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Tag>
              );
            })}
          </nav>
        </div>

        {/* Right: Equity + Avatar */}
        <div className="flex min-w-0 items-center gap-2 xl:gap-4">
          <a
            href={omenxUrl.wallet()}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-border/50 bg-white/[0.04] px-3 py-2 transition-all duration-200 hover:border-win/40 hover:bg-win/5 xl:px-4"
          >
            <span className="hidden text-sm text-muted-foreground xl:inline">
              Equity:
            </span>
            <span className="font-mono text-sm font-bold text-win">
              ${equityLabel}
            </span>
          </a>

          <button
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.06] xl:gap-2.5 xl:px-3"
          >
            <img
              src={userAvatar}
              alt={userName}
              className="h-9 w-9 rounded-full border-2 border-primary/50 object-cover"
            />
            <span className="max-w-[64px] truncate text-sm font-medium text-foreground xl:max-w-[100px]">
              {userName}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
