import { Answer } from '../types';
import { mockPosts } from './posts';

export const mainAnswer: Answer = {
  id: 'ans-httpcache-retry',
  repo: 'acme/httpcache',
  question: 'Why do we retry failed requests?',
  range_label: 'Last 6 months',
  short_answer: [
    {
      text: 'We retry failed requests so that brief network hiccups or server restarts do not immediately break user workflows.',
      evidence_ids: ['p1.s1'],
    },
    {
      text: 'The wait starts at half a second and doubles with each failure to give overloaded backends room to recover.',
      evidence_ids: ['p1.s2', 'p2.s1'],
    },
    {
      text: 'Total wait time is capped at thirty seconds so requests do not hang forever.',
      evidence_ids: ['p5.s2'],
    },
  ],
  based_on: 'Based on 5 comments in pull request #176 and 2 comments in #118.',
  decisions: [
    {
      id: 'dec-backoff',
      approach: 'Wait longer after each failed try',
      why: {
        text: 'Exponential backoff spreads out requests and avoids hammering servers after an outage.',
        evidence_ids: ['p1.s2'],
      },
      status: 'accepted',
      proposer: 'Priya N.',
      stance_history: [
        { author: 'Priya N.', stance: 'support', post_id: 'p1' },
        { author: 'Marcus T.', stance: 'support', post_id: 'p2' },
        { author: 'Leo K.', stance: 'support', post_id: 'p3' },
      ],
    },
    {
      id: 'dec-library',
      approach: 'Use an outside retry library',
      why: {
        text: 'Adds an outside dependency for what is only about twenty lines of code.',
        evidence_ids: ['p4.s1'],
      },
      status: 'rejected',
      proposer: 'Marcus T.',
      stance_history: [
        { author: 'Marcus T.', stance: 'support', post_id: 'p2' },
        { author: 'Priya N.', stance: 'oppose', post_id: 'p4' },
        { author: 'Marcus T.', stance: 'withdraw', post_id: 'p6' },
      ],
    },
    {
      id: 'dec-jitter',
      approach: 'Add a small random delay',
      why: {
        text: 'Wait until requests cluster in real production use before adding jitter complexity.',
        evidence_ids: ['p3.s2'],
      },
      status: 'deferred',
      proposer: 'Leo K.',
      stance_history: [
        { author: 'Leo K.', stance: 'support', post_id: 'p3' },
        { author: 'Priya N.', stance: 'neutral', post_id: 'p7' },
      ],
    },
    {
      id: 'dec-custom-tries',
      approach: 'Let users choose how many tries',
      why: {
        text: 'We need more real-world usage patterns to see if callers really need custom retry counts.',
        evidence_ids: ['p8.s1'],
      },
      status: 'unresolved',
      proposer: 'Marcus T.',
      stance_history: [
        { author: 'Marcus T.', stance: 'support', post_id: 'p8' },
      ],
    },
  ],
  timeline: [
    {
      date: '9 Jan 2026',
      pr_number: 118,
      text: {
        text: 'Simple fixed-wait retry was introduced for network timeouts.',
        evidence_ids: ['p5.s1'],
      },
    },
    {
      date: '14 Mar 2026',
      pr_number: 176,
      text: {
        text: 'Switched to growing wait after the staging outage overwhelmed upstream services.',
        evidence_ids: ['p1.s1'],
      },
    },
    {
      date: '2 Aug 2026',
      pr_number: 260,
      text: {
        text: 'Maximum total wait added to prevent client threads from blocking indefinitely.',
        evidence_ids: ['p5.s2'],
      },
      effect: 'modified',
    },
  ],
  people: [
    { author: 'Priya N.', role: 'Wrote the change · 5 comments', comments: 5, approved: false },
    { author: 'Marcus T.', role: 'Suggested a library, then agreed · 4 comments', comments: 4, approved: false },
    { author: 'Leo K.', role: 'Approved · 2 comments', comments: 2, approved: true },
  ],
  confidence: 'high',
  dropped: [
    {
      claim: 'Retrying was originally inspired by the AWS SDK client implementation.',
      reason: 'No comment or commit message references the AWS SDK directly.',
    },
    {
      claim: 'The default timeout was changed from 5 seconds to 3 seconds during staging tests.',
      reason: 'Timeout constants were unmodified in the merged pull request diff.',
    },
  ],
  posts: mockPosts,
};

// Auxiliary mock answers for other projects
function makeMockAnswer(id: string, repo: string, question: string): Answer {
  return {
    id,
    repo,
    question,
    range_label: 'Last 6 months',
    short_answer: [
      {
        text: 'Requests are backed off gradually to shield dependent backends during intermittent network partitions.',
        evidence_ids: ['p1.s1'],
      },
      {
        text: 'A hard ceiling prevents long tail latency spikes across synchronous service calls.',
        evidence_ids: ['p5.s2'],
      },
    ],
    based_on: 'Based on 4 comments across pull requests in ' + repo + '.',
    decisions: [
      {
        id: id + '-dec-1',
        approach: 'Stepwise backoff intervals',
        why: {
          text: 'Reduces synchronous pressure across client clusters.',
          evidence_ids: ['p1.s2'],
        },
        status: 'accepted',
        proposer: 'Elena R.',
        stance_history: [
          { author: 'Elena R.', stance: 'support', post_id: 'p1' },
        ],
      },
      {
        id: id + '-dec-2',
        approach: 'Heavyweight third-party telemetry wrapper',
        why: {
          text: 'High runtime overhead with marginal diagnostics benefits.',
          evidence_ids: ['p4.s1'],
        },
        status: 'rejected',
        proposer: 'Chen W.',
        stance_history: [
          { author: 'Chen W.', stance: 'support', post_id: 'p2' },
          { author: 'Elena R.', stance: 'oppose', post_id: 'p4' },
        ],
      },
    ],
    timeline: [
      {
        date: '10 Feb 2026',
        pr_number: 45,
        text: {
          text: 'Initial timeout handling introduced.',
          evidence_ids: ['p5.s1'],
        },
      },
      {
        date: '18 Apr 2026',
        pr_number: 92,
        text: {
          text: 'Adopted exponential backoff intervals.',
          evidence_ids: ['p1.s2'],
        },
        effect: 'modified',
      },
    ],
    people: [
      { author: 'Elena R.', role: 'Core contributor · 3 comments', comments: 3, approved: true },
      { author: 'Chen W.', role: 'Reviewer · 2 comments', comments: 2, approved: false },
    ],
    confidence: 'medium',
    dropped: [
      {
        claim: 'Original algorithm was ported from a C++ daemon.',
        reason: 'Unverified historical note from ticket comments.',
      },
    ],
    posts: mockPosts,
  };
}

export const mockAnswers: Record<string, Answer> = {
  'ans-httpcache-retry': mainAnswer,
  '176': mainAnswer,
  'retry-failed-requests': mainAnswer,
  'ans-fetchkit-42': makeMockAnswer('ans-fetchkit-42', 'northwind/fetchkit', 'Why does fetchkit retry on 503 status?'),
  'ans-fetchkit-88': makeMockAnswer('ans-fetchkit-88', 'northwind/fetchkit', 'Backoff strategy during gateway timeouts'),
  'ans-netclient-19': makeMockAnswer('ans-netclient-19', 'lumen/netclient', 'Exponential backoff in socket reconnects'),
  'ans-netclient-63': makeMockAnswer('ans-netclient-63', 'lumen/netclient', 'Retry intervals for TLS handshake drops'),
  'ans-queue-104': makeMockAnswer('ans-queue-104', 'harbor/queue', 'Worker job retry delay on queue congestion'),
  'ans-queue-55': makeMockAnswer('ans-queue-55', 'harbor/queue', 'Dead letter backoff throttling'),
  'ans-streamline-77': makeMockAnswer('ans-streamline-77', 'apex/streamline', 'Backoff schedule for WebSocket reconnects'),
  'ans-streamline-31': makeMockAnswer('ans-streamline-31', 'apex/streamline', 'Handling dropped streaming batches'),
  'ans-connect-12': makeMockAnswer('ans-connect-12', 'bolt/connect', 'Database pool retry backoff mechanism'),
  'ans-connect-90': makeMockAnswer('ans-connect-90', 'bolt/connect', 'Connection lease retry policy'),
};
