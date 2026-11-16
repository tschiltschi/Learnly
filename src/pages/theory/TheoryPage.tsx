import { useT } from '@/i18n';
import { useState } from 'react';
import { ArrowRight, BookOpen, FileText, FolderOpen, Layers, Plus, Search } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn, relativeTime } from '@/lib/utils';
import { masteryOf } from '@/lib/srs';
import { Badge, Button, Card, EmptyState, PageHeader, ProgressBar } from '@/components/ui';
import { TopicFormModal } from './TopicFormModal';
import { TopicDetail } from './TopicDetail';
import { TheoryStudy, TheoryQuiz } from './TheoryStudy';

export const SUBJECT_TONES: Record<string, string> = {
  Biology: 'from-emerald-400 to-teal-600',
  History: 'from-amber-400 to-orange-600',
  'Computer Science': 'from-cyan-400 to-indigo-600',
  Chemistry: 'from-fuchsia-400 to-purple-600',
  Geography: 'from-lime-400 to-emerald-600',
  Economics: 'from-sky-400 to-blue-600',
};

export function TheoryPage({ params }: { params: string[] }) {
  const [id, mode] = params;
  if (id && mode === 'study') return <TheoryStudy topicId={id} />;
  if (id && mode === 'quiz') return <TheoryQuiz topicId={id} />;
  if (id) return <TopicDetail topicId={id} />;
  return <TheoryOverview />;
}

function TheoryOverview() {
  const { state } = useStore();
  const tr = useT();
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState<string>('All');
  const [query, setQuery] = useState('');
  const subjects = Array.from(new Set(state.theoryTopics.map((t) => t.subject)));
  const topics = state.theoryTopics.filter((t) => (subject === 'All' || t.subject === subject) && (t.title + t.description).toLowerCase().includes(query.toLowerCase()));
  const grouped = subjects.filter((s) => subject === 'All' || s === subject).map((s) => ({ subject: s, topics: topics.filter((t) => t.subject === s) })).filter((g) => g.topics.length);
  const allCards = state.theoryTopics.flatMap((t) => t.cards);
  const docs = state.theoryTopics.reduce((n, t) => n + t.documents.length, 0);

  return (
    <div>
      <PageHeader
        eyebrow={<Badge tone="green">{tr('Theory')}</Badge>}
        title={tr('Theory')}
        description={tr('Organise your subjects into topics, upload your learning material and turn it into flashcards and quizzes.')}
        actions={
          <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" />}>
            {tr('New topic')}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: FolderOpen, label: 'Subjects', value: subjects.length },
          { icon: BookOpen, label: 'Topics', value: state.theoryTopics.length },
          { icon: Layers, label: 'Flashcards', value: allCards.length },
          { icon: FileText, label: 'Documents', value: docs },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300">
              <s.icon className="h-4 w-4" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold tabular-nums text-fog-100">{s.value}</div>
              <div className="text-[11px] text-fog-500">{tr(s.label)}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {['All', ...subjects].map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition', subject === s ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200' : 'border-white/10 text-fog-400 hover:border-white/20 hover:text-fog-100')}
            >
              {tr(s)}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-500" />
          <input id="theory-search" className="input pl-9" placeholder={tr('Search topics')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {state.theoryTopics.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={tr('No topics yet')}
          description={tr('Create a topic like “Photosynthesis” or “World War I”, paste your notes and Learnly turns them into flashcards.')}
          action={
            <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" />}>
              {tr('Create your first topic')}
            </Button>
          }
        />
      ) : grouped.length === 0 ? (
        <p className="py-10 text-center text-sm text-fog-400">{tr('No topics match your filters.')}</p>
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <section key={g.subject}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className={cn('h-2.5 w-2.5 rounded-full bg-gradient-to-br', SUBJECT_TONES[g.subject] ?? 'from-emerald-400 to-emerald-600')} />
                <h2 className="font-display text-[15px] font-semibold text-fog-100">{tr(g.subject)}</h2>
                <span className="text-xs text-fog-500">{tr('{n} topics', { n: g.topics.length })}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {g.topics.map((t) => {
                  const m = masteryOf(t.cards);
                  const lastQuiz = t.quizScores[t.quizScores.length - 1];
                  return (
                    <Card key={t.id} interactive onClick={() => navigate(`theory-${t.id}`)} className="group flex animate-fade-up flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg', SUBJECT_TONES[t.subject] ?? 'from-emerald-400 to-emerald-600')}>
                          <BookOpen className="h-[18px] w-[18px]" />
                        </div>
                        <div className="flex gap-1.5">
                          {t.documents.length > 0 && (
                            <Badge>
                              <FileText className="h-3 w-3" />
                              {t.documents.length}
                            </Badge>
                          )}
                          <Badge>{tr('{n} cards', { n: t.cards.length })}</Badge>
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-[16px] font-semibold text-fog-100">{t.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-fog-400">{t.description}</p>
                      <div className="mt-auto pt-5">
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-fog-500">{lastQuiz ? tr('Last quiz {p}%', { p: Math.round((lastQuiz.correct / lastQuiz.total) * 100) }) : tr('Updated {x}', { x: relativeTime(t.updatedAt, tr.lang) })}</span>
                          <span className="flex items-center gap-1 font-medium text-emerald-300">
                            {m} % <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
                        <ProgressBar value={m} color="bg-emerald-500" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      <TopicFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
