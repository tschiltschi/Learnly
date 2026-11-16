import { useT } from '@/i18n';
import { Check, Crown, FlaskConical } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PREMIUM_PERKS } from './plans';

export function UpgradeModal() {
  const { upgradeOpen, closeUpgrade, update, toast } = useStore();
  const t = useT();

  const activate = () => {
    update((s) => ({ ...s, plan: 'premium' }));
    closeUpgrade();
    toast(t('Premium activated (demo, no payment taken)'));
  };

  return (
    <Modal open={upgradeOpen.open} onClose={closeUpgrade} className="sm:max-w-[460px]">
      <div className="relative overflow-hidden rounded-t-3xl px-6 pb-6 pt-8 sm:rounded-t-3xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(400px_200px_at_50%_-20%,rgba(245,181,68,0.25),transparent_70%)]" />
        <div className="relative">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-400 shadow-[0_10px_30px_-10px_rgba(245,181,68,0.7)]">
            <Crown className="h-6 w-6 text-ink-950" />
          </div>
          <h2 className="font-display text-xl font-semibold text-fog-100">
            {upgradeOpen.feature ? t('{f} is a Premium feature', { f: t(upgradeOpen.feature) }) : t('Upgrade to Learnly Premium')}
          </h2>
          <p className="mt-1.5 text-sm text-fog-400">{t('Get a personal AI tutor, a plan built around your exams, and unlimited learning content.')}</p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-semibold text-fog-100">{t('€7.99')}</span>
            <span className="text-sm text-fog-400">{t('/ month · cancel anytime')}</span>
          </div>
        </div>
      </div>
      <ul className="grid gap-2.5 px-6 sm:grid-cols-2">
        {PREMIUM_PERKS.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[13px] text-fog-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            {t(p)}
          </li>
        ))}
      </ul>
      <div className="space-y-3 px-6 pb-6 pt-6">
        <Button variant="premium" size="lg" className="w-full" onClick={activate} icon={<Crown className="h-4 w-4" />}>
          {t('Activate Premium (demo)')}
        </Button>
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-sky-300/30 bg-sky-400/[0.05] px-3 py-2.5 text-xs text-sky-100/80">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />
          {t('No payment provider is connected. This switches your account to Premium in this browser so you can try every feature. You can switch back in Settings.')}
        </div>
        <button
          onClick={() => {
            closeUpgrade();
            navigate('pricing');
          }}
          className="w-full text-center text-xs font-medium text-fog-400 hover:text-fog-200"
        >
          {t('Compare Free and Premium')}
        </button>
      </div>
    </Modal>
  );
}
