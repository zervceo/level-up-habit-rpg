import type { QuizCardState } from '../types/domain';

const DAY_MS = 24 * 60 * 60 * 1000;

export function freshCard(questionId: string): QuizCardState {
  return {
    questionId,
    repetition: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    dueAt: Date.now(),
    lastResult: null,
    lastReviewedAt: null,
  };
}

/**
 * Standard SM-2 spaced-repetition update. We only have a binary
 * correct/incorrect signal, so it's mapped to SM-2's 0-5 quality scale:
 * correct -> 5 (easy recall), incorrect -> 2 (failed recall).
 */
export function sm2Update(card: QuizCardState, correct: boolean, now = Date.now()): QuizCardState {
  const quality = correct ? 5 : 2;
  let { repetition, easeFactor } = card;

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  let intervalDays: number;
  if (quality < 3) {
    repetition = 0;
    intervalDays = 1;
  } else {
    repetition += 1;
    if (repetition === 1) intervalDays = 1;
    else if (repetition === 2) intervalDays = 6;
    else intervalDays = Math.round(card.intervalDays * easeFactor);
  }

  return {
    questionId: card.questionId,
    repetition,
    easeFactor: round2(easeFactor),
    intervalDays,
    dueAt: now + intervalDays * DAY_MS,
    lastResult: correct ? 'CORRECT' : 'INCORRECT',
    lastReviewedAt: now,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function dueCards(cards: QuizCardState[], now = Date.now()): QuizCardState[] {
  return cards.filter((c) => c.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
}
