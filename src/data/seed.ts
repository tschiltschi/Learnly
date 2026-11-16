import { detectLanguage } from '@/i18n';
import type { Activity, AppState, CoachThread, Exam, PlanSession } from '@/types';
import { sampleVocabLists } from './vocab';
import { sampleTheoryTopics } from './theory';
import { COACH_SCRIPTS } from './coachScripts';
import { COACH_SCRIPTS_DE } from './coachScripts.de';
import { switchSampleLanguage, theoryToGerman, vocabToGerman } from './localizeSamples';

const DAY = 86400000;

function sampleActivity(now: number): Activity[] {
  // A plausible two-week history so the dashboard and statistics have something to show.
  const rows: [number, Activity['subject'], string, string, number, number, number][] = [
    [0.08, 'languages', 'Food & Drink', 'Flashcards · English → German', 9, 12, 8],
    [0.2, 'math', 'Percentages', 'Practice · 4 exercises', 3, 4, 12],
    [1.1, 'theory', 'Binary & number systems', 'Quiz', 4, 5, 6],
    [1.3, 'languages', 'Travel essentials', 'Multiple-choice test', 8, 10, 7],
    [2.1, 'theory', 'Cell division: Mitosis', 'Quiz', 5, 7, 9],
    [2.4, 'math', 'Algebra', 'Practice · 5 exercises', 4, 5, 15],
    [3.2, 'theory', 'The French Revolution (1789–1799)', 'Quiz', 5, 6, 10],
    [3.5, 'languages', 'Everyday verbs', 'Flashcards · English → French', 6, 8, 6],
    [4.1, 'math', 'Geometry', 'Practice · 3 exercises', 2, 3, 11],
    [5.2, 'theory', 'Cell division: Mitosis', 'Quiz', 4, 7, 8],
    [5.4, 'languages', 'Food & Drink', 'Multiple-choice test', 7, 12, 9],
    [6.3, 'math', 'Percentages', 'Practice · 4 exercises', 2, 4, 14],
    [7.2, 'languages', 'Food & Drink', 'Flashcards · German → English', 10, 12, 7],
    [8.1, 'theory', 'Photosynthesis', 'Flashcards', 3, 4, 5],
    [9.3, 'math', 'Algebra', 'Practice · 3 exercises', 2, 3, 10],
    [11.2, 'languages', 'Travel essentials', 'Flashcards · English → Spanish', 7, 10, 8],
    [12.4, 'theory', 'Binary & number systems', 'Flashcards', 4, 5, 6],
  ];
  return rows.map(([daysAgo, subject, title, detail, correct, total, minutes], i) => ({
    id: 'sa' + i,
    at: now - Math.round(daysAgo * DAY),
    subject,
    title,
    detail,
    correct,
    total,
    minutes,
    sample: true,
  }));
}

function samplePlan(): { sessions: PlanSession[]; exams: Exam[] } {
  const in9 = new Date(Date.now() + 9 * DAY).toISOString().slice(0, 10);
  const in16 = new Date(Date.now() + 16 * DAY).toISOString().slice(0, 10);
  const in23 = new Date(Date.now() + 23 * DAY).toISOString().slice(0, 10);
  return {
    sessions: [
      { id: 'ps1', day: 0, subject: 'theory', title: 'Biology: Mitosis', minutes: 30, done: false },
      { id: 'ps2', day: 1, subject: 'math', title: 'Mathematics: Percentages', minutes: 20, done: false },
      { id: 'ps3', day: 2, subject: 'languages', title: 'English vocabulary', minutes: 15, done: false },
      { id: 'ps4', day: 3, subject: 'theory', title: 'History: French Revolution', minutes: 25, done: false },
      { id: 'ps5', day: 4, subject: 'math', title: 'Mathematics: Geometry', minutes: 20, done: false },
      { id: 'ps6', day: 5, subject: 'languages', title: 'Spanish: Travel essentials', minutes: 15, done: false },
    ],
    exams: [
      { id: 'ex1', subject: 'theory', title: 'Biology test: Cell division', date: in9 },
      { id: 'ex2', subject: 'math', title: 'Math exam: Percentages & Algebra', date: in16 },
      { id: 'ex3', subject: 'languages', title: 'Spanish oral exam', date: in23 },
    ],
  };
}

function sampleThread(now: number, lang: 'en' | 'de'): CoachThread {
  const de = lang === 'de';
  const s1 = de ? COACH_SCRIPTS_DE[0] : COACH_SCRIPTS[0];
  return {
    id: 'thread-mitosis',
    title: de ? 'Mitose verstehen' : 'Understanding mitosis',
    subject: 'Biology',
    updatedAt: now - 3600_000,
    messages: [
      { id: 'cm1', role: 'user', content: de ? 'Ich verstehe Mitose nicht.' : "I don't understand mitosis.", at: now - 3600_000 },
      ...s1.messages.map((content, i) => ({ id: 'cm' + (i + 2), role: 'assistant' as const, content, at: now - 3600_000 + 1000 * (i + 1), demo: true })),
    ],
  };
}

/** Built-in sample content in both languages, used to switch it when the interface language changes. */
export function sampleVersions(now = Date.now()) {
  const vocabEn = sampleVocabLists(now);
  const theoryEn = sampleTheoryTopics(now);
  return {
    vocab: { en: vocabEn, de: vocabToGerman(vocabEn) },
    theory: { en: theoryEn, de: theoryToGerman(theoryEn) },
    thread: { en: sampleThread(now, 'en'), de: sampleThread(now, 'de') },
  };
}

export function withSampleLanguage(state: AppState, to: 'en' | 'de'): AppState {
  const from = state.settings.language ?? 'en';
  const next = switchSampleLanguage(state, from, to, sampleVersions());
  return { ...next, settings: { ...next.settings, language: to } };
}

export const STATE_VERSION = 1;

export function createInitialState(withSamples = true, lang: 'en' | 'de' = detectLanguage()): AppState {
  const now = Date.now();
  const plan = samplePlan();
  return {
    version: STATE_VERSION,
    user: null,
    plan: 'free',
    vocabLists: withSamples ? (lang === 'de' ? vocabToGerman(sampleVocabLists(now)) : sampleVocabLists(now)) : [],
    theoryTopics: withSamples ? (lang === 'de' ? theoryToGerman(sampleTheoryTopics(now)) : sampleTheoryTopics(now)) : [],
    mathAttempts: [],
    activity: withSamples ? sampleActivity(now) : [],
    sessions: withSamples ? plan.sessions : [],
    exams: withSamples ? plan.exams : [],
    coachThreads: withSamples ? [sampleThread(now, lang)] : [],
    settings: {
      language: lang,
      dailyGoal: 30,
      nativeLanguage: lang === 'de' ? 'German' : 'English',
      reduceMotion: false,
      soundEffects: true,
      weeklyReport: true,
      testDirection: 'both',
    },
    aiUsage: { month: new Date().toISOString().slice(0, 7), count: 3 },
    onboarded: false,
  };
}
