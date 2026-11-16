import { useT } from '@/i18n';
import { useState } from 'react';
import { AlertTriangle, Clock, Flame, Lock, Target, TrendingUp, Trophy } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { overview, subjectStats, minutesOnDay } from '@/lib/stats';
import { DAY, cn, formatMinutes, pct, relativeTime, startOfDay } from '@/lib/utils';
import { SUBJECTS } from '@/lib/subjects';
import { MATH_EXERCISES, getMathTopics } from '@/data/math';
import { Badge, Button, Card, CardHeader, PageHeader, PremiumBadge, Segmented } from '@/components/ui';
import type { AppState, SubjectKey } from '@/types';

function weaknesses(state: AppState, lang: 'en' | 'de') {
  const MATH_TOPICS = getMathTopics(lang);
  const words = state.vocabLists
    .flatMap((l) => l.words.map((w) => ({ label: `${w.term} → ${w.translation}`, where: l.name, wrong: w.wrong, total: w.correct + w.wrong })))
    .filter((w) => w.total > 0 && w.wrong > 0)
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong)
    .slice(0, 5);
  const cards = state.theoryTopics
    .flatMap((t) => t.cards.map((c) => ({ label: c.front, where: t.title, wrong: c.wrong, total: c.correct + c.wrong })))
    .filter((w) => w.total > 0 && w.wrong > 0)
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong)
    .slice(0, 5);
  const mathTopics = MATH_TOPICS.map((t) => {
    const ids = new Set(MATH_EXERCISES.filter((e) => e.topic === t.id).map((e) => e.id));
    const rows = state.mathAttempts.filter((a) => ids.has(a.exerciseId));
    return { name: t.name, total: rows.length, correct: rows.filter((r) => r.correct).length };
  });
  const byDifficulty = (['Easy', 'Medium', 'Hard'] as const).map((d) => {
    const ids = new Set(MATH_EXERCISES.filter((e) => e.difficulty === d).map((e) => e.id));
    const rows = state.mathAttempts.filter((a) => ids.has(a.exerciseId));
    return { d, total: rows.length, correct: rows.filter((r) => r.correct).length };
  });
  return { words, cards, mathTopics, byDifficulty };
}

export function ProgressPage() {
  const { state, isPremium, openUpgrade } = useStore();
  const tr = useT();
  const [range, setRange] = useState<'7' | '30'>('7');
  const ov = overview(state);
  const days = Number(range);
  const series = Array.from({ length: days }, (_, i) => {
    const day = startOfDay() - (days - 1 - i) * DAY;
    return { day, minutes: minutesOnDay(state.activity, day) };
  });
  const maxM = Math.max(state.settings.dailyGoal, ...series.map((s) => s.minutes)) * 1.15;
  const goalDays = series.filter((s) => s.minutes >= state.settings.dailyGoal).length;
  const sum = series.reduce((a, s) => a + s.minutes, 0);
  const w = weaknesses(state, tr.lang);

  return (
    <div>
      <PageHeader title={tr('Learning Progress')} description={tr('How much you study, how accurate you are, and where to focus next.')} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Flame, tone: 'text-orange-300 bg-orange-400/10', label: 'Current streak', value: tr('{n} days', { n: ov.streak }) },
          { icon: Clock, tone: 'text-sky-300 bg-sky-400/10', label: 'Total study time', value: formatMinutes(ov.totalMinutes, tr.lang) },
          { icon: Target, tone: 'text-emerald-300 bg-emerald-400/10', label: 'Accuracy', value: `${pct(ov.correctAnswers, ov.completedExercises)} %` },
          { icon: Trophy, tone: 'text-violet-300 bg-violet-400/10', label: 'Exercises done', value: String(ov.completedExercises) },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-2">
              <span className={cn('grid h-7 w-7 place-items-center rounded-lg', s.tone)}>
                <s.icon className="h-4 w-4" />
              </span>
              <span className="eyebrow">{tr(s.label)}</span>
            </div>
            <div className="mt-3 font-display text-2xl font-semibold tabular-nums text-fog-100">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader
          title={tr('Study time')}
          subtitle={tr('{x} in the last {d} days · goal reached on {g} days', { x: formatMinutes(sum, tr.lang), d: days, g: goalDays })}
          action={<Segmented value={range} onChange={setRange} options={[{ value: '7', label: tr('{n} days', { n: 7 }) }, { value: '30', label: tr('{n} days', { n: 30 }) }]} />}
        />
        <div className="px-5 pb-5 pt-6">
          <div className="relative flex h-48 items-end gap-[3px] sm:gap-1.5">
            <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-brand-400/40" style={{ bottom: `calc(${(state.settings.dailyGoal / maxM) * 100}% )` }}>
              <span className="absolute -top-5 right-0 text-[10px] text-brand-300">{tr('goal {n} min', { n: state.settings.dailyGoal })}</span>
            </div>
            {series.map((s, i) => (
              <div key={s.day} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className={cn('w-full rounded-t-[4px] transition-all duration-700', s.minutes >= state.settings.dailyGoal ? 'bg-gradient-to-t from-brand-600 to-brand-400' : 'bg-white/[0.14] group-hover:bg-white/25')}
                  style={{ height: `${Math.max(2, (s.minutes / maxM) * 100)}%` }}
                />
                <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-700 px-2 py-1 text-[11px] text-fog-100 group-hover:block">
                  {s.minutes} {tr('min')} · {new Date(s.day).toLocaleDateString(tr.locale, { day: 'numeric', month: 'short' })}
                </div>
                {(days === 7 || i % 5 === 0 || i === days - 1) && (
                  <span className="mt-2 text-center text-[10px] text-fog-500">{new Date(s.day).toLocaleDateString(tr.locale, days === 7 ? { weekday: 'short' } : { day: 'numeric', month: 'numeric' })}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {(['languages', 'math', 'theory'] as SubjectKey[]).map((k) => {
          const s = subjectStats(state.activity, k);
          const meta = SUBJECTS[k];
          return (
            <Card key={k} className="p-5">
              <div className="flex items-center gap-2.5">
                <span className={cn('grid h-8 w-8 place-items-center rounded-lg', meta.soft)}>
                  <meta.icon className={cn('h-4 w-4', meta.text)} />
                </span>
                <span className="font-display text-[15px] font-semibold text-fog-100">{tr(meta.name)}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-display text-lg font-semibold tabular-nums text-fog-100">{s.accuracy} %</div>
                  <div className="text-[10px] text-fog-500">{tr('accuracy')}</div>
                </div>
                <div>
                  <div className="font-display text-lg font-semibold tabular-nums text-fog-100">{s.sessions}</div>
                  <div className="text-[10px] text-fog-500">{tr('sessions')}</div>
                </div>
                <div>
                  <div className="font-display text-lg font-semibold tabular-nums text-fog-100">{s.minutes}</div>
                  <div className="text-[10px] text-fog-500">{tr('minutes')}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weakness analysis */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title={<span className="flex items-center gap-2">{tr('Weakness analysis')} <PremiumBadge compact={isPremium} /></span>} subtitle={tr("Calculated from every answer you've given")} icon={<AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />} />
        <div className="relative p-5">
          <div className={cn('grid gap-5 md:grid-cols-3', !isPremium && 'pointer-events-none select-none blur-[5px]')} aria-hidden={!isPremium}>
            <WeakList title={tr('Vocabulary you miss most')} items={w.words} empty={tr('No missed words yet.')} />
            <WeakList title={tr('Theory cards you miss most')} items={w.cards} empty={tr('No missed theory cards yet.')} />
            <div>
              <div className="eyebrow mb-3">{tr('Math by topic and difficulty')}</div>
              <div className="space-y-2">
                {[...w.mathTopics.map((t) => ({ label: t.name, ...t })), ...w.byDifficulty.map((d) => ({ label: tr(d.d), ...d }))].map((r) => (
                  <div key={r.label} className="flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0 text-fog-300">{r.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className={cn('h-full rounded-full', pct(r.correct, r.total) >= 70 ? 'bg-emerald-500' : 'bg-amber-400')} style={{ width: `${r.total ? pct(r.correct, r.total) : 0}%` }} />
                    </div>
                    <span className="w-14 text-right text-xs tabular-nums text-fog-400">{r.total ? `${pct(r.correct, r.total)} %` : tr('no data')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {!isPremium && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <Lock className="mx-auto mb-2 h-5 w-5 text-amber-200" />
                <p className="mb-3 text-sm text-fog-200">{tr('See exactly which words, cards and exercise types cost you points.')}</p>
                <Button variant="premium" size="sm" onClick={() => openUpgrade('Detailed weakness analysis')}>
                  {tr('Unlock with Premium')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title={tr('Session history')} subtitle={tr('{n} sessions', { n: state.activity.length })} icon={<TrendingUp className="mt-0.5 h-4 w-4 text-fog-300" />} />
        <div className="overflow-x-auto p-2">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-fog-500">
                <th className="px-3 py-2 font-semibold">{tr('Session')}</th>
                <th className="px-3 py-2 font-semibold">{tr('Subject')}</th>
                <th className="px-3 py-2 text-right font-semibold">{tr('Score')}</th>
                <th className="px-3 py-2 text-right font-semibold">{tr('Time')}</th>
                <th className="px-3 py-2 text-right font-semibold">{tr('When')}</th>
              </tr>
            </thead>
            <tbody>
              {state.activity.slice(0, 25).map((a) => (
                <tr key={a.id} className="border-t border-white/[0.04]">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-fog-100">{a.sample ? tr(a.title) : a.title}</div>
                    <div className="text-xs text-fog-500">
                      {tr(a.detail)}
                      {a.sample && ` · ${tr('sample')}`}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={a.subject === 'languages' ? 'purple' : a.subject === 'math' ? 'blue' : 'green'}>{tr(a.subject in SUBJECTS ? SUBJECTS[a.subject as SubjectKey].name : a.subject)}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fog-200">{a.total ? `${a.correct}/${a.total}` : '–'}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fog-400">{a.minutes} {tr('min')}</td>
                  <td className="px-3 py-2.5 text-right text-xs text-fog-500">{relativeTime(a.at, tr.lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {state.activity.length === 0 && <p className="py-8 text-center text-sm text-fog-400">{tr('Your finished sessions will show up here.')}</p>}
        </div>
      </Card>
    </div>
  );
}

function WeakList({ title, items, empty }: { title: string; items: { label: string; where: string; wrong: number; total: number }[]; empty: string }) {
  const tr = useT();
  return (
    <div>
      <div className="eyebrow mb-3">{title}</div>
      {items.length === 0 ? (
        <p className="text-sm text-fog-500">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((i) => (
            <li key={i.label + i.where} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm text-fog-100">{i.label}</div>
                <div className="truncate text-[11px] text-fog-500">{i.where}</div>
              </div>
              <span className="shrink-0 rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[11px] tabular-nums text-rose-300">
                {i.wrong}/{i.total} {tr('wrong')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
