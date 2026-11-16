import { useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useStore } from '@/store/AppStore';
import { createInitialState } from '@/data/seed';
import { navigate } from '@/lib/router';
import { useT } from '@/i18n';
import type { AppState } from '@/types';
import { supabase } from './index';

const SAVE_DELAY = 1500;

function displayName(session: Session): string {
  const meta = session.user.user_metadata ?? {};
  const fromMeta = meta.first_name || meta.given_name || (meta.full_name || meta.name || '').split(' ')[0];
  return fromMeta || (session.user.email ?? '').split('@')[0];
}

/** Restores a saved document on top of the current defaults, so fields added in later versions get a value. */
function restore(data: AppState): AppState {
  const base = createInitialState(false, data.settings?.language);
  return { ...base, ...data, settings: { ...base.settings, ...data.settings } };
}

/**
 * Keeps the signed-in Supabase account and the app state in step:
 * loads the user's saved learning data on sign-in, saves changes (debounced),
 * reads the plan from the server-owned profile and clears local data on sign-out.
 * Renders nothing; does nothing when no backend is configured.
 */
export function BackendSync() {
  const { state, update, toast } = useStore();
  const t = useT();
  const userId = useRef<string | null>(null);
  const loaded = useRef(false);
  const timer = useRef<number>();
  const tRef = useRef(t);
  tRef.current = t;

  const refreshPlan = async (id: string) => {
    if (!supabase) return 'free';
    const { data } = await supabase.from('profiles').select('plan').eq('id', id).maybeSingle();
    const plan = data?.plan === 'premium' ? 'premium' : 'free';
    update((s) => (s.plan === plan ? s : { ...s, plan }));
    return plan;
  };

  // Sign-in, sign-out and session restore.
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const apply = async (session: Session | null) => {
      if (!session) {
        loaded.current = false;
        if (userId.current) {
          userId.current = null;
          update((s) => createInitialState(true, s.settings.language));
        } else {
          // A browser-only demo account from before the backend was connected is not a real login.
          update((s) => (s.user ? { ...s, user: null } : s));
        }
        return;
      }
      if (userId.current === session.user.id) return;
      userId.current = session.user.id;
      loaded.current = false;

      const [{ data: row }, { data: profile }] = await Promise.all([
        client.from('app_state').select('data').eq('user_id', session.user.id).maybeSingle(),
        client.from('profiles').select('plan').eq('id', session.user.id).maybeSingle(),
      ]);
      update((s) => {
        // First sign-in: keep what is in this browser (sample content or the demo account's work) and upload it.
        const base = row?.data ? restore(row.data as AppState) : s;
        return {
          ...base,
          user: { name: base.user?.name || displayName(session), email: session.user.email ?? '', createdAt: base.user?.createdAt ?? Date.parse(session.user.created_at) },
          plan: profile?.plan === 'premium' ? 'premium' : 'free',
        };
      });
      loaded.current = true;
      if (location.hash === '' || location.hash === '#login' || location.hash === '#signup') navigate('dashboard');
    };

    client.auth.getSession().then(({ data }) => apply(data.session));
    // Supabase recommends not awaiting other Supabase calls inside this callback, so defer them.
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => apply(session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [update]);

  // Save changes to the user's row.
  useEffect(() => {
    if (!supabase || !loaded.current || !userId.current) return;
    const id = userId.current;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const { error } = await supabase!.from('app_state').upsert({ user_id: id, data: state, updated_at: new Date().toISOString() });
      if (error) console.error('Could not save to Supabase', error);
    }, SAVE_DELAY);
  }, [state]);

  // Coming back from Stripe Checkout or the billing portal.
  useEffect(() => {
    if (!supabase) return;
    const params = new URLSearchParams(location.search);
    const checkout = params.get('checkout');
    let poll: number | undefined;
    if (checkout) {
      history.replaceState(null, '', location.pathname + location.hash);
      if (checkout === 'cancelled') toast(tRef.current('Checkout cancelled. Nothing was charged.'), 'info');
      if (checkout === 'success') {
        toast(tRef.current('Payment received. Activating Premium…'), 'info');
        // The Stripe webhook usually lands within a few seconds.
        let tries = 0;
        poll = window.setInterval(async () => {
          tries += 1;
          if (!userId.current) return;
          const plan = await refreshPlan(userId.current);
          if (plan === 'premium') {
            window.clearInterval(poll);
            toast(tRef.current('Premium is active. Enjoy!'));
          } else if (tries >= 15) window.clearInterval(poll);
        }, 2000);
      }
    }
    // Picks up a cancellation made in the billing portal when the user comes back to the tab.
    const onFocus = () => {
      if (userId.current) refreshPlan(userId.current);
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener('focus', onFocus);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
