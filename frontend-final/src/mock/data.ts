import type {
  Analysis,
  Comment,
  Decision,
  FileView,
  FileListItem,
  Person,
  Statement,
  TimelineEntry,
  EvalResult,
  RepoInfo,
} from '../types';

export const mockRecentRepos: RepoInfo[] = [
  { name: "acme/httpcache", language: "Python", updated_at: "Updated 2 hours ago" },
  { name: "acme/billing-api", language: "Go", updated_at: "Updated 1 day ago" },
];

export const mockPeople: Person[] = [
  {
    id: "person-priya",
    display_name: "Priya N.",
    identities: [
      {
        kind: "commit_email",
        value: "priya@acme.dev",
        merged_because: "Same commit email as the GitHub account",
      },
      {
        kind: "github_login",
        value: "priya-n",
        merged_because: "Same email shown on the mailing list",
      },
      {
        kind: "other_handle",
        value: "Discourse: priya_n",
        label: "Discourse",
        merged_because: "Linked Discourse profile in GitHub bio",
      },
    ],
    commits: 12,
    comments: 8,
    first_at: "2026-01-09T08:15:00Z",
    last_at: "2026-08-25T14:10:00Z",
  },
  {
    id: "person-marcus",
    display_name: "Marcus T.",
    identities: [
      {
        kind: "commit_email",
        value: "marcus@acme.dev",
        merged_because: "Same commit email as the GitHub account",
      },
      {
        kind: "github_login",
        value: "mtrent",
        merged_because: "Matched GitHub login from PR author profile",
      },
      {
        kind: "other_handle",
        value: "Mailing list: M. Trent",
        label: "Mailing list",
        merged_because: "Public mailing list archives match work email",
      },
    ],
    commits: 9,
    comments: 7,
    first_at: "2026-01-09T08:30:00Z",
    last_at: "2026-08-26T10:00:00Z",
  },
  {
    id: "person-leo",
    display_name: "Leo K.",
    identities: [
      {
        kind: "commit_email",
        value: "leo.k@acme.dev",
        merged_because: "Primary email listed on commits",
      },
      {
        kind: "github_login",
        value: "leok",
        merged_because: "GitHub reviewer account",
      },
      {
        kind: "other_handle",
        value: "Slack: @leok",
        label: "Slack",
        merged_because: "Mapped from maintainer workspace",
      },
    ],
    commits: 2,
    comments: 4,
    first_at: "2026-01-10T11:00:00Z",
    last_at: "2026-05-12T13:40:00Z",
  },
  {
    id: "person-elena",
    display_name: "Elena R.",
    identities: [
      {
        kind: "commit_email",
        value: "elena@acme.dev",
        merged_because: "Verified work commit signature",
      },
      {
        kind: "github_login",
        value: "elenar",
        merged_because: "Matched repository contributor handle",
      },
      {
        kind: "other_handle",
        value: "IRC: elena_r",
        label: "IRC",
        merged_because: "Registered IRC cloaks",
      },
    ],
    commits: 5,
    comments: 4,
    first_at: "2026-01-10T12:00:00Z",
    last_at: "2026-06-18T11:00:00Z",
  },
  {
    id: "person-sam",
    display_name: "Sam V.",
    identities: [
      {
        kind: "commit_email",
        value: "sam@acme.dev",
        merged_because: "Commit author header",
      },
      {
        kind: "github_login",
        value: "samv",
        merged_because: "GitHub merger account",
      },
      {
        kind: "other_handle",
        value: "Twitter: @sam_v",
        label: "Twitter",
        merged_because: "Linked on personal GitHub sponsor page",
      },
    ],
    commits: 3,
    comments: 3,
    first_at: "2026-04-20T09:00:00Z",
    last_at: "2026-08-02T16:00:00Z",
  },
];

export const mockComments: Comment[] = [
  {
    id: "c1",
    github_id: "#1893401",
    person_id: "person-priya",
    date: "14 Mar 2026",
    where: "PR #176 comment",
    kind: "pr_comment",
    ref_number: 176,
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-1893401",
    text: "During yesterday's staging outage, hundreds of workers retried at the exact same moment and overwhelmed the database. We should wait longer after each failed try, starting at half a second and doubling each time. This spreads out retry attempts naturally so recovered services have breathing room.",
  },
  {
    id: "c2",
    github_id: "#1893402",
    person_id: "person-marcus",
    date: "14 Mar 2026",
    where: "PR #176 comment",
    kind: "pr_comment",
    ref_number: 176,
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-1893402",
    text: "Should we use an outside retry library like tenacity instead of writing custom loop code? It provides decorators and jitter policies out of the box.",
  },
  {
    id: "c3",
    github_id: "#1893403",
    person_id: "person-priya",
    date: "14 Mar 2026",
    where: "PR #176 review comment",
    kind: "review_comment",
    ref_number: 176,
    url: "https://github.com/acme/httpcache/pull/176#discussion_r1893403",
    text: "An outside library adds an unnecessary external dependency for what is only about 20 lines of code. We only need simple backoff on timeout errors here.",
  },
  {
    id: "c4",
    github_id: "#1893404",
    person_id: "person-marcus",
    date: "15 Mar 2026",
    where: "Issue #170 comment",
    kind: "issue_comment",
    ref_number: 170,
    url: "https://github.com/acme/httpcache/issues/170#issuecomment-1893404",
    text: "I looked through other projects and using an outside retry library would add too much overhead. Let us stick to our internal implementation.",
  },
  {
    id: "c5",
    github_id: "#1893405",
    person_id: "person-elena",
    date: "14 Mar 2026",
    where: "PR #176 comment",
    kind: "pr_comment",
    ref_number: 176,
    url: "https://github.com/acme/httpcache/pull/176#issuecomment-1893405",
    text: "Could we add a small random delay or jitter to prevent lockstep retries? Let us wait until requests cluster in real production use before tuning jitter.",
  },
  {
    id: "c6",
    github_id: "#1893406",
    person_id: "person-leo",
    date: "14 Mar 2026",
    where: "PR #176 review comment",
    kind: "review_comment",
    ref_number: 176,
    url: "https://github.com/acme/httpcache/pull/176#discussion_r1893406",
    text: "The exponential backoff logic looks clean and well bounded. We should let users choose how many tries they want through configuration.",
  },
  {
    id: "c7",
    github_id: "#1893407",
    person_id: "person-marcus",
    date: "9 Jan 2026",
    where: "PR #118 comment",
    kind: "pr_comment",
    ref_number: 118,
    url: "https://github.com/acme/httpcache/pull/118#issuecomment-1893407",
    text: "Added a simple fixed-wait retry of 1 second on failed HTTP requests. Network timeouts will be retried automatically up to three times.",
  },
  {
    id: "c8",
    github_id: "#1893408",
    person_id: "person-priya",
    date: "9 Jan 2026",
    where: "PR #118 comment",
    kind: "pr_comment",
    ref_number: 118,
    url: "https://github.com/acme/httpcache/pull/118#issuecomment-1893408",
    text: "Fixed wait is a solid first step to handle quick network blips. Merged initial retry handler into tree.",
  },
  {
    id: "c9",
    github_id: "#1893409",
    person_id: "person-sam",
    date: "2 Aug 2026",
    where: "PR #260 comment",
    kind: "pr_comment",
    ref_number: 260,
    url: "https://github.com/acme/httpcache/pull/260#issuecomment-1893409",
    text: "Added a maximum total wait ceiling so queries do not hang indefinitely. Caps backoff at 10 seconds total across all attempts.",
  },
  {
    id: "c10",
    github_id: "#1893410",
    person_id: "person-elena",
    date: "18 Jun 2026",
    where: "PR #231 comment",
    kind: "pr_comment",
    ref_number: 231,
    url: "https://github.com/acme/httpcache/pull/231#issuecomment-1893410",
    text: "Health checks should fail fast rather than retrying so unhealthy nodes leave the pool immediately. Removed retry wrapper from health_check method.",
  },
  {
    id: "c11",
    github_id: "#1893411",
    person_id: "person-marcus",
    date: "15 Jan 2026",
    where: "Commit message",
    kind: "commit_message",
    ref_number: null,
    url: "https://github.com/acme/httpcache/commit/d4e5f6a",
    text: "Documenting retry backoff configuration parameters in the project README for new contributors.",
  },
  {
    id: "c12",
    github_id: "#1893412",
    person_id: "person-sam",
    date: "28 Jul 2026",
    where: "Issue #170 comment",
    kind: "issue_comment",
    ref_number: 170,
    url: "https://github.com/acme/httpcache/issues/170#issuecomment-1893412",
    text: "Running benchmarks against the staging cluster to measure network latency during peak hours.",
  },
  {
    id: "c13",
    github_id: "#1893413",
    person_id: "person-elena",
    date: "18 Feb 2026",
    where: "Commit message",
    kind: "commit_message",
    ref_number: null,
    url: "https://github.com/acme/httpcache/commit/b7c8d9e",
    text: "Unit tests are passing across all supported Python versions in continuous integration.",
  },
  {
    id: "c14",
    github_id: "#1893414",
    person_id: "person-marcus",
    date: "15 Aug 2026",
    where: "Issue #170 comment",
    kind: "issue_comment",
    ref_number: 170,
    url: "https://github.com/acme/httpcache/issues/170#issuecomment-1893414",
    text: "We verified backoff behavior in staging cluster; retry storms eliminated successfully.",
  },
  {
    id: "c15",
    github_id: "#1893415",
    person_id: "person-priya",
    date: "25 Aug 2026",
    where: "Commit message",
    kind: "commit_message",
    ref_number: null,
    url: "https://github.com/acme/httpcache/commit/fedcba9",
    text: "Refactor error types in retry module for cleaner stack traces and better exception chaining.",
  },
  {
    id: "c16",
    github_id: "#1893416",
    person_id: "person-priya",
    date: "3 Apr 2026",
    where: "Commit message",
    kind: "commit_message",
    ref_number: null,
    url: "https://github.com/acme/httpcache/commit/3fa91c2",
    text: "Earlier implementation was located at src/http_retry.py before moving to new module structure.",
  },
  {
    id: "c17",
    github_id: "#1893417",
    person_id: "person-leo",
    date: "12 May 2026",
    where: "PR #176 review comment",
    kind: "review_comment",
    ref_number: 176,
    url: "https://github.com/acme/httpcache/pull/176#discussion_r1893417",
    text: "Connection pooling settings should align with worker thread concurrency limits.",
  },
  // Left out comments (no statements generated)
  {
    id: "c18",
    github_id: "#1893418",
    person_id: "person-leo",
    date: "14 Mar 2026",
    where: "PR #176 review comment",
    kind: "review_comment",
    ref_number: 176,
    url: "https://github.com/acme/httpcache/pull/176#discussion_r1893418",
    text: "Looks great to me, thanks for the patch! +1",
  },
  {
    id: "c19",
    github_id: "#1893419",
    person_id: "person-marcus",
    date: "16 Mar 2026",
    where: "Issue #170 comment",
    kind: "issue_comment",
    ref_number: 170,
    url: "https://github.com/acme/httpcache/issues/170#issuecomment-1893419",
    text: "I have updated the wording in the proposal after internal review.",
  },
  {
    id: "c20",
    github_id: "#1893420",
    person_id: "person-sam",
    date: "20 Apr 2026",
    where: "Issue #170 comment",
    kind: "issue_comment",
    ref_number: 170,
    url: "https://github.com/acme/httpcache/issues/170#issuecomment-1893420",
    text: "Some vague thoughts about maybe exploring alternative networking strategies later.",
  },
  {
    id: "c21",
    github_id: "#1893421",
    person_id: "person-elena",
    date: "10 Jan 2026",
    where: "PR #118 review comment",
    kind: "review_comment",
    ref_number: 118,
    url: "https://github.com/acme/httpcache/pull/118#discussion_r1893421",
    text: "+1 LGTM!",
  },
  {
    id: "c22",
    github_id: "#1893422",
    person_id: "person-sam",
    date: "30 Jul 2026",
    where: "PR #260 comment",
    kind: "pr_comment",
    ref_number: 260,
    url: "https://github.com/acme/httpcache/pull/260#issuecomment-1893422",
    text: "Updated benchmark numbers in offline spreadsheet.",
  },
  {
    id: "c23",
    github_id: "#1893423",
    person_id: "person-priya",
    date: "18 Jun 2026",
    where: "PR #231 comment",
    kind: "pr_comment",
    ref_number: 231,
    url: "https://github.com/acme/httpcache/pull/231#issuecomment-1893423",
    text: "Draft revision saved.",
  },
  {
    id: "c24",
    github_id: "#1893424",
    person_id: "person-marcus",
    date: "26 Aug 2026",
    where: "Commit message",
    kind: "commit_message",
    ref_number: null,
    url: "https://github.com/acme/httpcache/commit/1234567",
    text: "Automated sync of changelog entries for release preparation.",
  },
];

// Helper to construct exact character slice statements
function makeStatement(
  id: string,
  commentId: string,
  quote: string,
  decisionId: string | null
): Statement {
  const comment = mockComments.find((c) => c.id === commentId);
  if (!comment) throw new Error(`Comment not found: ${commentId}`);
  const start = comment.text.indexOf(quote);
  if (start === -1) {
    throw new Error(`Quote "${quote}" not found in comment ${commentId}: "${comment.text}"`);
  }
  const end = start + quote.length;
  return {
    id,
    comment_id: commentId,
    start,
    end,
    quote,
    decision_id: decisionId,
  };
}

export const mockStatements: Statement[] = [
  makeStatement(
    "stmt-1",
    "c1",
    "We should wait longer after each failed try, starting at half a second and doubling each time.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-2",
    "c1",
    "This spreads out retry attempts naturally so recovered services have breathing room.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-3",
    "c2",
    "Should we use an outside retry library like tenacity instead of writing custom loop code?",
    "dec-library"
  ),
  makeStatement(
    "stmt-4",
    "c3",
    "An outside library adds an unnecessary external dependency for what is only about 20 lines of code.",
    "dec-library"
  ),
  makeStatement(
    "stmt-5",
    "c4",
    "using an outside retry library would add too much overhead.",
    "dec-library"
  ),
  makeStatement(
    "stmt-6",
    "c5",
    "Let us wait until requests cluster in real production use before tuning jitter.",
    "dec-jitter"
  ),
  makeStatement(
    "stmt-7",
    "c6",
    "We should let users choose how many tries they want through configuration.",
    "dec-user-limit"
  ),
  makeStatement(
    "stmt-8",
    "c7",
    "Added a simple fixed-wait retry of 1 second on failed HTTP requests.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-9",
    "c8",
    "Fixed wait is a solid first step to handle quick network blips.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-10",
    "c9",
    "Caps backoff at 10 seconds total across all attempts.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-11",
    "c10",
    "Health checks should fail fast rather than retrying so unhealthy nodes leave the pool immediately.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-12",
    "c11",
    "Documenting retry backoff configuration parameters in the project README",
    null // Not a decision
  ),
  makeStatement(
    "stmt-13",
    "c12",
    "Running benchmarks against the staging cluster to measure network latency during peak hours.",
    null // Not a decision
  ),
  makeStatement(
    "stmt-14",
    "c13",
    "Unit tests are passing across all supported Python versions in continuous integration.",
    null // Not a decision
  ),
  makeStatement(
    "stmt-15",
    "c14",
    "retry storms eliminated successfully.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-16",
    "c15",
    "Refactor error types in retry module for cleaner stack traces",
    null // Not a decision
  ),
  makeStatement(
    "stmt-17",
    "c16",
    "Earlier implementation was located at src/http_retry.py before moving to new module structure.",
    "dec-backoff"
  ),
  makeStatement(
    "stmt-18",
    "c17",
    "Connection pooling settings should align with worker thread concurrency limits.",
    null // Not a decision
  ),
];

export const mockLeftOut = [
  { comment_id: "c18", reason: "The comment was only a reaction" },
  { comment_id: "c19", reason: "The text was edited after it was fetched" },
  { comment_id: "c20", reason: "No exact quote could be found" },
  { comment_id: "c21", reason: "The comment was only a reaction" },
  { comment_id: "c22", reason: "No exact quote could be found" },
  { comment_id: "c23", reason: "The text was edited after it was fetched" },
];

export const mockDecisions: Decision[] = [
  {
    id: "dec-backoff",
    title: "Wait longer after each failed try",
    status: "accepted",
    proposer_id: "person-priya",
    reason: {
      text: "Starts at half a second and doubles, spreading load after an outage.",
      statement_ids: ["stmt-1", "stmt-2"],
    },
    statement_ids: ["stmt-1", "stmt-2", "stmt-8", "stmt-9", "stmt-10", "stmt-11", "stmt-15", "stmt-17"],
    grouped_count: 1,
    later_changes: [
      {
        effect: "modified",
        pr_number: 260,
        date: "2 Aug 2026",
        note: {
          text: "Maximum total wait ceiling of 10s added to prevent hung queries.",
          statement_ids: ["stmt-10"],
        },
      },
      {
        effect: "reversed",
        pr_number: 231,
        date: "18 Jun 2026",
        note: {
          text: "Health checks no longer retry, failing fast instead.",
          statement_ids: ["stmt-11"],
        },
      },
    ],
  },
  {
    id: "dec-library",
    title: "Use an outside retry library",
    status: "rejected",
    proposer_id: "person-marcus",
    reason: {
      text: "Adds a dependency for about 20 lines of code.",
      statement_ids: ["stmt-4"],
    },
    statement_ids: ["stmt-3", "stmt-4", "stmt-5"],
    grouped_count: 3, // Grouped from 3 similar statements
    later_changes: [],
  },
  {
    id: "dec-jitter",
    title: "Add a small random delay",
    status: "deferred",
    proposer_id: "person-elena",
    reason: {
      text: "Wait until requests cluster in real use.",
      statement_ids: ["stmt-6"],
    },
    statement_ids: ["stmt-6"],
    grouped_count: 1,
    later_changes: [],
  },
  {
    id: "dec-user-limit",
    title: "Let users choose how many tries",
    status: "unresolved",
    proposer_id: "person-leo",
    reason: {
      text: "Needs a clear configuration design for limits and timeouts.",
      statement_ids: ["stmt-7"],
    },
    statement_ids: ["stmt-7"],
    grouped_count: 1,
    later_changes: [],
  },
];

export const mockTimeline: TimelineEntry[] = [
  {
    date: "9 Jan 2026",
    pr_number: 118,
    text: {
      text: "Simple fixed-wait retry added for connection drops.",
      statement_ids: ["stmt-8"],
    },
  },
  {
    date: "14 Mar 2026",
    pr_number: 176,
    text: {
      text: "Growing wait after the staging outage spreads retry storms.",
      statement_ids: ["stmt-1"],
    },
  },
  {
    date: "2 Aug 2026",
    pr_number: 260,
    text: {
      text: "Maximum total wait ceiling added so queries do not hang indefinitely.",
      statement_ids: ["stmt-10"],
    },
    effect: "modified",
  },
];

export const httpcacheAnalysis: Analysis = {
  id: "httpcache-analysis",
  repo: "acme/httpcache",
  question: "Why do we retry failed requests?",
  range_label: "Last 6 months",
  summary: {
    steps: [
      { key: "prs", label: "Fetching pull requests", count: 6 },
      { key: "issues", label: "Fetching issues", count: 4 },
      { key: "comments", label: "Fetching comments", count: mockComments.length },
      { key: "commits", label: "Fetching commits", count: 31 },
      { key: "statements", label: "Splitting discussions into statements", count: mockStatements.length },
      { key: "decisions", label: "Finding decisions", count: 4 },
      { key: "groups", label: "Grouping similar statements", count: 1 },
      { key: "renames", label: "Following file renames", count: 2 },
      { key: "people", label: "Merging people who use more than one name", count: 5 },
    ],
    prs: 6,
    issues: 4,
    comments: mockComments.length,
    commits: 31,
    statements_used: mockStatements.length,
    statements_left_out: mockLeftOut.length,
  },
  short_answer: [
    {
      text: "During a staging outage, workers retried simultaneously and overwhelmed the database.",
      statement_ids: ["stmt-1"],
    },
    {
      text: "The team agreed to wait longer after each failed try, starting at half a second and doubling each time.",
      statement_ids: ["stmt-1", "stmt-2"],
    },
    {
      text: "An outside retry library was rejected to avoid adding a dependency for 20 lines of code.",
      statement_ids: ["stmt-4"],
    },
  ],
  based_on: "Based on 5 comments in pull request #176 and 2 comments in #118.",
  decisions: mockDecisions,
  timeline: mockTimeline,
  confidence: "high",
  comments: mockComments,
  statements: mockStatements,
  left_out: mockLeftOut,
  people: mockPeople,
};

export const mockRetryFileView: FileView = {
  path: "src/retry.py",
  formerly: [
    {
      path: "src/net/retry.py",
      kind: "renamed",
      date: "12 Jun 2026",
      commit: "9be41d2",
      pr_number: 240,
    },
    {
      path: "src/http_retry.py",
      kind: "moved",
      date: "3 Apr 2026",
      commit: "3fa91c2",
      pr_number: null,
    },
  ],
  lines: [
    "import time",
    "from .errors import RetryError, Timeout",
    "",
    "def fetch_with_retry(client, request, max_retries=3):",
    "    delay = 0.5",
    "    for attempt in range(max_retries):",
    "        try:",
    "            return client.send(request)",
    "        except Timeout:",
    "            time.sleep(delay)",
    "            delay = min(delay * 2, 10.0)",
    "    raise RetryError('Max retries exceeded')",
    "",
    "def health_check(client):",
    "    return client.get('/health', timeout=1.0)",
  ],
  threads: [
    {
      id: "thread-retry-loop",
      line_start: 4,
      line_end: 11,
      in_short: {
        text: "Exponential backoff delays start at 0.5s and double up to a 10s ceiling.",
        statement_ids: ["stmt-1", "stmt-10"],
      },
      decision_ids: ["dec-backoff", "dec-library"],
      discussed_at_path: "src/http_retry.py",
      left_out: 0,
      based_on: 5,
    },
  ],
  later_notes: [
    {
      line_start: 14,
      line_end: 15,
      effect: "reversed",
      title: "Health checks no longer retry",
      explanation: {
        text: "Health checks retried in PR #118, but this was undone in PR #231 so unhealthy instances leave the pool immediately.",
        statement_ids: ["stmt-11"],
      },
      pr_numbers: [118, 231],
    },
  ],
};

export const mockFileList: FileListItem[] = [
  {
    path: "src/retry.py",
    decisions_count: 2,
    decided_against_count: 1,
    has_trail: true,
  },
  {
    path: "src/session.py",
    decisions_count: 3,
    decided_against_count: 1,
    has_trail: false,
  },
  {
    path: "src/cache.py",
    decisions_count: 4,
    decided_against_count: 0,
    has_trail: true,
  },
];

export const mockEvalResult: EvalResult = {
  saved_at: "2026-08-30 14:22 UTC",
  fingerprint: "sha256:7f4a8b9c1d2e3f5a6b7c8d9e0f1a2b3c",
  official: 4,
  found: 3,
  accuracy_percent: 75,
  precision_percent: 60,
  pairs: [
    {
      official_idea: "Use an outside retry library like tenacity",
      found_idea: "Use an outside retry library",
      statement_ids: ["stmt-3", "stmt-4"],
      kind: "found",
    },
    {
      official_idea: "Immediate retry with zero delay",
      found_idea: "Zero-delay immediate retries",
      statement_ids: ["stmt-1"],
      kind: "found",
    },
    {
      official_idea: "Unlimited retry attempts",
      found_idea: "Unbounded retry loops without ceiling",
      statement_ids: ["stmt-10"],
      kind: "found",
    },
    {
      official_idea: "Linear 1-second backoff spacing",
      found_idea: null,
      statement_ids: [],
      kind: "missed",
    },
  ],
  extras: ["Decorrelate client backoffs with full jitter"],
};

// Small complete Analysis for acme/billing-api so it never dead-ends
export function createBillingAnalysis(): Analysis {
  const billingComments: Comment[] = [
    {
      id: "bc1",
      github_id: "#2938101",
      person_id: "person-priya",
      date: "12 Apr 2026",
      where: "PR #42 comment",
      kind: "pr_comment",
      ref_number: 42,
      url: "https://github.com/acme/billing-api/pull/42#issuecomment-2938101",
      text: "We should use idempotency keys for payment retries. Direct duplicate posting causes double charges.",
    },
    {
      id: "bc2",
      github_id: "#2938102",
      person_id: "person-marcus",
      date: "12 Apr 2026",
      where: "PR #42 review comment",
      kind: "review_comment",
      ref_number: 42,
      url: "https://github.com/acme/billing-api/pull/42#discussion_r2938102",
      text: "Agreed on idempotency keys. Direct duplicate posting was rejected.",
    },
  ];

  const stmtB1 = {
    id: "bstmt-1",
    comment_id: "bc1",
    start: 0,
    end: 49,
    quote: "We should use idempotency keys for payment retries.",
    decision_id: "bdec-1",
  };

  const stmtB2 = {
    id: "bstmt-2",
    comment_id: "bc2",
    start: 29,
    end: 69,
    quote: "Direct duplicate posting was rejected.",
    decision_id: "bdec-2",
  };

  return {
    id: "billing-analysis",
    repo: "acme/billing-api",
    question: "How do we handle duplicate charges?",
    range_label: "Last 6 months",
    summary: {
      steps: [],
      prs: 3,
      issues: 2,
      comments: 2,
      commits: 14,
      statements_used: 2,
      statements_left_out: 0,
    },
    short_answer: [
      {
        text: "The team implemented idempotency keys for payment retries.",
        statement_ids: ["bstmt-1"],
      },
      {
        text: "Direct duplicate posting was rejected to protect against double charges.",
        statement_ids: ["bstmt-2"],
      },
    ],
    based_on: "Based on 2 comments in pull request #42.",
    decisions: [
      {
        id: "bdec-1",
        title: "Use idempotency keys for payment retries",
        status: "accepted",
        proposer_id: "person-priya",
        reason: {
          text: "Prevents duplicate charges when client network blips occur.",
          statement_ids: ["bstmt-1"],
        },
        statement_ids: ["bstmt-1"],
        grouped_count: 1,
        later_changes: [],
      },
      {
        id: "bdec-2",
        title: "Direct duplicate posting",
        status: "rejected",
        proposer_id: "person-marcus",
        reason: {
          text: "Causes duplicate credit card charges.",
          statement_ids: ["bstmt-2"],
        },
        statement_ids: ["bstmt-2"],
        grouped_count: 1,
        later_changes: [],
      },
    ],
    timeline: [
      {
        date: "12 Apr 2026",
        pr_number: 42,
        text: {
          text: "Idempotency key header requirement added to checkout endpoint.",
          statement_ids: ["bstmt-1"],
        },
      },
    ],
    confidence: "high",
    comments: billingComments,
    statements: [stmtB1, stmtB2],
    left_out: [],
    people: mockPeople.slice(0, 2),
  };
}
