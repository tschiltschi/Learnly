import { translate } from '@/i18n';
import type { Exam, PlanSession, SubjectKey } from '@/types';

const SUBJECT_TITLES: Record<'en' | 'de', Record<SubjectKey, string>> = {
  en: { languages: 'Vocabulary review', math: 'Math practice', theory: 'Theory flashcards' },
  de: { languages: 'Vokabeln wiederholen', math: 'Mathe üben', theory: 'Theorie-Karteikarten' },
};

/**
 * Rule-based weekly scheduler (no AI). Subjects with a closer exam get more and longer sessions;
 * every subject appears at least twice a week. Returns sessions for days without enough planned time.
 */
export function suggestWeek(exams: Exam[], dailyMinutes: number, existing: PlanSession[], lang: 'en' | 'de' = 'en', today = new Date()): Omit<PlanSession, 'id'>[] {
  const subjects: SubjectKey[] = ['languages', 'math', 'theory'];
  const weight: Record<SubjectKey, number> = { languages: 1, math: 1, theory: 1 };
  const titles: Record<SubjectKey, string> = { ...SUBJECT_TITLES[lang] };

  for (const exam of exams) {
    const days = Math.ceil((new Date(exam.date).getTime() - today.getTime()) / 86400000);
    if (days < 0) continue;
    const boost = days <= 7 ? 3 : days <= 14 ? 2 : 1.3;
    if (boost > weight[exam.subject]) {
      weight[exam.subject] = boost;
      titles[exam.subject] = lang === 'de' ? `${translate('de', exam.title)}: Vorbereitung` : `${exam.title} prep`;
    }
  }

  const ranked = [...subjects].sort((a, b) => weight[b] - weight[a]);
  const out: Omit<PlanSession, 'id'>[] = [];
  for (let day = 0; day < 7; day++) {
    const planned = existing.filter((s) => s.day === day).reduce((a, s) => a + s.minutes, 0);
    let remaining = dailyMinutes - planned;
    if (remaining < 10) continue;
    // primary subject rotates, but heavier subjects come up more often
    const primary = ranked[day % 7 < 4 ? 0 : day % 3] ?? ranked[0];
    const secondary = ranked.find((s) => s !== primary) ?? ranked[1];
    const primaryMin = Math.max(10, Math.round((remaining * (weight[primary] / (weight[primary] + weight[secondary]))) / 5) * 5);
    out.push({ day, subject: primary, title: titles[primary], minutes: Math.min(primaryMin, remaining), done: false, suggested: true });
    remaining -= Math.min(primaryMin, remaining);
    if (remaining >= 10) {
      out.push({ day, subject: secondary, title: titles[secondary], minutes: Math.round(remaining / 5) * 5, done: false, suggested: true });
    }
  }
  return out;
}
