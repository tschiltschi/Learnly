import { useT } from '@/i18n';
import { useEffect } from 'react';
import { useRoute, navigate } from './lib/router';
import { useStore } from './store/AppStore';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { LanguagesPage } from './pages/languages/LanguagesPage';
import { MathPage } from './pages/math/MathPage';
import { TheoryPage } from './pages/theory/TheoryPage';
import { FlashcardsPage } from './pages/Flashcards';
import { ProgressPage } from './pages/Progress';
import { CoachPage } from './pages/Coach';
import { PlanPage } from './pages/Plan';
import { VoicePage } from './pages/Voice';
import { PricingPage } from './pages/Pricing';
import { SettingsPage } from './pages/Settings';
import { NotFound } from './pages/NotFound';

const APP_PAGES = ['dashboard', 'languages', 'math', 'theory', 'flashcards', 'progress', 'coach', 'plan', 'voice', 'pricing', 'preferences'];

export function App() {
  const route = useRoute();
  const { state } = useStore();
  const page = route.page || (state.user ? 'dashboard' : 'login');

  useEffect(() => {
    if (!state.user && APP_PAGES.includes(page)) navigate('login');
    if (state.user && (page === 'login' || page === 'signup')) navigate('dashboard');
  }, [state.user, page]);

  const t = useT();
  useEffect(() => {
    const titles: Record<string, string> = { math: 'Mathematics', preferences: 'Settings', coach: 'AI Coach', plan: 'Learning Plan', voice: 'Voice Mode' };
    const name = titles[page] ?? page.charAt(0).toUpperCase() + page.slice(1);
    document.title = `${t(name)} · Learnly`;
  }, [page, t.lang]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state.user || page === 'login' || page === 'signup') {
    return <AuthPage mode={page === 'signup' ? 'signup' : 'login'} />;
  }

  const p = route.params;
  let content;
  switch (page) {
    case 'dashboard':
      content = <Dashboard />;
      break;
    case 'languages':
      content = <LanguagesPage params={p} />;
      break;
    case 'math':
      content = <MathPage params={p} />;
      break;
    case 'theory':
      content = <TheoryPage params={p} />;
      break;
    case 'flashcards':
      content = <FlashcardsPage />;
      break;
    case 'progress':
      content = <ProgressPage />;
      break;
    case 'coach':
      content = <CoachPage />;
      break;
    case 'plan':
      content = <PlanPage />;
      break;
    case 'voice':
      content = <VoicePage />;
      break;
    case 'pricing':
      content = <PricingPage />;
      break;
    case 'preferences':
      content = <SettingsPage />;
      break;
    default:
      content = <NotFound />;
  }

  return <AppShell active={page}>{content}</AppShell>;
}
