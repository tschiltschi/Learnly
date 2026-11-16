// Opens the Stripe customer portal, where Premium users cancel or change their payment method.
import { adminClient, appUrl, corsHeaders, json, requestUser } from '../_shared/http.ts';
import { getStripe } from '../_shared/stripe.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const user = await requestUser(req);
  if (!user) return json({ error: 'not_signed_in' }, 401);
  const stripe = getStripe();
  if (!stripe) return json({ error: 'payments_not_configured' }, 503);

  const { data: profile } = await adminClient().from('profiles').select('stripe_customer_id').eq('id', user.id).single();
  if (!profile?.stripe_customer_id) return json({ error: 'no_subscription' }, 404);

  const { language } = await req.json().catch(() => ({ language: 'en' }));
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    locale: language === 'de' ? 'de' : 'en',
    return_url: `${appUrl()}/#preferences`,
  });
  return json({ url: session.url });
});
