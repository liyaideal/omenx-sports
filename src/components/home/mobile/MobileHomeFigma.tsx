import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Share2,
  Volume2,
  Maximize2,
  PictureInPicture2,
  Info,
  Home as HomeIcon,
  Radio,
  Trophy,
  Star,
  User as UserIcon,
} from "lucide-react";

/**
 * Mobile home page — 1:1 port of Figma node 1:1382 / 1:1926.
 * Scoped tokens live in src/styles.css (--fm-*). Desktop is untouched.
 * Width target: 390 (iPhone). Card width 358 with 16px gutters.
 */
export function MobileHomeFigma() {
  const [tab, setTab] = useState<"stream" | "markets">("stream");
  const [posTab, setPosTab] = useState<"positions" | "open" | "history">("positions");

  return (
    <div
      className="min-h-dvh w-full font-archivo text-[var(--fm-text)]"
      style={{ background: "var(--fm-bg)" }}
    >
      <TopBar />

      <main className="px-4 pb-32">
        {/* Live Game header */}
        <SectionHeader label="Live Game" />

        {/* Live Card hero */}
        <LiveCard />

        {/* Stream / Markets tabs */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-[var(--fm-card-2)] p-1">
          {(["stream", "markets"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "h-9 rounded-[6px] text-[12px] font-bold uppercase tracking-[0.06em] transition",
                tab === t
                  ? "bg-[var(--fm-green)] text-black"
                  : "text-[var(--fm-muted)]",
              ].join(" ")}
            >
              {t === "stream" ? "Stream" : "Markets"}
            </button>
          ))}
        </div>

        {tab === "stream" ? <StreamPanel /> : <MarketsPanel />}

        {/* Live Tape */}
        <LiveTape />

        {/* Positions */}
        <div className="mt-4 flex items-center gap-2 rounded-md bg-[var(--fm-card-2)] p-1">
          {(
            [
              ["positions", "Positions", 3],
              ["open", "Open Orders", 2],
              ["history", "History", 12],
            ] as const
          ).map(([k, label, n]) => (
            <button
              key={k}
              type="button"
              onClick={() => setPosTab(k)}
              className={[
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[6px] text-[12px] font-bold uppercase tracking-[0.04em] transition",
                posTab === k
                  ? "bg-[var(--fm-green)] text-black"
                  : "text-[var(--fm-muted)]",
              ].join(" ")}
            >
              <span>{label}</span>
              <span
                className={[
                  "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px]",
                  posTab === k
                    ? "bg-black/25 text-black"
                    : "bg-white/10 text-[var(--fm-muted)]",
                ].join(" ")}
              >
                {n}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          <PositionCard side="USA YES" sideColor="green" />
          <PositionCard side="DRAW NO" sideColor="red" />
          <PositionCard side="USA YES" sideColor="green" voucher />
        </div>
      </main>

      <QuickBuyBar />
      <BottomNav />
    </div>
  );
}

/* -------------------------------------------------------- */

function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 flex h-11 items-center px-4"
      style={{ background: "#000" }}
    >
      <div className="flex items-center gap-2">
        <span className="font-bebas text-[20px] leading-none tracking-[0.04em] text-white">
          OMENX
        </span>
        <span className="text-[var(--fm-yellow)]">|</span>
        <span className="font-bebas text-[20px] leading-none tracking-[0.04em] text-[var(--fm-yellow)]">
          SPORTS
        </span>
      </div>
    </header>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex h-10 items-center gap-2 pt-[18px]" style={{ paddingBottom: 10 }}>
      <span className="h-[14px] w-[3px] rounded-[2px] bg-[var(--fm-green)]" />
      <span className="font-archivo text-[11px] font-black uppercase tracking-[0.08em] text-[var(--fm-green)]">
        {label}
      </span>
    </div>
  );
}

function LiveCard() {
  return (
    <article className="overflow-hidden rounded-[6px] border border-[var(--fm-border)] bg-[var(--fm-card)]">
      {/* Header strip with league pill + share */}
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-[var(--fm-text)]">
          <span className="grid h-3 w-3 place-items-center rounded-full bg-[var(--fm-green)] text-[8px] text-black">
            ★
          </span>
          World Cup 2026
        </span>
        <button
          type="button"
          aria-label="Share"
          className="grid h-7 w-7 place-items-center rounded-[4px] bg-[var(--fm-red)]/15 text-[var(--fm-red)]"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between px-3 pt-2">
        <TeamSide flag="🇺🇸" name="USA" />
        <div className="text-center">
          <div className="font-archivo text-[22px] font-black leading-none tracking-tight">
            2 — 0
          </div>
        </div>
        <TeamSide flag="🇲🇽" name="MEX" align="right" />
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-2 border-t border-[var(--fm-border-soft)]">
        <StatCell label="Total Volume" value="$3.62M" />
        <StatCell label="Live Players" value="2,746" border />
      </div>

      {/* Live dot */}
      <div className="flex items-center gap-1.5 px-3 pb-3 pt-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--fm-green)] shadow-[0_0_6px_var(--fm-green)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-green)]">
          Live
        </span>
      </div>
    </article>
  );
}

function TeamSide({ flag, name, align = "left" }: { flag: string; name: string; align?: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <span className="grid h-7 w-9 place-items-center rounded-[3px] bg-white/5 text-lg leading-none">
        {flag}
      </span>
      <span className="font-bebas text-[18px] leading-none tracking-[0.04em]">{name}</span>
    </div>
  );
}

function StatCell({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`px-3 py-2 ${border ? "border-l border-[var(--fm-border-soft)]" : ""}`}>
      <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--fm-muted)]">
        {label}
      </div>
      <div className="mt-0.5 font-archivo text-[16px] font-bold text-[var(--fm-text)]">
        {value}
      </div>
    </div>
  );
}

/* ---------------- Stream panel ---------------- */

function StreamPanel() {
  return (
    <section className="mt-3">
      {/* Stream still / hero */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-[6px] border border-[var(--fm-border)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg,#0b5b3b 0%,#1f8a3e 35%,#f7d046 65%,#d94343 100%)",
          }}
        />
        <div className="absolute inset-0 bg-black/25" />
        {/* Top overlay chips */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-[3px] bg-[var(--fm-red)] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white">
            <span className="h-1 w-1 rounded-full bg-white" /> WC · LIVE
          </span>
        </div>
        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-[3px] bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
          ▸ 00:43
        </div>
        {/* Big LIVE NOW */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center font-bebas leading-none">
            <div className="text-[44px] tracking-[0.04em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              LIVE{" "}
              <span className="text-[var(--fm-yellow)]">NOW</span>
            </div>
            <div className="mt-1 text-[10px] tracking-[0.3em] text-white/80">
              FIFA WORLD CUP 2026
            </div>
          </div>
        </div>
      </div>

      {/* Score strip + controls */}
      <div className="mt-2 flex items-center justify-between rounded-[6px] border border-[var(--fm-border-soft)] bg-[var(--fm-card)] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">🇺🇸</span>
          <span className="font-bebas text-[16px] tracking-[0.04em]">2 — 0</span>
          <span className="text-lg leading-none">🇲🇽</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.12em] text-[var(--fm-muted)]">
            Stream delayed
          </span>
          <Info className="h-3 w-3 text-[var(--fm-muted)]" />
          {[Volume2, PictureInPicture2, Maximize2].map((Icon, i) => (
            <button
              key={i}
              type="button"
              className="grid h-6 w-6 place-items-center rounded-[3px] bg-white/[0.06]"
            >
              <Icon className="h-3 w-3 text-[var(--fm-text)]" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Markets panel ---------------- */

function MarketsPanel() {
  return (
    <section className="mt-3 space-y-3">
      {/* Price history */}
      <div className="rounded-[6px] border border-[var(--fm-border)] bg-[var(--fm-card)] p-3">
        <div className="flex items-center justify-between">
          <span className="font-archivo text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fm-text)]">
            Price History
          </span>
          <div className="flex items-center gap-1">
            {["5M", "1H", "1D", "1W", "ALL"].map((r) => (
              <button
                key={r}
                className={[
                  "h-5 rounded-[3px] px-1.5 text-[9px] font-bold uppercase tracking-wider",
                  r === "1D"
                    ? "bg-[var(--fm-green)] text-black"
                    : "text-[var(--fm-muted)]",
                ].join(" ")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Faux chart */}
        <div className="relative mt-3 h-[110px]">
          <svg viewBox="0 0 320 110" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="fmGreen" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00e676" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#00e676" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fmRed" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ff4c4d" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ff4c4d" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fmYellow" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffca16" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ffca16" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 70 L40 65 L80 55 L120 60 L160 40 L200 35 L240 30 L280 28 L320 25 L320 110 L0 110 Z"
              fill="url(#fmGreen)"
            />
            <path
              d="M0 70 L40 65 L80 55 L120 60 L160 40 L200 35 L240 30 L280 28 L320 25"
              stroke="#00e676"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M0 80 L40 78 L80 82 L120 75 L160 78 L200 74 L240 76 L280 72 L320 70"
              stroke="#ffca16"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M0 95 L40 92 L80 90 L120 92 L160 90 L200 92 L240 95 L280 96 L320 98"
              stroke="#ff4c4d"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-4 text-[10px]">
          <Legend color="var(--fm-green)" label="USA" />
          <Legend color="var(--fm-yellow)" label="Draw" />
          <Legend color="var(--fm-red)" label="MEX" />
        </div>
      </div>

      {/* Order book — USA market */}
      <OrderBookCard
        team="USA"
        teamPrice="52¢"
        rows={[
          ["77", "2,012", "1,820", "75"],
          ["76", "1,840", "1,650", "74"],
          ["75", "1,210", "980", "73"],
          ["74", "640", "412", "72"],
        ]}
      />
      <OutcomeRow label="Draw" price="26¢" />
      <OutcomeRow label="Mexico" price="22¢" />
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[var(--fm-muted)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function OrderBookCard({
  team,
  teamPrice,
  rows,
}: {
  team: string;
  teamPrice: string;
  rows: [string, string, string, string][];
}) {
  return (
    <div className="rounded-[6px] border border-[var(--fm-border)] bg-[var(--fm-card)] p-3">
      <div className="flex items-center justify-between">
        <span className="font-archivo text-[11px] font-bold uppercase tracking-[0.08em]">
          Markets
        </span>
        <span className="text-[9px] text-[var(--fm-muted)]">Market #1</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-bebas text-[16px] tracking-[0.04em]">{team}</span>
        <span className="font-archivo text-[14px] font-black text-[var(--fm-green)]">
          {teamPrice}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[9px]">
        <span className="rounded-[3px] bg-[var(--fm-green)]/15 px-1.5 py-0.5 font-bold text-[var(--fm-green)]">
          BUY
        </span>
        <span className="rounded-[3px] bg-[var(--fm-red)]/15 px-1.5 py-0.5 font-bold text-[var(--fm-red)]">
          SELL
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[9px] uppercase tracking-wider text-[var(--fm-muted)]">
        <div className="text-center">United States Yes Bids</div>
        <div className="text-center">United States No Bids</div>
      </div>
      <div className="mt-1 space-y-0.5">
        {rows.map(([yp, yq, nq, np], i) => (
          <div key={i} className="grid grid-cols-4 text-[10px] tabular-nums">
            <div className="text-[var(--fm-green)]">{yp}¢</div>
            <div className="text-right text-[var(--fm-muted)]">{yq}</div>
            <div className="text-left text-[var(--fm-muted)]">{nq}</div>
            <div className="text-right text-[var(--fm-red)]">{np}¢</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutcomeRow({ label, price }: { label: string; price: string }) {
  return (
    <div className="flex items-center justify-between rounded-[6px] border border-[var(--fm-border-soft)] bg-[var(--fm-card)] px-3 py-2">
      <span className="font-archivo text-[12px] font-bold text-[var(--fm-text)]">— {label}</span>
      <div className="flex items-center gap-2">
        <span className="font-archivo text-[13px] font-black">{price}</span>
        <span className="fm-chip-green rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold uppercase">
          Yes
        </span>
        <span className="fm-chip-red rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold uppercase">
          No
        </span>
      </div>
    </div>
  );
}

/* ---------------- Live Tape ---------------- */

function LiveTape() {
  const rows = [
    ["@neopilot", "Buy", "Draw", "5M", "30s"],
    ["@halt.69", "Sell", "Draw", "20M", "1m"],
    ["@kkforext", "Buy", "Mexico", "20M", "40s"],
    ["@user.69", "Buy", "Draw", "25M", "3s"],
    ["@fer.jaad", "Sell", "Draw", "25M", "1m"],
    ["@diff0", "Buy", "Mexico", "35M", "12s"],
    ["@solareduh", "Buy", "Draw", "25M", "1s"],
    ["@x_user_x", "Sell", "Mexico", "25M", "1s"],
  ];
  return (
    <section className="mt-4 rounded-[6px] border border-[var(--fm-border-soft)] bg-[var(--fm-card)] p-3">
      <div className="flex items-center justify-between">
        <span className="font-archivo text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--fm-text)]">
          Live Tape — Recent Fills
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-[var(--fm-green)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--fm-green)] shadow-[0_0_6px_var(--fm-green)]" />
          Live
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        {rows.map(([user, side, outcome, size, ago], i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_36px_60px_44px_28px] items-center gap-2 text-[10px] tabular-nums"
          >
            <span className="truncate text-[var(--fm-muted)]">{user}</span>
            <span
              className={[
                "rounded-[3px] px-1.5 py-0.5 text-center text-[9px] font-bold uppercase",
                side === "Buy" ? "fm-chip-green" : "fm-chip-red",
              ].join(" ")}
            >
              {side}
            </span>
            <span className="text-[var(--fm-text)]">{outcome}</span>
            <span className="text-right text-[var(--fm-text)]">{size}</span>
            <span className="text-right text-[var(--fm-muted)]">{ago}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Positions ---------------- */

function PositionCard({
  side,
  sideColor,
  voucher,
}: {
  side: string;
  sideColor: "green" | "red";
  voucher?: boolean;
}) {
  return (
    <article className="rounded-[6px] border border-[var(--fm-border-soft)] bg-[var(--fm-card)] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {voucher && (
            <span className="inline-flex items-center gap-1 rounded-[3px] bg-[var(--fm-yellow)]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--fm-yellow)]">
              🎟 Voucher
            </span>
          )}
          <span className="font-archivo text-[12px] font-bold">United States vs Mexico</span>
        </div>
        <span
          className={[
            "rounded-[3px] px-1.5 py-0.5 text-[9px] font-black uppercase",
            sideColor === "green" ? "fm-chip-green" : "fm-chip-red",
          ].join(" ")}
        >
          {side}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <Field label="Size" value="180" />
        <Field label="Entry" value="42¢" />
        <Field label="Mark" value="42.9¢" />
        <Field label="Leverage" value="3×" />
        <Field label="Margin" value="60" />
        <Field label="Liq" value="28¢" valueColor="var(--fm-red)" />
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-[var(--fm-border-soft)] pt-2 text-[10px]">
        <span className="text-[var(--fm-muted)]">+TP/SL ▾</span>
        <span>
          <span className="text-[var(--fm-muted)]">PNL </span>
          <span className="font-bold text-[var(--fm-green)]">+1.64</span>{" "}
          <span className="text-[var(--fm-muted)]">ROE </span>
          <span className="font-bold text-[var(--fm-green)]">+2.7%</span>
        </span>
        <button className="rounded-[3px] bg-white/[0.06] px-2 py-1 text-[10px] font-bold uppercase text-[var(--fm-text)]">
          Close
        </button>
      </div>

      {voucher && (
        <div className="mt-2 rounded-[3px] bg-white/[0.04] px-2 py-1 text-[9px] text-[var(--fm-muted)]">
          Voucher positions don't support TP/SL.
        </div>
      )}
    </article>
  );
}

function Field({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.08em] text-[var(--fm-muted)]">{label}</div>
      <div
        className="mt-0.5 font-archivo text-[12px] font-bold"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------- Quick Buy + Bottom Nav ---------------- */

function QuickBuyBar() {
  return (
    <div className="fixed inset-x-0 bottom-[56px] z-30 border-t border-[var(--fm-border-soft)] bg-[var(--fm-card)] px-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] uppercase tracking-[0.1em] text-[var(--fm-muted)]">
            Trading · United States
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-bebas text-[28px] leading-none tracking-[0.02em] text-[var(--fm-green)]">
              46¢
            </span>
            <span className="text-[10px] font-bold text-[var(--fm-green)]">+30</span>
          </div>
        </div>
        <button className="h-10 rounded-[6px] bg-[var(--fm-green)] px-5 text-[12px] font-black uppercase tracking-[0.08em] text-black">
          Quick Buy
        </button>
      </div>
    </div>
  );
}

function BottomNav() {
  const items = [
    { icon: HomeIcon, label: "Home", active: true, to: "/" as const },
    { icon: Radio, label: "Live", to: "/events" as const, dot: true },
    { icon: Trophy, label: "World Cup", to: "/promo/world-cup" as const, big: true },
    { icon: Star, label: "Fans", to: "/fans" as const },
    { icon: UserIcon, label: "Me", to: "/" as const },
  ];
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid h-14 grid-cols-5 border-t border-[var(--fm-border-soft)]"
      style={{ background: "#000" }}
    >
      {items.map(({ icon: Icon, label, active, to, dot, big }) => (
        <Link
          key={label}
          to={to}
          className="relative flex flex-col items-center justify-center gap-0.5"
        >
          <Icon
            className={[
              big ? "h-5 w-5" : "h-4 w-4",
              active ? "text-[var(--fm-green)]" : "text-[var(--fm-muted)]",
            ].join(" ")}
          />
          {dot && (
            <span className="absolute right-[28%] top-2 h-1.5 w-1.5 rounded-full bg-[var(--fm-red)]" />
          )}
          <span
            className={[
              "text-[9px] font-bold uppercase tracking-[0.06em]",
              active ? "text-[var(--fm-green)]" : "text-[var(--fm-muted)]",
            ].join(" ")}
          >
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}