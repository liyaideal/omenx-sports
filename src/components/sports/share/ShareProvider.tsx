import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ShareDialog } from "./ShareDialog";
import type { ShareTarget } from "./share-targets";

interface ShareContextValue {
  share: (target: ShareTarget) => void;
  close: () => void;
  isOpen: boolean;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function ShareProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ShareTarget | null>(null);

  const share = useCallback((t: ShareTarget) => setTarget(t), []);
  const close = useCallback(() => setTarget(null), []);

  const value = useMemo<ShareContextValue>(
    () => ({ share, close, isOpen: !!target }),
    [share, close, target],
  );

  return (
    <ShareContext.Provider value={value}>
      {children}
      <ShareDialog target={target} onClose={close} />
    </ShareContext.Provider>
  );
}

export function useShare(): ShareContextValue {
  const ctx = useContext(ShareContext);
  if (!ctx) {
    throw new Error("useShare must be used inside <ShareProvider>");
  }
  return ctx;
}