import { useT } from '@/i18n';
import { useRef, useState, type FormEvent } from 'react';
import { BookA, Check, ClipboardPaste, Layers, ListChecks, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { uid, cn, pct } from '@/lib/utils';
import { masteryOf } from '@/lib/srs';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Modal, PageHeader, ProgressBar, Segmented } from '@/components/ui';
import { NotFound } from '../NotFound';
import { ListFormModal } from './ListFormModal';
import type { VocabWord } from '@/types';

type Dir = 'fwd' | 'rev' | 'mix';

const LANG_CODES: Record<string, string> = { English: 'EN', German: 'DE', Spanish: 'ES', French: 'FR', Italian: 'IT', Portuguese: 'PT', Dutch: 'NL', Latin: 'LA', Turkish: 'TR', Japanese: 'JA', Chinese: 'ZH' };
export const code = (lang: string) => LANG_CODES[lang] ?? lang.slice(0, 2).toUpperCase();

/** "apple" in each language, used as an example in the add-word fields. */
const APPLE: Record<string, string> = { English: 'apple', German: 'der Apfel', Spanish: 'la manzana', French: 'la pomme', Italian: 'la mela', Portuguese: 'a maçã', Dutch: 'de appel', Latin: 'malum', Turkish: 'elma', Japanese: 'りんご', Chinese: '苹果' };

export function ListDetail({ listId }: { listId: string }) {
  const { state, update, toast } = useStore();
  const t = useT();
  const example = (lang: string) => (APPLE[lang] ? t('{l}, e.g. {w}', { l: t(lang), w: APPLE[lang] }) : t(lang));
  const list = state.vocabLists.find((l) => l.id === listId);
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [note, setNote] = useState('');
  const [dir, setDir] = useState<Dir>('fwd');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ term: '', translation: '', note: '' });
  const [editList, setEditList] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const termRef = useRef<HTMLInputElement>(null);

  if (!list) return <NotFound />;

  const setWords = (fn: (w: VocabWord[]) => VocabWord[]) =>
    update((s) => ({ ...s, vocabLists: s.vocabLists.map((l) => (l.id === list.id ? { ...l, words: fn(l.words), updatedAt: Date.now() } : l)) }));

  const addWord = (e: FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !translation.trim()) return;
    setWords((w) => [...w, { id: uid(), term: term.trim(), translation: translation.trim(), note: note.trim() || undefined, correct: 0, wrong: 0, box: 0, due: 0 }]);
    setTerm('');
    setTranslation('');
    setNote('');
    termRef.current?.focus();
  };

  const saveEdit = (id: string) => {
    if (!draft.term.trim() || !draft.translation.trim()) return;
    setWords((w) => w.map((x) => (x.id === id ? { ...x, term: draft.term.trim(), translation: draft.translation.trim(), note: draft.note.trim() || undefined } : x)));
    setEditing(null);
  };

  const dirLabel = { fwd: `${t(list.sourceLang)} → ${t(list.targetLang)}`, rev: `${t(list.targetLang)} → ${t(list.sourceLang)}`, mix: t('Both directions') };

  return (
    <div>
      <PageHeader
        back={{ label: t('All lists'), to: 'languages' }}
        eyebrow={
          <Badge tone="purple">
            {t(list.sourceLang)} → {t(list.targetLang)}
          </Badge>
        }
        title={list.name}
        description={list.description || t('{n} words', { n: list.words.length })}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditList(true)} icon={<Pencil className="h-3.5 w-3.5" />}>
              {t('Edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-3.5 w-3.5" />}>
              {t('Delete')}
            </Button>
          </>
        }
      />

      {/* Practice panel */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-violet-600/15 via-transparent to-transparent p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div>
              <div className="eyebrow">{t('Mastery')}</div>
              <div className="mt-1 font-display text-2xl font-semibold text-fog-100">{masteryOf(list.words)} %</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <div className="eyebrow">{t('Direction')}</div>
              <Segmented
                className="mt-1.5"
                value={dir}
                onChange={setDir}
                options={[
                  { value: 'fwd', label: `${code(list.sourceLang)} → ${code(list.targetLang)}` },
                  { value: 'rev', label: `${code(list.targetLang)} → ${code(list.sourceLang)}` },
                  { value: 'mix', label: t('Both') },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!list.words.length} onClick={() => navigate(`languages-${list.id}-study-${dir}`)} icon={<Layers className="h-4 w-4" />}>
              {t('Study flashcards')}
            </Button>
            <Button variant="secondary" disabled={list.words.length < 4} onClick={() => navigate(`languages-${list.id}-test-${dir}`)} icon={<ListChecks className="h-4 w-4" />}>
              {t('Multiple-choice test')}
            </Button>
          </div>
        </div>
        {list.words.length > 0 && list.words.length < 4 && <p className="border-t border-white/5 px-5 py-2.5 text-xs text-fog-400">{t('Add at least 4 words to unlock the multiple-choice test.')}</p>}
        <p className="border-t border-white/5 px-5 py-2.5 text-xs text-fog-500">{t('Practising: {d}', { d: dirLabel[dir] })}</p>
      </Card>

      {/* Add word */}
      <Card className="mb-4 p-4">
        <form onSubmit={addWord} className="grid gap-2.5 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input ref={termRef} id="new-term" className="input" placeholder={example(list.sourceLang)} value={term} onChange={(e) => setTerm(e.target.value)} aria-label={t(list.sourceLang)} />
          <input id="new-translation" className="input" placeholder={example(list.targetLang)} value={translation} onChange={(e) => setTranslation(e.target.value)} aria-label={t(list.targetLang)} />
          <input id="new-note" className="input" placeholder={t('Note (optional)')} value={note} onChange={(e) => setNote(e.target.value)} aria-label={t('Note')} />
          <div className="flex gap-2">
            <Button type="submit" disabled={!term.trim() || !translation.trim()} icon={<Plus className="h-4 w-4" />} className="flex-1 md:flex-none">
              {t('Add word')}
            </Button>
            <Button variant="secondary" size="icon" className="h-10 w-10" onClick={() => setImportOpen(true)} title={t('Paste many words')} aria-label={t('Paste many words')}>
              <ClipboardPaste className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Words */}
      {list.words.length === 0 ? (
        <EmptyState icon={BookA} title={t('This list is empty')} description={t('Add your first word above, or paste a whole list at once with the clipboard button.')} />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_1fr_120px_84px] gap-4 border-b border-white/[0.06] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-fog-500 md:grid">
            <span>{t(list.sourceLang)}</span>
            <span>{t(list.targetLang)}</span>
            <span>{t('Accuracy')}</span>
            <span />
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {list.words.map((w) =>
              editing === w.id ? (
                <li key={w.id} className="grid gap-2 bg-white/[0.02] px-5 py-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <input id={`edit-term-${w.id}`} className="input" value={draft.term} onChange={(e) => setDraft({ ...draft, term: e.target.value })} autoFocus />
                  <input id={`edit-tr-${w.id}`} className="input" value={draft.translation} onChange={(e) => setDraft({ ...draft, translation: e.target.value })} />
                  <input id={`edit-note-${w.id}`} className="input" placeholder={t('Note')} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && saveEdit(w.id)} />
                  <div className="flex gap-1">
                    <Button size="icon" onClick={() => saveEdit(w.id)} aria-label={t('Save')}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(null)} aria-label={t('Cancel')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ) : (
                <li key={w.id} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3 transition hover:bg-white/[0.02] md:grid-cols-[1fr_1fr_120px_84px]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-fog-100">{w.term}</div>
                    <div className="truncate text-sm text-violet-200 md:hidden">{w.translation}</div>
                  </div>
                  <div className="hidden min-w-0 md:block">
                    <div className="truncate text-sm text-violet-200">{w.translation}</div>
                    {w.note && <div className="truncate text-xs text-fog-500">{w.note}</div>}
                  </div>
                  <div className="hidden items-center gap-2 md:flex">
                    {w.correct + w.wrong > 0 ? (
                      <>
                        <ProgressBar value={pct(w.correct, w.correct + w.wrong)} className="w-14" color={pct(w.correct, w.correct + w.wrong) >= 70 ? 'bg-emerald-500' : 'bg-amber-400'} />
                        <span className="whitespace-nowrap text-xs tabular-nums text-fog-400">{pct(w.correct, w.correct + w.wrong)} %</span>
                      </>
                    ) : (
                      <span className="text-xs text-fog-500">{t('New')}</span>
                    )}
                  </div>
                  <div className={cn('flex justify-end gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100')}>
                    <button
                      onClick={() => {
                        setEditing(w.id);
                        setDraft({ term: w.term, translation: w.translation, note: w.note ?? '' });
                      }}
                      className="rounded-lg p-1.5 text-fog-400 hover:bg-white/10 hover:text-fog-100"
                      aria-label={t('Edit {x}', { x: w.term })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setWords((ws) => ws.filter((x) => x.id !== w.id));
                        toast(t('Removed “{x}”', { x: w.term }), 'info');
                      }}
                      className="rounded-lg p-1.5 text-fog-400 hover:bg-rose-500/15 hover:text-rose-300"
                      aria-label={t('Delete {x}', { x: w.term })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        </Card>
      )}

      <ListFormModal open={editList} onClose={() => setEditList(false)} list={list} />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('Delete “{x}”?', { x: list.name })}
        description={t('This removes the list and its {n} words for good.', { n: list.words.length })}
        confirmLabel={t('Delete list')}
        onConfirm={() => {
          update((s) => ({ ...s, vocabLists: s.vocabLists.filter((l) => l.id !== list.id) }));
          toast(t('List deleted'), 'info');
          navigate('languages');
        }}
      />
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(pairs) => {
          setWords((w) => [...w, ...pairs.map((p) => ({ id: uid(), term: p[0], translation: p[1], correct: 0, wrong: 0, box: 0, due: 0 }))]);
          toast(t('Added {n} words', { n: pairs.length }));
        }}
      />
    </div>
  );
}

function parsePairs(text: string): [string, string][] {
  return text
    .split('\n')
    .map((line) => line.split(/\t|\s[-–—=:]\s|;|,(?=\s*\S)/))
    .filter((parts) => parts.length >= 2 && parts[0].trim() && parts[1].trim())
    .map((parts) => [parts[0].trim(), parts.slice(1).join(', ').trim()]);
}

function ImportModal({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (p: [string, string][]) => void }) {
  const t = useT();
  const [text, setText] = useState('');
  const pairs = parsePairs(text);
  return (
    <Modal open={open} onClose={onClose} title={t('Paste many words')} description={t('One pair per line. Separate word and translation with a dash, tab, semicolon or comma.')}>
      <div className="space-y-3 px-6 pb-6 pt-3">
        <textarea id="import-text" rows={7} className="input font-mono text-[13px]" placeholder={'Apple - Apfel\nPear - Birne\nBanana - Banane'} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center justify-between">
          <span className="text-xs text-fog-400">{t('{n} pairs recognised', { n: pairs.length })}</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button
              disabled={!pairs.length}
              onClick={() => {
                onImport(pairs);
                setText('');
                onClose();
              }}
            >
              {t('Add {n} words', { n: pairs.length || '' })}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
