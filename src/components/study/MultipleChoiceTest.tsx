import { useT } from '@/i18n';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Clock, RotateCcw, Trophy, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar, ProgressRing } from '../ui/Progress';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/lib/quiz';
import { playFeedback } from '@/lib/sound';
import { useStore } from '@/store/AppStore';

export interface TestResult {
  correct: number;
  total: number;
  minutes: number;
  answers: { question: QuizQuestion; chosen: string | null; correct: boolean }[];
}

export function MultipleChoiceTest({
  questions,
  onFinish,
  onExit,
  onRetry,
  timeLimitSec,
  promptLabel,
  onAnswer,
}: {
  questions: QuizQuestion[];
  onFinish: (r: TestResult) => void;
  onExit: () => void;
  onRetry: () => void;
  timeLimitSec?: number;
  promptLabel?: (q: QuizQuestion) => string;
  onAnswer?: (q: QuizQuestion, correct: boolean) => void;
}) {
  const { state } = useStore();
  const t = useT();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<TestResult['answers']>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [left, setLeft] = useState(timeLimitSec ?? 0);
  const started = useRef(Date.now());
  const q = questions[index];

  const finish = (all: TestResult['answers']) => {
    // unanswered questions (time ran out) count as wrong
    const full = [...all, ...questions.slice(all.length).map((question) => ({ question, chosen: null, correct: false }))];
    const r: TestResult = {
      correct: full.filter((a) => a.correct).length,
      total: questions.length,
      minutes: Math.max(1, Math.round((Date.now() - started.current) / 60000)),
      answers: full,
    };
    setResult(r);
    onFinish(r);
  };

  useEffect(() => {
    if (!timeLimitSec || result) return;
    const t = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(t);
  }, [timeLimitSec, result]);

  useEffect(() => {
    if (timeLimitSec && left <= 0 && !result) finish(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const choose = (opt: string) => {
    if (chosen || !q) return;
    setChosen(opt);
    const ok = opt === q.answer;
    if (state.settings.soundEffects) playFeedback(ok);
    onAnswer?.(q, ok);
    setAnswers((a) => [...a, { question: q, chosen: opt, correct: ok }]);
  };

  const next = () => {
    if (index + 1 >= questions.length) finish(answers);
    else {
      setIndex((i) => i + 1);
      setChosen(null);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result || !q) return;
      const n = Number(e.key);
      if (!chosen && n >= 1 && n <= q.options.length) choose(q.options[n - 1]);
      else if (chosen && (e.key === 'Enter' || e.key === 'ArrowRight')) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (result) {
    const score = Math.round((result.correct / result.total) * 100);
    return (
      <div className="mx-auto max-w-2xl animate-scale-in">
        <div className="surface p-8">
          <div className="flex flex-col items-center text-center">
            <ProgressRing value={score} size={140} stroke={12} color={score >= 80 ? '#10b981' : score >= 50 ? '#8b5cf6' : '#f59e0b'}>
              <div>
                <div className="font-display text-3xl font-semibold text-fog-100">{score}%</div>
                <div className="text-xs text-fog-400">
                  {result.correct}/{result.total} {t('correct')}
                </div>
              </div>
            </ProgressRing>
            <h2 className="mt-5 flex items-center gap-2 font-display text-xl font-semibold text-fog-100">
              {score >= 80 && <Trophy className="h-5 w-5 text-amber-300" />}
              {score >= 80 ? t('Great result!') : score >= 50 ? t('Solid work') : t('Room to improve')}
            </h2>
            <p className="mt-1 text-sm text-fog-400">{t('Finished in {m} min. Your results are saved to Learning Progress.', { m: result.minutes })}</p>
          </div>
          <div className="mt-6 max-h-72 space-y-2 overflow-y-auto pr-1">
            {result.answers.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.05]">
                {a.correct ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />}
                <div className="min-w-0 text-sm">
                  <div className="text-fog-200">{a.question.prompt}</div>
                  <div className="mt-0.5 text-xs text-fog-400">
                    {a.correct ? (
                      a.question.answer
                    ) : (
                      <>
                        <span className="text-rose-300/80 line-through">{a.chosen ?? t('No answer')}</span> · <span className="text-emerald-300">{a.question.answer}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={onRetry} icon={<RotateCcw className="h-4 w-4" />}>
              {t('New test')}
            </Button>
            <Button variant="ghost" onClick={onExit}>
              {t('Done')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const mm = Math.floor(Math.max(0, left) / 60);
  const ss = String(Math.max(0, left) % 60).padStart(2, '0');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <span className="text-xs font-medium tabular-nums text-fog-400">
          {t('Question {i} of {n}', { i: index + 1, n: questions.length })}
        </span>
        <ProgressBar value={(index / questions.length) * 100} className="flex-1" />
        {timeLimitSec ? (
          <span className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium tabular-nums', left < 30 ? 'bg-rose-500/15 text-rose-300' : 'bg-white/5 text-fog-300')}>
            <Clock className="h-3.5 w-3.5" />
            {mm}:{ss}
          </span>
        ) : null}
      </div>

      <div key={q.id} className="surface animate-fade-up p-6 sm:p-8">
        <div className="eyebrow mb-3">{promptLabel ? promptLabel(q) : t('Choose the correct answer')}</div>
        <h2 className="font-display text-xl font-semibold text-fog-100 sm:text-2xl">{q.prompt}</h2>
        <div className="mt-6 grid gap-2.5">
          {q.options.map((opt, i) => {
            const isAnswer = opt === q.answer;
            const isChosen = opt === chosen;
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={!!chosen}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition',
                  !chosen && 'border-white/10 bg-white/[0.03] text-fog-100 hover:border-brand-400/50 hover:bg-brand-500/10',
                  chosen && isAnswer && 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100',
                  chosen && isChosen && !isAnswer && 'border-rose-400/50 bg-rose-500/15 text-rose-100',
                  chosen && !isAnswer && !isChosen && 'border-white/[0.06] text-fog-500',
                )}
              >
                <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-semibold', chosen && isAnswer ? 'bg-emerald-400/20' : chosen && isChosen ? 'bg-rose-400/20' : 'bg-white/[0.07] text-fog-300')}>
                  {chosen && isAnswer ? <Check className="h-3.5 w-3.5" /> : chosen && isChosen ? <X className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="min-w-0">{opt}</span>
              </button>
            );
          })}
        </div>
        {chosen && (
          <div className="mt-6 flex animate-fade-up items-center justify-between gap-3">
            <p className={cn('text-sm font-medium', chosen === q.answer ? 'text-emerald-300' : 'text-rose-300')}>
              {chosen === q.answer ? t('Correct!') : t('Not quite. The answer is “{a}”.', { a: q.answer })}
            </p>
            <Button onClick={next} icon={<ArrowRight className="h-4 w-4" />}>
              {index + 1 >= questions.length ? t('See results') : t('Next')}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" onClick={onExit}>
          {t('Quit test')}
        </Button>
      </div>
    </div>
  );
}
