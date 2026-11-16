import type { ReviewStats } from '@/types';
import { DAY } from './utils';

// Leitner-style spacing: box -> days until next review.
export const BOX_INTERVALS = [0, 1, 2, 4, 8, 16];

export function review<T extends ReviewStats>(item: T, correct: boolean, now = Date.now()): T {
  const box = correct ? Math.min(item.box + 1, BOX_INTERVALS.length - 1) : 0;
  return {
    ...item,
    box,
    correct: item.correct + (correct ? 1 : 0),
    wrong: item.wrong + (correct ? 0 : 1),
    due: now + BOX_INTERVALS[box] * DAY,
    lastReviewed: now,
  };
}

export function isDue(item: ReviewStats, now = Date.now()) {
  return !item.due || item.due <= now;
}

export function masteryOf(items: ReviewStats[]): number {
  if (!items.length) return 0;
  const sum = items.reduce((a, i) => a + Math.min(i.box, 4) / 4, 0);
  return Math.round((sum / items.length) * 100);
}
