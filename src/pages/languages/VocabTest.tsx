import { useT } from '@/i18n';
import { useMemo, useState } from 'react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { buildQuiz } from '@/lib/quiz';
import { review } from '@/lib/srs';
import { Badge, PageHeader } from '@/components/ui';
import { MultipleChoiceTest } from '@/components/study/MultipleChoiceTest';
import { NotFound } from '../NotFound';

export function VocabTest({ listId, direction = 'mix' }: { listId: string; direction?: string }) {
  const { state, update, logActivity } = useStore();
  const t = useT();
  const list = state.vocabLists.find((l) => l.id === listId);
  const [round, setRound] = useState(0);

  const questions = useMemo(() => {
    if (!list) return [];
    const fwd = list.words.map((w) => ({ id: w.id, prompt: w.term, answer: w.translation }));
    const rev = list.words.map((w) => ({ id: w.id, prompt: w.translation, answer: w.term }));
    if (direction === 'fwd') return buildQuiz(fwd, 10).map((q) => ({ ...q, dir: 'fwd' as const }));
    if (direction === 'rev') return buildQuiz(rev, 10).map((q) => ({ ...q, dir: 'rev' as const }));
    const a = buildQuiz(fwd, 5).map((q) => ({ ...q, dir: 'fwd' as const }));
    const b = buildQuiz(rev, 10)
      .filter((q) => !a.some((x) => x.sourceId === q.sourceId))
      .slice(0, 5)
      .map((q) => ({ ...q, dir: 'rev' as const }));
    return [...a, ...b].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, direction, round]);

  if (!list || list.words.length < 4) return <NotFound />;
  const dirText = direction === 'fwd' ? `${t(list.sourceLang)} → ${t(list.targetLang)}` : direction === 'rev' ? `${t(list.targetLang)} → ${t(list.sourceLang)}` : t('Both directions');

  return (
    <div>
      <PageHeader back={{ label: list.name, to: `languages-${list.id}` }} eyebrow={<Badge tone="purple">{t('Vocabulary test')} · {dirText}</Badge>} title={list.name} />
      <MultipleChoiceTest
        key={round}
        questions={questions}
        promptLabel={(q) => {
          const d = (q as (typeof questions)[number]).dir;
          return t('Translate into {l}', { l: t(d === 'fwd' ? list.targetLang : list.sourceLang) });
        }}
        onAnswer={(q, ok) =>
          update((s) => ({
            ...s,
            vocabLists: s.vocabLists.map((l) => (l.id === list.id ? { ...l, words: l.words.map((w) => (w.id === q.sourceId ? review(w, ok) : w)) } : l)),
          }))
        }
        onFinish={(r) => logActivity({ subject: 'languages', title: list.name, detail: `${t('Multiple-choice test')} · ${dirText}`, correct: r.correct, total: r.total, minutes: r.minutes })}
        onRetry={() => setRound((r) => r + 1)}
        onExit={() => navigate(`languages-${list.id}`)}
      />
    </div>
  );
}
