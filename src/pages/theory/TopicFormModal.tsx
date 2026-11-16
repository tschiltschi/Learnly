import { useT } from '@/i18n';
import { useEffect, useState, type FormEvent } from 'react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { uid } from '@/lib/utils';
import { THEORY_SUBJECTS } from '@/data/theory';
import { Button, Modal } from '@/components/ui';
import type { TheoryTopic } from '@/types';

export function TopicFormModal({ open, onClose, topic }: { open: boolean; onClose: () => void; topic?: TheoryTopic }) {
  const { update, toast, state } = useStore();
  const tr = useT();
  const existing = Array.from(new Set([...THEORY_SUBJECTS, ...state.theoryTopics.map((t) => t.subject)]));
  const [subject, setSubject] = useState('Biology');
  const [customSubject, setCustomSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSubject(topic?.subject ?? 'Biology');
    setCustomSubject('');
    setTitle(topic?.title ?? '');
    setDescription(topic?.description ?? '');
    setNotes(topic?.notes ?? '');
    setError('');
  }, [open, topic]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subj = subject === '__new' ? customSubject.trim() : subject;
    if (!subj) return setError(tr('Enter a name for the new subject.'));
    if (!title.trim()) return setError(tr('Give the topic a title, for example “Photosynthesis”.'));
    if (topic) {
      update((s) => ({ ...s, theoryTopics: s.theoryTopics.map((t) => (t.id === topic.id ? { ...t, subject: subj, title: title.trim(), description: description.trim(), updatedAt: Date.now() } : t)) }));
      toast(tr('Topic updated'));
      onClose();
      return;
    }
    const id = uid();
    update((s) => ({
      ...s,
      theoryTopics: [
        { id, subject: subj, title: title.trim(), description: description.trim(), notes: notes.trim(), documents: [], cards: [], quizScores: [], createdAt: Date.now(), updatedAt: Date.now() },
        ...s.theoryTopics,
      ],
    }));
    toast(tr('Topic created'));
    onClose();
    navigate(`theory-${id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title={topic ? tr('Edit topic') : tr('New topic')} description={topic ? undefined : tr('Add your notes now or later. You can upload documents on the next screen.')}>
      <form onSubmit={submit} className="space-y-4 px-6 pb-6 pt-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="topic-subject" className="label">
              {tr('Subject')}
            </label>
            <select id="topic-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {existing.map((s) => (
                <option key={s} value={s}>{tr(s)}</option>
              ))}
              <option value="__new">{tr('+ New subject…')}</option>
            </select>
          </div>
          {subject === '__new' && (
            <div>
              <label htmlFor="topic-new-subject" className="label">
                {tr('New subject')}
              </label>
              <input id="topic-new-subject" className="input" placeholder={tr('e.g. Physics')} value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="topic-title" className="label">
            {tr('Title')}
          </label>
          <input id="topic-title" className="input" placeholder={tr('e.g. World War I: Causes')} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label htmlFor="topic-desc" className="label">
            {tr('Short description')} <span className="text-fog-500">{tr('(optional)')}</span>
          </label>
          <input id="topic-desc" className="input" placeholder={tr('What does this topic cover?')} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {!topic && (
          <div>
            <label htmlFor="topic-notes" className="label">
              {tr('Notes')} <span className="text-fog-500">{tr('(optional)')}</span>
            </label>
            <textarea id="topic-notes" rows={5} className="input resize-y text-[13px]" placeholder={tr('Write one fact per line, e.g.\nAlliance system: Network of treaties that divided Europe into two blocs.')} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        )}
        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button type="submit">{topic ? tr('Save changes') : tr('Create topic')}</Button>
        </div>
      </form>
    </Modal>
  );
}
