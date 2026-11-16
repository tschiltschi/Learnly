import { useT } from '@/i18n';
import { ArrowRight, Calculator, CheckCircle2, Circle, GraduationCap, Percent, Shapes, Sigma, Target, Timer, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn, pct } from '@/lib/utils';
import { getMathExercises, getMathTopics } from '@/data/math';
import { Badge, Button, Card, PageHeader, ProgressBar } from '@/components/ui';
import { LockedFeature } from '@/components/premium/PremiumLock';
import { MathPractice } from './MathPractice';
import { NotFound } from '../NotFound';
import type { MathAttempt, MathTopicId } from '@/types';

const TOPIC_ICONS: Record<MathTopicId, typeof Sigma> = { algebra: Sigma, geometry: Shapes, percentages: Percent };

export function exerciseStatus(attempts: MathAttempt[], id: string): 'new' | 'solved' | 'failed' {
  const rows = attempts.filter((a) => a.exerciseId === id);
  if (!rows.length) return 'new';
  return rows[rows.length - 1].correct ? 'solved' : 'failed';
}

export function MathPage({ params }: { params: string[] }) {
  const { isPremium, openUpgrade } = useStore();
  const t = useT();
  const TOPICS = getMathTopics(t.lang);
  const EXS = getMathExercises(t.lang);
  const [topic, sub] = params;
  if (topic === 'exam') {
    if (!isPremium) return <ExamGate onBlocked={() => openUpgrade('Realistic exam simulations')} />;
    return <MathPractice exercises={pickExam(TOPICS, EXS)} mode="exam" title={t('Exam simulation')} backTo="math" />;
  }
  if (topic) {
    const tp = TOPICS.find((x) => x.id === topic);
    if (!tp) return <NotFound />;
    const list = EXS.filter((e) => e.topic === tp.id);
    if (sub === 'practice') return <MathPractice exercises={list} mode="practice" title={tp.name} backTo={`math-${tp.id}`} />;
    if (sub) {
      const start = list.findIndex((e) => e.id === sub);
      if (start >= 0) return <MathPractice exercises={[...list.slice(start), ...list.slice(0, start)]} mode="practice" title={tp.name} backTo={`math-${tp.id}`} />;
    }
    return <TopicView topicId={tp.id} />;
  }
  return <MathOverview />;
}

function ExamGate({ onBlocked }: { onBlocked: () => void }) {
  useEffect(() => {
    onBlocked();
    navigate('math');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function pickExam(TOPICS: ReturnType<typeof getMathTopics>, EXS: ReturnType<typeof getMathExercises>) {
  // 2 exercises per topic, one medium and one hard where possible
  return TOPICS.flatMap((t) => {
    const ex = EXS.filter((e) => e.topic === t.id);
    return [ex.find((e) => e.difficulty === 'Medium')!, ex.find((e) => e.difficulty === 'Hard')!].filter(Boolean);
  });
}

function MathOverview() {
  const { state } = useStore();
  const t = useT();
  const TOPICS = getMathTopics(t.lang);
  const EXS = getMathExercises(t.lang);

  const attempts = state.mathAttempts;
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const solved = EXS.filter((e) => exerciseStatus(attempts, e.id) === 'solved').length;

  return (
    <div>
      <PageHeader
        eyebrow={<Badge tone="blue">{t('Mathematics')}</Badge>}
        title={t('Mathematics')}
        description={t('Pick a topic, practise realistic exercises and see every solution worked out step by step.')}
        actions={
          <Button onClick={() => navigate('math-percentages-practice')} icon={<ArrowRight className="h-4 w-4" />}>
            {t('Quick practice')}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="eyebrow">{t('Solved')}</div>
          <div className="mt-1 font-display text-xl font-semibold tabular-nums text-fog-100">
            {solved}
            <span className="text-sm font-normal text-fog-500"> / {EXS.length}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="eyebrow">{t('Accuracy')}</div>
          <div className="mt-1 font-display text-xl font-semibold tabular-nums text-fog-100">{total ? `${pct(correct, total)} %` : '–'}</div>
        </Card>
        <Card className="p-4">
          <div className="eyebrow">{t('Attempts')}</div>
          <div className="mt-1 font-display text-xl font-semibold tabular-nums text-fog-100">{total}</div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TOPICS.map((tp, i) => {
          const ex = EXS.filter((e) => e.topic === tp.id);
          const s = ex.filter((e) => exerciseStatus(attempts, e.id) === 'solved').length;
          const Icon = TOPIC_ICONS[tp.id];
          return (
            <Card key={tp.id} interactive onClick={() => navigate(`math-${tp.id}`)} className="group flex animate-fade-up flex-col p-5" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-900/40">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge tone="blue">{t('{n} exercises', { n: ex.length })}</Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-fog-100">{tp.name}</h3>
              <p className="mt-1 text-sm text-fog-400">{tp.description}</p>
              <div className="math mt-4 truncate rounded-lg bg-ink-950/60 px-3 py-2 text-xs text-sky-200 ring-1 ring-white/5">{tp.formulas[0].formula}</div>
              <div className="mt-auto pt-5">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-fog-500">
                    {t('{a} of {b} solved', { a: s, b: ex.length })}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-sky-300 transition group-hover:gap-1.5">
                    {t('Open')} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <ProgressBar value={(s / ex.length) * 100} color="bg-sky-500" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <LockedFeature icon={<Timer className="h-4 w-4" />} title="Realistic exam simulations" description="A timed 6-question exam across all topics, graded at the end like the real thing." onUnlocked={() => navigate('math-exam')} />
        <LockedFeature icon={<Target className="h-4 w-4" />} title="Detailed weakness analysis" description="Find the exact exercise types that cost you points." onUnlocked={() => navigate('progress')} />
      </div>
    </div>
  );
}

function TopicView({ topicId }: { topicId: MathTopicId }) {
  const { state } = useStore();
  const t = useT();
  const TOPICS = getMathTopics(t.lang);
  const EXS = getMathExercises(t.lang);

  const tp = TOPICS.find((x) => x.id === topicId)!;
  const ex = EXS.filter((e) => e.topic === topicId);
  const diffTone = { Easy: 'green', Medium: 'amber', Hard: 'rose' } as const;

  return (
    <div>
      <PageHeader
        back={{ label: t('Mathematics'), to: 'math' }}
        eyebrow={<Badge tone="blue">{t('Topic')}</Badge>}
        title={tp.name}
        description={tp.description}
        actions={
          <Button onClick={() => navigate(`math-${tp.id}-practice`)} icon={<Calculator className="h-4 w-4" />}>
            {t('Practise all {n}', { n: ex.length })}
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h3 className="font-display text-[15px] font-semibold text-fog-100">{t('Exercises')}</h3>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {ex.map((e) => {
              const st = exerciseStatus(state.mathAttempts, e.id);
              return (
                <li key={e.id}>
                  <button onClick={() => navigate(`math-${tp.id}-${e.id}`)} className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]">
                    {st === 'solved' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> : st === 'failed' ? <XCircle className="h-5 w-5 shrink-0 text-rose-400" /> : <Circle className="h-5 w-5 shrink-0 text-fog-500" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-fog-100">{e.title}</div>
                      <div className="math mt-0.5 truncate text-xs text-fog-400">{e.question}</div>
                    </div>
                    <Badge tone={diffTone[e.difficulty]}>{t(e.difficulty)}</Badge>
                    <ArrowRight className="hidden h-4 w-4 text-fog-500 transition group-hover:translate-x-0.5 group-hover:text-fog-200 sm:block" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="h-fit p-5">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-sky-300" />
            <h3 className="font-display text-[15px] font-semibold text-fog-100">{t('Formula sheet')}</h3>
          </div>
          <div className="space-y-3">
            {tp.formulas.map((f) => (
              <div key={f.name} className="rounded-xl bg-ink-950/50 p-3 ring-1 ring-white/[0.05]">
                <div className="text-xs text-fog-400">{f.name}</div>
                <div className={cn('math mt-1 text-[15px] text-sky-100')}>{f.formula}</div>
                {f.note && <div className="mt-1 text-[11px] text-fog-500">{f.note}</div>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
