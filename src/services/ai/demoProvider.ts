import { getCoachScripts } from '@/data/coachScripts';
import { extractCards } from '@/lib/cardExtractor';
import { suggestWeek } from '@/lib/planner';
import type { AIProvider } from './types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const NOT_CONNECTED = {
  en: 'No AI model is connected in this demo, so Learnly cannot answer free-form questions yet. Tap one of the sample questions to see how the Learning Coach teaches, or connect an AI provider (see src/services/ai/config.ts).',
  de: 'In dieser Demo ist kein KI-Modell verbunden, deshalb kann Learnly noch keine freien Fragen beantworten. Tippe auf eine der Beispielfragen, um zu sehen, wie der Lerncoach erklärt, oder verbinde einen KI-Anbieter (siehe src/services/ai/config.ts).',
};

function findScript(text: string, lang: 'en' | 'de') {
  const COACH_SCRIPTS = getCoachScripts(lang);
  const t = text.toLowerCase().replace(/[’']/g, "'").trim();
  // exact suggestion text first, then keyword match
  return (
    COACH_SCRIPTS.find((s) => s.match.some((m) => t === m || t === m + '.' || t === m + '?')) ??
    COACH_SCRIPTS.find((s) => s.match.some((m) => m.length > 3 && t.includes(m)))
  );
}

/**
 * Demo provider: never calls a model. Chat replies come from pre-written sample conversations,
 * flashcards and plans come from local rule-based generators. Everything is flagged demo: true.
 */
export const demoProvider: AIProvider = {
  id: 'demo',
  label: 'Demo mode',
  isDemo: true,

  async chat({ message, language }) {
    await wait(700);
    const script = findScript(message, language);
    if (!script) return { messages: [], demo: true, notice: NOT_CONNECTED[language] };
    return { messages: script.messages, suggestions: script.suggestions, demo: true };
  },

  async generateFlashcards({ text, max }) {
    await wait(600);
    return { items: extractCards(text, max), method: 'rule-based', demo: true };
  },

  async suggestStudyPlan({ exams, dailyMinutes, existing, language }) {
    await wait(500);
    return { items: suggestWeek(exams, dailyMinutes, existing, language), method: 'rule-based', demo: true };
  },

  async voiceTurn({ transcript, language }) {
    await wait(500);
    const script = findScript(transcript, language);
    return script
      ? { messages: script.messages, demo: true }
      : { messages: [], demo: true, notice: NOT_CONNECTED[language] };
  },

  async analyzeDocument() {
    await wait(400);
    return {
      available: false,
      notice: 'Advanced document analysis needs a connected AI provider. Your file is saved with the topic and will be analysed once AI is enabled.',
    };
  },
};
