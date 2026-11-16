import { useT } from '@/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, Shuffle, Trophy, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar, ProgressRing } from '../ui/Progress';
import { Flashcard, type FlashcardData } from './Flashcard';
import { shuffle as shuffleArr } from '@/lib/utils';

export interface SessionResult {
  correct: number;
  total: number;
  minutes: number;
  missed: FlashcardData[];
}

export function StudySession({
  cards,
  frontLabel,
  backLabel,
  accent,
  onGrade,
  onFinish,
  onExit,
}: {
  cards: FlashcardData[];
  frontLabel: string;
  backLabel: string;
  accent?: 'violet' | 'emerald' | 'sky';
  onGrade: (id: string, correct: boolean) => void;
  onFinish: (r: SessionResult) => void;
  onExit: () => void;
}) {
  const t = useT();
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const started = useRef(Date.now());
  const finishedRef = useRef<SessionResult | null>(null);

  const card = deck[index];
  const correct = Object.values(results).filter(Boolean).length;

  const grade = useCallback(
    (ok: boolean) => {
      if (!card || !flipped) return;
      onGrade(card.id, ok);
      const next = { ...results, [card.id]: ok };
      setResults(next);
      setFlipped(false);
      if (index + 1 >= deck.length) {
        const r: SessionResult = {
          correct: Object.values(next).filter(Boolean).length,
          total: deck.length,
          minutes: Math.max(1, Math.round((Date.now() - started.current) / 60000)),
          missed: deck.filter((c) => next[c.id] === false),
        };
        finishedRef.current = r;
        setDone(true);
        onFinish(r);
      } else {
        // wait for the card to flip back before showing the next one
        window.setTimeout(() => setIndex((i) => i + 1), 180);
      }
    },
    [card, flipped, results, index, deck, onGrade, onFinish],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === '1' || e.key === 'ArrowLeft') grade(false);
      else if (e.key === '2' || e.key === 'ArrowRight') grade(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [grade, done]);

  const restart = (subset?: FlashcardData[]) => {
    setDeck(subset ?? shuffleArr(cards));
    setIndex(0);
    setResults({});
    setFlipped(false);
    setDone(false);
    started.current = Date.now();
  };

  const summary = finishedRef.current;
  const score = useMemo(() => (summary ? Math.round((summary.correct / summary.total) * 100) : 0), [summary]);

  if (done && summary) {
    return (
      <div className="mx-auto max-w-xl animate-scale-in">
        <div className="surface p-8 text-center">
          <ProgressRing value={score} size={140} stroke={12} color={score >= 80 ? '#10b981' : score >= 50 ? '#8b5cf6' : '#f59e0b'}>
            <div>
              <div className="font-display text-3xl font-semibold text-fog-100">{score}%</div>
              <div className="text-xs text-fog-400">{t('known')}</div>
            </div>
          </ProgressRing>
          <h2 className="mt-5 flex items-center justify-center gap-2 font-display text-xl font-semibold text-fog-100">
            {score >= 80 && <Trophy className="h-5 w-5 text-amber-300" />}
            {score >= 80 ? t('Excellent session!') : score >= 50 ? t('Good progress') : t('Keep going, it gets easier')}
          </h2>
          <p className="mt-1 text-sm text-fog-400">
            {t('You knew {c} of {n} cards in {m} min.', { c: summary.correct, n: summary.total, m: summary.minutes })}
          </p>
          {summary.missed.length > 0 && (
            <div className="mt-6 rounded-2xl bg-white/[0.03] p-4 text-left ring-1 ring-white/[0.06]">
              <div className="eyebrow mb-2">{t('Review these')}</div>
              <ul className="space-y-1.5">
                {summary.missed.slice(0, 6).map((m) => (
                  <li key={m.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-fog-200">{m.front}</span>
                    <span className="text-right text-fog-400">{m.back}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {summary.missed.length > 0 && (
              <Button onClick={() => restart(summary.missed)} icon={<RotateCcw className="h-4 w-4" />}>
                {t('Practise {n} missed', { n: summary.missed.length })}
              </Button>
            )}
            <Button variant="secondary" onClick={() => restart()} icon={<Shuffle className="h-4 w-4" />}>
              {t('Study all again')}
            </Button>
            <Button variant="ghost" onClick={onExit}>
              {t('Done')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-4">
        <span className="text-xs font-medium tabular-nums text-fog-400">
          {index + 1} / {deck.length}
        </span>
        <ProgressBar value={(index / deck.length) * 100} className="flex-1" />
        <span className="flex items-center gap-1 text-xs tabular-nums text-emerald-300">
          <Check className="h-3.5 w-3.5" />
          {correct}
        </span>
        <span className="flex items-center gap-1 text-xs tabular-nums text-rose-300">
          <X className="h-3.5 w-3.5" />
          {Object.keys(results).length - correct}
        </span>
      </div>

      <div key={card.id} className="animate-fade-up">
        <Flashcard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} frontLabel={frontLabel} backLabel={backLabel} accent={accent} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => grade(false)}
          disabled={!flipped}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15 disabled:opacity-40"
        >
          <X className="h-4 w-4" /> {t("Didn't know")} <kbd className="ml-1 hidden rounded bg-white/10 px-1.5 text-[10px] sm:inline">1</kbd>
        </button>
        <button
          onClick={() => grade(true)}
          disabled={!flipped}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/15 disabled:opacity-40"
        >
          <Check className="h-4 w-4" /> {t('Knew it')} <kbd className="ml-1 hidden rounded bg-white/10 px-1.5 text-[10px] sm:inline">2</kbd>
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-fog-500">{flipped ? t('How did you do?') : t('Think of the answer, then flip the card.')}</p>
      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" onClick={onExit}>
          {t('End session')}
        </Button>
      </div>
    </div>
  );
}
