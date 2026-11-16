import { useT } from '@/i18n';
import { ArrowRight, ArrowUpRight, BookOpen, Calculator, CheckCircle2, Clock, Flame, Languages, Layers, Sparkles, Target } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { overview, last7Days, subjectStats } from '@/lib/stats';
import { formatMinutes, relativeTime, cn } from '@/lib/utils';
import { isDue, masteryOf } from '@/lib/srs';
import { SUBJECTS } from '@/lib/subjects';
import { MATH_EXERCISES } from '@/data/math';
import { Button, Card, CardHeader, ProgressBar, ProgressRing, PremiumBadge, Badge } from '@/components/ui';
import type { SubjectKey } from '@/types';

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function Dashboard() {
  const { state, isPremium, openUpgrade } = useStore();
  const t = useT();
  const ov = overview(state);
  const week = last7Days(state.activity, t.locale);
  const maxWeek = Math.max(state.settings.dailyGoal, ...week.map((d) => d.minutes)) * 1.15;
  const goalPct = Math.min(100, Math.round((ov.todayMinutes / state.settings.dailyGoal) * 100));

  const words = state.vocabLists.flatMap((l) => l.words);
  const theoryCards = state.theoryTopics.flatMap((t) => t.cards);
  const dueCount = words.filter((w) => isDue(w)).length + theoryCards.filter((c) => isDue(c)).length;
  const solved = new Set(state.mathAttempts.filter((a) => a.correct).map((a) => a.exerciseId)).size;

  const subjectInfo: Record<SubjectKey, { stat: string; sub: string; progress: number }> = {
    languages: {
      stat: t('{a} lists · {b} words', { a: state.vocabLists.length, b: words.length }),
      sub: t('{p}% mastered', { p: masteryOf(words) }),
      progress: masteryOf(words),
    },
    math: {
      stat: t('{a} topics · {b} exercises', { a: 3, b: MATH_EXERCISES.length }),
      sub: solved ? t('{n} solved', { n: solved }) : t('{p}% accuracy', { p: subjectStats(state.activity, 'math').accuracy }),
      progress: Math.round((solved / MATH_EXERCISES.length) * 100),
    },
    theory: {
      stat: t('{a} topics · {b} cards', { a: state.theoryTopics.length, b: theoryCards.length }),
      sub: t('{p}% mastered', { p: masteryOf(theoryCards) }),
      progress: masteryOf(theoryCards),
    },
  };

  const todaySession = state.sessions.find((s) => s.day === (new Date().getDay() + 6) % 7 && !s.done);
  const firstName = state.user?.name.split(' ')[0] ?? '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-fog-400">{new Date().toLocaleDateString(t.locale, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-fog-100 sm:text-[32px]">
            {t(greeting())}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-fog-400">
            {goalPct >= 100
              ? t("You've hit today's goal. Anything extra is a bonus.")
              : t("{n} more minutes to reach today's goal.", { n: state.settings.dailyGoal - ov.todayMinutes })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dueCount > 0 && (
            <Button variant="secondary" onClick={() => navigate('flashcards')} icon={<Layers className="h-4 w-4" />}>
              {t('Review {n} due cards', { n: dueCount })}
            </Button>
          )}
          <Button onClick={() => navigate(todaySession ? SUBJECTS[todaySession.subject].route : 'languages')} icon={<ArrowRight className="h-4 w-4" />}>
            {todaySession ? t('Start: {s}', { s: t(todaySession.title) }) : t('Continue learning')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="col-span-2 flex items-center gap-5 p-5 lg:col-span-1">
          <ProgressRing value={goalPct} size={76} stroke={8} color="url(#goalGrad)">
            <span className="font-display text-base font-semibold tabular-nums text-fog-100">{goalPct}%</span>
          </ProgressRing>
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="goalGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <div className="eyebrow">{t('Daily progress')}</div>
            <div className="mt-1 font-display text-xl font-semibold tabular-nums text-fog-100">
              {ov.todayMinutes}
              <span className="text-sm font-normal text-fog-400"> / {state.settings.dailyGoal} {t('min')}</span>
            </div>
          </div>
        </Card>
        <StatTile icon={<Flame className="h-4 w-4" />} tone="text-orange-300 bg-orange-400/10" label={t('Learning streak')} value={t(ov.streak === 1 ? '{n} day' : '{n} days', { n: ov.streak })} hint={ov.streak > 0 ? t('Keep it alive today') : t('Study today to start one')} />
        <StatTile icon={<Clock className="h-4 w-4" />} tone="text-sky-300 bg-sky-400/10" label={t('Total study time')} value={formatMinutes(ov.totalMinutes, t.lang)} hint={t('{x} this week', { x: formatMinutes(week.reduce((s, d) => s + d.minutes, 0), t.lang) })} />
        <StatTile icon={<CheckCircle2 className="h-4 w-4" />} tone="text-emerald-300 bg-emerald-400/10" className="col-span-2 lg:col-span-1" label={t('Completed exercises')} value={String(ov.completedExercises)} hint={t('{p}% answered correctly', { p: ov.completedExercises ? Math.round((ov.correctAnswers / ov.completedExercises) * 100) : 0 })} />
      </div>

      {/* Subject cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-fog-100">{t('Your subjects')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(['languages', 'math', 'theory'] as SubjectKey[]).map((key, i) => (
            <SubjectCard key={key} subject={key} info={subjectInfo[key]} delay={i * 60} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent activity */}
        <Card>
          <CardHeader
            title={t('Recent activity')}
            subtitle={t('Your last learning sessions')}
            action={
              <button onClick={() => navigate('progress')} className="flex items-center gap-1 text-xs font-medium text-fog-400 hover:text-fog-100">
                {t('All progress')} <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          <div className="px-2 pb-3 pt-3">
            {state.activity.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-fog-400">{t('No sessions yet. Pick a subject above to start your first one.')}</p>
            ) : (
              state.activity.slice(0, 6).map((a) => {
                const s = a.subject in SUBJECTS ? SUBJECTS[a.subject as SubjectKey] : null;
                const Icon = s?.icon ?? Sparkles;
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.03]">
                    <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', s ? s.soft : 'bg-white/5')}>
                      <Icon className={cn('h-4 w-4', s ? s.text : 'text-fog-300')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-fog-100">{a.sample ? t(a.title) : a.title}</div>
                      <div className="truncate text-xs text-fog-400">{t(a.detail)}</div>
                    </div>
                    <div className="text-right">
                      {a.total ? (
                        <div className="text-sm font-medium tabular-nums text-fog-200">
                          {a.correct}/{a.total}
                        </div>
                      ) : null}
                      <div className="text-[11px] text-fog-500">{relativeTime(a.at, t.lang)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="space-y-4">
          {/* This week */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-semibold text-fog-100">{t('This week')}</h3>
              <Badge tone="purple">
                <Target className="h-3 w-3" /> {t('{n} min/day', { n: state.settings.dailyGoal })}
              </Badge>
            </div>
            <div className="relative mt-5 flex h-32 items-end gap-2">
              <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-brand-400/30" style={{ bottom: `${(state.settings.dailyGoal / maxWeek) * 100}%` }} />
              {week.map((d, i) => (
                <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className={cn('w-full rounded-md transition-all duration-700', i === 6 ? 'bg-gradient-to-t from-brand-600 to-brand-400' : d.minutes >= state.settings.dailyGoal ? 'bg-brand-500/60' : 'bg-white/[0.12]')}
                      style={{ height: `${Math.max(3, (d.minutes / maxWeek) * 100)}%` }}
                      title={`${d.minutes} ${t('min')}`}
                    />
                  </div>
                  <span className={cn('text-[10px]', i === 6 ? 'font-semibold text-fog-200' : 'text-fog-500')}>{d.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Coach teaser */}
          <button
            onClick={() => (isPremium ? navigate('coach') : openUpgrade('AI Learning Coach'))}
            className="group relative w-full overflow-hidden rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-600/25 via-ink-850 to-ink-850 p-5 text-left transition hover:border-brand-400/40"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/25 blur-3xl transition group-hover:bg-brand-500/35" />
            <div className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-300" />
              <span className="text-sm font-semibold text-fog-100">{t('AI Learning Coach')}</span>
              <PremiumBadge className="ml-auto" compact={isPremium} />
            </div>
            <p className="relative mt-2 text-sm text-fog-300">{t("“I don't understand mitosis.” Ask anything and get a patient explanation, then a question to check you've got it.")}</p>
            <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-200">
              {isPremium ? t('Open the coach') : t('Unlock with Premium')} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, tone, label, value, hint, className }: { icon: React.ReactNode; tone: string; label: string; value: string; hint: string; className?: string }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center gap-2">
        <span className={cn('grid h-7 w-7 place-items-center rounded-lg', tone)}>{icon}</span>
        <span className="eyebrow">{label}</span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tabular-nums text-fog-100">{value}</div>
      <div className="mt-0.5 text-xs text-fog-500">{hint}</div>
    </Card>
  );
}

const SUBJECT_ICONS = { languages: Languages, math: Calculator, theory: BookOpen };

function SubjectCard({ subject, info, delay }: { subject: SubjectKey; info: { stat: string; sub: string; progress: number }; delay: number }) {
  const t = useT();
  const s = SUBJECTS[subject];
  const Icon = SUBJECT_ICONS[subject];
  const glow = { languages: 'hover:shadow-[0_20px_60px_-20px_rgba(139,92,246,0.55)] hover:border-violet-400/40', math: 'hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.55)] hover:border-sky-400/40', theory: 'hover:shadow-[0_20px_60px_-20px_rgba(16,185,129,0.5)] hover:border-emerald-400/40' }[subject];
  const iconBg = { languages: 'from-violet-400 to-violet-600', math: 'from-sky-400 to-blue-600', theory: 'from-emerald-400 to-emerald-600' }[subject];

  return (
    <button
      onClick={() => navigate(s.route)}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        'group relative flex min-h-[230px] animate-fade-up flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-850 p-6 text-left transition duration-300 hover:-translate-y-1',
        glow,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity duration-300 group-hover:opacity-100', s.gradient)} />
      <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.06] transition duration-500 group-hover:rotate-6 group-hover:opacity-[0.1]">
        <Icon className="h-40 w-40" strokeWidth={1.2} />
      </div>
      <div className="relative flex items-start justify-between">
        <div className={cn('grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br shadow-lg', iconBg)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-fog-400 transition group-hover:bg-white/10 group-hover:text-fog-100">
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="relative mt-auto pt-8">
        <h3 className="font-display text-xl font-semibold tracking-tight text-fog-100">{t(s.name)}</h3>
        <p className="mt-1 text-sm text-fog-300">{t(s.description)}</p>
        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="text-fog-400">{info.stat}</span>
          <span className={cn('font-medium', s.text)}>{info.sub}</span>
        </div>
        <ProgressBar value={info.progress} className="mt-2" color={s.bg} />
      </div>
    </button>
  );
}
