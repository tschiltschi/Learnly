import Stripe from 'npm:stripe@23.0.1';

let stripe: Stripe | null = null;

/** Stripe client, or null while STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe | null {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) return null;
  stripe ??= new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  return stripe;
}

export { Stripe };
