import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trophy } from "lucide-react";

const SECTIONS = [
  {
    code: "RULE-00",
    title: "General 01",
    body: [
      "111 Total reward pool: 3,000,000 U across the three series. Each series has its own quota; eligible rewards stack across series.",
      "222 Effective volume = leveraged trades on supported markets with fee rate ≥ 0.04%.",
      "333 Position vouchers stay claimable for 7 days. Open positions opened with a voucher are valid for 72 hours.",
      "444 Sybil / wash trading / collusion / abuse disqualifies the account and forfeits rewards. OMENX reserves the final interpretation right.",
    ],
  },
  {
    code: "RULE-01",
    title: "Welcome Pack 02",
    body: [
      "T-01 – T-03 are new-user only. T-04 (invite) is open to all users.",
      "Rewards are credited within 15 minutes after task completion.",
      "Invite reward counts up to 10 valid invited users — max 500 U.",
    ],
  },
  {
    code: "RULE-02",
    title: "Combo Challenge",
    body: [
      "Each combo locks 10 U at the odds shown at submission time.",
      "All 3 legs must win. Combos pay 10 U × locked odds, capped at 50× (max 500 U).",
      "Max 3 combos per user. Identical combos may not be re-submitted.",
      "Markets within 30 minutes of kickoff are not eligible. Cancelled fixtures void the matching leg per page rules.",
    ],
  },
  {
    code: "RULE-03",
    title: "Lucky Box",
    body: [
      "Each tier grants 1 ticket the first time your daily volume crosses its threshold (Basic 100 U, Premium 1,000 U, Grand 5,000 U). Tiers are independent — hitting 5,000 U in one day earns tickets for all three tiers at once.",
      "Tickets never expire and are not cleared at day reset. Spend them any time from the Lucky Box tab.",
      "Opening a vault consumes 1 ticket for that tier only and draws from that tier's own prize pool. Prize odds are shown on every card.",
      "Volume does not carry over between days — a tier only grants a new ticket after a fresh day's volume crosses its threshold again.",
    ],
  },
];

export function CarnivalRulesSection() {
  return (
    <div className="relative overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] p-5">
      {/* Faint pitch stripes watermark */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-pitch-stripes" />
      {/* Oversized trophy watermark in the corner */}
      <Trophy
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-amber-400/[0.04]"
      />

      <div className="relative font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
        INFO · CARNIVAL RULES
      </div>
      <h3 className="relative mt-1 font-pitch text-xl font-bold uppercase tracking-wide text-white">
        How it works
      </h3>

      <Accordion type="multiple" defaultValue={["RULE-00"]} className="relative mt-4">
        {SECTIONS.map((s) => (
          <AccordionItem key={s.code} value={s.code} className="border-zinc-800">
            <AccordionTrigger className="font-pitch text-sm font-bold uppercase tracking-wide text-white">
              <span className="flex items-center gap-3">
                <span className="font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
                  {s.code}
                </span>
                {s.title}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-400">
                {s.body.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
