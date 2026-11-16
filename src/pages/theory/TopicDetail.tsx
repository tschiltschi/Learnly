import { useT } from '@/i18n';
import { useRef, useState } from 'react';
import { Check, FileText, FileUp, Layers, ListChecks, Loader2, Pencil, Plus, ScanSearch, Sparkles, Trash2, Upload, Wand2 } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn, fileSize, relativeTime, uid } from '@/lib/utils';
import { masteryOf } from '@/lib/srs';
import { ai } from '@/services/ai';
import { aiErrorMessage } from '@/services/ai/httpProvider';
import type { ExtractedCard } from '@/lib/cardExtractor';
import { Badge, Button, Card, ConfirmDialog, DemoBadge, EmptyState, Modal, PageHeader, ProgressBar, ProgressRing, Segmented } from '@/components/ui';
import { LockedFeature } from '@/components/premium/PremiumLock';
import { NotFound } from '../NotFound';
import { TopicFormModal } from './TopicFormModal';
import type { TheoryCard, TheoryTopic } from '@/types';

type Tab = 'notes' | 'cards' | 'documents' | 'quizzes';

export function TopicDetail({ topicId }: { topicId: string }) {
  const tr = useT();
  const { state, update, toast } = useStore();
  const topic = state.theoryTopics.find((t) => t.id === topicId);
  const [tab, setTab] = useState<Tab>('notes');
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!topic) return <NotFound />;

  const patch = (fn: (t: TheoryTopic) => TheoryTopic) =>
    update((s) => ({ ...s, theoryTopics: s.theoryTopics.map((t) => (t.id === topic.id ? { ...fn(t), updatedAt: Date.now() } : t)) }));

  const mastery = masteryOf(topic.cards);
  const lastQuiz = topic.quizScores[topic.quizScores.length - 1];

  return (
    <div>
      <PageHeader
        back={{ label: tr('All topics'), to: 'theory' }}
        eyebrow={<Badge tone="green">{tr(topic.subject)}</Badge>}
        title={topic.title}
        description={topic.description}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} icon={<Pencil className="h-3.5 w-3.5" />}>
              {tr('Edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-3.5 w-3.5" />}>
              {tr('Delete')}
            </Button>
          </>
        }
      />

      {/* Progress strip */}
      <Card className="mb-6 flex flex-col gap-5 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <ProgressRing value={mastery} size={64} stroke={7} color="#10b981">
            <span className="text-sm font-semibold tabular-nums text-fog-100">{mastery}%</span>
          </ProgressRing>
          <div>
            <div className="text-sm font-medium text-fog-100">{tr('Learning progress')}</div>
            <div className="text-xs text-fog-400">
              {tr('{a} cards · {b} quizzes', { a: topic.cards.length, b: topic.quizScores.length })}{lastQuiz ? ` · ${tr('last {p}%', { p: Math.round((lastQuiz.correct / lastQuiz.total) * 100) })}` : ''}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:ml-auto">
          <Button disabled={!topic.cards.length} onClick={() => navigate(`theory-${topic.id}-study`)} icon={<Layers className="h-4 w-4" />}>
            {tr('Study flashcards')}
          </Button>
          <Button variant="secondary" disabled={topic.cards.length < 4} onClick={() => navigate(`theory-${topic.id}-quiz`)} icon={<ListChecks className="h-4 w-4" />}>
            {tr('Start quiz')}
          </Button>
        </div>
      </Card>

      <Segmented
        className="mb-5"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'notes', label: tr('Notes') },
          { value: 'cards', label: `${tr('Flashcards')} (${topic.cards.length})` },
          { value: 'documents', label: `${tr('Documents')} (${topic.documents.length})` },
          { value: 'quizzes', label: tr('Quiz history') },
        ]}
      />

      {tab === 'notes' && <NotesTab topic={topic} patch={patch} onGenerated={() => setTab('cards')} />}
      {tab === 'cards' && <CardsTab topic={topic} patch={patch} />}
      {tab === 'documents' && <DocumentsTab topic={topic} patch={patch} />}
      {tab === 'quizzes' && <QuizTab topic={topic} />}

      <TopicFormModal open={editOpen} onClose={() => setEditOpen(false)} topic={topic} />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={tr('Delete “{x}”?', { x: topic.title })}
        description={tr('This removes the topic with its notes, {a} flashcards and {b} documents.', { a: topic.cards.length, b: topic.documents.length })}
        confirmLabel={tr('Delete topic')}
        onConfirm={() => {
          update((s) => ({ ...s, theoryTopics: s.theoryTopics.filter((t) => t.id !== topic.id) }));
          toast(tr('Topic deleted'), 'info');
          navigate('theory');
        }}
      />
    </div>
  );
}

type Patch = (fn: (t: TheoryTopic) => TheoryTopic) => void;

function NotesTab({ topic, patch, onGenerated }: { topic: TheoryTopic; patch: Patch; onGenerated: () => void }) {
  const tr = useT();
  const [notes, setNotes] = useState(topic.notes);
  const dirty = notes !== topic.notes;
  const { toast } = useStore();
  const [genOpen, setGenOpen] = useState(false);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <label htmlFor="topic-notes-edit" className="font-display text-[15px] font-semibold text-fog-100">
            {tr('Learning material')}
          </label>
          <span className="text-xs text-fog-500">{tr('{n} words', { n: notes.split(/\s+/).filter(Boolean).length })}</span>
        </div>
        <textarea
          id="topic-notes-edit"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={14}
          className="input resize-y font-[450] leading-relaxed"
          placeholder={tr('Paste or write your notes. Tip: one fact per line, like\nChloroplast: The organelle where photosynthesis takes place.')}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-fog-500">{tr('“Term: definition” lines make the best flashcards.')}</span>
          <div className="flex gap-2">
            {dirty && (
              <Button variant="ghost" size="sm" onClick={() => setNotes(topic.notes)}>
                {tr('Discard')}
              </Button>
            )}
            <Button
              size="sm"
              variant={dirty ? 'primary' : 'secondary'}
              disabled={!dirty}
              onClick={() => {
                patch((t) => ({ ...t, notes }));
                toast(tr('Notes saved'));
              }}
              icon={<Check className="h-3.5 w-3.5" />}
            >
              {tr('Save notes')}
            </Button>
          </div>
        </div>
      </Card>
      <div className="space-y-3">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-emerald-300" />
            <h3 className="font-display text-[15px] font-semibold text-fog-100">{tr('Generate from notes')}</h3>
          </div>
          <p className="mt-2 text-sm text-fog-400">{tr("Create flashcards from your material, then review them before they're added.")}</p>
          <Button
            className="mt-4 w-full"
            disabled={!notes.trim()}
            onClick={() => {
              if (dirty) patch((t) => ({ ...t, notes }));
              setGenOpen(true);
            }}
            icon={<Sparkles className="h-4 w-4" />}
          >
            {tr('Generate flashcards')}
          </Button>
        </Card>
        <LockedFeature icon={<ScanSearch className="h-4 w-4" />} title="Advanced document analysis" description="Summaries and key concepts from your PDFs and slides." />
      </div>
      <GenerateModal open={genOpen} onClose={() => setGenOpen(false)} topic={{ ...topic, notes }} patch={patch} onAdded={onGenerated} />
    </div>
  );
}

function GenerateModal({ open, onClose, topic, patch, onAdded }: { open: boolean; onClose: () => void; topic: TheoryTopic; patch: Patch; onAdded: () => void }) {
  const tr = useT();
  const { consumeGeneration, generationsLeft, isPremium, openUpgrade, toast } = useStore();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<(ExtractedCard & { keep: boolean })[] | null>(null);
  const [method, setMethod] = useState<'ai' | 'rule-based'>('rule-based');

  const run = async () => {
    if (!consumeGeneration()) {
      onClose();
      openUpgrade('Unlimited AI-generated content');
      return;
    }
    setLoading(true);
    try {
      const res = await ai.generateFlashcards({ text: topic.notes, topicTitle: topic.title, max: 25 });
      const existing = new Set(topic.cards.map((c) => c.front.toLowerCase()));
      setItems(res.items.map((i) => ({ ...i, keep: !existing.has(i.front.toLowerCase()) })));
      setMethod(res.method);
    } catch (err) {
      toast(ai.isDemo ? tr('Generation failed. Please try again.') : aiErrorMessage(err, tr.lang), 'error');
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setItems(null);
    onClose();
  };

  const kept = items?.filter((i) => i.keep) ?? [];

  return (
    <Modal open={open} onClose={close} title={tr('Generate flashcards')} description={topic.title} className="sm:max-w-2xl">
      <div className="px-6 pb-6 pt-3">
        {!items && !loading && (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-sky-300/30 bg-sky-400/[0.05] p-4 text-sm text-sky-100/80">
              <div className="mb-1.5 flex items-center gap-2">
                <DemoBadge label={ai.isDemo ? tr('Demo mode') : tr('AI')} />
              </div>
              {ai.isDemo
                ? tr('No AI model is connected, so Learnly uses its built-in rule-based extractor: it turns “Term: definition” lines and “X is Y” sentences into cards. With an AI provider connected, this button generates cards from any kind of text.')
                : tr('Learnly AI will read your notes and write flashcards for the key facts.')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-fog-400">{isPremium ? tr('Unlimited generations with Premium') : tr('{n} of 10 free generations left this month', { n: generationsLeft })}</span>
              <Button onClick={run} icon={<Sparkles className="h-4 w-4" />}>
                {tr('Generate')}
              </Button>
            </div>
          </div>
        )}
        {loading && (
          <div className="space-y-2.5 py-2">
            <div className="mb-3 flex items-center gap-2 text-sm text-fog-300">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-300" /> {tr('Reading your notes…')}
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14" />
            ))}
          </div>
        )}
        {items && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-fog-300">
                {tr('{a} cards found · {b} selected', { a: items.length, b: kept.length })}
              </span>
              <DemoBadge label={method === 'rule-based' ? tr('Rule-based · no AI') : tr('AI generated')} />
            </div>
            {items.length === 0 ? (
              <p className="rounded-xl bg-white/[0.03] p-4 text-sm text-fog-400">{tr('No cards could be extracted. Write your notes as “Term: definition” lines and try again.')}</p>
            ) : (
              <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                {items.map((it, i) => (
                  <li key={i}>
                    <label className={cn('flex cursor-pointer gap-3 rounded-xl border p-3 transition', it.keep ? 'border-emerald-400/30 bg-emerald-500/[0.06]' : 'border-white/[0.06] opacity-60')}>
                      <input type="checkbox" id={`gen-${i}`} className="mt-1 accent-emerald-500" checked={it.keep} onChange={() => setItems(items.map((x, j) => (j === i ? { ...x, keep: !x.keep } : x)))} />
                      <div className="min-w-0 text-sm">
                        <div className="font-medium text-fog-100">{it.front}</div>
                        <div className="mt-0.5 text-fog-400">{it.back}</div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>
                {tr('Cancel')}
              </Button>
              <Button
                disabled={!kept.length}
                onClick={() => {
                  patch((t) => ({ ...t, cards: [...t.cards, ...kept.map((k) => ({ id: uid(), front: k.front, back: k.back, generated: true, box: 0, due: 0, correct: 0, wrong: 0 }))] }));
                  toast(tr('Added {n} flashcards', { n: kept.length }));
                  close();
                  onAdded();
                }}
              >
                {tr('Add {n} cards', { n: kept.length })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function CardsTab({ topic, patch }: { topic: TheoryTopic; patch: Patch }) {
  const tr = useT();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [editing, setEditing] = useState<TheoryCard | null>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    patch((t) => ({ ...t, cards: [...t.cards, { id: uid(), front: front.trim(), back: back.trim(), box: 0, due: 0, correct: 0, wrong: 0 }] }));
    setFront('');
    setBack('');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form onSubmit={add} className="grid gap-2.5 md:grid-cols-[1fr_1.4fr_auto]">
          <input id="card-front" className="input" placeholder={tr('Question, e.g. What is a chromatid?')} value={front} onChange={(e) => setFront(e.target.value)} aria-label={tr('Front')} />
          <input id="card-back" className="input" placeholder={tr('Answer')} value={back} onChange={(e) => setBack(e.target.value)} aria-label={tr('Back')} />
          <Button type="submit" disabled={!front.trim() || !back.trim()} icon={<Plus className="h-4 w-4" />}>
            {tr('Add card')}
          </Button>
        </form>
      </Card>
      {topic.cards.length === 0 ? (
        <EmptyState icon={Layers} title={tr('No flashcards yet')} description={tr('Add cards above, or generate them from your notes in the Notes tab.')} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {topic.cards.map((c) => (
            <Card key={c.id} className="group p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-fog-100">{c.front}</div>
                  <div className="mt-1 text-sm text-fog-400">{c.back}</div>
                </div>
                <div className="flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-fog-400 hover:bg-white/10 hover:text-fog-100" aria-label={tr('Edit card')}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => patch((t) => ({ ...t, cards: t.cards.filter((x) => x.id !== c.id) }))} className="rounded-lg p-1.5 text-fog-400 hover:bg-rose-500/15 hover:text-rose-300" aria-label={tr('Delete card')}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <ProgressBar value={(Math.min(c.box, 4) / 4) * 100} className="w-16" color="bg-emerald-500" />
                <span className="text-[11px] text-fog-500">{c.correct + c.wrong ? `${c.correct}/${c.correct + c.wrong} ${tr('correct')}` : tr('Not studied yet')}</span>
                {c.generated && <span className="ml-auto text-[10px] uppercase tracking-wider text-fog-500">{tr('generated')}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
      <EditCardModal card={editing} onClose={() => setEditing(null)} onSave={(c) => patch((t) => ({ ...t, cards: t.cards.map((x) => (x.id === c.id ? c : x)) }))} />
    </div>
  );
}

function EditCardModal({ card, onClose, onSave }: { card: TheoryCard | null; onClose: () => void; onSave: (c: TheoryCard) => void }) {
  const tr = useT();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [last, setLast] = useState<string | null>(null);
  if (card && card.id !== last) {
    setLast(card.id);
    setFront(card.front);
    setBack(card.back);
  }
  return (
    <Modal open={!!card} onClose={() => { setLast(null); onClose(); }} title={tr('Edit flashcard')}>
      <div className="space-y-3 px-6 pb-6 pt-3">
        <div>
          <label htmlFor="edit-card-front" className="label">{tr('Front')}</label>
          <input id="edit-card-front" className="input" value={front} onChange={(e) => setFront(e.target.value)} />
        </div>
        <div>
          <label htmlFor="edit-card-back" className="label">{tr('Back')}</label>
          <textarea id="edit-card-back" rows={3} className="input resize-none" value={back} onChange={(e) => setBack(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setLast(null); onClose(); }}>{tr('Cancel')}</Button>
          <Button
            disabled={!front.trim() || !back.trim()}
            onClick={() => {
              if (card) onSave({ ...card, front: front.trim(), back: back.trim() });
              setLast(null);
              onClose();
            }}
          >
            {tr('Save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const ACCEPT = '.pdf,.docx,.doc,.txt,.md';
const MAX_BYTES = 20 * 1024 * 1024;

function DocumentsTab({ topic, patch }: { topic: TheoryTopic; patch: Patch }) {
  const tr = useT();
  const { toast, isPremium } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext)) return toast(tr('{f}: only PDF, DOCX, TXT and MD files are supported', { f: file.name }), 'error');
      if (file.size > MAX_BYTES) return toast(tr('{f} is larger than 20 MB', { f: file.name }), 'error');
      setUploading((u) => [...u, file.name]);
      const finish = (extracted?: string) => {
        window.setTimeout(() => {
          setUploading((u) => u.filter((n) => n !== file.name));
          patch((t) => ({
            ...t,
            documents: [...t.documents, { id: uid(), name: file.name, size: file.size, type: file.type || ext, uploadedAt: Date.now() }],
            notes: extracted ? (t.notes ? t.notes + '\n\n' : '') + extracted.trim() : t.notes,
          }));
          toast(extracted ? tr('{f} added and its text copied into your notes', { f: file.name }) : tr('{f} uploaded', { f: file.name }));
        }, 700);
      };
      if (ext === 'txt' || ext === 'md') {
        const r = new FileReader();
        r.onload = () => finish(String(r.result ?? ''));
        r.onerror = () => finish();
        r.readAsText(file);
      } else finish();
    });
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition',
          drag ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.02]',
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-300">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-fog-100">{tr('Drop files here or click to upload')}</p>
        <p className="mt-1 text-xs text-fog-500">{tr('PDF, DOCX, TXT or MD · up to 20 MB')}</p>
        <input ref={inputRef} id="doc-upload" type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      </div>
      <p className="text-xs text-fog-500">
        {tr('Text from TXT and MD files is added to your notes straight away. Reading PDF and DOCX files needs the document service, which is not connected in this demo, so those files are stored with the topic for now.')}
      </p>

      {uploading.map((n) => (
        <Card key={n} className="flex items-center gap-3 p-4">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
          <span className="text-sm text-fog-300">{tr('Uploading {f}…', { f: n })}</span>
        </Card>
      ))}

      {topic.documents.length === 0 && !uploading.length ? (
        <EmptyState icon={FileUp} title={tr('No documents yet')} description={tr('Upload your lecture slides, worksheets or textbook chapters to keep everything for this topic in one place.')} />
      ) : (
        <Card className="divide-y divide-white/[0.05]">
          {topic.documents.map((d) => {
            const ext = d.name.split('.').pop()?.toUpperCase();
            return (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-bold', ext === 'PDF' ? 'bg-rose-500/15 text-rose-300' : ext?.startsWith('DOC') ? 'bg-sky-500/15 text-sky-300' : 'bg-white/10 text-fog-300')}>
                  {ext === 'PDF' || ext?.startsWith('DOC') ? ext : <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-fog-100">{d.name}</div>
                  <div className="text-xs text-fog-500">
                    {fileSize(d.size)} · {tr('uploaded {x}', { x: relativeTime(d.uploadedAt, tr.lang) })}
                  </div>
                </div>
                {isPremium && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        const r = await ai.analyzeDocument({ fileName: d.name, language: tr.lang });
                        setAnalysis(r.available ? [r.summary, ...(r.keyConcepts ?? []).map((k) => '• ' + k)].filter(Boolean).join('\n') : tr(r.notice ?? ''));
                      } catch (err) {
                        setAnalysis(aiErrorMessage(err, tr.lang));
                      }
                    }}
                    icon={<ScanSearch className="h-3.5 w-3.5" />}
                  >
                    {tr('Analyse')}
                  </Button>
                )}
                <button onClick={() => patch((t) => ({ ...t, documents: t.documents.filter((x) => x.id !== d.id) }))} className="rounded-lg p-2 text-fog-400 hover:bg-rose-500/15 hover:text-rose-300" aria-label={tr('Remove {f}', { f: d.name })}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </Card>
      )}
      {!isPremium && <LockedFeature icon={<ScanSearch className="h-4 w-4" />} title="Advanced document analysis" description="Get summaries, key concepts and auto-generated cards from your PDFs and DOCX files." />}
      <Modal open={analysis !== null} onClose={() => setAnalysis(null)} title={tr('Document analysis')}>
        <div className="px-6 pb-6 pt-2">
          <DemoBadge className="mb-3" />
          <p className="whitespace-pre-line text-sm text-fog-300">{analysis}</p>
        </div>
      </Modal>
    </div>
  );
}

function QuizTab({ topic }: { topic: TheoryTopic }) {
  const tr = useT();
  if (!topic.quizScores.length)
    return (
      <EmptyState
        icon={ListChecks}
        title={tr('No quizzes taken yet')}
        description={topic.cards.length < 4 ? tr('Add at least 4 flashcards, then take a quiz to test yourself.') : tr('Take your first quiz to see your progress here.')}
        action={topic.cards.length >= 4 ? <Button onClick={() => navigate(`theory-${topic.id}-quiz`)}>{tr('Start quiz')}</Button> : undefined}
      />
    );
  return (
    <Card className="p-5">
      <h3 className="font-display text-[15px] font-semibold text-fog-100">{tr('Quiz scores')}</h3>
      <div className="mt-6 flex h-40 items-end gap-3">
        {topic.quizScores.map((q, i) => {
          const p = Math.round((q.correct / q.total) * 100);
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-medium tabular-nums text-fog-200">{p} %</span>
              <div className="w-full max-w-[56px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400" style={{ height: `${Math.max(4, p)}%` }} />
              <span className="text-[10px] text-fog-500">{new Date(q.at).toLocaleDateString(tr.locale, { day: 'numeric', month: 'short' })}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
