import { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: 'p1',
    author: 'Priya N.',
    timestamp: '2026-03-14T09:15:00Z',
    url: 'https://github.com/acme/httpcache/pull/176#issuecomment-101',
    sentences: [
      { id: 'p1.s1', text: 'We retry failed requests so that brief network hiccups or server restarts do not immediately break user workflows.' },
      { id: 'p1.s2', text: 'Exponential backoff spreads out requests and avoids hammering servers after an outage.' },
      { id: 'p1.s3', text: 'A static sleep duration caused recurring thunder storms during the staging incident last week.' },
    ],
  },
  {
    id: 'p2',
    author: 'Marcus T.',
    timestamp: '2026-03-14T10:30:00Z',
    url: 'https://github.com/acme/httpcache/pull/176#issuecomment-102',
    sentences: [
      { id: 'p2.s1', text: 'The wait starting at half a second and doubling with each failure makes complete sense to me.' },
      { id: 'p2.s2', text: 'Should we pull in tenancy-retry or an existing Python retry package instead of hand-rolling this?' },
    ],
  },
  {
    id: 'p3',
    author: 'Leo K.',
    timestamp: '2026-03-14T11:05:00Z',
    url: 'https://github.com/acme/httpcache/pull/176#issuecomment-103',
    sentences: [
      { id: 'p3.s1', text: 'I reviewed the core loop and it looks very clean and self-contained.' },
      { id: 'p3.s2', text: 'Wait until requests cluster in real production use before adding jitter complexity.' },
      { id: 'p3.s3', text: 'We can defer full jitter randomization to a subsequent PR if thundering herds persist.' },
    ],
  },
  {
    id: 'p4',
    author: 'Priya N.',
    timestamp: '2026-03-14T11:40:00Z',
    url: 'https://github.com/acme/httpcache/pull/176#issuecomment-104',
    sentences: [
      { id: 'p4.s1', text: 'An outside package adds a dependency for what is only about twenty lines of code.' },
      { id: 'p4.s2', text: 'Our zero external dependencies policy has saved us countless audit headaches this quarter.' },
    ],
  },
  {
    id: 'p5',
    author: 'Priya N.',
    timestamp: '2026-01-09T14:20:00Z',
    url: 'https://github.com/acme/httpcache/pull/118#issuecomment-201',
    sentences: [
      { id: 'p5.s1', text: 'Simple fixed-wait retry was introduced for network timeouts.' },
      { id: 'p5.s2', text: 'Total wait time is capped at thirty seconds so requests do not hang forever.' },
      { id: 'p5.s3', text: 'Health checks fail immediately so load balancers can pull unhealthy pods without waiting.' },
    ],
  },
  {
    id: 'p6',
    author: 'Marcus T.',
    timestamp: '2026-03-14T13:10:00Z',
    url: 'https://github.com/acme/httpcache/pull/176#issuecomment-105',
    sentences: [
      { id: 'p6.s1', text: 'Agreed on keeping the zero dependency footprint, let us keep it in-house.' },
      { id: 'p6.s2', text: 'With comprehensive unit tests in place, rolling our own twenty lines is fine.' },
    ],
  },
  {
    id: 'p7',
    author: 'Priya N.',
    timestamp: '2026-03-14T14:00:00Z',
    url: 'https://github.com/acme/httpcache/pull/176#issuecomment-106',
    sentences: [
      { id: 'p7.s1', text: 'I will file a follow-up ticket for random jitter to revisit once metric telemetry is live.' },
      { id: 'p7.s2', text: 'For now the doubling delay without randomness solves the immediate staging blocker.' },
    ],
  },
  {
    id: 'p8',
    author: 'Marcus T.',
    timestamp: '2026-03-14T14:45:00Z',
    url: 'https://github.com/acme/httpcache/pull/176#issuecomment-107',
    sentences: [
      { id: 'p8.s1', text: 'We need more real-world usage patterns to see if callers really need custom retry counts.' },
      { id: 'p8.s2', text: 'Let us keep the default hardcoded to three tries for this release.' },
    ],
  },
];
