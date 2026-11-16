import type { ChatMessage, Exam, PlanSession, SubjectKey } from '@/types';
import type { ExtractedCard } from '@/lib/cardExtractor';

/**
 * The contract every AI backend implements. The UI only talks to this interface,
 * so plugging in a real model means writing one provider and switching config.ts.
 */
export interface AIProvider {
  id: string;
  label: string;
  /** true while no real AI is connected; the UI labels every result from a demo provider. */
  isDemo: boolean;

  /** Tutor chat for the AI Learning Coach. */
  chat(input: { subject: string; history: ChatMessage[]; message: string; language: Language }): Promise<AIChatReply>;

  /** Turn learning material into flashcards. */
  generateFlashcards(input: { text: string; topicTitle: string; max?: number; language?: Language }): Promise<AIGenerationResult<ExtractedCard>>;

  /** Propose a week of study sessions from exams and preferences. */
  suggestStudyPlan(input: { exams: Exam[]; dailyMinutes: number; existing: PlanSession[]; language: Language }): Promise<AIGenerationResult<Omit<PlanSession, 'id'>>>;

  /** One spoken turn in Voice Mode (speech-to-text and text-to-speech happen around it). */
  voiceTurn(input: { subject: string; transcript: string; language: Language }): Promise<AIChatReply>;

  /** Deep analysis of an uploaded document (Premium). */
  analyzeDocument(input: { fileName: string; text?: string; language?: Language }): Promise<AIDocumentAnalysis>;
}

export interface AIChatReply {
  messages: string[];
  /** Follow-up suggestions the student can tap. */
  suggestions?: string[];
  demo: boolean;
  /** Set when the provider cannot answer, e.g. no AI connected. */
  notice?: string;
}

export interface AIGenerationResult<T> {
  items: T[];
  method: 'ai' | 'rule-based';
  demo: boolean;
}

export interface AIDocumentAnalysis {
  available: boolean;
  summary?: string;
  keyConcepts?: string[];
  notice?: string;
}

/** Interface language. Real providers should answer in this language. */
export type Language = 'en' | 'de';

export type SubjectHint = SubjectKey | 'general';
