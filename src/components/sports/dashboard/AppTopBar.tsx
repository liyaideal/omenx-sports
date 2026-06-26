import { useState } from "react";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Gift,
  Globe,
  HelpCircle,
  LogOut,
  MessageCircle,
  Settings as SettingsIcon,
  Shield,
  Users,
} from "lucide-react";
import { omenxUrl, OMENX_BASE } from "@/lib/omenx";
import { Link } from "@tanstack/react-router";
import omenxLogo from "@/assets/omenx-logo.svg";
import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Español" },
  { code: "FR", label: "Français" },
  { code: "DE", label: "Deutsch" },
  { code: "PT", label: "Português" },
  { code: "JA", label: "日本語" },
];

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
  const [language, setLanguage] = useState("EN");

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

      <div className="flex w-full min-w-0 items-center justify-between gap-6 px-6 py-3 md:px-8">
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
                className="bg-gradient-to-br from-primary to-accent bg-clip-text pr-2 font-display text-2xl font-black italic uppercase tracking-normal text-transparent"
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
            <WorldCupCarnivalBadge />
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <a href={omenxUrl.account()}>
                  <Gift className="mr-2 h-4 w-4 text-primary" />
                  Rewards
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={omenxUrl.account()}>
                  <Users className="mr-2 h-4 w-4 text-primary" />
                  Referral
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a href={omenxUrl.settings()}>
                  <SettingsIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">Language</span>
                  <span className="ml-2 text-xs text-muted-foreground">{language}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            language === lang.code ? "text-primary" : "opacity-0"
                          }`}
                        />
                        {lang.code} — {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a href={omenxUrl.transparency()}>
                  <Shield className="mr-2 h-4 w-4 text-emerald-400" />
                  Transparency Audit
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://omenx-helpcenter.lovable.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">Help & Support</span>
                  <ExternalLink className="ml-2 h-3 w-3 text-muted-foreground" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://discord.gg/qXssm2crf9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-[#5865F2]" />
                  <span className="flex-1">Join Discord</span>
                  <ExternalLink className="ml-2 h-3 w-3 text-muted-foreground" />
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="text-loss">
                <a href={OMENX_BASE + "/"}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function WorldCupCarnivalBadge() {
  return (
    <Link
      to="/promo/world-cup"
      search={{ tab: "overview" }}
      aria-label="World Cup Carnival"
      className="group/wc relative hidden shrink-0 items-center gap-2.5 whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 transition-all hover:border-white/20 hover:bg-white/[0.06] xl:flex"
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <JerseyIcon className="h-7 w-7" />
        <span className="pointer-events-none absolute inset-x-0 top-[11px] text-center font-display text-[9px] font-black leading-none text-white">
          10
        </span>
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500/80" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-[1.5px] ring-[#0b0d12]" />
        </span>
      </span>
      <span className="flex flex-col items-start leading-[1.05]">
        <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/90">
          World Cup
        </span>
        <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/90">
          Carnival
        </span>
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-white/45 transition-transform group-hover/wc:translate-x-0.5 group-hover/wc:text-white/80" />
    </Link>
  );
}

function JerseyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7.5 3.2 4 4.6 2.6 8.3l2.6 1.2.7-1.6V20a1 1 0 0 0 1 1h10.2a1 1 0 0 0 1-1V7.9l.7 1.6 2.6-1.2L20 4.6l-3.5-1.4-1.5 2.1a3.5 3.5 0 0 1-6 0L7.5 3.2Z"
        fill="#5b6cff"
        stroke="#a8b4ff"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
