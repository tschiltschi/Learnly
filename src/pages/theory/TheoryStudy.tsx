import { useT } from '@/i18n';
import { useMemo, useState } from 'react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { review } from '@/lib/srs';
import { shuffle } from '@/lib/utils';
import { buildQuiz } from '@/lib/quiz';
import { Badge, PageHeader } from '@/components/ui';
import { StudySession } from '@/components/study/StudySession';
import { MultipleChoiceTest } from '@/components/study/MultipleChoiceTest';
import { NotFound } from '../NotFound';

export function TheoryStudy({ topicId }: { topicId: string }) {
  const { state, update, logActivity } = useStore();
  const tr = useT();
  const topic = state.theoryTopics.find((t) => t.id === topicId);
  const cards = useMemo(() => (topic ? shuffle(topic.cards).map((c) => ({ id: c.id, front: c.front, back: c.back })) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topicId]);
  if (!topic || !cards.length) return <NotFound />;

  return (
    <div>
      <PageHeader back={{ label: topic.title, to: `theory-${topic.id}` }} eyebrow={<Badge tone="green">{tr(topic.subject)} · {tr('Flashcards')}</Badge>} title={topic.title} />
      <StudySession
        cards={cards}
        frontLabel={tr('Question')}
        backLabel={tr('Answer')}
        accent="emerald"
        onGrade={(id, ok) => update((s) => ({ ...s, theoryTopics: s.theoryTopics.map((t) => (t.id === topic.id ? { ...t, cards: t.cards.map((c) => (c.id === id ? review(c, ok) : c)) } : t)) }))}
        onFinish={(r) => logActivity({ subject: 'theory', title: topic.title, detail: tr('Flashcards'), correct: r.correct, total: r.total, minutes: r.minutes })}
        onExit={() => navigate(`theory-${topic.id}`)}
      />
    </div>
  );
}

export function TheoryQuiz({ topicId }: { topicId: string }) {
  const { state, update, logActivity } = useStore();
  const tr = useT();
  const topic = state.theoryTopics.find((t) => t.id === topicId);
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => (topic ? buildQuiz(topic.cards.map((c) => ({ id: c.id, prompt: c.front, answer: c.back })), 10) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topicId, round],
  );
  if (!topic || topic.cards.length < 4) return <NotFound />;

  return (
    <div>
      <PageHeader back={{ label: topic.title, to: `theory-${topic.id}` }} eyebrow={<Badge tone="green">{tr(topic.subject)} · {tr('Quiz')}</Badge>} title={topic.title} />
      <MultipleChoiceTest
        key={round}
        questions={questions}
        onAnswer={(q, ok) => update((s) => ({ ...s, theoryTopics: s.theoryTopics.map((t) => (t.id === topic.id ? { ...t, cards: t.cards.map((c) => (c.id === q.sourceId ? review(c, ok) : c)) } : t)) }))}
        onFinish={(r) => {
          update((s) => ({ ...s, theoryTopics: s.theoryTopics.map((t) => (t.id === topic.id ? { ...t, quizScores: [...t.quizScores, { at: Date.now(), correct: r.correct, total: r.total }] } : t)) }));
          logActivity({ subject: 'theory', title: topic.title, detail: tr('Quiz'), correct: r.correct, total: r.total, minutes: r.minutes });
        }}
        onRetry={() => setRound((x) => x + 1)}
        onExit={() => navigate(`theory-${topic.id}`)}
      />
    </div>
  );
}
