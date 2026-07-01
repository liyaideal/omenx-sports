import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Sparkles, Gift, Ticket } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  LUCKY_BOX_TIERS,
  USER_CARNIVAL_STATE,
  type LuckyBoxTier,
  type LuckyBoxPrize,
} from "@/data/world-cup-carnival";
import { cn } from "@/lib/utils";

const ACCENT: Record<LuckyBoxTier["accent"], string> = {
  accent: "oklch(0.7 0.18 145)",
  amber: "#facc15",
  blue: "#60a5fa",
};

const MAX_THRESHOLD =
  LUCKY_BOX_TIERS[LUCKY_BOX_TIERS.length - 1]?.volumeUnlock ?? 5000;

type TicketMap = Record<string, number>;

/**
 * Mock-only: on first render, seed 1 ticket per tier whose threshold is
 * covered by today's volume. Real backend will grant tickets as volume
 * crosses each threshold and persist them across days.
 */
function deriveInitialTickets(volume: number): TicketMap {
  const t: TicketMap = {};
  LUCKY_BOX_TIERS.forEach((tier) => {
    t[tier.id] = volume >= tier.volumeUnlock ? 1 : 0;
  });
  return t;
}

export function LuckyBoxSection({
  volumeOverride,
}: {
  volumeOverride?: number;
} = {}) {
  const todayVolume = volumeOverride ?? USER_CARNIVAL_STATE.todayVolume;
  const [tickets, setTickets] = useState<TicketMap>(() =>
    deriveInitialTickets(todayVolume),
  );
  // If the volume override changes (style-guide fixtures), reseed.
  useEffect(() => {
    setTickets(deriveInitialTickets(todayVolume));
  }, [todayVolume]);

  const hasAnyTicket = useMemo(
    () => Object.values(tickets).some((n) => n > 0),
    [tickets],
  );
  const tokenPct = Math.max(
    0,
    Math.min(100, (todayVolume / MAX_THRESHOLD) * 100),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
        <Gift
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-blue-400/10"
        />
        <div className="relative font-scoreboard text-[10px] font-bold tracking-[0.25em] text-blue-400">
          SEC-03 · DAILY LUCKY BOX
        </div>
        <h3 className="relative mt-1 font-pitch text-xl font-bold uppercase tracking-wide text-white">
          Today's volume:{" "}
          <span className="font-scoreboard text-[oklch(0.7_0.18_145)] tabular-nums">
            {todayVolume.toLocaleString()} U
          </span>
        </h3>
        <p className="relative mt-1 text-sm text-zinc-400">
          Every time your daily volume crosses a tier threshold, you earn 1
          ticket for that vault. Tickets never expire — spend them any time.
        </p>
      </div>

      <VolumeLadder
        volume={todayVolume}
        tokenPct={tokenPct}
        tickets={tickets}
        hasAnyTicket={hasAnyTicket}
      />

      <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
        {LUCKY_BOX_TIERS.map((t) => {
          const remaining = Math.max(0, t.volumeUnlock - todayVolume);
          const reached = todayVolume >= t.volumeUnlock;
          const ticketCount = tickets[t.id] ?? 0;
          return (
            <TierCard
              key={t.id}
              tier={t}
              remaining={remaining}
              reached={reached}
              ticketCount={ticketCount}
              onConsumeTicket={() =>
                setTickets((prev) => ({
                  ...prev,
                  [t.id]: Math.max(0, (prev[t.id] ?? 0) - 1),
                }))
              }
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Volume Ladder ---------------- */

function VolumeLadder({
  volume,
  tokenPct,
  tickets,
  hasAnyTicket,
}: {
  volume: number;
  tokenPct: number;
  tickets: TicketMap;
  hasAnyTicket: boolean;
}) {
  // Highest tier the user has ever unlocked (via current tickets or today's volume).
  const topIdx = LUCKY_BOX_TIERS.reduce((acc, t, i) => {
    const unlockedNow = volume >= t.volumeUnlock;
    const hasTicket = (tickets[t.id] ?? 0) > 0;
    return unlockedNow || hasTicket ? i : acc;
  }, -1);
  const topTier = topIdx >= 0 ? LUCKY_BOX_TIERS[topIdx] : null;
  const activeColor = topTier ? ACCENT[topTier.accent] : "#facc15";

  // Express positions as `calc(... * (100% - 40px) + 20px)` so nodes align
  // with the track inset (px-5 padding).
  const posExpr = (pct: number) =>
    `calc(${pct.toFixed(3)}% * (100% - 40px) / 100% + 20px)`;
  const tokenAtEdge = tokenPct > 92;

  return (
    <div className="relative">
      <div className="relative h-16 overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] px-5 sm:h-14">
        <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-25" />

        {/* Track baseline */}
        <div className="absolute left-5 right-5 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className="h-full"
            style={{
              width: `${tokenPct}%`,
              background:
                "linear-gradient(90deg, oklch(0.7 0.18 145), #facc15)",
              boxShadow: `0 0 12px ${activeColor}`,
            }}
          />
        </div>

        {/* Nodes */}
        {LUCKY_BOX_TIERS.map((t, i) => {
          const pct = (t.volumeUnlock / MAX_THRESHOLD) * 100;
          const reached =
            volume >= t.volumeUnlock || (tickets[t.id] ?? 0) > 0;
          const color = ACCENT[t.accent];
          const isLast = i === LUCKY_BOX_TIERS.length - 1;
          // Alternate labels above/below to avoid collision when thresholds
          // sit close together (e.g. 100U vs 1,000U on a 5,000U scale).
          const labelBelow = i % 2 === 0;
          const labelPos = labelBelow ? "top-4" : "bottom-4";
          // Last node anchors its label to the right edge so it can't overflow.
          const labelAlign = isLast
            ? "right-0 translate-x-0 text-right"
            : "left-1/2 -translate-x-1/2";
          return (
            <div
              key={t.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: posExpr(pct) }}
            >
              <div
                className={cn(
                  "h-3 w-3 rotate-45",
                  !reached && "border border-dashed",
                )}
                style={{
                  background: reached ? color : "transparent",
                  borderColor: reached ? color : "rgb(82 82 91)",
                  boxShadow: reached ? `0 0 10px ${color}` : undefined,
                }}
              />
              <div
                className={cn(
                  "absolute whitespace-nowrap font-scoreboard text-[9px] font-bold tracking-[0.18em]",
                  labelPos,
                  labelAlign,
                )}
                style={{ color: reached ? color : "rgb(113 113 122)" }}
              >
                {t.volumeUnlock.toLocaleString()} U
              </div>
            </div>
          );
        })}

        {/* Token */}
        {volume > 0 && (
          <motion.div
            initial={{ left: "16px", opacity: 0 }}
            animate={{ left: posExpr(tokenPct), opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              tokenAtEdge ? "translate-x-[-90%]" : "-translate-x-1/2",
            )}
          >
            <div
              className="relative grid h-6 w-14 place-items-center sm:h-7 sm:w-16"
              style={{
                clipPath:
                  "polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%)",
                background: activeColor,
                boxShadow: `0 0 18px ${activeColor}`,
              }}
            >
              <span className="font-scoreboard text-[9px] sm:text-[10px] font-black italic tabular-nums text-black">
                {volume.toLocaleString()} U
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-2 font-pitch text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {hasAnyTicket ? (
          <span style={{ color: activeColor }}>
            Tickets ready · spend any time
          </span>
        ) : (
          <>
            Reach{" "}
            <span className="text-white">
              {LUCKY_BOX_TIERS[0]?.volumeUnlock.toLocaleString()} U
            </span>{" "}
            to earn your first ticket
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tier Card ---------------- */

function TierCard({
  tier,
  remaining,
  reached,
  ticketCount,
  onConsumeTicket,
}: {
  tier: LuckyBoxTier;
  remaining: number;
  reached: boolean;
  ticketCount: number;
  onConsumeTicket: () => void;
}) {
  const accent = ACCENT[tier.accent];
  const hasTicket = ticketCount > 0;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<LuckyBoxPrize | null>(null);
  const [scrollIdx, setScrollIdx] = useState(0);

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(
      () => setScrollIdx((i) => (i + 1) % tier.prizes.length),
      80,
    );
    return () => clearInterval(id);
  }, [spinning, tier.prizes.length]);

  function spin() {
    if (!hasTicket || spinning) return;
    setSpinning(true);
    setResult(null);
    const winner = drawPrize(tier.prizes);
    onConsumeTicket();
    setTimeout(() => {
      setSpinning(false);
      setResult(winner);
      toast.success(`${tier.name}: ${winner.label}`);
    }, 2200);
  }

  const reelLabel = result
    ? result.label
    : tier.prizes[scrollIdx]?.label ?? "—";

  const progressPct =
    reached || hasTicket
      ? 100
      : Math.min(
          100,
          Math.round(
            ((tier.volumeUnlock - remaining) / tier.volumeUnlock) * 100,
          ),
        );

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden border-2 bg-[#0a0a0a] p-5 transition-all",
        hasTicket && "z-[1]",
      )}
      style={{
        borderColor: hasTicket
          ? accent
          : reached
            ? "rgb(63 63 70)"
            : "rgb(39 39 42)",
        borderStyle: hasTicket || reached ? "solid" : "dashed",
        boxShadow: hasTicket ? `0 0 40px ${accent}40` : undefined,
      }}
    >
      {/* Spotlight cone when tickets available */}
      {hasTicket && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(120% 60% at 50% 0%, ${accent}40 0%, transparent 55%)`,
          }}
        />
      )}
      {/* Dim shroud when no ticket */}
      {!hasTicket && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] bg-black/55"
          style={{ backdropFilter: "grayscale(0.7)" }}
        />
      )}

      <div className="relative z-[3] flex items-center justify-between gap-2">
        <span
          className="font-scoreboard text-[10px] font-bold tracking-[0.25em]"
          style={{ color: hasTicket ? accent : "rgb(113 113 122)" }}
        >
          {tier.code}
        </span>
        {hasTicket && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 font-scoreboard text-[9px] font-bold tracking-[0.22em]"
            style={{ background: accent, color: "black" }}
          >
            <Ticket className="h-2.5 w-2.5" />×{ticketCount} TICKET
            {ticketCount > 1 ? "S" : ""}
          </div>
        )}
        {!hasTicket && !reached && (
          <div className="flex items-center gap-1 border border-dashed border-zinc-700 px-2 py-0.5 font-scoreboard text-[9px] font-bold tracking-[0.22em] text-zinc-500">
            +{remaining.toLocaleString()} U TO EARN
          </div>
        )}
      </div>
      <div className="relative z-[3] flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <h3 className="min-w-0 truncate font-pitch text-xl font-bold uppercase tracking-wide text-white">
          {tier.name}
        </h3>
        <span className="whitespace-nowrap font-pitch text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {tier.poolLabel}
        </span>
      </div>

      {/* Reel */}
      <div
        className="relative z-[3] grid h-24 place-items-center overflow-hidden border border-zinc-800 bg-black"
        aria-live="polite"
      >
        <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-25" />
        <div
          aria-hidden
          className="absolute inset-0 animate-scoreboard-sweep"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
          }}
        />
        <Trophy
          aria-hidden
          className="pointer-events-none absolute left-3 top-2 h-5 w-5 opacity-10"
          style={{ color: accent }}
        />
        <div
          className={cn(
            "relative font-scoreboard text-xl font-black italic tabular-nums",
            result?.hero && "text-amber-300",
            spinning && "animate-pulse",
          )}
          style={{
            color: result?.hero
              ? "#fde047"
              : hasTicket
                ? accent
                : "rgb(113 113 122)",
            filter: result?.hero
              ? "drop-shadow(0 0 14px rgba(253,224,71,0.7))"
              : `drop-shadow(0 0 10px ${hasTicket ? accent : "transparent"})`,
          }}
        >
          {result?.hero && <Sparkles className="mr-2 inline h-5 w-5" />}
          {reelLabel}
        </div>
      </div>

      <div className="relative z-[3]">
        <div className="mb-1.5 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          <span>
            {reached || hasTicket
              ? `Ticket earned at ${tier.volumeUnlock.toLocaleString()} U volume`
              : `+${remaining.toLocaleString()} U to earn a ticket`}
          </span>
          <span style={{ color: reached || hasTicket ? accent : undefined }}>
            {progressPct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className="h-full"
            style={{
              width: `${progressPct}%`,
              background: accent,
              boxShadow: reached || hasTicket ? `0 0 10px ${accent}` : undefined,
            }}
          />
        </div>
      </div>

      <ul className="relative z-[3] flex-1 space-y-1.5 border-t border-zinc-900 pt-3">
        {tier.prizes.map((p) => (
          <li
            key={p.label}
            className="flex items-center justify-between font-pitch text-xs"
          >
            <span className="flex min-w-0 items-center gap-1.5 text-zinc-300">
              {p.hero && <Trophy className="h-3 w-3 shrink-0 text-amber-400" />}
              <span className="truncate">{p.label}</span>
              {p.hero && tier.id === "grand" && p.label.toLowerCase().includes("signed") && (
                <Link
                  to="/promo/world-cup"
                  search={{ tab: "legend" }}
                  className="ml-1 shrink-0 border border-dashed border-amber-400/60 px-1.5 py-0.5 font-scoreboard text-[9px] font-bold tracking-[0.18em] text-amber-400 transition-colors hover:border-amber-400 hover:bg-amber-400/10"
                >
                  GUESS WHO'S NEXT →
                </Link>
              )}
            </span>
            <span className="font-scoreboard text-[10px] font-bold tabular-nums text-zinc-500">
              {(p.chance * 100).toFixed(p.chance < 0.05 ? 1 : 0)}%
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={spin}
        disabled={!hasTicket || spinning}
        className="relative z-[3] border-2 px-4 py-2.5 font-pitch text-xs font-bold uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: hasTicket ? accent : "rgb(39 39 42)",
          background: hasTicket ? accent : "transparent",
          color: hasTicket ? "black" : "rgb(113 113 122)",
        }}
      >
        {spinning
          ? "Spinning…"
          : hasTicket
            ? `Open vault ×${ticketCount}`
            : reached
              ? "Trade more to earn another ticket"
              : `+${remaining.toLocaleString()} U to earn a ticket`}
      </button>
    </div>
  );
}

function drawPrize(prizes: LuckyBoxPrize[]): LuckyBoxPrize {
  const total = prizes.reduce((a, p) => a + p.chance, 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= p.chance;
    if (r <= 0) return p;
  }
  return prizes[0];
}
