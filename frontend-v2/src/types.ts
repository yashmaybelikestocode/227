export type Sentence = {
  id: string;
  text: string;
};

export type Claim = {
  text: string;
  evidence_ids: string[];
};

export type Post = {
  id: string;
  author: string;
  timestamp: string;
  url: string;
  sentences: Sentence[];
};

export type DecisionStatus = 'accepted' | 'rejected' | 'deferred' | 'unresolved';

export type StanceHistoryEntry = {
  author: string;
  stance: 'support' | 'oppose' | 'neutral' | 'withdraw';
  post_id: string;
};

export type Decision = {
  id: string;
  approach: string;
  why: Claim;
  status: DecisionStatus;
  proposer: string;
  stance_history: StanceHistoryEntry[];
};

export type LaterChangeEffect = 'modified' | 'reversed' | 'unrelated' | 'unclear';

export type TimelineEntry = {
  date: string;
  pr_number: number;
  text: Claim;
  effect?: LaterChangeEffect;
};

export type PersonSummary = {
  author: string;
  role: string;
  comments: number;
  approved: boolean;
};

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type DroppedStatement = {
  claim: string;
  reason: string;
};

export type Answer = {
  id: string;
  repo: string;
  question: string;
  range_label: string;
  short_answer: Claim[];
  based_on: string;
  decisions: Decision[];
  timeline: TimelineEntry[];
  people: PersonSummary[];
  confidence: ConfidenceLevel;
  dropped: DroppedStatement[];
  posts: Post[];
};

export type KeywordHit = {
  id: string;
  repo: string;
  kind: 'pull' | 'issue';
  number: number;
  title: string;
  snippet: string;
  date: string;
  comments: number;
  people: number;
  language: string;
  answer_id: string;
};

export type ActivityItemKind = 'commit' | 'issue_comment' | 'pr_comment' | 'review_comment';

export type ActivityItem = {
  id: string;
  kind: ActivityItemKind;
  author: string;
  timestamp: string;
  text: string;
  url: string;
  ref: string | null;
  decision_id?: string;
  evidence_ids?: string[];
};

export type PersonProfile = {
  author: string;
  commits: number;
  comments: number;
  first_at: string;
  last_at: string;
  proposed: string[];
  argued_against: Claim[];
  activity: ActivityItem[];
};

export type Hotspot = {
  file: string;
  decided_against: number;
  undone_later: number;
  adjusted_later: number;
  still_open: number;
  last_discussed: string;
};

export type SavedAnswer = {
  answer_id: string;
  title: string;
  repo: string;
  saved_at: string;
};

export type LineThread = {
  id: string;
  file: string;
  line_start: number;
  line_end: number;
  in_short: Claim;
  decisions: Decision[];
  story: TimelineEntry[];
  confidence: ConfidenceLevel;
  left_out: number;
  based_on_comments: number;
  posts: Post[];
};

export type LaterNote = {
  line_start: number;
  line_end: number;
  effect: 'reversed' | 'modified';
  title: string;
  explanation: Claim;
  pr_numbers: number[];
};

export type FileView = {
  path: string;
  lines: string[];
  threads: LineThread[];
  later_notes: LaterNote[];
};

export type PullFile = {
  path: string;
  additions: number;
  deletions: number;
};

export type PullOverview = {
  number: number;
  title: string;
  author: string;
  merged_at: string;
  url: string;
  files: PullFile[];
  answer: Answer;
};

export type CheckMatch = {
  decision: Decision;
  sentence: string;
  evidence_ids: string[];
  posts: Post[];
};

export type EvalPair = {
  official_idea: string;
  found_idea: string | null;
  kind: 'found' | 'missed';
};

export type EvalResult = {
  saved_at: string;
  fingerprint: string;
  found: number;
  official: number;
  listed: number;
  listed_official: number;
  pairs: EvalPair[];
  extras: string[];
};

export type RepoInfo = {
  name: string;
  language: string;
  updated_at: string;
};
