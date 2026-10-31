import { PullOverview } from '../types';
import { mainAnswer } from './answers';

export const mockPull176: PullOverview = {
  number: 176,
  title: 'Exponential backoff for transient HTTP timeouts',
  author: 'Priya N.',
  merged_at: '14 Mar 2026',
  url: 'https://github.com/acme/httpcache/pull/176',
  files: [
    { path: 'src/retry.py', additions: 14, deletions: 3 },
    { path: 'tests/test_retry.py', additions: 28, deletions: 4 },
    { path: 'docs/configuration.md', additions: 6, deletions: 1 },
  ],
  answer: mainAnswer,
};

export const mockPullSummaries = [
  {
    number: 176,
    title: 'Exponential backoff for transient HTTP timeouts',
    author: 'Priya N.',
    date: '14 Mar 2026',
    comments: 11,
    decided_against_count: 1,
  },
  {
    number: 118,
    title: 'Initial retry mechanism for upstream timeouts',
    author: 'Priya N.',
    date: '9 Jan 2026',
    comments: 6,
    decided_against_count: 0,
  },
  {
    number: 231,
    title: 'Disable retry on health check endpoints',
    author: 'Marcus T.',
    date: '14 May 2026',
    comments: 4,
    decided_against_count: 0,
  },
  {
    number: 260,
    title: 'Maximum total wait cap for retry backoff',
    author: 'Priya N.',
    date: '2 Aug 2026',
    comments: 7,
    decided_against_count: 0,
  },
];
