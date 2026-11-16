import { useT } from '@/i18n';
import { useEffect, useRef, useState } from 'react';
import { Mic, RotateCcw, Sparkles, Square, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { cn } from '@/lib/utils';
import { getVoiceScripts } from '@/data/coachScripts';
import { ai } from '@/services/ai';
import { DemoBadge } from '@/components/ui';
import { PremiumPageGate } from '@/components/premium/PremiumLock';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';
type Line = { role: 'user' | 'ai'; text: string };

export function VoicePage() {
  const { isPremium } = useStore();
  if (!isPremium)
    return (
      <PremiumPageGate feature="AI Voice Learning Mode" description="Practise out loud: speak your answers, hear the tutor reply and get instant feedback on pronunciation and content.">
        <VoiceView />
      </PremiumPageGate>
    );
  return <VoiceView />;
}

function VoiceView() {
  const { logActivity } = useStore();
  const tr = useT();
  const VOICE_SCRIPTS = getVoiceScripts(tr.lang);
  const [subject, setSubject] = useState(VOICE_SCRIPTS[0].subject);
  const [phase, setPhase] = useState<Phase>('idle');
  const [turn, setTurn] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [partial, setPartial] = useState('');
  const [speak, setSpeak] = useState(true);
  const timers = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const script = VOICE_SCRIPTS.find((s) => s.subject === subject) ?? VOICE_SCRIPTS[0];
  const finished = turn >= script.turns.length;
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  };
  useEffect(() => clearTimers, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines, partial]);

  const reset = (s = subject) => {
    clearTimers();
    setSubject(s);
    setPhase('idle');
    setTurn(0);
    setLines([]);
    setPartial('');
  };

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // Demo playback of a pre-written exchange. A real integration would stream microphone audio
  // to speech-to-text, send the transcript to ai.voiceTurn() and play back text-to-speech.
  const play = () => {
    if (phase !== 'idle') {
      clearTimers();
      setPhase('idle');
      setPartial('');
      return;
    }
    if (finished) return reset();
    const t = script.turns[turn];
    setPhase('listening');
    const words = t.user.split(' ');
    words.forEach((_, i) => later(() => setPartial(words.slice(0, i + 1).join(' ')), 250 + i * 220));
    const listenEnd = 450 + words.length * 220;
    later(() => {
      setLines((l) => [...l, { role: 'user', text: t.user }]);
      setPartial('');
      setPhase('thinking');
    }, listenEnd);
    later(() => {
      setPhase('speaking');
      setLines((l) => [...l, { role: 'ai', text: t.ai }]);
      const done = () => {
        setPhase('idle');
        setTurn((x) => {
          const next = x + 1;
          if (next >= script.turns.length) logActivity({ subject: 'voice', title: tr('Voice session: {subject}', { subject: tr(subject) }), detail: tr('Voice Mode · demo playback'), minutes: 2 });
          return next;
        });
      };
      let usedTts = false;
      if (speak && canSpeak) {
        try {
          const u = new SpeechSynthesisUtterance(t.ai);
          u.rate = 1.02;
          u.lang = tr.lang === 'de' ? 'de-DE' : subject === 'Languages' ? 'en-GB' : 'en-US';
          u.onend = done;
          u.onerror = done;
          window.speechSynthesis.speak(u);
          usedTts = true;
        } catch {
          usedTts = false;
        }
      }
      if (!usedTts) later(done, Math.min(6000, 1200 + t.ai.length * 35));
    }, listenEnd + 900);
  };

  const label = tr({ idle: finished ? 'Session complete · tap to restart' : lines.length ? 'Tap to continue' : 'Tap to start', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Learnly is speaking' }[phase]);

  return (
    <div className="-mx-4 -mb-16 -mt-6 flex min-h-[calc(100vh-57px)] flex-col sm:-mx-6 lg:-mx-10 lg:-mt-10 lg:min-h-screen">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-6">
        <h1 className="font-display text-base font-semibold text-fog-100">{tr('Voice Mode')}</h1>
        {ai.isDemo && <DemoBadge label={tr('Demo playback')} />}
        <div className="ml-auto flex items-center gap-1.5">
          {VOICE_SCRIPTS.map((s) => (
            <button key={s.subject} onClick={() => reset(s.subject)} className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition', s.subject === subject ? 'border-brand-400/40 bg-brand-500/15 text-brand-100' : 'border-white/10 text-fog-400 hover:text-fog-100')}>
              {tr(s.subject)}
            </button>
          ))}
          {canSpeak && (
            <button onClick={() => setSpeak((v) => !v)} className="ml-1 rounded-lg p-2 text-fog-400 hover:bg-white/10 hover:text-fog-100" aria-label={tr(speak ? 'Mute voice' : 'Read answers aloud')} title={tr(speak ? 'Mute voice' : 'Read answers aloud')}>
              {speak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      <div className="grid flex-1 lg:grid-cols-[1fr_380px]">
        {/* Orb */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-12">
          <div className={cn('pointer-events-none absolute h-[460px] w-[460px] rounded-full blur-[100px] transition-all duration-700', phase === 'speaking' ? 'bg-brand-500/30' : phase === 'listening' ? 'bg-sky-500/25' : 'bg-brand-700/15')} />
          <div className="relative grid h-64 w-64 place-items-center">
            {(phase === 'listening' || phase === 'speaking') && (
              <>
                <span className={cn('absolute inset-6 animate-pulsering rounded-full', phase === 'listening' ? 'bg-sky-400/25' : 'bg-brand-400/25')} />
                <span className={cn('absolute inset-6 animate-pulsering rounded-full [animation-delay:.6s]', phase === 'listening' ? 'bg-sky-400/20' : 'bg-brand-400/20')} />
              </>
            )}
            <div
              className={cn(
                'absolute inset-10 rounded-full bg-gradient-to-br shadow-[0_0_80px_-10px_rgba(139,92,246,0.6)] transition-all duration-500',
                phase === 'listening' ? 'scale-105 from-sky-400 via-indigo-500 to-brand-600' : 'from-brand-400 via-brand-600 to-indigo-800',
                phase === 'thinking' && 'animate-pulse',
              )}
            />
            <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_45%)]" />
            <button
              onClick={play}
              className="relative z-10 grid h-20 w-20 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition hover:scale-105 hover:bg-white/25 active:scale-95"
              aria-label={tr(phase === 'idle' ? 'Start speaking' : 'Stop')}
            >
              {phase === 'idle' ? finished ? <RotateCcw className="h-7 w-7" /> : <Mic className="h-8 w-8" /> : phase === 'speaking' ? <SpeakingBars /> : <Square className="h-6 w-6 fill-current" />}
            </button>
          </div>
          <div className="relative mt-6 h-6 text-sm font-medium text-fog-200">{label}</div>
          <div className="relative mt-2 min-h-[48px] max-w-md text-center text-lg text-fog-100">{partial && <span className="animate-fade-up">“{partial}”</span>}</div>
          <p className="relative mt-6 max-w-md text-center text-xs text-fog-500">
            {ai.isDemo
              ? tr('Demo: this plays a pre-written sample conversation. Your microphone is not used and no AI is connected yet.')
              : tr('Speak naturally. Learnly listens, answers out loud and corrects your mistakes.')}
          </p>
        </div>

        {/* Transcript */}
        <div className="flex flex-col border-t border-white/[0.06] bg-ink-900/40 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-semibold text-fog-100">{tr('Conversation')}</span>
            {lines.length > 0 && (
              <button onClick={() => reset()} className="text-xs text-fog-500 hover:text-fog-200">
                {tr('Clear')}
              </button>
            )}
          </div>
          <div ref={scrollRef} className="max-h-[50vh] flex-1 space-y-3 overflow-y-auto px-5 pb-5 lg:max-h-none">
            {lines.length === 0 && <p className="text-sm text-fog-500">{tr('Your conversation with Learnly will appear here as you talk.')}</p>}
            {lines.map((l, i) => (
              <div key={i} className={cn('animate-fade-up', l.role === 'user' && 'text-right')}>
                <div className="mb-1 flex items-center gap-1.5 text-[11px] text-fog-500" style={{ justifyContent: l.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {l.role === 'ai' && <Sparkles className="h-3 w-3 text-brand-300" />}
                  {l.role === 'user' ? tr('You (sample)') : 'Learnly'}
                </div>
                <div className={cn('inline-block max-w-[90%] rounded-2xl px-3.5 py-2.5 text-left text-sm', l.role === 'user' ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-tl-md border border-white/[0.07] bg-ink-850 text-fog-200')}>{l.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeakingBars() {
  return (
    <div className="flex h-8 items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="h-full w-1.5 origin-center animate-bar rounded-full bg-white" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  );
}
