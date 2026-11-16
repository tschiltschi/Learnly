import { useState } from 'react';
import { useStore } from '@/store/AppStore';
import { useT } from '@/i18n';
import { BACKEND, openBillingPortal, startCheckout } from './index';

/**
 * Upgrade and downgrade, in whichever mode Learnly runs:
 * - demo (no backend): switches the plan in this browser, labelled as a demo;
 * - backend with Stripe: Stripe Checkout to upgrade, the Stripe customer portal to cancel;
 * - backend without Stripe: the plan is set on the server only, so the buttons are disabled.
 */
export function usePlanActions() {
  const { update, toast, closeUpgrade } = useStore();
  const t = useT();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch {
      toast(t('Could not reach the payment page. Please try again.'), 'error');
      setBusy(false);
    }
  };

  const mode: 'demo' | 'stripe' | 'unavailable' = !BACKEND.enabled ? 'demo' : BACKEND.payments ? 'stripe' : 'unavailable';

  return {
    mode,
    busy,
    upgradeLabel: mode === 'demo' ? t('Activate Premium (demo)') : mode === 'stripe' ? t('Continue to payment') : t('Payments are not set up yet'),
    upgrade: () => {
      if (mode === 'demo') {
        update((s) => ({ ...s, plan: 'premium' }));
        closeUpgrade();
        toast(t('Premium activated (demo, no payment taken)'));
      } else if (mode === 'stripe') run(() => startCheckout(t.lang));
    },
    downgradeLabel: mode === 'stripe' ? t('Manage subscription') : t('Switch to Free'),
    downgrade: () => {
      if (mode === 'demo') {
        update((s) => ({ ...s, plan: 'free' }));
        toast(t('Switched back to the Free plan'), 'info');
      } else if (mode === 'stripe') run(() => openBillingPortal(t.lang));
    },
  };
}
