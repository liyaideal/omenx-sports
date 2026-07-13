/**
 * OmenX 主站演示引擎 (shared Supabase for all OmenX front-end blueprints).
 * Schema is owned by the main OmenX project — this file only calls existing
 * tables, RPCs and Edge Functions. Reference boundary doc lives in the main
 * repo at `docs/backend-boundary.md`.
 *
 * Never enable Supabase inside this Sports project. Never introduce schema
 * changes here. If a new table or column is required, request it upstream.
 */
import { createClient, type Session, type User } from "@supabase/supabase-js";

export const DEMO_ENGINE_URL = "https://lbrwdmnctmivgrsgdpqj.supabase.co";
// Public anon key — safe to ship in the browser. Row-level security enforced
// server-side by the main OmenX project.
export const DEMO_ENGINE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicndkbW5jdG1pdmdyc2dkcHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NjAzMDAsImV4cCI6MjA4MzIzNjMwMH0.RV_BjXITobIJhZa9up2x3aUzmLiVyJbwW46ATHCVcRU";

export const demoEngine = createClient(DEMO_ENGINE_URL, DEMO_ENGINE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window === "undefined" ? undefined : window.localStorage,
    storageKey: "omenx-sports-demo-session",
  },
});

export type DemoScenario = "matched" | "welcome";

export interface DemoProfile {
  id: string;
  user_id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  balance: number;
  trial_balance: number;
}

/**
 * Provision (or reuse) a demo account on the main site, then sign in.
 * Returns the resulting Supabase session.
 */
export async function signInDemo(scenario: DemoScenario): Promise<Session> {
  const res = await fetch(`${DEMO_ENGINE_URL}/functions/v1/ensure-demo-user`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: DEMO_ENGINE_ANON_KEY,
      authorization: `Bearer ${DEMO_ENGINE_ANON_KEY}`,
    },
    body: JSON.stringify({ scenario }),
  });
  if (!res.ok) throw new Error(`ensure-demo-user failed (${res.status})`);
  const { email, password } = (await res.json()) as {
    email: string;
    password: string;
  };
  const { data, error } = await demoEngine.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) throw error ?? new Error("Sign in failed");
  return data.session;
}

export async function signOutDemo(): Promise<void> {
  await demoEngine.auth.signOut();
}

/** Fetch this user's profile row (balance + trial_balance are the wallet). */
export async function fetchDemoProfile(user: User): Promise<DemoProfile | null> {
  const { data, error } = await demoEngine
    .from("profiles")
    .select(
      "id, user_id, username, email, avatar_url, balance, trial_balance",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as DemoProfile | null) ?? null;
}

/**
 * Trial Bonus first, then main balance. Returns the split so caller can
 * PATCH `profiles`.
 */
export function splitBalanceCharge(
  profile: Pick<DemoProfile, "balance" | "trial_balance">,
  amount: number,
): { fromTrial: number; fromBalance: number; ok: boolean } {
  const trial = Number(profile.trial_balance ?? 0);
  const bal = Number(profile.balance ?? 0);
  if (amount > trial + bal) {
    return { fromTrial: 0, fromBalance: 0, ok: false };
  }
  const fromTrial = Math.min(trial, amount);
  const fromBalance = amount - fromTrial;
  return { fromTrial, fromBalance, ok: true };
}

export function totalBalance(
  p: Pick<DemoProfile, "balance" | "trial_balance"> | null | undefined,
): number {
  if (!p) return 0;
  return Number(p.balance ?? 0) + Number(p.trial_balance ?? 0);
}

export interface PlaceDemoOrderInput {
  userId: string;
  eventName: string;
  optionId: string;
  optionLabel: string; // "Yes" | "No"
  price: number; // 0..1
  amount: number; // USDC
  profile: DemoProfile;
}

export interface PlaceDemoOrderResult {
  tradeId: string;
  positionId: string;
  quantity: number;
}

/**
 * Small-white-user market order:
 *   - full-margin, leverage=1, no fee
 *   - writes one `trades` row + one `positions` row
 *   - decrements profile balances (Trial first)
 * Assumes RLS allows the authenticated user to insert into their own rows
 * and update their own profile (main-site policy).
 */
export async function placeDemoOrder(
  input: PlaceDemoOrderInput,
): Promise<PlaceDemoOrderResult> {
  const { userId, eventName, optionId, optionLabel, price, amount, profile } =
    input;
  if (price <= 0 || price >= 1) throw new Error("Invalid price");
  if (amount <= 0) throw new Error("Enter an amount");
  const split = splitBalanceCharge(profile, amount);
  if (!split.ok) throw new Error("Insufficient balance");

  const quantity = amount / price;

  const { data: trade, error: tErr } = await demoEngine
    .from("trades")
    .insert({
      user_id: userId,
      event_name: eventName,
      option_label: optionLabel,
      side: "long",
      order_type: "market",
      price,
      amount,
      quantity,
      leverage: 1,
      margin: amount,
      fee: 0,
      status: "Filled",
    })
    .select("id")
    .single();
  if (tErr || !trade) throw tErr ?? new Error("Trade insert failed");

  const { data: pos, error: pErr } = await demoEngine
    .from("positions")
    .insert({
      user_id: userId,
      trade_id: trade.id,
      event_name: eventName,
      option_label: optionLabel,
      option_id: optionId,
      side: "long",
      entry_price: price,
      mark_price: price,
      size: quantity,
      margin: amount,
      leverage: 1,
      status: "Open",
    })
    .select("id")
    .single();
  if (pErr || !pos) throw pErr ?? new Error("Position insert failed");

  const { error: upErr } = await demoEngine
    .from("profiles")
    .update({
      trial_balance: Number(profile.trial_balance) - split.fromTrial,
      balance: Number(profile.balance) - split.fromBalance,
    })
    .eq("user_id", userId);
  if (upErr) throw upErr;

  return { tradeId: trade.id, positionId: pos.id, quantity };
}

export interface DemoOpenPosition {
  id: string;
  event_name: string;
  option_label: string;
  option_id: string | null;
  side: string;
  entry_price: number;
  mark_price: number;
  size: number;
  margin: number;
  leverage: number;
  status: string;
  created_at: string;
}

export async function fetchOpenPositions(
  userId: string,
): Promise<DemoOpenPosition[]> {
  const { data, error } = await demoEngine
    .from("positions")
    .select(
      "id, event_name, option_label, option_id, side, entry_price, mark_price, size, margin, leverage, status, created_at",
    )
    .eq("user_id", userId)
    .eq("status", "Open")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DemoOpenPosition[];
}