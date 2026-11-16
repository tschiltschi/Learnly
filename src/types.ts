export type Plan = 'free' | 'premium';
export type SubjectKey = 'languages' | 'math' | 'theory';

export interface User {
  name: string;
  email: string;
  createdAt: number;
}

/** Spaced-repetition fields shared by vocabulary words and theory flashcards (Leitner boxes 0-5). */
export interface ReviewStats {
  correct: number;
  wrong: number;
  box: number;
  due: number;
  lastReviewed?: number;
}

export interface VocabWord extends ReviewStats {
  id: string;
  term: string;
  translation: string;
  note?: string;
}

export interface VocabList {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  description?: string;
  words: VocabWord[];
  createdAt: number;
  updatedAt: number;
  sample?: boolean;
}

export type MathTopicId = 'algebra' | 'geometry' | 'percentages';

export interface MathExercise {
  id: string;
  topic: MathTopicId;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  formula?: string;
  kind: 'mc' | 'input';
  options?: string[];
  answer: string;
  /** Accept numeric answers within this tolerance. */
  tolerance?: number;
  unit?: string;
  steps: { text: string; math?: string }[];
}

export interface MathAttempt {
  exerciseId: string;
  correct: boolean;
  at: number;
}

export interface TheoryCard extends ReviewStats {
  id: string;
  front: string;
  back: string;
  generated?: boolean;
}

export interface TheoryDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: number;
}

export interface TheoryTopic {
  id: string;
  subject: string;
  title: string;
  description: string;
  notes: string;
  documents: TheoryDocument[];
  cards: TheoryCard[];
  quizScores: { at: number; correct: number; total: number }[];
  createdAt: number;
  updatedAt: number;
  sample?: boolean;
}

export interface Activity {
  id: string;
  at: number;
  subject: SubjectKey | 'coach' | 'voice' | 'plan';
  title: string;
  detail: string;
  correct?: number;
  total?: number;
  minutes: number;
  sample?: boolean;
}

export interface PlanSession {
  id: string;
  /** 0 = Monday ... 6 = Sunday */
  day: number;
  subject: SubjectKey;
  title: string;
  minutes: number;
  done: boolean;
  suggested?: boolean;
}

export interface Exam {
  id: string;
  subject: SubjectKey;
  title: string;
  date: string; // yyyy-mm-dd
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  at: number;
  demo?: boolean;
}

export interface CoachThread {
  id: string;
  title: string;
  subject: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface Settings {
  language: 'en' | 'de';
  dailyGoal: number;
  nativeLanguage: string;
  reduceMotion: boolean;
  soundEffects: boolean;
  weeklyReport: boolean;
  testDirection: 'both' | 'forward' | 'reverse';
}

export interface AppState {
  version: number;
  user: User | null;
  plan: Plan;
  vocabLists: VocabList[];
  theoryTopics: TheoryTopic[];
  mathAttempts: MathAttempt[];
  activity: Activity[];
  sessions: PlanSession[];
  exams: Exam[];
  coachThreads: CoachThread[];
  settings: Settings;
  aiUsage: { month: string; count: number };
  onboarded: boolean;
}
