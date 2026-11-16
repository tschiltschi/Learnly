import { useT } from '@/i18n';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, ChevronDown, Clock, Lightbulb, RotateCcw, Sigma, Trophy, X } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import { Badge, Button, PageHeader, ProgressBar, ProgressRing } from '@/components/ui';
import type { MathExercise } from '@/types';
import { playFeedback } from '@/lib/sound';

function parseNumber(s: string): number | null {
  const cleaned = s
    .toLowerCase()
    .replace(/^[a-z]\s*=\s*/, '')
    .replace(/[€$%°]|cm²|cm³|m²|cm|m\b/g, '')
    .replace(/\s/g, '');
  // accept both 1,060.90 and 1060,90
  const normal = /,\d{1,2}$/.test(cleaned) && !cleaned.includes('.') ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  if (!normal || isNaN(Number(normal))) return null;
  return Number(normal);
}

export function displayAnswer(ex: MathExercise, lang: 'en' | 'de'): string {
  const a = ex.kind === 'input' && lang === 'de' ? ex.answer.replace('.', ',') : ex.answer;
  return ex.kind === 'input' && ex.unit ? `${a} ${ex.unit}` : a;
}

export function checkAnswer(ex: MathExercise, given: string): boolean {
  if (ex.kind === 'mc') return given === ex.answer;
  const n = parseNumber(given);
  const target = Number(ex.answer);
  if (n === null) return false;
  return Math.abs(n - target) <= (ex.tolerance ?? 0.001);
}

type Result = { exercise: MathExercise; given: string; correct: boolean };

export function MathPractice({ exercises, mode, title, backTo }: { exercises: MathExercise[]; mode: 'practice' | 'exam'; title: string; backTo: string }) {
  const { update, logActivity, state } = useStore();
  const t = useT();
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState('');
  const [checked, setChecked] = useState<null | boolean>(null);
  const [stepsShown, setStepsShown] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [finished, setFinished] = useState(false);
  const [left, setLeft] = useState(mode === 'exam' ? exercises.length * 120 : 0);
  const started = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const ex = exercises[index];
  const isExam = mode === 'exam';

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (!isExam || finished) return;
    const t = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(t);
  }, [isExam, finished]);

  useEffect(() => {
    if (isExam && left <= 0 && !finished) finish(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const finish = (all: Result[]) => {
    setFinished(true);
    const correct = all.filter((r) => r.correct).length;
    logActivity({
      subject: 'math',
      title: isExam ? t('Math exam simulation') : title,
      detail: isExam ? t('Exam · {n} questions', { n: exercises.length }) : t('Practice · {n} exercises', { n: all.length }),
      correct,
      total: isExam ? exercises.length : all.length,
      minutes: Math.max(1, Math.round((Date.now() - started.current) / 60000)),
    });
  };

  const submit = (e?: FormEvent, value = given) => {
    e?.preventDefault();
    if (!value.trim() || checked !== null) return;
    const ok = checkAnswer(ex, value);
    if (state.settings.soundEffects && !isExam) playFeedback(ok);
    update((s) => ({ ...s, mathAttempts: [...s.mathAttempts, { exerciseId: ex.id, correct: ok, at: Date.now() }] }));
    const next = [...results, { exercise: ex, given: value, correct: ok }];
    setResults(next);
    if (isExam) {
      advance(next);
    } else {
      setChecked(ok);
    }
  };

  const advance = (all = results) => {
    if (index + 1 >= exercises.length) return finish(all);
    setIndex((i) => i + 1);
    setGiven('');
    setChecked(null);
    setStepsShown(0);
  };

  if (finished) {
    const correct = results.filter((r) => r.correct).length;
    const total = isExam ? exercises.length : results.length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    const grade = score >= 92 ? '1' : score >= 81 ? '2' : score >= 67 ? '3' : score >= 50 ? '4' : score >= 30 ? '5' : '6';
    return (
      <div>
        <PageHeader back={{ label: t('Go back'), to: backTo }} title={isExam ? t('Exam results') : t('{x}: results', { x: title })} />
        <div className="surface mx-auto max-w-2xl animate-scale-in p-8">
          <div className="flex flex-col items-center text-center">
            <ProgressRing value={score} size={140} stroke={12} color={score >= 80 ? '#10b981' : score >= 50 ? '#3b82f6' : '#f59e0b'}>
              <div>
                <div className="font-display text-3xl font-semibold text-fog-100">{score}%</div>
                <div className="text-xs text-fog-400">
                  {correct}/{total} {t('correct')}
                </div>
              </div>
            </ProgressRing>
            <h2 className="mt-5 flex items-center gap-2 font-display text-xl font-semibold text-fog-100">
              {score >= 80 && <Trophy className="h-5 w-5 text-amber-300" />}
              {isExam ? t('Estimated grade: {g}', { g: grade }) : score >= 80 ? t('Strong work!') : t('Practice makes perfect')}
            </h2>
            {isExam && <p className="mt-1 text-xs text-fog-500">{t('Based on the German 1–6 grading scale.')}</p>}
          </div>
          <div className="mt-6 space-y-2">
            {(isExam ? exercises : results.map((r) => r.exercise)).map((e) => {
              const r = results.find((x) => x.exercise.id === e.id);
              return (
                <div key={e.id} className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.05]">
                  {r?.correct ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />}
                  <div className="min-w-0 text-sm">
                    <div className="text-fog-200">{e.title}</div>
                    <div className="mt-0.5 text-xs text-fog-400">
                      {t('Your answer:')} <span className={r?.correct ? 'text-emerald-300' : 'text-rose-300'}>{r?.given || t('No answer')}</span>
                      {!r?.correct && (
                        <>
                          {' '}
                          · {t('Correct:')} <span className="text-emerald-300">{displayAnswer(e, t.lang)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <Button
              onClick={() => {
                setIndex(0);
                setResults([]);
                setFinished(false);
                setGiven('');
                setChecked(null);
                setStepsShown(0);
                setLeft(isExam ? exercises.length * 120 : 0);
                started.current = Date.now();
              }}
              icon={<RotateCcw className="h-4 w-4" />}
            >
              {t('Try again')}
            </Button>
            <Button variant="ghost" onClick={() => navigate(backTo)}>
              {t('Done')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const diffTone = { Easy: 'green', Medium: 'amber', Hard: 'rose' } as const;
  const mm = Math.floor(Math.max(0, left) / 60);
  const ss = String(Math.max(0, left) % 60).padStart(2, '0');

  return (
    <div>
      <PageHeader back={{ label: t('Go back'), to: backTo }} eyebrow={<Badge tone="blue">{isExam ? t('Exam simulation · no hints') : t('Practice')}</Badge>} title={title} />
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-4">
          <span className="text-xs font-medium tabular-nums text-fog-400">
            {index + 1} / {exercises.length}
          </span>
          <ProgressBar value={(index / exercises.length) * 100} className="flex-1" color="bg-sky-500" />
          {isExam ? (
            <span className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium tabular-nums', left < 60 ? 'bg-rose-500/15 text-rose-300' : 'bg-white/5 text-fog-300')}>
              <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
            </span>
          ) : (
            <span className="text-xs tabular-nums text-emerald-300">{results.filter((r) => r.correct).length} {t('correct')}</span>
          )}
        </div>

        <div key={ex.id} className="surface animate-fade-up overflow-hidden">
          <div className="border-b border-white/[0.06] bg-gradient-to-r from-sky-500/10 to-transparent px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-fog-100">{ex.title}</span>
              <Badge tone={diffTone[ex.difficulty]}>{t(ex.difficulty)}</Badge>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="font-display text-lg font-medium leading-relaxed text-fog-100 sm:text-xl">{ex.question}</p>
            {ex.formula && !isExam && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-950/60 px-3 py-2 ring-1 ring-sky-400/15">
                <Sigma className="h-3.5 w-3.5 text-sky-300" />
                <span className="math text-sm text-sky-100">{ex.formula}</span>
              </div>
            )}

            {ex.kind === 'mc' ? (
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {ex.options!.map((opt) => {
                  const isAnswer = opt === ex.answer;
                  const chosen = given === opt;
                  return (
                    <button
                      key={opt}
                      disabled={checked !== null}
                      onClick={() => {
                        setGiven(opt);
                        submit(undefined, opt);
                      }}
                      className={cn(
                        'math rounded-xl border px-4 py-3.5 text-left text-[15px] transition',
                        checked === null && 'border-white/10 bg-white/[0.03] text-fog-100 hover:border-sky-400/50 hover:bg-sky-500/10',
                        checked !== null && isAnswer && 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100',
                        checked !== null && chosen && !isAnswer && 'border-rose-400/50 bg-rose-500/15 text-rose-100',
                        checked !== null && !isAnswer && !chosen && 'border-white/[0.05] text-fog-500',
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    id={`answer-${ex.id}`}
                    className={cn('input math h-12 text-base', checked === true && 'border-emerald-400/50', checked === false && 'border-rose-400/50')}
                    placeholder={t('Your answer')}
                    inputMode="decimal"
                    value={given}
                    disabled={checked !== null}
                    onChange={(e) => setGiven(e.target.value)}
                  />
                  {ex.unit && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fog-500">{ex.unit}</span>}
                </div>
                {checked === null && (
                  <Button type="submit" size="lg" disabled={!given.trim()}>
                    {isExam ? t('Submit') : t('Check')}
                  </Button>
                )}
              </form>
            )}

            {checked !== null && (
              <div className={cn('mt-5 flex animate-fade-up items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium', checked ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200')}>
                {checked ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {checked ? t('Correct, well done!') : t('Not quite. The correct answer is {a}.', { a: displayAnswer(ex, t.lang) })}
              </div>
            )}
          </div>

          {!isExam && (
            <div className="border-t border-white/[0.06] px-6 py-5 sm:px-8">
              {stepsShown === 0 ? (
                <button onClick={() => setStepsShown(1)} className="flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200">
                  <Lightbulb className="h-4 w-4" /> {checked === null ? t('Stuck? Show the first step') : t('Show step-by-step solution')}
                </button>
              ) : (
                <div>
                  <div className="eyebrow mb-3">{t('Step-by-step solution')}</div>
                  <ol className="space-y-3">
                    {ex.steps.slice(0, stepsShown).map((s, i) => (
                      <li key={i} className="flex animate-fade-up gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-500/15 text-[11px] font-semibold text-sky-200">{i + 1}</span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-sm text-fog-200">{s.text}</p>
                          {s.math && <div className="math mt-1.5 w-fit max-w-full overflow-x-auto rounded-lg bg-ink-950/60 px-3 py-2 text-sm text-sky-100 ring-1 ring-white/5">{s.math}</div>}
                        </div>
                      </li>
                    ))}
                  </ol>
                  {stepsShown < ex.steps.length && (
                    <button onClick={() => setStepsShown((n) => n + 1)} className="mt-4 flex items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200">
                      <ChevronDown className="h-4 w-4" /> {t('Next step')} ({stepsShown}/{ex.steps.length})
                    </button>
                  )}
                  {stepsShown < ex.steps.length && (
                    <button onClick={() => setStepsShown(ex.steps.length)} className="ml-4 mt-4 text-xs text-fog-500 hover:text-fog-300">
                      {t('Show all')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => (results.length ? finish(results) : navigate(backTo))}>
            {results.length ? t('Finish session') : t('Cancel')}
          </Button>
          {checked !== null && (
            <Button onClick={() => advance()} icon={<ArrowRight className="h-4 w-4" />}>
              {index + 1 >= exercises.length ? t('See results') : t('Next exercise')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
