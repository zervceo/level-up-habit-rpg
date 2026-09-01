import type { QuizQuestion, QuizTopic } from '../types/domain';
import raw from './bank.json';

export const QUIZ_BANK = raw as QuizQuestion[];

export function questionsByTopic(topic: QuizTopic): QuizQuestion[] {
  return QUIZ_BANK.filter((q) => q.topic === topic);
}

export function getQuestion(id: string): QuizQuestion | undefined {
  return QUIZ_BANK.find((q) => q.id === id);
}

export function randomQuestionForTopic(topic: QuizTopic): QuizQuestion {
  const pool = questionsByTopic(topic);
  return pool[Math.floor(Math.random() * pool.length)];
}
