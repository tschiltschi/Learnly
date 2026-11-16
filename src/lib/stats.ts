import type { Activity, AppState, SubjectKey } from '@/types';
import { DAY, dayKey, startOfDay } from './utils';

export function minutesOnDay(activity: Activity[], day: number): number {
  const start = startOfDay(day);
  return activity.filter((a) => a.at >= start && a.at < start + DAY).reduce((s, a) => s + a.minutes, 0);
}

export function streak(activity: Activity[]): number {
  const days = new Set(activity.map((a) => dayKey(a.at)));
  let count = 0;
  let cursor = startOfDay();
  if (!days.has(dayKey(cursor))) cursor -= DAY; // streak still alive if you studied yesterday
  while (days.has(dayKey(cursor))) {
    count++;
    cursor -= DAY;
  }
  return count;
}

export function last7Days(activity: Activity[], locale = 'en-GB') {
  const today = startOfDay();
  return Array.from({ length: 7 }, (_, i) => {
    const day = today - (6 - i) * DAY;
    return {
      day,
      label: new Date(day).toLocaleDateString(locale, { weekday: 'short' }),
      minutes: minutesOnDay(activity, day),
    };
  });
}

export function subjectStats(activity: Activity[], subject: SubjectKey) {
  const rows = activity.filter((a) => a.subject === subject);
  const correct = rows.reduce((s, a) => s + (a.correct ?? 0), 0);
  const total = rows.reduce((s, a) => s + (a.total ?? 0), 0);
  const minutes = rows.reduce((s, a) => s + a.minutes, 0);
  return { sessions: rows.length, correct, total, minutes, accuracy: total ? Math.round((correct / total) * 100) : 0 };
}

export function overview(state: AppState) {
  const a = state.activity;
  return {
    todayMinutes: minutesOnDay(a, Date.now()),
    streak: streak(a),
    totalMinutes: a.reduce((s, x) => s + x.minutes, 0),
    completedExercises: a.reduce((s, x) => s + (x.total ?? 0), 0),
    correctAnswers: a.reduce((s, x) => s + (x.correct ?? 0), 0),
  };
}
