// Receives Stripe events and keeps profiles.plan in step with the subscription.
// Deployed with verify_jwt = false (see supabase/config.toml); every event is checked against STRIPE_WEBHOOK_SECRET instead.
import { adminClient, json } from '../_shared/http.ts';
import { getStripe, Stripe } from '../_shared/stripe.ts';

const cryptoProvider = Stripe.createSubtleCryptoProvider();
const ACTIVE = new Set(['active', 'trialing', 'past_due']);

async function applySubscription(sub: Stripe.Subscription) {
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const plan = ACTIVE.has(sub.status) ? 'premium' : 'free';
  const db = adminClient();
  const update = { plan, stripe_subscription_id: sub.id, subscription_status: sub.status, updated_at: new Date().toISOString() };
  const { data } = await db.from('profiles').update(update).eq('stripe_customer_id', customer).select('id');
  // Fall back to the user id stored on the subscription, e.g. when the customer was created outside Learnly.
  if (!data?.length && sub.metadata?.user_id) {
    await db.from('profiles').update({ ...update, stripe_customer_id: customer }).eq('id', sub.metadata.user_id);
  }
}

Deno.serve(async (req) => {
  const stripe = getStripe();
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripe || !secret) return json({ error: 'payments_not_configured' }, 503);

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) return json({ error: 'missing_signature' }, 400);
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
  } catch (err) {
    console.error('Invalid Stripe signature', err);
    return json({ error: 'invalid_signature' }, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode === 'subscription' && session.subscription) {
        const id = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        await applySubscription(await stripe.subscriptions.retrieve(id));
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await applySubscription(event.data.object);
      break;
  }
  return json({ received: true });
});
