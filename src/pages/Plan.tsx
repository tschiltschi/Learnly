import { useT } from '@/i18n';
import { useState, type FormEvent } from 'react';
import { CalendarDays, Check, GraduationCap, Play, Plus, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { cn, uid } from '@/lib/utils';
import { SUBJECTS } from '@/lib/subjects';
import { ai } from '@/services/ai';
import { aiErrorMessage } from '@/services/ai/httpProvider';
import { Badge, Button, Card, CardHeader, DemoBadge, Modal, PageHeader, ProgressBar } from '@/components/ui';
import { PremiumPageGate } from '@/components/premium/PremiumLock';
import type { PlanSession, SubjectKey } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function PlanPage() {
  const { isPremium } = useStore();
  if (!isPremium)
    return (
      <PremiumPageGate feature="Personalized Learning Plan" description="A weekly schedule built around your exams, with daily goals and study sessions suggested for you.">
        <PlanView />
      </PremiumPageGate>
    );
  return <PlanView />;
}

function PlanView() {
  const tr = useT();
  const { state, update, toast } = useStore();
  const [adding, setAdding] = useState<number | null>(null);
  const [examOpen, setExamOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const monday = new Date();
  monday.setDate(monday.getDate() - todayIdx);

  const planned = state.sessions.reduce((a, s) => a + s.minutes, 0);
  const done = state.sessions.filter((s) => s.done).reduce((a, s) => a + s.minutes, 0);
  const hasSuggested = state.sessions.some((s) => s.suggested);
  const exams = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));

  const setSessions = (fn: (s: PlanSession[]) => PlanSession[]) => update((s) => ({ ...s, sessions: fn(s.sessions) }));

  const suggest = async () => {
    setSuggesting(true);
    let res;
    try {
      res = await ai.suggestStudyPlan({ language: tr.lang, exams: state.exams, dailyMinutes: state.settings.dailyGoal, existing: state.sessions.filter((s) => !s.suggested) });
    } catch (err) {
      setSuggesting(false);
      return toast(aiErrorMessage(err, tr.lang), 'error');
    }
    setSessions((ss) => [...ss.filter((s) => !s.suggested), ...res.items.map((i) => ({ ...i, id: uid() }))]);
    setSuggesting(false);
    toast(res.items.length ? tr('{n} sessions suggested', { n: res.items.length }) : tr('Your week is already full'), res.items.length ? 'success' : 'info');
  };

  return (
    <div>
      <PageHeader
        title={tr('Learning Plan')}
        description={tr('Your week at a glance. Plan sessions, track exams and let Learnly fill the gaps.')}
        actions={
          <>
            {hasSuggested && (
              <Button variant="ghost" size="sm" onClick={() => setSessions((ss) => ss.filter((s) => !s.suggested))} icon={<X className="h-3.5 w-3.5" />}>
                {tr('Clear suggestions')}
              </Button>
            )}
            <Button variant="secondary" onClick={suggest} loading={suggesting} icon={<Wand2 className="h-4 w-4" />}>
              {tr('Suggest sessions')}
            </Button>
            <Button onClick={() => setAdding(todayIdx)} icon={<Plus className="h-4 w-4" />}>
              {tr('Add session')}
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="flex flex-col p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="eyebrow">{tr('This week')}</div>
              <div className="mt-1 font-display text-xl font-semibold text-fog-100">
                {done} <span className="text-sm font-normal text-fog-400">{tr('of {n} planned minutes done', { n: planned })}</span>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <label htmlFor="daily-goal" className="mb-1.5 flex justify-between text-xs text-fog-400">
                <span>{tr('Daily study goal')}</span>
                <span className="font-medium text-fog-200">{state.settings.dailyGoal} {tr('min')}</span>
              </label>
              <input
                id="daily-goal"
                type="range"
                min={10}
                max={120}
                step={5}
                value={state.settings.dailyGoal}
                onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, dailyGoal: Number(e.target.value) } }))}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
          <ProgressBar value={planned ? (done / planned) * 100 : 0} className="mt-4" height="h-2" color="bg-gradient-to-r from-brand-500 to-sky-400" />
          {ai.isDemo && (
            <div className="mt-4 flex items-center gap-2 text-xs text-fog-500">
              <DemoBadge label={tr('Rule-based')} /> {tr('Suggestions come from a built-in scheduler that weights subjects by how close the exam is. An AI planner can replace it later.')}
            </div>
          )}
          {planned > 0 && (
            <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
              {(Object.keys(SUBJECTS) as SubjectKey[]).map((k) => {
                const mins = state.sessions.filter((s) => s.subject === k).reduce((a, s) => a + s.minutes, 0);
                const s = SUBJECTS[k];
                return (
                  <div key={k} className="rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.05]">
                    <div className="flex items-center gap-1.5 text-[11px] text-fog-400">
                      <span className={cn('h-1.5 w-1.5 rounded-full', s.bg)} />
                      <span className="truncate">{tr(s.name)}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-fog-100">
                      {mins} <span className="text-xs font-normal text-fog-500">{tr('min')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title={tr('Upcoming exams')}
            icon={<GraduationCap className="mt-0.5 h-4 w-4 text-amber-300" />}
            action={
              <Button size="sm" variant="ghost" onClick={() => setExamOpen(true)} icon={<Plus className="h-3.5 w-3.5" />}>
                {tr('Add')}
              </Button>
            }
          />
          <div className="space-y-2 p-4">
            {exams.length === 0 && <p className="px-1 py-3 text-sm text-fog-500">{tr('No exams yet. Add one so suggestions focus on it.')}</p>}
            {exams.map((e) => {
              const days = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
              const s = SUBJECTS[e.subject];
              return (
                <div key={e.id} className="group flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.05]">
                  <div className={cn('w-1 self-stretch rounded-full', s.bg)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fog-100" title={tr(e.title)}>{tr(e.title)}</div>
                    <div className="text-xs text-fog-500">{new Date(e.date).toLocaleDateString(tr.locale, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                  </div>
                  <Badge tone={days <= 7 ? 'rose' : days <= 14 ? 'amber' : 'neutral'}>{days < 0 ? tr('past') : days === 0 ? tr('today') : tr('in {n} d', { n: days })}</Badge>
                  <button onClick={() => update((st) => ({ ...st, exams: st.exams.filter((x) => x.id !== e.id) }))} className="rounded-md p-1 text-fog-500 opacity-0 hover:text-rose-300 group-hover:opacity-100" aria-label={tr('Remove exam')}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Week calendar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {DAYS.map((day, i) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + i);
          const sessions = state.sessions.filter((s) => s.day === i);
          const mins = sessions.reduce((a, s) => a + s.minutes, 0);
          const isToday = i === todayIdx;
          return (
            <div key={day} className={cn('flex min-h-[200px] flex-col rounded-2xl border p-3', isToday ? 'border-brand-400/40 bg-brand-500/[0.06]' : 'border-white/[0.07] bg-ink-850/60')}>
              <div className="mb-3 flex items-baseline justify-between px-1">
                <div>
                  <div className={cn('text-xs font-semibold', isToday ? 'text-brand-200' : 'text-fog-200')}>{tr(day)}</div>
                  <div className="text-[11px] text-fog-500">{date.toLocaleDateString(tr.locale, { day: 'numeric', month: 'short' })}</div>
                </div>
                <span className={cn('text-[11px] tabular-nums', mins >= state.settings.dailyGoal ? 'text-emerald-300' : 'text-fog-500')}>{mins} {tr('min')}</span>
              </div>
              <div className="flex-1 space-y-2">
                {sessions.map((s) => {
                  const meta = SUBJECTS[s.subject];
                  return (
                    <div key={s.id} className={cn('group rounded-xl border p-2.5 transition', s.suggested ? 'border-dashed border-white/20 bg-transparent' : 'border-white/[0.06] bg-ink-800/80', s.done && 'opacity-55')}>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => setSessions((ss) => ss.map((x) => (x.id === s.id ? { ...x, done: !x.done, suggested: false } : x)))}
                          className={cn('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition', s.done ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-white/25 hover:border-white/50')}
                          aria-label={s.done ? tr('Mark as not done') : tr('Mark as done')}
                        >
                          {s.done && <Check className="h-3 w-3" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className={cn('text-[12.5px] font-medium leading-snug text-fog-100', s.done && 'line-through')}>{tr(s.title)}</div>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-fog-500">
                            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.bg)} />
                            <span className="truncate">{s.minutes} {tr('min')} · {tr(meta.name)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                        {s.suggested && (
                          <button onClick={() => setSessions((ss) => ss.map((x) => (x.id === s.id ? { ...x, suggested: false } : x)))} className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-fog-200 hover:bg-white/10">
                            {tr('Keep')}
                          </button>
                        )}
                        <button onClick={() => navigate(meta.route)} className="flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-fog-200 hover:bg-white/10">
                          <Play className="h-2.5 w-2.5" /> {tr('Start')}
                        </button>
                        <button onClick={() => setSessions((ss) => ss.filter((x) => x.id !== s.id))} className="ml-auto rounded-md p-1 text-fog-500 hover:text-rose-300" aria-label={tr('Delete session')}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {s.suggested && <div className="mt-1.5 flex items-center gap-1 text-[10px] text-sky-300/70"><Sparkles className="h-2.5 w-2.5" /> {tr('suggested')}</div>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setAdding(i)} className="mt-2 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] text-fog-500 transition hover:bg-white/[0.04] hover:text-fog-200">
                <Plus className="h-3 w-3" /> {tr('Add')}
              </button>
            </div>
          );
        })}
      </div>

      <SessionModal day={adding} onClose={() => setAdding(null)} onSave={(s) => setSessions((ss) => [...ss, { ...s, id: uid(), done: false }])} />
      <ExamModal open={examOpen} onClose={() => setExamOpen(false)} />
    </div>
  );
}

function SessionModal({ day, onClose, onSave }: { day: number | null; onClose: () => void; onSave: (s: Omit<PlanSession, 'id' | 'done'>) => void }) {
  const tr = useT();
  const [d, setD] = useState(0);
  const [subject, setSubject] = useState<SubjectKey>('theory');
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(25);
  const [lastDay, setLastDay] = useState<number | null>(null);
  if (day !== null && day !== lastDay) {
    setLastDay(day);
    setD(day);
    setTitle('');
  }
  const close = () => {
    setLastDay(null);
    onClose();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ day: d, subject, title: title.trim() || tr('{s} session', { s: tr(SUBJECTS[subject].name) }), minutes });
    close();
  };
  return (
    <Modal open={day !== null} onClose={close} title={tr('Add study session')}>
      <form onSubmit={submit} className="space-y-4 px-6 pb-6 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sess-day" className="label">{tr('Day')}</label>
            <select id="sess-day" className="input" value={d} onChange={(e) => setD(Number(e.target.value))}>
              {DAYS.map((x, i) => (
                <option key={x} value={i}>{tr(x)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sess-subject" className="label">{tr('Subject')}</label>
            <select id="sess-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value as SubjectKey)}>
              <option value="languages">{tr('Languages')}</option>
              <option value="math">{tr('Mathematics')}</option>
              <option value="theory">{tr('Theory')}</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="sess-title" className="label">{tr('What will you study?')}</label>
          <input id="sess-title" className="input" placeholder={tr('e.g. Biology: Photosynthesis')} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label htmlFor="sess-min" className="mb-1.5 flex justify-between text-xs text-fog-300">
            <span>{tr('Duration')}</span>
            <span className="font-medium">{minutes} {tr('min')}</span>
          </label>
          <input id="sess-min" type="range" min={5} max={90} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-full accent-brand-500" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>{tr('Cancel')}</Button>
          <Button type="submit" icon={<CalendarDays className="h-4 w-4" />}>{tr('Add to plan')}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ExamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tr = useT();
  const { update, toast } = useStore();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectKey>('theory');
  const [date, setDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    update((s) => ({ ...s, exams: [...s.exams, { id: uid(), title: title.trim(), subject, date }] }));
    toast(tr('Exam added. Use “Suggest sessions” to plan for it.'));
    setTitle('');
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={tr('Add an exam')}>
      <form onSubmit={submit} className="space-y-4 px-6 pb-6 pt-3">
        <div>
          <label htmlFor="exam-title" className="label">{tr('Exam')}</label>
          <input id="exam-title" className="input" placeholder={tr('e.g. History test: French Revolution')} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="exam-subject" className="label">{tr('Subject')}</label>
            <select id="exam-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value as SubjectKey)}>
              <option value="languages">{tr('Languages')}</option>
              <option value="math">{tr('Mathematics')}</option>
              <option value="theory">{tr('Theory')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="exam-date" className="label">{tr('Date')}</label>
            <input id="exam-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>{tr('Cancel')}</Button>
          <Button type="submit" disabled={!title.trim()}>{tr('Add exam')}</Button>
        </div>
      </form>
    </Modal>
  );
}
