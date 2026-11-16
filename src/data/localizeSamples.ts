import type { AppState, CoachThread, TheoryTopic, VocabList } from '@/types';
import { VOCAB_DE, THEORY_DE } from './samples.de';

type Lang = 'en' | 'de';

/** Apply the German text to English sample lists. Progress fields are left untouched. */
export function vocabToGerman(lists: VocabList[]): VocabList[] {
  return lists.map((l) => {
    const d = VOCAB_DE[l.id];
    if (!d) return l;
    return {
      ...l,
      name: d.name,
      description: d.description,
      sourceLang: d.sourceLang,
      targetLang: d.targetLang,
      words: l.words.map((w) => {
        const x = d.words[w.id];
        return x ? { ...w, term: x[0], translation: x[1], note: x[2] } : w;
      }),
    };
  });
}

export function theoryToGerman(topics: TheoryTopic[]): TheoryTopic[] {
  return topics.map((t) => {
    const d = THEORY_DE[t.id];
    if (!d) return t;
    return {
      ...t,
      title: d.title,
      description: d.description,
      notes: d.notes,
      documents: t.documents.map((doc) => ({ ...doc, name: d.documents?.[doc.id] ?? doc.name })),
      cards: t.cards.map((c) => {
        const x = d.cards[c.id];
        return x ? { ...c, front: x[0], back: x[1] } : c;
      }),
    };
  });
}

/** Keep `cur` unless it still holds the built-in text of the old language. */
const swap = <T,>(cur: T, from: T | undefined, to: T | undefined): T => (from !== undefined && cur === from ? (to as T) : cur);

interface Versions {
  vocab: Record<Lang, VocabList[]>;
  theory: Record<Lang, TheoryTopic[]>;
  thread: Record<Lang, CoachThread>;
}

/**
 * Switches the built-in sample content to another language when the interface language changes.
 * Only text the user has not changed is replaced, and words or cards the user added stay as they are.
 */
export function switchSampleLanguage(state: AppState, from: Lang, to: Lang, v: Versions): AppState {
  if (from === to) return state;
  const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
  const vf = byId(v.vocab[from]);
  const vt = byId(v.vocab[to]);
  const tf = byId(v.theory[from]);
  const tt = byId(v.theory[to]);

  const vocabLists = state.vocabLists.map((l) => {
    const f = vf.get(l.id);
    const t = vt.get(l.id);
    if (!l.sample || !f || !t) return l;
    const wf = byId(f.words);
    const wt = byId(t.words);
    return {
      ...l,
      name: swap(l.name, f.name, t.name),
      description: swap(l.description, f.description, t.description),
      sourceLang: swap(l.sourceLang, f.sourceLang, t.sourceLang),
      targetLang: swap(l.targetLang, f.targetLang, t.targetLang),
      words: l.words.map((w) => {
        const a = wf.get(w.id);
        const b = wt.get(w.id);
        if (!a || !b || w.term !== a.term || w.translation !== a.translation) return w;
        return { ...w, term: b.term, translation: b.translation, note: swap(w.note, a.note, b.note) };
      }),
    };
  });

  const theoryTopics = state.theoryTopics.map((tp) => {
    const f = tf.get(tp.id);
    const t = tt.get(tp.id);
    if (!tp.sample || !f || !t) return tp;
    const cf = byId(f.cards);
    const ct = byId(t.cards);
    const df = byId(f.documents);
    const dt = byId(t.documents);
    return {
      ...tp,
      title: swap(tp.title, f.title, t.title),
      description: swap(tp.description, f.description, t.description),
      notes: swap(tp.notes, f.notes, t.notes),
      documents: tp.documents.map((d) => ({ ...d, name: swap(d.name, df.get(d.id)?.name, dt.get(d.id)?.name) })),
      cards: tp.cards.map((c) => {
        const a = cf.get(c.id);
        const b = ct.get(c.id);
        if (!a || !b || c.front !== a.front || c.back !== a.back) return c;
        return { ...c, front: b.front, back: b.back };
      }),
    };
  });

  const thf = v.thread[from];
  const tht = v.thread[to];
  const coachThreads = state.coachThreads.map((th) => {
    if (th.id !== thf.id) return th;
    const mf = byId(thf.messages);
    const mt = byId(tht.messages);
    return {
      ...th,
      title: swap(th.title, thf.title, tht.title),
      messages: th.messages.map((m) => ({ ...m, content: swap(m.content, mf.get(m.id)?.content, mt.get(m.id)?.content) })),
    };
  });

  return { ...state, vocabLists, theoryTopics, coachThreads };
}
