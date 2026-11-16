import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Activity, AppState } from '@/types';
import { createInitialState, STATE_VERSION } from '@/data/seed';
import { loadJSON, saveJSON } from '@/lib/storage';
import { uid } from '@/lib/utils';
import { AI_CONFIG } from '@/services/ai/config';
import { supabase } from '@/services/backend';

const KEY = 'learnly:state:v1';

interface Store {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  logActivity: (a: Omit<Activity, 'id' | 'at'>) => void;
  /** Counts one AI/auto generation against the Free plan limit. Returns false when the limit is reached. */
  consumeGeneration: () => boolean;
  generationsLeft: number;
  isPremium: boolean;
  persisted: boolean;
  resetAll: (withSamples: boolean) => void;
  /** Signs out of the real account (Supabase) or the browser-only demo account. */
  signOut: () => Promise<void>;
  upgradeOpen: { open: boolean; feature?: string };
  openUpgrade: (feature?: string) => void;
  closeUpgrade: () => void;
  toast: (msg: string, tone?: 'success' | 'info' | 'error') => void;
  toasts: { id: string; msg: string; tone: 'success' | 'info' | 'error' }[];
}

const Ctx = createContext<Store | null>(null);

function load(): AppState {
  const saved = loadJSON<AppState | null>(KEY, null);
  if (saved && saved.version === STATE_VERSION) {
    const base = createInitialState(false);
    return { ...base, ...saved, settings: { ...base.settings, ...saved.settings } };
  }
  return createInitialState(true);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [persisted, setPersisted] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState<{ open: boolean; feature?: string }>({ open: false });
  const [toasts, setToasts] = useState<Store['toasts']>([]);
  const saveTimer = useRef<number>();

  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setPersisted(saveJSON(KEY, state)), 250);
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  const logActivity = useCallback((a: Omit<Activity, 'id' | 'at'>) => {
    setState((s) => ({ ...s, activity: [{ ...a, id: uid(), at: Date.now() }, ...s.activity].slice(0, 400) }));
  }, []);

  const month = new Date().toISOString().slice(0, 7);
  const used = state.aiUsage.month === month ? state.aiUsage.count : 0;
  const isPremium = state.plan === 'premium';
  const generationsLeft = isPremium ? Infinity : Math.max(0, AI_CONFIG.freeMonthlyGenerations - used);

  const consumeGeneration = useCallback(() => {
    if (isPremium) return true;
    if (generationsLeft <= 0) return false;
    setState((s) => ({ ...s, aiUsage: { month, count: (s.aiUsage.month === month ? s.aiUsage.count : 0) + 1 } }));
    return true;
  }, [isPremium, generationsLeft, month]);

  const toast = useCallback((msg: string, tone: 'success' | 'info' | 'error' = 'success') => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const resetAll = useCallback((withSamples: boolean) => {
    setState((s) => ({ ...createInitialState(withSamples, s.settings.language), user: s.user, plan: s.plan, onboarded: true }));
  }, []);

  const signOut = useCallback(async () => {
    // With a backend, BackendSync clears this browser's copy once Supabase reports the sign-out.
    if (supabase) await supabase.auth.signOut();
    else setState((s) => ({ ...s, user: null }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      state,
      update,
      logActivity,
      consumeGeneration,
      generationsLeft,
      isPremium,
      persisted,
      resetAll,
      signOut,
      upgradeOpen,
      openUpgrade: (feature?: string) => setUpgradeOpen({ open: true, feature }),
      closeUpgrade: () => setUpgradeOpen({ open: false }),
      toast,
      toasts,
    }),
    [state, update, logActivity, consumeGeneration, generationsLeft, isPremium, persisted, resetAll, signOut, upgradeOpen, toast, toasts],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside AppStoreProvider');
  return s;
}
