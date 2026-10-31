import { CheckMatch } from '../types';
import { mainAnswer } from './answers';
import { mockPosts } from './posts';

export function runCheckIdea(text: string): CheckMatch | null {
  if (text.toLowerCase().includes('library')) {
    const rejectedLibrary = mainAnswer.decisions.find((d) => d.id === 'dec-library')!;
    return {
      decision: rejectedLibrary,
      sentence: 'An outside package adds a dependency for what is only about twenty lines of code.',
      evidence_ids: ['p4.s1'],
      posts: mockPosts,
    };
  }
  return null;
}
