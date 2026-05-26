import { ChevronDown } from "lucide-react";
import { omenxUrl, OMENX_BASE } from "@/lib/omenx";
import omenxLogo from "@/assets/omenx-logo.svg";

const NAV = [
  { label: "Events", href: `${OMENX_BASE}/events` },
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
  equity?: string;
}) {
  const equityLabel = equity ?? "$0.00";

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
            href="/"
            aria-label="OmenX Sports"
            className="group flex flex-shrink-0 items-center gap-3 transition-opacity duration-300 hover:opacity-95"
          >
            <img
              src={omenxLogo}
              alt="OMENX"
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* Neon monolith divider */}
            <span
              aria-hidden
              className="relative hidden h-9 w-[3px] overflow-hidden rounded-full bg-white/5 sm:block"
            >
              <span
                className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-accent"
                style={{
                  boxShadow:
                    "0 0 12px color-mix(in oklab, var(--primary) 60%, transparent)",
                }}
              />
            </span>

            {/* Sports sub-brand lockup */}
            <span className="hidden flex-col items-start leading-none sm:flex">
              <span className="mb-1 ml-px text-[9px] font-bold uppercase tracking-[0.4em] text-white/30">
                Zone
              </span>
              <span
                className="bg-gradient-to-br from-primary to-accent bg-clip-text font-display text-2xl font-black italic uppercase tracking-tight text-transparent"
                style={{
                  filter:
                    "drop-shadow(0 0 15px color-mix(in oklab, var(--primary) 35%, transparent))",
                }}
              >
                Sports
              </span>
            </span>
          </a>

          <nav className="flex min-w-0 items-center gap-1">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                rel="noopener"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-foreground xl:px-4"
              >
                {item.label}
              </a>
            ))}
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
              {equityLabel}
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
