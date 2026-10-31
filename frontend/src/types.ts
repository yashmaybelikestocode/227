export interface Claim {
  text: string;
  evidence_ids: string[];
}

export interface Sentence {
  id: string; // e.g. "p176_1.s1"
  text: string;
}

export interface Post {
  id: string;
  author: string;
  timestamp: string; // ISO or human date like "2026-03-14T10:15:00Z"
  url: string;
  sentences: Sentence[];
}

export type DecisionStatus = "accepted" | "rejected" | "deferred" | "unresolved";

export interface StanceHistoryEntry {
  author: string;
  stance: "support" | "oppose" | "neutral" | "withdraw";
  post_id: string;
}

export interface Decision {
  id: string;
  approach: string;
  why: Claim;
  status: DecisionStatus;
  proposer: string;
  stance_history: StanceHistoryEntry[];
}

export type TimelineEffect = "modified" | "reversed" | "unrelated" | "unclear";

export interface TimelineEntry {
  date: string;
  pr_number: number;
  text: Claim;
  effect?: TimelineEffect;
}

export interface PersonSummary {
  author: string;
  role: string;
  comments: number;
  approved: boolean;
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface DroppedStatement {
  claim: string;
  reason: string;
}

export interface Answer {
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
}

export interface KeywordHit {
  id: string;
  repo: string;
  kind: "pull" | "issue";
  number: number;
  title: string;
  snippet: string;
  date: string;
  comments: number;
  people: number;
  language: string;
  answer_id: string;
}

export interface LineThread {
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
}

export interface LaterNote {
  line_start: number;
  line_end: number;
  effect: "reversed" | "modified";
  title: string;
  explanation: Claim;
  pr_numbers: number[];
}

export interface FileView {
  path: string;
  lines: string[];
  threads: LineThread[];
  later_notes: LaterNote[];
}

export interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
}

export interface PullOverview {
  number: number;
  title: string;
  author: string;
  merged_at: string;
  url: string;
  files: ChangedFile[];
  answer: Answer;
}

export interface CheckMatch {
  decision: Decision;
  sentence: string;
  evidence_ids: string[];
  posts: Post[];
}

export interface EvalPair {
  official_idea: string;
  found_idea: string | null;
  kind: "found" | "missed";
}

export interface EvalResult {
  saved_at: string;
  fingerprint: string;
  found: number;
  official: number;
  listed: number;
  listed_official: number;
  pairs: EvalPair[];
  extras: string[];
}

export interface RepoInfo {
  name: string;
  language: string;
  updated_at: string;
  description: string;
}

export interface ProjectFileSummary {
  path: string;
  discussions_count: number;
  decided_against_count: number;
}

export interface PullSummary {
  number: number;
  title: string;
  date: string;
  comments: number;
  decided_against_count: number;
}
