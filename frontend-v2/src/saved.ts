import { Answer, SavedAnswer } from './types';

const STORAGE_KEY = 'cypher_saved_answers_v2';

export function getSavedAnswers(): SavedAnswer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAnswer[];
  } catch (err) {
    console.error('Failed to load saved answers from localStorage', err);
    return [];
  }
}

export function saveAnswer(answer: Answer): void {
  try {
    const list = getSavedAnswers();
    if (list.some((item) => item.answer_id === answer.id)) {
      return;
    }
    const newEntry: SavedAnswer = {
      answer_id: answer.id,
      title: answer.question,
      repo: answer.repo,
      saved_at: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save answer to localStorage', err);
  }
}

export function removeSavedAnswer(answerId: string): void {
  try {
    const list = getSavedAnswers();
    const filtered = list.filter((item) => item.answer_id !== answerId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove saved answer from localStorage', err);
  }
}

export function isAnswerSaved(answerId: string): boolean {
  try {
    const list = getSavedAnswers();
    return list.some((item) => item.answer_id === answerId);
  } catch {
    return false;
  }
}
