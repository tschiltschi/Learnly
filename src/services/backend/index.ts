import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Real backend (Supabase: accounts, synced data, Edge Functions for AI and Stripe).
 * Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY Learnly runs as a browser-only demo,
 * exactly like before: data stays in localStorage and Premium is a demo switch.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export const BACKEND = {
  /** Real sign-in and data sync. */
  enabled: supabase !== null,
  /** Real Premium payments through Stripe Checkout. */
  payments: supabase !== null && import.meta.env.VITE_PAYMENTS === 'stripe',
  functionsUrl: url ? `${url.replace(/\/+$/, '')}/functions/v1` : '',
  anonKey: anonKey ?? '',
};

/** Headers for calling an Edge Function as the signed-in user. */
export async function authHeaders(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return { apikey: BACKEND.anonKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

/** Calls an Edge Function and returns its JSON. Throws an Error whose message is the function's error code. */
export async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND.functionsUrl}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `http_${res.status}`);
  return data as T;
}

/** Sends the user to Stripe Checkout for Premium. */
export async function startCheckout(language: string): Promise<void> {
  const { url: checkoutUrl } = await callFunction<{ url: string }>('create-checkout', { language });
  window.location.assign(checkoutUrl);
}

/** Opens the Stripe customer portal (cancel, change card, invoices). */
export async function openBillingPortal(language: string): Promise<void> {
  const { url: portalUrl } = await callFunction<{ url: string }>('customer-portal', { language });
  window.location.assign(portalUrl);
}
