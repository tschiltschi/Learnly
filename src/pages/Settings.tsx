import { useState, type ReactNode } from 'react';
import { Cpu, Crown, Database, Globe, LogOut, Save, User } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import { ai } from '@/services/ai';
import { AI_CONFIG } from '@/services/ai/config';
import { Badge, Button, Card, ConfirmDialog, DemoBadge, PageHeader } from '@/components/ui';
import { LANGUAGES } from './languages/ListFormModal';
import { withSampleLanguage } from '@/data/seed';
import { LANGUAGE_OPTIONS, useT, type Lang } from '@/i18n';

export function SettingsPage() {
  const { state, update, isPremium, openUpgrade, toast, resetAll, generationsLeft } = useStore();
  const [name, setName] = useState(state.user?.name ?? '');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [confirm, setConfirm] = useState<null | 'samples' | 'empty'>(null);
  const t = useT();
  const s = state.settings;
  const setSetting = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));

  return (
    <div className="max-w-3xl">
      <PageHeader title={t('Settings')} description={t('Manage your profile, plan, learning preferences and data.')} />

      <div className="space-y-5">
        <Section icon={<Globe className="h-4 w-4" />} title={t('Language')}>
          <p className="mb-3 text-sm text-fog-400">{t('Choose the language for menus, buttons and built-in learning content.')}</p>
          <div className="grid grid-cols-2 gap-2 sm:max-w-sm" role="radiogroup" aria-label={t('Language')}>
            {LANGUAGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                id={`set-lang-${o.value}`}
                role="radio"
                aria-checked={s.language === o.value}
                onClick={() => update((st) => withSampleLanguage(st, o.value as Lang))}
                className={cn('flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition', s.language === o.value ? 'border-brand-400/50 bg-brand-500/10 text-fog-100' : 'border-white/10 text-fog-300 hover:border-white/20 hover:text-fog-100')}
              >
                <span className="font-medium">{o.label}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-fog-500">{o.value}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<User className="h-4 w-4" />} title={t('Profile')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="set-name" className="label">{t('Name')}</label>
              <input id="set-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="set-email" className="label">{t('Email')}</label>
              <input id="set-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              disabled={!name.trim() || (name === state.user?.name && email === state.user?.email)}
              onClick={() => {
                update((st) => ({ ...st, user: st.user ? { ...st.user, name: name.trim(), email: email.trim() } : st.user }));
                toast(t('Profile saved'));
              }}
              icon={<Save className="h-3.5 w-3.5" />}
            >
              {t('Save profile')}
            </Button>
          </div>
        </Section>

        <Section icon={<Crown className="h-4 w-4" />} title={t('Plan')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-semibold text-fog-100">{isPremium ? 'Premium' : t('Free')}</span>
                {isPremium ? <Badge tone="amber">{t('€7.99 / month')}</Badge> : <Badge>{t.lang === 'de' ? '0 €' : '€0'}</Badge>}
              </div>
              <p className="mt-1 text-sm text-fog-400">{isPremium ? t('All features unlocked. Demo upgrade, no payment taken.') : t('{left} of {total} free generations left this month.', { left: generationsLeft, total: AI_CONFIG.freeMonthlyGenerations })}</p>
            </div>
            {isPremium ? (
              <Button
                variant="secondary"
                onClick={() => {
                  update((st) => ({ ...st, plan: 'free' }));
                  toast(t('Switched back to the Free plan'), 'info');
                }}
              >
                {t('Switch to Free')}
              </Button>
            ) : (
              <Button variant="premium" onClick={() => openUpgrade()} icon={<Crown className="h-4 w-4" />}>
                {t('Upgrade')}
              </Button>
            )}
          </div>
        </Section>

        <Section title={t('Learning preferences')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-goal" className="mb-1.5 flex justify-between text-xs font-medium text-fog-300">
                <span>{t('Daily goal')}</span>
                <span>{t('{n} min', { n: s.dailyGoal })}</span>
              </label>
              <input id="set-goal" type="range" min={10} max={120} step={5} value={s.dailyGoal} onChange={(e) => setSetting('dailyGoal', Number(e.target.value))} className="w-full accent-brand-500" />
            </div>
            <div>
              <label htmlFor="set-native" className="label">{t('Native language')}</label>
              <select id="set-native" className="input" value={s.nativeLanguage} onChange={(e) => setSetting('nativeLanguage', e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{t(l)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-5 divide-y divide-white/[0.05]">
            <Toggle id="set-motion" label={t('Reduce motion')} hint={t('Turns off flips and animations.')} checked={s.reduceMotion} onChange={(v) => setSetting('reduceMotion', v)} />
            <Toggle id="set-sound" label={t('Sound effects')} hint={t('Play a sound for correct answers.')} checked={s.soundEffects} onChange={(v) => setSetting('soundEffects', v)} />
            <Toggle id="set-report" label={t('Weekly progress email')} hint={t('A summary of your week every Sunday.')} checked={s.weeklyReport} onChange={(v) => setSetting('weeklyReport', v)} />
          </div>
        </Section>

        <Section icon={<Cpu className="h-4 w-4" />} title={t('AI integration')}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-fog-100">{t(ai.label)}</span>
                {ai.isDemo ? <DemoBadge /> : <Badge tone="green">{t('Connected')}</Badge>}
              </div>
              <p className="mt-1.5 text-sm text-fog-400">
                {ai.isDemo
                  ? t('No AI model is connected. The AI Coach and Voice Mode show pre-written sample conversations, and flashcards and study plans come from built-in rule-based generators. Everything from the demo layer is labelled “Demo”.')
                  : t('AI features are served by your Learnly backend.')}
              </p>
              <p className="mt-2 text-xs text-fog-500">
                {t('Developers: set')} <code className="rounded bg-white/10 px-1">VITE_AI_PROVIDER=http</code> {t('and point')} <code className="rounded bg-white/10 px-1">VITE_AI_BASE_URL</code> {t('at your backend. See')} <code className="rounded bg-white/10 px-1">src/services/ai</code>.
              </p>
            </div>
          </div>
        </Section>

        <Section icon={<Database className="h-4 w-4" />} title={t('Your data')}>
          <p className="text-sm text-fog-400">{t('Everything you create is saved in this browser. Learnly started you off with sample lists, topics and history so you can explore.')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirm('samples')}>
              {t('Restore sample content')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirm('empty')}>
              {t('Start with an empty account')}
            </Button>
          </div>
        </Section>

        <Button
          variant="ghost"
          onClick={() => {
            update((st) => ({ ...st, user: null }));
            navigate('login');
          }}
          icon={<LogOut className="h-4 w-4" />}
        >
          {t('Sign out')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={t(confirm === 'empty' ? 'Delete all your content?' : 'Restore sample content?')}
        description={t(confirm === 'empty' ? 'This removes all vocabulary lists, topics, plans and history from this browser. Your profile and plan stay.' : 'This replaces your current lists, topics, plans and history with the original sample content.')}
        confirmLabel={t(confirm === 'empty' ? 'Delete everything' : 'Restore samples')}
        onConfirm={() => {
          resetAll(confirm === 'samples');
          toast(t(confirm === 'empty' ? 'All content removed' : 'Sample content restored'), 'info');
        }}
      />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-[15px] font-semibold text-fog-100">
        {icon && <span className="text-fog-400">{icon}</span>}
        {title}
      </h2>
      {children}
    </Card>
  );
}

function Toggle({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label htmlFor={id} className="cursor-pointer">
        <div className="text-sm text-fog-100">{label}</div>
        <div className="text-xs text-fog-500">{hint}</div>
      </label>
      <button id={id} role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-brand-500' : 'bg-white/15')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>
  );
}
