import {
  Answer,
  EvalResult,
  FileView,
  KeywordHit,
  Post,
  ProjectFileSummary,
  PullOverview,
  PullSummary,
  RepoInfo,
} from "../types";

export const MOCK_REPOS: RepoInfo[] = [
  {
    name: "acme/httpcache",
    language: "Python",
    updated_at: "Updated 2 hours ago",
    description: "In-memory caching and resilient HTTP client for Python services",
  },
  {
    name: "acme/billing-api",
    language: "Go",
    updated_at: "Updated yesterday",
    description: "High-throughput subscription billing and invoice pipeline",
  },
  {
    name: "northwind/fetchkit",
    language: "JavaScript",
    updated_at: "Updated 3 days ago",
    description: "Universal fetch adapter with retry and circuit breaking",
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "post_176_1",
    author: "Priya N.",
    timestamp: "2026-03-14T10:15:00Z",
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-1",
    sentences: [
      { id: "p176_1.s1", text: "During the staging outage on Wednesday, simultaneous retries overwhelmed the downstream database with thundering herds." },
      { id: "p176_1.s2", text: "We decided to wait longer after each failed try, starting at half a second and doubling each time to spread load." },
      { id: "p176_1.s3", text: "This gives failing backends breathing room to recover before we try again." },
    ],
  },
  {
    id: "post_176_2",
    author: "Marcus T.",
    timestamp: "2026-03-14T11:30:00Z",
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-2",
    sentences: [
      { id: "p176_2.s1", text: "I looked into using an outside retry library like tenacity, but pulling in a whole package for twenty lines of loop logic is unnecessary complexity." },
      { id: "p176_2.s2", text: "A clean internal helper keeps our zero-dependency promise intact." },
    ],
  },
  {
    id: "post_176_3",
    author: "Leo K.",
    timestamp: "2026-03-14T14:05:00Z",
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-3",
    sentences: [
      { id: "p176_3.s1", text: "Full jitter delay would smooth out synchronized retry waves even further." },
      { id: "p176_3.s2", text: "Let us postpone adding a small random delay until we observe actual traffic spikes in production metrics." },
      { id: "p176_3.s3", text: "Plain doubling is enough for our current throughput." },
    ],
  },
  {
    id: "post_176_4",
    author: "Marcus T.",
    timestamp: "2026-03-14T15:20:00Z",
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-4",
    sentences: [
      { id: "p176_4.s1", text: "Some API clients may want to configure their own attempt limits instead of hardcoding three tries." },
      { id: "p176_4.s2", text: "We leave the question of letting users choose how many tries still open until we measure latency impact." },
    ],
  },
  {
    id: "post_176_5",
    author: "Priya N.",
    timestamp: "2026-03-14T16:45:00Z",
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-5",
    sentences: [
      { id: "p176_5.s1", text: "I have updated the test suite with coverage for the exponential doubling intervals." },
      { id: "p176_5.s2", text: "All tests pass locally and on continuous integration." },
    ],
  },
  {
    id: "post_118_1",
    author: "Priya N.",
    timestamp: "2026-01-09T09:00:00Z",
    url: "https://github.com/acme/httpcache/pull/118#issuecomment-1",
    sentences: [
      { id: "p118_1.s1", text: "PR #118 introduced a simple fixed-wait retry to handle occasional dropped packets." },
      { id: "p118_1.s2", text: "It waited exactly one second between each try." },
    ],
  },
  {
    id: "post_118_2",
    author: "Leo K.",
    timestamp: "2026-01-09T11:20:00Z",
    url: "https://github.com/acme/httpcache/pull/118#issuecomment-2",
    sentences: [
      { id: "p118_2.s1", text: "Fixed delays worked fine for single dropped connections, but they do not scale when a whole server cluster restarts." },
    ],
  },
  {
    id: "post_260_1",
    author: "Marcus T.",
    timestamp: "2026-08-02T13:10:00Z",
    url: "https://github.com/acme/httpcache/pull/260#issuecomment-1",
    sentences: [
      { id: "p260_1.s1", text: "Without an upper bound, retrying six times could pause a thread for over thirty seconds." },
      { id: "p260_1.s2", text: "We capped the maximum total delay at thirty seconds to prevent hanging user workers." },
    ],
  },
  {
    id: "post_231_1",
    author: "Leo K.",
    timestamp: "2026-05-18T10:00:00Z",
    url: "https://github.com/acme/httpcache/pull/231#issuecomment-1",
    sentences: [
      { id: "p231_1.s1", text: "Health checks must fail fast without retrying so orchestration supervisors replace dead pods immediately." },
      { id: "p231_1.s2", text: "We explicitly reverted retry logic on the health check endpoint." },
    ],
  },
];

export const MOCK_ANSWER_HTTPCACHE_RETRY: Answer = {
  id: "ans_httpcache_retry",
  repo: "acme/httpcache",
  question: "Why do we retry failed requests?",
  range_label: "Last 6 months",
  short_answer: [
    {
      text: "We retry transient network errors using a doubled wait time between attempts.",
      evidence_ids: ["p176_1.s2"],
    },
    {
      text: "The team decided against using an outside retry library because internal logic is only twenty lines of code.",
      evidence_ids: ["p176_2.s1"],
    },
    {
      text: "Adding a random delay was postponed until real traffic metrics show request clustering.",
      evidence_ids: ["p176_3.s2"],
    },
  ],
  based_on: "Based on 5 comments in pull request #176 and 2 comments in #118.",
  decisions: [
    {
      id: "dec_1",
      approach: "Wait longer after each failed try",
      why: {
        text: "starts at half a second and doubles, spreads load after an outage",
        evidence_ids: ["p176_1.s2"],
      },
      status: "accepted",
      proposer: "Priya N.",
      stance_history: [
        { author: "Priya N.", stance: "support", post_id: "post_176_1" },
        { author: "Marcus T.", stance: "support", post_id: "post_176_2" },
        { author: "Leo K.", stance: "support", post_id: "post_176_3" },
      ],
    },
    {
      id: "dec_2",
      approach: "Use an outside retry library",
      why: {
        text: "adds a dependency for about 20 lines of code",
        evidence_ids: ["p176_2.s1"],
      },
      status: "rejected",
      proposer: "Marcus T.",
      stance_history: [
        { author: "Marcus T.", stance: "oppose", post_id: "post_176_2" },
        { author: "Priya N.", stance: "oppose", post_id: "post_176_1" },
      ],
    },
    {
      id: "dec_3",
      approach: "Add a small random delay",
      why: {
        text: "wait until requests cluster in real use",
        evidence_ids: ["p176_3.s2"],
      },
      status: "deferred",
      proposer: "Leo K.",
      stance_history: [
        { author: "Leo K.", stance: "neutral", post_id: "post_176_3" },
      ],
    },
    {
      id: "dec_4",
      approach: "Let users choose how many tries",
      why: {
        text: "needs benchmark results before exposing configuration",
        evidence_ids: ["p176_4.s2"],
      },
      status: "unresolved",
      proposer: "Marcus T.",
      stance_history: [
        { author: "Marcus T.", stance: "neutral", post_id: "post_176_4" },
      ],
    },
  ],
  timeline: [
    {
      date: "9 Jan 2026",
      pr_number: 118,
      text: {
        text: "Simple fixed-wait retry was introduced for transient timeouts.",
        evidence_ids: ["p118_1.s1"],
      },
    },
    {
      date: "14 Mar 2026",
      pr_number: 176,
      text: {
        text: "Growing wait retry was adopted after the staging outage caused thundering herds.",
        evidence_ids: ["p176_1.s1"],
      },
    },
    {
      date: "2 Aug 2026",
      pr_number: 260,
      text: {
        text: "Maximum total wait cap of thirty seconds was added.",
        evidence_ids: ["p260_1.s1"],
      },
      effect: "modified",
    },
  ],
  people: [
    {
      author: "Priya N.",
      role: "Wrote the change · 5 comments",
      comments: 5,
      approved: true,
    },
    {
      author: "Marcus T.",
      role: "Suggested a library, then agreed · 4 comments",
      comments: 4,
      approved: true,
    },
    {
      author: "Leo K.",
      role: "Approved the implementation · 2 comments",
      comments: 2,
      approved: true,
    },
  ],
  confidence: "high",
  dropped: [
    {
      claim: "Retries were suggested by an external security auditor.",
      reason: "No mention of an auditor in PR #176 or issue discussions.",
    },
    {
      claim: "Network timeouts dropped by 80% after deploy.",
      reason: "Metrics mentioned in meeting notes but not confirmed in GitHub comments.",
    },
  ],
  posts: MOCK_POSTS,
};

export const MOCK_GENERIC_ANSWERS: Record<string, Answer> = {
  ans_northwind_fetchkit: {
    id: "ans_northwind_fetchkit",
    repo: "northwind/fetchkit",
    question: "Why does fetchkit use exponential backoff?",
    range_label: "Last 6 months",
    short_answer: [
      {
        text: "The team adopted an exponential backoff formula to prevent flooding recovering gateway services.",
        evidence_ids: ["p_generic_1.s1"],
      },
      {
        text: "We avoided browser-specific timers to maintain Node.js and worker compatibility.",
        evidence_ids: ["p_generic_1.s2"],
      },
    ],
    based_on: "Based on 8 comments in pull request #45.",
    decisions: [
      {
        id: "dec_nw_1",
        approach: "Use exponential backoff with ceiling",
        why: {
          text: "balances fast recovery for minor blips with protection for persistent down-time",
          evidence_ids: ["p_generic_1.s1"],
        },
        status: "accepted",
        proposer: "Sarah B.",
        stance_history: [],
      },
      {
        id: "dec_nw_2",
        approach: "Rely on browser online/offline events",
        why: {
          text: "fails in server-side worker environments and background tasks",
          evidence_ids: ["p_generic_1.s2"],
        },
        status: "rejected",
        proposer: "Tom D.",
        stance_history: [],
      },
    ],
    timeline: [
      {
        date: "12 Feb 2026",
        pr_number: 45,
        text: {
          text: "Initial backoff policy merged after gateway stability issues.",
          evidence_ids: ["p_generic_1.s1"],
        },
      },
    ],
    people: [
      { author: "Sarah B.", role: "Primary author · 6 comments", comments: 6, approved: true },
      { author: "Tom D.", role: "Reviewer · 3 comments", comments: 3, approved: true },
    ],
    confidence: "medium",
    dropped: [
      { claim: "Client requests dropped by half.", reason: "Unverified statistic from internal chat." },
    ],
    posts: [
      {
        id: "post_nw_1",
        author: "Sarah B.",
        timestamp: "2026-02-12T09:30:00Z",
        url: "https://github.com/northwind/fetchkit/pull/45#issuecomment-1",
        sentences: [
          { id: "p_generic_1.s1", text: "The team adopted an exponential backoff formula to prevent flooding recovering gateway services." },
          { id: "p_generic_1.s2", text: "We avoided browser-specific timers to maintain Node.js and worker compatibility." },
        ],
      },
    ],
  },
  ans_lumen_netclient: {
    id: "ans_lumen_netclient",
    repo: "lumen/netclient",
    question: "How is retry delay calculated across worker threads?",
    range_label: "Last year",
    short_answer: [
      {
        text: "Worker threads share a monotonic timer to calculate retry intervals without drift.",
        evidence_ids: ["p_lumen_1.s1"],
      },
    ],
    based_on: "Based on 6 comments in issue #89.",
    decisions: [
      {
        id: "dec_lu_1",
        approach: "Monotonic clock calculation",
        why: {
          text: "prevents clock skew when machines adjust time via NTP",
          evidence_ids: ["p_lumen_1.s1"],
        },
        status: "accepted",
        proposer: "Elena R.",
        stance_history: [],
      },
      {
        id: "dec_lu_2",
        approach: "Synchronous sleep on main event loop",
        why: {
          text: "freezes user interface and stalls pending network packets",
          evidence_ids: ["p_lumen_1.s2"],
        },
        status: "rejected",
        proposer: "Alex W.",
        stance_history: [],
      },
    ],
    timeline: [
      {
        date: "24 Apr 2026",
        pr_number: 104,
        text: {
          text: "Shifted from wall-clock to monotonic clock for backoff timer math.",
          evidence_ids: ["p_lumen_1.s1"],
        },
      },
    ],
    people: [
      { author: "Elena R.", role: "Thread designer · 4 comments", comments: 4, approved: true },
      { author: "Alex W.", role: "Benchmarker · 2 comments", comments: 2, approved: true },
    ],
    confidence: "high",
    dropped: [],
    posts: [
      {
        id: "post_lu_1",
        author: "Elena R.",
        timestamp: "2026-04-24T14:10:00Z",
        url: "https://github.com/lumen/netclient/issues/89#issuecomment-1",
        sentences: [
          { id: "p_lumen_1.s1", text: "Worker threads share a monotonic timer to calculate retry intervals without drift." },
          { id: "p_lumen_1.s2", text: "Synchronous sleeping on the event loop was rejected because it froze user input." },
        ],
      },
    ],
  },
  ans_harbor_queue: {
    id: "ans_harbor_queue",
    repo: "harbor/queue",
    question: "Why do dead letter queues back off exponentially?",
    range_label: "Last 6 months",
    short_answer: [
      {
        text: "Dead letter retries back off exponentially to give corrupted message handlers time to receive updates.",
        evidence_ids: ["p_harbor_1.s1"],
      },
    ],
    based_on: "Based on 7 comments in pull request #210.",
    decisions: [
      {
        id: "dec_hb_1",
        approach: "Progressive dead letter backoff",
        why: {
          text: "avoids spinning CPU on poison pills while preserving FIFO order where needed",
          evidence_ids: ["p_harbor_1.s1"],
        },
        status: "accepted",
        proposer: "Karan S.",
        stance_history: [],
      },
      {
        id: "dec_hb_2",
        approach: "Immediate drop of invalid payloads",
        why: {
          text: "caused silent data loss during temporary database schema rollouts",
          evidence_ids: ["p_harbor_1.s2"],
        },
        status: "rejected",
        proposer: "Maya P.",
        stance_history: [],
      },
    ],
    timeline: [
      {
        date: "19 Mar 2026",
        pr_number: 210,
        text: {
          text: "Exponential queue reschedule merged.",
          evidence_ids: ["p_harbor_1.s1"],
        },
      },
    ],
    people: [
      { author: "Karan S.", role: "Queue architect · 5 comments", comments: 5, approved: true },
      { author: "Maya P.", role: "Reliability reviewer · 3 comments", comments: 3, approved: true },
    ],
    confidence: "medium",
    dropped: [],
    posts: [
      {
        id: "post_hb_1",
        author: "Karan S.",
        timestamp: "2026-03-19T11:00:00Z",
        url: "https://github.com/harbor/queue/pull/210#issuecomment-1",
        sentences: [
          { id: "p_harbor_1.s1", text: "Dead letter retries back off exponentially to give corrupted message handlers time to receive updates." },
          { id: "p_harbor_1.s2", text: "Dropping messages immediately was rejected due to risk of silent data loss." },
        ],
      },
    ],
  },
  ans_zenith_rpc: {
    id: "ans_zenith_rpc",
    repo: "zenith/rpc",
    question: "Why was connection retry throttled?",
    range_label: "Last month",
    short_answer: [
      {
        text: "RPC channels throttle connection retries to guard orchestrators against crash loops.",
        evidence_ids: ["p_zenith_1.s1"],
      },
    ],
    based_on: "Based on 3 comments in issue #33.",
    decisions: [
      {
        id: "dec_zn_1",
        approach: "Channel-level retry limit",
        why: {
          text: "contains blast radius when upstream authentication service is unreachable",
          evidence_ids: ["p_zenith_1.s1"],
        },
        status: "accepted",
        proposer: "Hassan A.",
        stance_history: [],
      },
      {
        id: "dec_zn_2",
        approach: "Infinite retry loop",
        why: {
          text: "exhausted socket descriptors during DNS lookup outages",
          evidence_ids: ["p_zenith_1.s2"],
        },
        status: "rejected",
        proposer: "Chloe M.",
        stance_history: [],
      },
    ],
    timeline: [
      {
        date: "05 Jun 2026",
        pr_number: 33,
        text: {
          text: "Max retry policy adopted for gRPC connections.",
          evidence_ids: ["p_zenith_1.s1"],
        },
      },
    ],
    people: [
      { author: "Hassan A.", role: "Core engineer · 2 comments", comments: 2, approved: true },
      { author: "Chloe M.", role: "Peer reviewer · 1 comment", comments: 1, approved: true },
    ],
    confidence: "high",
    dropped: [],
    posts: [
      {
        id: "post_zn_1",
        author: "Hassan A.",
        timestamp: "2026-06-05T08:15:00Z",
        url: "https://github.com/zenith/rpc/issues/33#issuecomment-1",
        sentences: [
          { id: "p_zenith_1.s1", text: "RPC channels throttle connection retries to guard orchestrators against crash loops." },
          { id: "p_zenith_1.s2", text: "Infinite retry loops were rejected because they rapidly exhausted file descriptors." },
        ],
      },
    ],
  },
  ans_crest_sync: {
    id: "ans_crest_sync",
    repo: "crest/sync",
    question: "Why do sync conflicts trigger progressive delay?",
    range_label: "Last 6 months",
    short_answer: [
      {
        text: "Document synchronization conflicts wait progressively longer before re-reading base revisions.",
        evidence_ids: ["p_crest_1.s1"],
      },
    ],
    based_on: "Based on 4 comments in pull request #72.",
    decisions: [
      {
        id: "dec_cr_1",
        approach: "Progressive sync retry with backoff",
        why: {
          text: "resolves race conditions between distributed offline clients gracefully",
          evidence_ids: ["p_crest_1.s1"],
        },
        status: "accepted",
        proposer: "Oliver B.",
        stance_history: [],
      },
      {
        id: "dec_cr_2",
        approach: "Optimistic overwrite on conflict",
        why: {
          text: "causes irrecoverable loss of concurrent user edits",
          evidence_ids: ["p_crest_1.s2"],
        },
        status: "rejected",
        proposer: "Nadia T.",
        stance_history: [],
      },
    ],
    timeline: [
      {
        date: "11 May 2026",
        pr_number: 72,
        text: {
          text: "Sync backoff algorithm introduced.",
          evidence_ids: ["p_crest_1.s1"],
        },
      },
    ],
    people: [
      { author: "Oliver B.", role: "Sync lead · 3 comments", comments: 3, approved: true },
      { author: "Nadia T.", role: "Reviewer · 1 comment", comments: 1, approved: true },
    ],
    confidence: "medium",
    dropped: [],
    posts: [
      {
        id: "post_cr_1",
        author: "Oliver B.",
        timestamp: "2026-05-11T16:20:00Z",
        url: "https://github.com/crest/sync/pull/72#issuecomment-1",
        sentences: [
          { id: "p_crest_1.s1", text: "Document synchronization conflicts wait progressively longer before re-reading base revisions." },
          { id: "p_crest_1.s2", text: "Optimistic overwrites were rejected because they caused data loss." },
        ],
      },
    ],
  },
};

export const MOCK_KEYWORD_HITS: KeywordHit[] = [
  {
    id: "hit_1",
    repo: "acme/httpcache",
    kind: "pull",
    number: 176,
    title: "Implement exponential backoff retry for transient network timeouts",
    snippet: "We replace simple 1-second loops with exponential backoff so failing endpoints have breathing room to recover.",
    date: "14 Mar 2026",
    comments: 11,
    people: 3,
    language: "Python",
    answer_id: "ans_httpcache_retry",
  },
  {
    id: "hit_2",
    repo: "acme/httpcache",
    kind: "pull",
    number: 118,
    title: "Add basic retry loop for dropped socket connections",
    snippet: "Initial implementation of socket retry with fixed intervals before moving to exponential backoff in PR #176.",
    date: "9 Jan 2026",
    comments: 6,
    people: 2,
    language: "Python",
    answer_id: "ans_httpcache_retry",
  },
  {
    id: "hit_3",
    repo: "acme/httpcache",
    kind: "issue",
    number: 174,
    title: "Staging outage caused by thundering herd retries",
    snippet: "Simultaneous retries brought down the cache node. We need exponential backoff delay doubling.",
    date: "12 Mar 2026",
    comments: 8,
    people: 4,
    language: "Python",
    answer_id: "ans_httpcache_retry",
  },
  {
    id: "hit_4",
    repo: "northwind/fetchkit",
    kind: "pull",
    number: 45,
    title: "Add exponential backoff strategy to universal fetch client",
    snippet: "Adapts retry schedule with exponential backoff factor to avoid saturating third-party payment gateways.",
    date: "12 Feb 2026",
    comments: 8,
    people: 3,
    language: "JavaScript",
    answer_id: "ans_northwind_fetchkit",
  },
  {
    id: "hit_5",
    repo: "northwind/fetchkit",
    kind: "issue",
    number: 41,
    title: "Gateway 504 errors trigger cascading client timeouts",
    snippet: "Discussing whether exponential backoff or linear delays are better suited for browser worker threads.",
    date: "02 Feb 2026",
    comments: 5,
    people: 3,
    language: "JavaScript",
    answer_id: "ans_northwind_fetchkit",
  },
  {
    id: "hit_6",
    repo: "lumen/netclient",
    kind: "issue",
    number: 89,
    title: "Design for exponential backoff timer across worker threads",
    snippet: "Monotonic clock calculation prevents drift during exponential backoff sleep intervals.",
    date: "24 Apr 2026",
    comments: 6,
    people: 2,
    language: "Rust",
    answer_id: "ans_lumen_netclient",
  },
  {
    id: "hit_7",
    repo: "lumen/netclient",
    kind: "pull",
    number: 104,
    title: "Use monotonic clock for backoff timer calculations",
    snippet: "Replaces system wall clock with steady time during exponential backoff evaluations.",
    date: "28 Apr 2026",
    comments: 3,
    people: 2,
    language: "Rust",
    answer_id: "ans_lumen_netclient",
  },
  {
    id: "hit_8",
    repo: "harbor/queue",
    kind: "pull",
    number: 210,
    title: "Add progressive dead letter queue backoff",
    snippet: "Implements exponential backoff on retrying poisoned queue messages before archiving them.",
    date: "19 Mar 2026",
    comments: 7,
    people: 3,
    language: "Go",
    answer_id: "ans_harbor_queue",
  },
  {
    id: "hit_9",
    repo: "harbor/queue",
    kind: "issue",
    number: 195,
    title: "Excessive disk writes during consumer restart bursts",
    snippet: "Messages retrying without exponential backoff write redundant log entries to the journal.",
    date: "10 Mar 2026",
    comments: 4,
    people: 2,
    language: "Go",
    answer_id: "ans_harbor_queue",
  },
  {
    id: "hit_10",
    repo: "zenith/rpc",
    kind: "issue",
    number: 33,
    title: "Throttled channel connection retries on disconnection",
    snippet: "RPC reconnect loops now apply exponential backoff to protect identity providers.",
    date: "05 Jun 2026",
    comments: 3,
    people: 2,
    language: "Go",
    answer_id: "ans_zenith_rpc",
  },
  {
    id: "hit_11",
    repo: "crest/sync",
    kind: "pull",
    number: 72,
    title: "Exponential retry schedule for offline document sync",
    snippet: "Implements exponential backoff schedule to resolve concurrent document editing conflicts.",
    date: "11 May 2026",
    comments: 4,
    people: 2,
    language: "JavaScript",
    answer_id: "ans_crest_sync",
  },
  {
    id: "hit_12",
    repo: "crest/sync",
    kind: "issue",
    number: 68,
    title: "Document write contention under spotty network connections",
    snippet: "Explores exponential backoff algorithms for conflict resolution across mobile clients.",
    date: "01 May 2026",
    comments: 2,
    people: 2,
    language: "JavaScript",
    answer_id: "ans_crest_sync",
  },
  {
    id: "hit_13",
    repo: "acme/billing-api",
    kind: "pull",
    number: 88,
    title: "Webhook delivery exponential retry policy",
    snippet: "Retries customer webhook notifications with exponential backoff intervals over 24 hours.",
    date: "18 Jun 2026",
    comments: 9,
    people: 4,
    language: "Go",
    answer_id: "ans_httpcache_retry",
  },
];

export const MOCK_RETRY_FILE_VIEW: FileView = {
  path: "src/retry.py",
  lines: [
    "import time",
    "from .errors import RetryError, Timeout",
    "",
    "def fetch_with_retry(request, max_attempts=3):",
    "    delay = 0.5",
    "    for attempt in range(max_attempts):",
    "        try:",
    "            return request.send()",
    "        except Timeout:",
    "            time.sleep(delay)",
    "            delay *= 2",
    "    raise RetryError(\"Exceeded max retry attempts\")",
    "",
    "def health_check(service_url):",
    "    return direct_ping(service_url)",
  ],
  threads: [
    {
      id: "thread_fetch_with_retry",
      file: "src/retry.py",
      line_start: 4,
      line_end: 11,
      in_short: {
        text: "We retry timed-out requests with an increasing delay rather than an outside library.",
        evidence_ids: ["p176_1.s2"],
      },
      decisions: MOCK_ANSWER_HTTPCACHE_RETRY.decisions,
      story: MOCK_ANSWER_HTTPCACHE_RETRY.timeline,
      confidence: "high",
      left_out: 0,
      based_on_comments: 5,
      posts: MOCK_POSTS,
    },
  ],
  later_notes: [
    {
      line_start: 14,
      line_end: 15,
      effect: "reversed",
      title: "Health check retry was removed",
      explanation: {
        text: "Health checks fail fast without retrying so failing containers are killed immediately.",
        evidence_ids: ["p231_1.s1"],
      },
      pr_numbers: [118, 231],
    },
  ],
};

export const MOCK_PROJECT_FILES: ProjectFileSummary[] = [
  {
    path: "src/retry.py",
    discussions_count: 3,
    decided_against_count: 1,
  },
  {
    path: "src/cache.py",
    discussions_count: 5,
    decided_against_count: 2,
  },
  {
    path: "src/client.py",
    discussions_count: 2,
    decided_against_count: 0,
  },
  {
    path: "src/errors.py",
    discussions_count: 1,
    decided_against_count: 0,
  },
];

export const MOCK_PULL_SUMMARIES: PullSummary[] = [
  {
    number: 176,
    title: "Implement exponential backoff retry for transient network timeouts",
    date: "14 Mar 2026",
    comments: 11,
    decided_against_count: 1,
  },
  {
    number: 118,
    title: "Add basic retry loop for dropped socket connections",
    date: "9 Jan 2026",
    comments: 6,
    decided_against_count: 0,
  },
  {
    number: 231,
    title: "Remove retry logic from health check endpoints",
    date: "18 May 2026",
    comments: 4,
    decided_against_count: 1,
  },
  {
    number: 260,
    title: "Cap maximum retry delay at 30 seconds",
    date: "2 Aug 2026",
    comments: 5,
    decided_against_count: 0,
  },
];

export const MOCK_PULL_OVERVIEW_176: PullOverview = {
  number: 176,
  title: "Implement exponential backoff retry for transient network timeouts",
  author: "Priya N.",
  merged_at: "14 Mar 2026",
  url: "https://github.com/acme/httpcache/pull/176",
  files: [
    { path: "src/retry.py", additions: 15, deletions: 4 },
    { path: "tests/test_retry.py", additions: 42, deletions: 0 },
    { path: "README.md", additions: 8, deletions: 2 },
  ],
  answer: MOCK_ANSWER_HTTPCACHE_RETRY,
};

export const MOCK_EVAL_RESULT: EvalResult = {
  saved_at: "2026-10-15 14:22 UTC",
  fingerprint: "a8f3b9c1d2e4",
  found: 3,
  official: 4,
  listed: 4,
  listed_official: 3,
  pairs: [
    {
      official_idea: "Use external retry library (tenacity/urllib3)",
      found_idea: "Use an outside retry library",
      kind: "found",
    },
    {
      official_idea: "Exponential delay doubling",
      found_idea: "Wait longer after each failed try",
      kind: "found",
    },
    {
      official_idea: "Jitter random delay",
      found_idea: "Add a small random delay",
      kind: "found",
    },
    {
      official_idea: "Circuit breaker pattern on consecutive 503s",
      found_idea: null,
      kind: "missed",
    },
  ],
  extras: [
    "Configurable max attempts per request endpoint",
  ],
};
