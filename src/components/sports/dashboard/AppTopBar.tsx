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
      <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-visible">
        <AnimatedJersey className="h-9 w-9" />
        <span className="pointer-events-none absolute right-[5px] top-[3px] z-10 inline-flex h-[7px] w-[7px]">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500/70" />
          <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-red-500 ring-[1.5px] ring-[#0b0d12]" />
        </span>
      </span>
      <span className="flex flex-col items-start leading-[1.1]">
        <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b9a7ff]">
          World Cup
        </span>
        <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b9a7ff]">
          Carnival
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-white/55 transition-transform group-hover/wc:translate-x-0.5 group-hover/wc:text-white/85" />
    </Link>
  );
}

function AnimatedJersey({ className }: { className?: string }) {
  return (
    <span className={`jf-stage ${className ?? ""}`} aria-hidden>
      <style>{JERSEY_CSS}</style>
      <span className="jf-halowrap">
        <svg className="jf-halosvg" viewBox="0 0 184 184">
          <defs>
            <radialGradient id="jfHalo2">
              <stop offset="0" stopColor="#fff0c0" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#ffd76a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffd76a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="jf-halo" cx="92" cy="92" r="62" fill="url(#jfHalo2)" />
        </svg>
      </span>
      <span className="jf-life">
        <span className="jf-sway">
          <svg className="jf-jsvg" viewBox="0 0 120 140">
            <defs>
              <linearGradient id="jfShine2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <path
                id="jfBody2"
                d="M34 30 L47 24 Q60 34 73 24 L86 30 L109 47 L94 66 L86 58 L86 105 L34 105 L34 58 L26 66 L11 47 Z"
              />
              <clipPath id="jfClip2">
                <use href="#jfBody2" />
              </clipPath>
            </defs>
            <use href="#jfBody2" fill="#6c5ce7" />
            <g clipPath="url(#jfClip2)">
              <rect x="20" y="0" width="11" height="140" fill="#4d3cc0" />
              <rect x="42" y="0" width="11" height="140" fill="#4d3cc0" />
              <rect x="64" y="0" width="11" height="140" fill="#4d3cc0" />
              <rect x="86" y="0" width="11" height="140" fill="#4d3cc0" />
              <path d="M11 47 L26 66 L30 61 L15 42 Z" fill="#ffd76a" />
              <path d="M109 47 L94 66 L90 61 L105 42 Z" fill="#ffd76a" />
              <rect x="31" y="99" width="58" height="5" fill="#ffd76a" />
              <path d="M46 27 L17 45" stroke="#ff6f9c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d="M74 27 L103 45" stroke="#ff6f9c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </g>
            <use href="#jfBody2" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
            <path d="M47 24 Q60 34 73 24" fill="none" stroke="#ffd76a" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M47 24 Q60 34 73 24" fill="none" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="45" cy="48" r="7" fill="#ffd76a" stroke="#e0a93a" strokeWidth="1" />
            <path
              d="M45 44 l1.4 2.9 3.2.4 -2.3 2.2 .6 3.1 -2.9-1.5 -2.9 1.5 .6-3.1 -2.3-2.2 3.2-.4 z"
              fill="#6c4a08"
            />
            <text
              x="64"
              y="93"
              fontSize="26"
              fontWeight="800"
              fill="#ffffff"
              stroke="#ffd76a"
              strokeWidth="0.8"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              10
            </text>
            <g clipPath="url(#jfClip2)">
              <rect className="jf-shine" x="0" y="-8" width="30" height="156" fill="url(#jfShine2)" />
            </g>
          </svg>
        </span>
      </span>
    </span>
  );
}

const JERSEY_CSS = `
.jf-stage{position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:visible;}
.jf-halowrap{position:absolute;inset:-40%;display:flex;align-items:center;justify-content:center;pointer-events:none;}
.jf-halosvg{width:160%;height:160%;overflow:visible;}
.jf-jsvg{width:100%;height:100%;display:block;overflow:visible;}
.jf-life{position:relative;width:78%;height:90%;display:flex;align-items:center;justify-content:center;transform-origin:center;animation:jf-life 4.5s ease-in-out infinite;}
.jf-sway{width:100%;height:100%;display:flex;align-items:center;justify-content:center;transform-origin:50% 8%;animation:jf-sway 4.5s ease-in-out infinite;}
.jf-halo{transform-box:fill-box;transform-origin:center;animation:jf-halo 4.5s ease-in-out infinite;}
.jf-shine{transform-box:fill-box;animation:jf-shine 4.5s ease-in-out infinite;}
@keyframes jf-life{0%{transform:scale(1)}22%{transform:scale(1.035)}44%{transform:scale(1)}56%{transform:scale(1.10)}63%{transform:scale(.985)}70%{transform:scale(1.025)}78%,100%{transform:scale(1)}}
@keyframes jf-sway{0%,100%{transform:skewX(1deg) rotate(.6deg)}50%{transform:skewX(-1deg) rotate(-.6deg)}}
@keyframes jf-halo{0%{transform:scale(.85);opacity:.4}22%{transform:scale(1.05);opacity:.8}44%{transform:scale(.85);opacity:.4}56%{transform:scale(1.22);opacity:1}70%{transform:scale(1);opacity:.6}100%{transform:scale(.85);opacity:.4}}
@keyframes jf-shine{0%,8%{transform:translateX(-72px) skewX(-16deg)}26%{transform:translateX(188px) skewX(-16deg)}100%{transform:translateX(188px) skewX(-16deg)}}
@media (prefers-reduced-motion: reduce){.jf-life,.jf-sway,.jf-halo,.jf-shine{animation:none}}
`;
