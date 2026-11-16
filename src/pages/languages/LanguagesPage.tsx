import { useT } from '@/i18n';
import { useState } from 'react';
import { ArrowRight, BookA, Brain, Layers, ListChecks, Plus, Search, Target } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { masteryOf, isDue } from '@/lib/srs';
import { relativeTime, cn } from '@/lib/utils';
import { subjectStats } from '@/lib/stats';
import { Badge, Button, Card, EmptyState, PageHeader, ProgressBar } from '@/components/ui';
import { LockedFeature } from '@/components/premium/PremiumLock';
import { ListFormModal } from './ListFormModal';
import { ListDetail, code } from './ListDetail';
import { VocabStudy } from './VocabStudy';
import { VocabTest } from './VocabTest';

export function LanguagesPage({ params }: { params: string[] }) {
  const [id, mode, dir] = params;
  if (id && mode === 'study') return <VocabStudy listId={id} direction={dir} />;
  if (id && mode === 'test') return <VocabTest listId={id} direction={dir} />;
  if (id) return <ListDetail listId={id} />;
  return <LanguagesOverview />;
}

const LANG_FLAG_COLORS: Record<string, string> = {
  German: 'from-amber-400/80 to-rose-500/80',
  Spanish: 'from-rose-500/80 to-amber-400/80',
  French: 'from-sky-500/80 to-rose-400/80',
  Italian: 'from-emerald-500/80 to-rose-400/80',
  English: 'from-sky-500/80 to-indigo-500/80',
};

function LanguagesOverview() {
  const { state } = useStore();
  const t = useT();
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const lists = state.vocabLists.filter((l) => (l.name + l.targetLang + l.sourceLang).toLowerCase().includes(query.toLowerCase()));
  const words = state.vocabLists.flatMap((l) => l.words);
  const stats = subjectStats(state.activity, 'languages');
  const due = words.filter((w) => isDue(w)).length;

  return (
    <div>
      <PageHeader
        eyebrow={<Badge tone="purple">{t('Languages')}</Badge>}
        title={t('Vocabulary')}
        description={t('Build your own vocabulary lists, study them as flashcards and test yourself in both directions.')}
        actions={
          <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" />}>
            {t('New list')}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat icon={<BookA className="h-4 w-4" />} label={t('Words')} value={words.length} />
        <MiniStat icon={<Brain className="h-4 w-4" />} label={t('Mastered')} value={`${masteryOf(words)} %`} />
        <MiniStat icon={<Target className="h-4 w-4" />} label={t('Test accuracy')} value={`${stats.accuracy} %`} />
        <MiniStat icon={<Layers className="h-4 w-4" />} label={t('Due for review')} value={due} />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-500" />
          <input id="vocab-search" className="input pl-9" placeholder={t('Search lists')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <span className="text-xs text-fog-500">{t('{n} lists', { n: lists.length })}</span>
      </div>

      {state.vocabLists.length === 0 ? (
        <EmptyState
          icon={BookA}
          title={t('No vocabulary lists yet')}
          description={t('Create your first list, for example English → German, and add words like Apple → Apfel.')}
          action={
            <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" />}>
              {t('Create a list')}
            </Button>
          }
        />
      ) : lists.length === 0 ? (
        <p className="py-10 text-center text-sm text-fog-400">{t('No lists match “{q}”.', { q: query })}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lists.map((l, i) => {
            const m = masteryOf(l.words);
            return (
              <Card key={l.id} interactive onClick={() => navigate(`languages-${l.id}`)} className="group flex animate-fade-up flex-col p-5" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-xs font-bold text-white', LANG_FLAG_COLORS[l.targetLang] ?? 'from-violet-500 to-indigo-600')}>
                    {code(l.targetLang)}
                  </div>
                  <Badge>{t('{n} words', { n: l.words.length })}</Badge>
                </div>
                <h3 className="mt-4 font-display text-[16px] font-semibold text-fog-100">{l.name}</h3>
                <p className="mt-0.5 text-xs text-fog-400">
                  {t(l.sourceLang)} → {t(l.targetLang)}
                </p>
                {l.description && <p className="mt-2 line-clamp-2 text-sm text-fog-400">{l.description}</p>}
                <div className="mt-auto pt-5">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-fog-500">{t('Updated {x}', { x: relativeTime(l.updatedAt, t.lang) })}</span>
                    <span className="font-medium text-violet-300">{t('{p}% mastered', { p: m })}</span>
                  </div>
                  <ProgressBar value={m} color="bg-violet-500" />
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!l.words.length}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`languages-${l.id}-study-fwd`);
                      }}
                      icon={<Layers className="h-3.5 w-3.5" />}
                    >
                      {t('Flashcards')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={l.words.length < 4}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`languages-${l.id}-test-mix`);
                      }}
                      icon={<ListChecks className="h-3.5 w-3.5" />}
                    >
                      {t('Test')}
                    </Button>
                    <ArrowRight className="ml-auto h-4 w-4 self-center text-fog-500 transition group-hover:translate-x-0.5 group-hover:text-fog-200" />
                  </div>
                </div>
              </Card>
            );
          })}
          <button onClick={() => setCreating(true)} className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-sm text-fog-400 transition hover:border-violet-400/40 hover:bg-violet-500/[0.04] hover:text-fog-100">
            <Plus className="h-5 w-5" />
            {t('New vocabulary list')}
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <LockedFeature
          icon={<Brain className="h-4 w-4" />}
          title="Intelligent spaced repetition"
          description="Review each word right before you'd forget it. Learnly schedules your daily review queue."
          onUnlocked={() => navigate('flashcards')}
        />
        <LockedFeature icon={<Target className="h-4 w-4" />} title="Detailed weakness analysis" description="See which words and patterns you miss most, across all lists." onUnlocked={() => navigate('progress')} />
      </div>

      <ListFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-violet-300">{icon}</span>
      <div>
        <div className="font-display text-lg font-semibold tabular-nums text-fog-100">{value}</div>
        <div className="text-[11px] text-fog-500">{label}</div>
      </div>
    </Card>
  );
}
