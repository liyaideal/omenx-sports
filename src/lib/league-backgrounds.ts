import wc from "@/assets/league-bg/wc.jpg";
import ucl from "@/assets/league-bg/ucl.jpg";
import epl from "@/assets/league-bg/epl.jpg";
import ll from "@/assets/league-bg/ll.jpg";
import mls from "@/assets/league-bg/mls.jpg";

/** Atmospheric background images per league, keyed by league.short.
 *  Used by event header to convey the competition without relying on the
 *  league chip alone. */
export const LEAGUE_BG: Record<string, string> = {
  WC: wc,
  UCL: ucl,
  EPL: epl,
  LL: ll,
  MLS: mls,
};