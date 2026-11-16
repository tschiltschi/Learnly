import { useT } from '@/i18n';
import { useState } from 'react';
import { Check, ChevronDown, Crown, Minus, Sparkles } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import { Badge, Button } from '@/components/ui';
import { COMPARISON, FREE_PERKS, PREMIUM_PERKS } from '@/components/premium/plans';
import { usePlanActions } from '@/services/backend/usePlanActions';

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. Premium is billed monthly and you can cancel with one click in Settings. You keep Premium until the end of the month you paid for.' },
  { q: 'What happens to my content if I go back to Free?', a: 'Nothing is deleted. Your vocabulary lists, topics, flashcards and progress stay. Premium-only tools like the AI Coach just lock again.' },
  { q: 'Is there a student discount?', a: 'Premium is already priced for students. Schools that want Learnly for whole classes can contact us for group pricing.' },
  { q: 'How does the AI handle my documents?', a: 'Uploaded material is only used to create learning content for you. It is never shared with other users.' },
];

export function PricingPage() {
  const { isPremium, openUpgrade } = useStore();
  const [open, setOpen] = useState<number | null>(0);
  const tr = useT();
  const plan = usePlanActions();

  return (
    <div>
      <div className="relative mb-12 animate-fade-up text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[520px] max-w-full -translate-x-1/2 rounded-full bg-brand-600/20 blur-[90px]" />
        <Badge tone="amber" className="relative">
          <Crown className="h-3 w-3" /> {tr('Learnly Premium')}
        </Badge>
        <h1 className="relative mt-4 font-display text-3xl font-semibold tracking-tight text-fog-100 sm:text-[42px] sm:leading-[1.1]">
          {tr('Learn smarter.')} <span className="gradient-text">{tr('Not harder.')}</span>
        </h1>
        <p className="relative mx-auto mt-3 max-w-xl text-[15px] text-fog-400">{tr('Everything you need to study is free. Premium adds a personal AI tutor, a plan built around your exams and unlimited AI content.')}</p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
        {/* Free */}
        <div className="surface flex flex-col p-7">
          <h2 className="font-display text-lg font-semibold text-fog-100">{tr('Free')}</h2>
          <p className="mt-1 text-sm text-fog-400">{tr('For getting organised and practising every day.')}</p>
          <div className="mt-6 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-semibold text-fog-100">{tr.lang === 'de' ? '0 €' : '€0'}</span>
            <span className="text-sm text-fog-500">{tr('forever')}</span>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="mt-6 w-full"
            disabled={!isPremium || plan.mode === 'unavailable'}
            loading={isPremium && plan.busy}
            onClick={plan.downgrade}
          >
            {isPremium ? plan.downgradeLabel : tr('Your current plan')}
          </Button>
          <ul className="mt-7 space-y-3">
            {FREE_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-fog-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-fog-400" />
                {tr(p)}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-b from-ink-800 to-ink-850 p-7 shadow-[0_30px_80px_-30px_rgba(245,181,68,0.35)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-fog-100">
              Premium <Sparkles className="h-4 w-4 text-amber-300" />
            </h2>
            <Badge tone="amber">{tr('Most popular')}</Badge>
          </div>
          <p className="relative mt-1 text-sm text-fog-400">{tr('Everything in Free, plus your personal AI tutor.')}</p>
          <div className="relative mt-6 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-semibold text-fog-100">{tr.lang === 'de' ? '7,99 €' : '€7.99'}</span>
            <span className="text-sm text-fog-500">{tr('/ month')}</span>
          </div>
          <Button variant="premium" size="lg" className="relative mt-6 w-full" disabled={isPremium} onClick={() => openUpgrade()} icon={<Crown className="h-4 w-4" />}>
            {isPremium ? tr('Your current plan') : tr('Upgrade to Premium')}
          </Button>
          <ul className="relative mt-7 space-y-3">
            {PREMIUM_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-fog-100">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                {tr(p)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comparison */}
      <div className="mx-auto mt-14 max-w-4xl">
        <h2 className="mb-5 text-center font-display text-xl font-semibold text-fog-100">{tr('Compare plans')}</h2>
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-4 text-left font-medium text-fog-400">{tr('Feature')}</th>
                <th className="w-32 px-5 py-4 text-center font-semibold text-fog-200">{tr('Free')}</th>
                <th className="w-32 px-5 py-4 text-center font-semibold text-amber-200">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} className={cn('border-white/[0.04]', i > 0 && 'border-t', COMPARISON[i - 1]?.group !== row.group && 'border-t-white/10')}>
                  <td className="px-5 py-3.5 text-fog-200">
                    {COMPARISON[i - 1]?.group !== row.group && <div className="eyebrow mb-1.5 mt-1">{tr(row.group)}</div>}
                    {tr(row.feature)}
                  </td>
                  <Cell v={typeof row.free === 'string' ? tr(row.free) : row.free} />
                  <Cell v={typeof row.premium === 'string' ? tr(row.premium) : row.premium} premium />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-14 max-w-2xl">
        <h2 className="mb-5 text-center font-display text-xl font-semibold text-fog-100">{tr('Questions')}</h2>
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <div key={f.q} className="surface overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-fog-100" aria-expanded={open === i}>
                {tr(f.q)}
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-fog-400 transition', open === i && 'rotate-180')} />
              </button>
              {open === i && <p className="animate-fade-up px-5 pb-4 text-sm text-fog-400">{tr(f.a)}</p>}
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-fog-500">
          {plan.mode === 'stripe' ? tr('Payments are handled securely by Stripe.') : tr('Payments are not connected in this demo.')}{' '}
          <button onClick={() => navigate('preferences')} className="underline hover:text-fog-300">
            {tr('Manage your plan in Settings')}
          </button>
          .
        </p>
      </div>
    </div>
  );
}

function Cell({ v, premium }: { v: string | boolean; premium?: boolean }) {
  return (
    <td className="px-5 py-3.5 text-center">
      {v === true ? <Check className={cn('mx-auto h-4 w-4', premium ? 'text-amber-300' : 'text-emerald-400')} /> : v === false ? <Minus className="mx-auto h-4 w-4 text-fog-500" /> : <span className={cn('text-xs', premium ? 'text-amber-100' : 'text-fog-300')}>{v}</span>}
    </td>
  );
}
