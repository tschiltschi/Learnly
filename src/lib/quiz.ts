import { shuffle } from './utils';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  sourceId: string;
}

/** Builds multiple-choice questions from question/answer pairs, using other answers as distractors. */
export function buildQuiz(
  pairs: { id: string; prompt: string; answer: string }[],
  count = 10,
): QuizQuestion[] {
  if (pairs.length < 2) return [];
  const pool = shuffle(pairs).slice(0, count);
  return pool.map((p) => {
    const distractors = shuffle(
      Array.from(new Set(pairs.filter((x) => x.id !== p.id && x.answer !== p.answer).map((x) => x.answer))),
    ).slice(0, 3);
    return {
      id: p.id + Math.random().toString(36).slice(2, 5),
      prompt: p.prompt,
      options: shuffle([p.answer, ...distractors]),
      answer: p.answer,
      sourceId: p.id,
    };
  });
}
