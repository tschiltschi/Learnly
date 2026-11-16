import { useT } from '@/i18n';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, BookOpen, Calculator, GraduationCap, Info, Languages, MessageSquarePlus, PanelLeft, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn, relativeTime, uid } from '@/lib/utils';
import { ai } from '@/services/ai';
import { ALL_COACH_SCRIPTS, getCoachStarters } from '@/data/coachScripts';
import { DemoBadge } from '@/components/ui';
import { Markdown } from '@/components/Markdown';
import { PremiumPageGate } from '@/components/premium/PremiumLock';
import type { ChatMessage, CoachThread } from '@/types';

const SUBJECT_OPTIONS = [
  { value: 'General', icon: GraduationCap },
  { value: 'Biology', icon: BookOpen },
  { value: 'History', icon: BookOpen },
  { value: 'Mathematics', icon: Calculator },
  { value: 'Languages', icon: Languages },
  { value: 'Computer Science', icon: BookOpen },
];

export function CoachPage() {
  const { isPremium } = useStore();
  if (!isPremium)
    return (
      <PremiumPageGate feature="AI Learning Coach" description="A patient personal tutor that explains any topic in simple words and checks your understanding with follow-up questions.">
        <CoachView />
      </PremiumPageGate>
    );
  return <CoachView />;
}

function CoachView() {
  const { state, update } = useStore();
  const tr = useT();
  const starters = getCoachStarters(tr.lang);
  const [activeId, setActiveId] = useState<string | null>(state.coachThreads[0]?.id ?? null);
  const [subject, setSubject] = useState('General');
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showThreads, setShowThreads] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thread = state.coachThreads.find((t) => t.id === activeId) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread?.messages.length, thinking, notice]);

  useEffect(() => {
    setNotice(null);
    if (thread) setSubject(thread.subject);
    // continue a saved demo conversation where it left off
    const last = thread?.messages[thread.messages.length - 1];
    const script = last?.role === 'assistant' ? ALL_COACH_SCRIPTS().find((s) => s.messages.includes(last.content)) : undefined;
    setSuggestions(script?.suggestions ?? []);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;
    setInput('');
    setNotice(null);
    setSuggestions([]);
    const userMsg: ChatMessage = { id: uid(), role: 'user', content, at: Date.now() };
    let id = activeId;
    if (!thread) {
      id = uid();
      const t: CoachThread = { id, title: content.length > 42 ? content.slice(0, 40) + '…' : content, subject, messages: [userMsg], updatedAt: Date.now() };
      update((s) => ({ ...s, coachThreads: [t, ...s.coachThreads] }));
      setActiveId(id);
    } else {
      update((s) => ({ ...s, coachThreads: s.coachThreads.map((t) => (t.id === id ? { ...t, messages: [...t.messages, userMsg], updatedAt: Date.now() } : t)) }));
    }
    setThinking(true);
    try {
      const reply = await ai.chat({ subject, history: thread?.messages ?? [], message: content, language: tr.lang });
      if (reply.notice) setNotice(reply.notice);
      if (reply.messages.length) {
        const msgs = reply.messages.map((m, i) => ({ id: uid(), role: 'assistant' as const, content: m, at: Date.now() + i, demo: reply.demo }));
        update((s) => ({ ...s, coachThreads: s.coachThreads.map((t) => (t.id === id ? { ...t, messages: [...t.messages, ...msgs], updatedAt: Date.now() } : t)) }));
      }
      setSuggestions(reply.suggestions ?? []);
    } finally {
      setThinking(false);
    }
  };

  const onSuggestion = (s: string) => {
    if (s === 'Open my Learning Plan' || s === 'Öffne meinen Lernplan') return navigate('plan');
    if (s === 'Make me flashcards for this' || s === 'Mach mir Karteikarten dazu') return navigate('theory-mitosis');
    if (s === 'Give me a practice exercise' || s === 'Gib mir eine Übungsaufgabe') return navigate('math-geometry-practice');
    send(s);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="-mx-4 -mb-16 -mt-6 flex h-[calc(100vh-57px)] sm:-mx-6 lg:-mx-10 lg:-mt-10 lg:h-screen">
      {/* Threads */}
      <aside className={cn('absolute z-20 h-full w-72 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/95 backdrop-blur-xl md:static md:flex md:bg-ink-900/40', showThreads ? 'flex' : 'hidden')}>
        <div className="p-3">
          <button
            onClick={() => {
              setActiveId(null);
              setShowThreads(false);
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-fog-100 transition hover:bg-white/[0.08]"
          >
            <MessageSquarePlus className="h-4 w-4" /> {tr('New conversation')}
          </button>
        </div>
        <div className="eyebrow px-5 pb-2 pt-2">{tr('Past conversations')}</div>
        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
          {state.coachThreads.length === 0 && <p className="px-3 py-4 text-xs text-fog-500">{tr('Your conversations will appear here.')}</p>}
          {state.coachThreads.map((t) => (
            <div key={t.id} className={cn('group flex items-center rounded-lg', t.id === activeId ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]')}>
              <button
                onClick={() => {
                  setActiveId(t.id);
                  setShowThreads(false);
                }}
                className="min-w-0 flex-1 px-3 py-2 text-left"
              >
                <div className="truncate text-[13px] text-fog-100">{t.title}</div>
                <div className="text-[11px] text-fog-500">
                  {tr(t.subject)} · {relativeTime(t.updatedAt, tr.lang)}
                </div>
              </button>
              <button
                onClick={() => {
                  update((s) => ({ ...s, coachThreads: s.coachThreads.filter((x) => x.id !== t.id) }));
                  if (activeId === t.id) setActiveId(null);
                }}
                className="mr-1 rounded-md p-1.5 text-fog-500 opacity-0 transition hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
                aria-label={tr('Delete conversation')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <section className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-6">
          <button onClick={() => setShowThreads((v) => !v)} className="rounded-lg p-1.5 text-fog-400 hover:bg-white/10 md:hidden" aria-label={tr('Show conversations')}>
            <PanelLeft className="h-4 w-4" />
          </button>
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-indigo-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-fog-100">{thread?.title ?? tr('Learnly AI Coach')}</div>
            <div className="hidden text-[11px] text-fog-500 sm:block">{tr('Your patient personal tutor')}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {ai.isDemo && <DemoBadge label={tr('Demo')} className="hidden sm:inline-flex" />}
            <select id="coach-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-[120px] rounded-lg border border-white/10 bg-ink-900 px-2 py-1.5 text-xs text-fog-200 outline-none sm:w-auto" aria-label={tr('Subject')}>
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{tr(s.value)}</option>
              ))}
            </select>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {!thread && (
              <div className="animate-fade-up pt-6 text-center sm:pt-12">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-600 shadow-glow">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-fog-100">{tr('What would you like to understand today?')}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-fog-400">{tr('I explain things step by step and check that each step makes sense before moving on.')}</p>
                <div className="mx-auto mt-8 grid max-w-xl gap-2 sm:grid-cols-2">
                  {starters.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm text-fog-200 transition hover:border-brand-400/40 hover:bg-brand-500/10">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {thread?.messages.map((m) => (
              <div key={m.id} className={cn('flex animate-fade-up gap-3', m.role === 'user' && 'justify-end')}>
                {m.role === 'assistant' && (
                  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-indigo-600">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className={cn('max-w-[85%] text-[14.5px] leading-relaxed', m.role === 'user' ? 'rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-white' : 'rounded-2xl rounded-tl-md border border-white/[0.07] bg-ink-850 px-4 py-3 text-fog-200')}>
                  {m.role === 'assistant' ? <Markdown text={m.content} /> : m.content}
                  {m.demo && <div className="mt-2 text-[10px] font-medium uppercase tracking-wider text-sky-300/70">{tr('Sample answer · demo')}</div>}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-indigo-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-white/[0.07] bg-ink-850 px-4 py-3.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-fog-400" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
            {notice && (
              <div className="flex animate-fade-up items-start gap-2.5 rounded-xl border border-dashed border-sky-300/30 bg-sky-400/[0.05] px-4 py-3 text-sm text-sky-100/85">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                <span>{notice}</span>
              </div>
            )}
            {notice && (
              <div className="flex flex-wrap gap-2">
                {starters.slice(0, 3).map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-fog-300 hover:border-brand-400/40 hover:text-fog-100">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-ink-900/40 px-4 pb-4 pt-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            {suggestions.length > 0 && !thinking && (
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => onSuggestion(s)} className="animate-fade-up rounded-full border border-brand-400/25 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-200 transition hover:bg-brand-500/20">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-850 p-2 focus-within:border-brand-500/50">
              <textarea
                id="coach-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={subject === 'General' ? tr('Ask about anything you are learning…') : tr('Ask about {subject}…', { subject: tr.lang === 'de' ? tr(subject) : subject.toLowerCase() })}
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-fog-100 outline-none placeholder:text-fog-500"
              />
              <button type="submit" disabled={!input.trim() || thinking} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500 disabled:opacity-40" aria-label={tr('Send')}>
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-fog-500">
              {ai.isDemo ? tr('Demo mode: answers are pre-written samples. Connect an AI provider for real tutoring.') : tr('Learnly AI can make mistakes. Check important facts with your teacher.')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
