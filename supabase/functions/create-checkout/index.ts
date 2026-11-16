// Starts a Stripe Checkout session for Learnly Premium (€7.99 / month) and returns its URL.
import { adminClient, appUrl, corsHeaders, json, requestUser } from '../_shared/http.ts';
import { getStripe } from '../_shared/stripe.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const user = await requestUser(req);
  if (!user) return json({ error: 'not_signed_in' }, 401);
  const stripe = getStripe();
  const price = Deno.env.get('STRIPE_PRICE_ID');
  if (!stripe || !price) return json({ error: 'payments_not_configured' }, 503);

  const db = adminClient();
  const { data: profile } = await db.from('profiles').select('plan, stripe_customer_id').eq('id', user.id).single();
  if (profile?.plan === 'premium') return json({ error: 'already_premium' }, 409);

  let customer = profile?.stripe_customer_id as string | null;
  if (!customer) {
    const created = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
    customer = created.id;
    await db.from('profiles').update({ stripe_customer_id: customer, updated_at: new Date().toISOString() }).eq('id', user.id);
  }

  const { language } = await req.json().catch(() => ({ language: 'en' }));
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    locale: language === 'de' ? 'de' : 'en',
    success_url: `${appUrl()}/?checkout=success#dashboard`,
    cancel_url: `${appUrl()}/?checkout=cancelled#pricing`,
  });
  return json({ url: session.url });
});
