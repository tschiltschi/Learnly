import { useT } from '@/i18n';
import { useMemo } from 'react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { review } from '@/lib/srs';
import { shuffle } from '@/lib/utils';
import { Badge, PageHeader } from '@/components/ui';
import { StudySession } from '@/components/study/StudySession';
import { NotFound } from '../NotFound';

export function VocabStudy({ listId, direction = 'fwd' }: { listId: string; direction?: string }) {
  const { state, update, logActivity } = useStore();
  const t = useT();
  const list = state.vocabLists.find((l) => l.id === listId);

  // Build the deck once per visit so grading doesn't reshuffle it.
  const cards = useMemo(() => {
    if (!list) return [];
    return shuffle(list.words).map((w) => {
      const reverse = direction === 'rev' || (direction === 'mix' && Math.random() < 0.5);
      return reverse ? { id: w.id, front: w.translation, back: w.term, hint: w.note } : { id: w.id, front: w.term, back: w.translation, hint: w.note };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, direction]);

  if (!list) return <NotFound />;
  if (!cards.length) return <NotFound />;

  const labels =
    direction === 'rev'
      ? [t(list.targetLang), t(list.sourceLang)]
      : direction === 'mix'
        ? [t('Translate'), t('Answer')]
        : [t(list.sourceLang), t(list.targetLang)];
  const dirText = direction === 'rev' ? `${t(list.targetLang)} → ${t(list.sourceLang)}` : direction === 'mix' ? t('Both directions') : `${t(list.sourceLang)} → ${t(list.targetLang)}`;

  return (
    <div>
      <PageHeader back={{ label: list.name, to: `languages-${list.id}` }} eyebrow={<Badge tone="purple">{t('Flashcards')} · {dirText}</Badge>} title={list.name} />
      <StudySession
        cards={cards}
        frontLabel={labels[0]}
        backLabel={labels[1]}
        accent="violet"
        onGrade={(id, ok) =>
          update((s) => ({
            ...s,
            vocabLists: s.vocabLists.map((l) => (l.id === list.id ? { ...l, words: l.words.map((w) => (w.id === id ? review(w, ok) : w)) } : l)),
          }))
        }
        onFinish={(r) => logActivity({ subject: 'languages', title: list.name, detail: `${t('Flashcards')} · ${dirText}`, correct: r.correct, total: r.total, minutes: r.minutes })}
        onExit={() => navigate(`languages-${list.id}`)}
      />
    </div>
  );
}
