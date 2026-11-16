import { useT } from '@/i18n';
import { useEffect, useState, type FormEvent } from 'react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { uid } from '@/lib/utils';
import { Button, Modal } from '@/components/ui';
import type { VocabList } from '@/types';

export const LANGUAGES = ['English', 'German', 'Spanish', 'French', 'Italian', 'Portuguese', 'Dutch', 'Latin', 'Turkish', 'Japanese', 'Chinese'];

export function ListFormModal({ open, onClose, list }: { open: boolean; onClose: () => void; list?: VocabList }) {
  const { update, toast, state } = useStore();
  const t = useT();
  const [name, setName] = useState('');
  const [sourceLang, setSource] = useState(state.settings.nativeLanguage);
  const [targetLang, setTarget] = useState('German');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(list?.name ?? '');
      setSource(list?.sourceLang ?? state.settings.nativeLanguage);
      setTarget(list?.targetLang ?? (state.settings.nativeLanguage === 'German' ? 'English' : 'German'));
      setDescription(list?.description ?? '');
      setError('');
    }
  }, [open, list, state.settings.nativeLanguage]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(t('Give your list a name, for example “Unit 3: At school”.'));
    if (sourceLang === targetLang) return setError(t('Pick two different languages.'));
    if (list) {
      update((s) => ({
        ...s,
        vocabLists: s.vocabLists.map((l) => (l.id === list.id ? { ...l, name: name.trim(), sourceLang, targetLang, description: description.trim(), updatedAt: Date.now() } : l)),
      }));
      toast(t('List updated'));
      onClose();
    } else {
      const id = uid();
      update((s) => ({
        ...s,
        vocabLists: [{ id, name: name.trim(), sourceLang, targetLang, description: description.trim(), words: [], createdAt: Date.now(), updatedAt: Date.now() }, ...s.vocabLists],
      }));
      toast(t('List created. Add your first words.'));
      onClose();
      navigate(`languages-${id}`);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={list ? t('Edit list') : t('New vocabulary list')} description={list ? undefined : t('You can add words right after creating it.')}>
      <form onSubmit={submit} className="space-y-4 px-6 pb-6 pt-3">
        <div>
          <label className="label" htmlFor="list-name">
            {t('Name')}
          </label>
          <input id="list-name" autoFocus className="input" placeholder={t('e.g. Unit 3: At school')} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="list-source">
              {t('From')}
            </label>
            <select id="list-source" className="input" value={sourceLang} onChange={(e) => setSource(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{t(l)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="list-target">
              {t('To')}
            </label>
            <select id="list-target" className="input" value={targetLang} onChange={(e) => setTarget(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{t(l)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="list-desc">
            {t('Description')} <span className="text-fog-500">{t('(optional)')}</span>
          </label>
          <textarea id="list-desc" rows={2} className="input resize-none" placeholder={t('What is this list for?')} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button type="submit">{list ? t('Save changes') : t('Create list')}</Button>
        </div>
      </form>
    </Modal>
  );
}
