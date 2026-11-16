import { useT } from '@/i18n';
import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Brain, CalendarClock, Languages, Layers, Sparkles } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { BOX_INTERVALS, isDue, masteryOf, review } from '@/lib/srs';
import { cn, shuffle } from '@/lib/utils';
import { Badge, Button, Card, EmptyState, PageHeader, PremiumBadge, ProgressBar } from '@/components/ui';
import { StudySession } from '@/components/study/StudySession';
import type { FlashcardData } from '@/components/study/Flashcard';
import type { AppState, ReviewStats } from '@/types';

function collectDue(state: AppState): FlashcardData[] {
  const out: FlashcardData[] = [];
  for (const l of state.vocabLists) for (const w of l.words) if (isDue(w)) out.push({ id: `v_${l.id}_${w.id}`, front: w.term, back: w.translation, hint: `${l.name} · ${l.targetLang}` });
  for (const t of state.theoryTopics) for (const c of t.cards) if (isDue(c)) out.push({ id: `t_${t.id}_${c.id}`, front: c.front, back: c.back, hint: t.title });
  return out;
}

export function FlashcardsPage() {
  const { state, update, logActivity, isPremium, openUpgrade } = useStore();
  const tr = useT();
  const [reviewing, setReviewing] = useState(false);

  const decks: { id: string; kind: 'vocab' | 'theory'; name: string; meta: string; items: ReviewStats[]; route: string; study: string }[] = [
    ...state.vocabLists.map((l) => ({ id: l.id, kind: 'vocab' as const, name: l.name, meta: `${tr(l.sourceLang)} → ${tr(l.targetLang)}`, items: l.words, route: `languages-${l.id}`, study: `languages-${l.id}-study-fwd` })),
    ...state.theoryTopics.map((t) => ({ id: t.id, kind: 'theory' as const, name: t.title, meta: tr(t.subject), items: t.cards, route: `theory-${t.id}`, study: `theory-${t.id}-study` })),
  ];
  const all = decks.flatMap((d) => d.items);
  const due = all.filter((i) => isDue(i)).length;
  const boxes = BOX_INTERVALS.map((_, b) => all.filter((i) => i.box === b).length);
  const maxBox = Math.max(1, ...boxes);

  // Built once when the session starts so grading doesn't change the deck.
  const queue = useMemo(() => (reviewing ? shuffle(collectDue(state)).slice(0, 30) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviewing]);

  if (reviewing && queue.length) {
    return (
      <div>
        <PageHeader eyebrow={<Badge tone="amber">{tr('Smart review · spaced repetition')}</Badge>} title={tr("Today's review")} description={tr('Cards from all your decks that are due today.')} />
        <StudySession
          cards={queue}
          frontLabel={tr('Recall')}
          backLabel={tr('Answer')}
          accent="violet"
          onGrade={(id, ok) => {
            const [kind, deckId, itemId] = id.split('_');
            update((s) =>
              kind === 'v'
                ? { ...s, vocabLists: s.vocabLists.map((l) => (l.id === deckId ? { ...l, words: l.words.map((w) => (w.id === itemId ? review(w, ok) : w)) } : l)) }
                : { ...s, theoryTopics: s.theoryTopics.map((t) => (t.id === deckId ? { ...t, cards: t.cards.map((c) => (c.id === itemId ? review(c, ok) : c)) } : t)) },
            );
          }}
          onFinish={(r) => logActivity({ subject: 'languages', title: tr('Smart review'), detail: tr('Spaced repetition · all decks'), correct: r.correct, total: r.total, minutes: r.minutes })}
          onExit={() => setReviewing(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={tr('My Flashcards')} description={tr('All your decks in one place: vocabulary lists and theory topics.')} />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <Brain className="h-4 w-4 text-brand-300" />
            <span className="text-sm font-semibold text-fog-100">{tr('Smart review')}</span>
            <PremiumBadge compact={isPremium} />
          </div>
          <div className="relative mt-4 flex items-end gap-3">
            <span className="font-display text-5xl font-semibold tabular-nums text-fog-100">{due}</span>
            <span className="pb-2 text-sm text-fog-400">{tr('cards due today across {n} decks', { n: decks.length })}</span>
          </div>
          <p className="relative mt-2 max-w-md text-sm text-fog-400">{tr("Learnly schedules each card right before you're likely to forget it: after 1, 2, 4, 8 and 16 days. Missed cards come back tomorrow.")}</p>
          <Button
            className="relative mt-5"
            variant={isPremium ? 'primary' : 'premium'}
            disabled={isPremium && due === 0}
            onClick={() => (isPremium ? setReviewing(true) : openUpgrade('Intelligent spaced repetition'))}
            icon={isPremium ? <Sparkles className="h-4 w-4" /> : undefined}
          >
            {isPremium ? (due ? tr('Review {n} cards', { n: Math.min(due, 30) }) : tr('All caught up')) : tr('Unlock smart review')}
          </Button>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-fog-300" />
            <span className="text-sm font-semibold text-fog-100">{tr('Memory strength')}</span>
          </div>
          <div className={cn('mt-5 flex h-32 items-end gap-2', !isPremium && 'blur-[2px]')}>
            {boxes.map((n, b) => (
              <div key={b} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[11px] tabular-nums text-fog-300">{n}</span>
                <div className="w-full rounded-t-md" style={{ height: `${Math.max(4, (n / maxBox) * 100)}%`, background: `rgba(139,92,246,${0.25 + b * 0.15})` }} />
                <span className="text-[10px] text-fog-500">{b === 0 ? tr('New') : `${BOX_INTERVALS[b]} ${tr('d')}`}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-fog-500">{isPremium ? tr('Cards per review interval. Further right means stronger memory.') : tr('Available with Premium.')}</p>
        </Card>
      </div>

      {decks.length === 0 ? (
        <EmptyState icon={Layers} title={tr('No decks yet')} description={tr('Create a vocabulary list or a theory topic to get your first flashcards.')} action={<Button onClick={() => navigate('languages')}>{tr('Create a vocabulary list')}</Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {decks.map((d) => {
            const m = masteryOf(d.items);
            const dueHere = d.items.filter((i) => isDue(i)).length;
            const Icon = d.kind === 'vocab' ? Languages : BookOpen;
            return (
              <Card key={d.kind + d.id} className="flex items-center gap-4 p-4">
                <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', d.kind === 'vocab' ? 'bg-violet-500/10 text-violet-300' : 'bg-emerald-500/10 text-emerald-300')}>
                  <Icon className="h-5 w-5" />
                </div>
                <button onClick={() => navigate(d.route)} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium text-fog-100 hover:underline">{d.name}</div>
                  <div className="text-xs text-fog-500">
                    {d.meta} · {tr('{n} cards', { n: d.items.length })}{dueHere ? ` · ${tr('{n} due', { n: dueHere })}` : ''}
                  </div>
                  <ProgressBar value={m} className="mt-2" color={d.kind === 'vocab' ? 'bg-violet-500' : 'bg-emerald-500'} />
                </button>
                <Button size="sm" variant="secondary" disabled={!d.items.length} onClick={() => navigate(d.study)} icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  {tr('Study')}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
