import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  demoEngine,
  fetchDemoProfile,
  type DemoProfile,
} from "@/lib/demoEngine";

export interface DemoAuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: DemoProfile | null;
  refreshProfile: () => Promise<void>;
}

/**
 * Subscribes to the OmenX main-site demo Supabase session and pulls the
 * matching `profiles` row (balance + trial_balance). Any component in the
 * Sports project can call this to render live user state.
 */
export function useDemoAuth(): DemoAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    try {
      const p = await fetchDemoProfile(u);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    demoEngine.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
      loadProfile(data.session?.user ?? null);
    });
    const sub = demoEngine.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      loadProfile(s?.user ?? null);
    });
    return () => {
      cancelled = true;
      sub.data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(
    () => loadProfile(session?.user ?? null),
    [session, loadProfile],
  );

  return {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    refreshProfile,
  };
}