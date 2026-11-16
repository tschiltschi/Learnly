import { useT } from '@/i18n';
import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Calculator, Check, FlaskConical, Languages, Sparkles } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { navigate } from '@/lib/router';
import { Button } from '@/components/ui';
import { Logo } from '@/components/layout/Logo';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { BACKEND, supabase } from '@/services/backend';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { update, state } = useStore();
  const t = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const redirectTo = window.location.origin + window.location.pathname;

  const authError = (message: string) => {
    if (/invalid login credentials/i.test(message)) return t('Email or password is wrong.');
    if (/already registered|already exists/i.test(message)) return t('There is already an account with this email. Sign in instead.');
    if (/email not confirmed/i.test(message)) return t('Please confirm your email first. We sent you a link when you signed up.');
    return t('Sign-in failed: {m}', { m: message });
  };

  /** Real account through Supabase. BackendSync loads the data and opens the dashboard once signed in. */
  const backendSubmit = async () => {
    if (!supabase) return;
    setLoading(true);
    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { first_name: name.trim() }, emailRedirectTo: redirectTo } });
      if (err) setError(authError(err.message));
      else if (!data.session) setInfo(t('Almost done: we sent you an email. Open the link in it to confirm your account.'));
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(authError(err.message));
    }
    setLoading(false);
  };

  const google = async () => {
    if (!supabase) return signIn('Alex', 'alex.student@example.com');
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (err) setError(authError(err.message));
  };

  const forgotPassword = async () => {
    setError('');
    if (!supabase) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t('Enter your email address first.'));
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectTo + '#preferences' });
    if (err) setError(authError(err.message));
    else setInfo(t('We sent you a link. After opening it, choose a new password in Settings.'));
  };

  const signIn = (n: string, e: string) => {
    setLoading(true);
    window.setTimeout(() => {
      update((s) => ({ ...s, user: { name: n, email: e, createdAt: s.user?.createdAt ?? Date.now() } }));
      navigate('dashboard');
    }, 650);
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setError('');
    setInfo('');
    if (mode === 'signup' && name.trim().length < 2) return setError(t('Please enter your first name.'));
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t('Please enter a valid email address, like name@school.com.'));
    if (password.length < 6) return setError(t('Your password needs at least 6 characters.'));
    if (BACKEND.enabled) return void backendSubmit();
    const display = mode === 'signup' ? name.trim() : email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    signIn(display, email.trim());
  };

  return (
    <div className="app-bg flex min-h-full">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden border-r border-white/[0.06] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <Logo />
        <div className="relative">
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-fog-100">
            {t('Learn smarter.')}
            <br />
            <span className="gradient-text">{t('Not harder.')}</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fog-300">
            {t('Flashcards, step-by-step math and quizzes from your own notes, with a personal AI tutor when you need one.')}
          </p>
          <div className="mt-10 grid max-w-md gap-3">
            {[
              { icon: Languages, color: 'text-violet-300 bg-violet-500/10', title: 'Languages', text: 'Vocabulary lists, flashcards and tests' },
              { icon: Calculator, color: 'text-sky-300 bg-sky-500/10', title: 'Mathematics', text: 'Exercises with step-by-step solutions' },
              { icon: BookOpen, color: 'text-emerald-300 bg-emerald-500/10', title: 'Theory', text: 'Turn your notes into flashcards and quizzes' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-fog-100">{t(f.title)}</div>
                  <div className="text-xs text-fog-400">{t(f.text)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-fog-500">
          <Sparkles className="h-3.5 w-3.5" /> {t('Built for students in school and university')}
        </div>
      </div>

      {/* Form */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageSwitch />
        </div>
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Logo />
            <p className="mt-3 font-display text-lg text-fog-300">{t('Learn smarter.')} {t('Not harder.')}</p>
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fog-100">{mode === 'login' ? t('Welcome back') : t('Create your account')}</h2>
          <p className="mt-1.5 text-sm text-fog-400">{mode === 'login' ? t('Sign in to continue learning.') : t('Free forever. Upgrade when you want more.')}</p>

          <button
            type="button"
            onClick={google}
            className="mt-7 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-fog-100 transition hover:bg-white/[0.08]"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            {t('Continue with Google')}
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-fog-500">
            <span className="h-px flex-1 bg-white/10" /> {t('or with email')} <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="label">
                  {t('First name')}
                </label>
                <input id="auth-name" className="input" placeholder="Alex" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="label">
                {t('Email')}
              </label>
              <input id="auth-email" className="input" type="email" placeholder={t('you@school.com')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password" className="label">
                  {t('Password')}
                </label>
                {mode === 'login' &&
                  (BACKEND.enabled ? (
                    <button type="button" onClick={forgotPassword} className="mb-1.5 text-xs text-brand-300 hover:text-brand-200">
                      {t('Forgot password?')}
                    </button>
                  ) : (
                    <span className="mb-1.5 text-xs text-fog-500">{t('At least 6 characters')}</span>
                  ))}
              </div>
              <input
                id="auth-password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
            {info && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{info}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {mode === 'login' ? t('Sign in') : t('Create free account')}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {mode === 'signup' && (
            <ul className="mt-5 space-y-1.5 text-xs text-fog-400">
              {['All three subjects included', 'Unlimited vocabulary lists', 'No credit card needed'].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> {t(x)}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-7 text-center text-sm text-fog-400">
            {mode === 'login' ? t('New to Learnly? ') : t('Already have an account? ')}
            <button onClick={() => navigate(mode === 'login' ? 'signup' : 'login')} className="font-medium text-brand-300 hover:text-brand-200">
              {mode === 'login' ? t('Create an account') : t('Sign in')}
            </button>
          </p>

          {!BACKEND.enabled && (
            <div className="mt-8 flex items-start gap-2 rounded-xl border border-dashed border-sky-300/25 bg-sky-400/[0.04] px-3 py-2.5 text-[11px] leading-relaxed text-sky-100/70">
              <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />
              {t('Demo sign-in: no server is connected, so any email and password work and your account lives only in this browser.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
