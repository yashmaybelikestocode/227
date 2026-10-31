import { EvalResult } from '../types';

export const mockEvalResult: EvalResult = {
  saved_at: '28 Oct 2026, 14:22',
  fingerprint: 'a8f9c1e0',
  found: 3,
  official: 4,
  listed: 4,
  listed_official: 3,
  pairs: [
    {
      official_idea: 'Use an outside retry library',
      found_idea: 'Use an outside retry library',
      kind: 'found',
    },
    {
      official_idea: 'Add a small random delay (jitter)',
      found_idea: 'Add a small random delay (jitter)',
      kind: 'found',
    },
    {
      official_idea: 'Let users choose custom retry count',
      found_idea: 'Let users choose custom retry count',
      kind: 'found',
    },
    {
      official_idea: 'Hardcode fixed 10-second delay',
      found_idea: null,
      kind: 'missed',
    },
  ],
  extras: ['Exponential increase per attempt without cap'],
};
