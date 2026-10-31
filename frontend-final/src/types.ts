export type DecisionStatus = "accepted" | "rejected" | "deferred" | "unresolved";

export type LaterEffect = "modified" | "reversed";

export type ConfidenceLevel = "high" | "medium" | "low";

export type IdentityKind = "commit_email" | "github_login" | "other_handle";

export interface Identity {
  kind: IdentityKind;
  value: string;
  label?: string;
  merged_because: string;
}

export interface Person {
  id: string;
  display_name: string;
  identities: Identity[];
  commits: number;
  comments: number;
  first_at: string;
  last_at: string;
}

export type CommentKind = "pr_comment" | "issue_comment" | "review_comment" | "commit_message";

export interface Comment {
  id: string;
  github_id: string;
  person_id: string;
  date: string;
  where: string; // e.g. "PR #176 comment"
  kind: CommentKind;
  ref_number: number | null;
  url: string;
  text: string;
}

export interface Statement {
  id: string;
  comment_id: string;
  start: number;
  end: number;
  quote: string; // must equal comment.text.slice(start, end)
  decision_id: string | null;
}

export interface LeftOut {
  comment_id: string;
  reason: string;
}

export interface Claim {
  text: string;
  statement_ids: string[];
}

export interface LaterChange {
  effect: LaterEffect;
  pr_number: number;
  date: string;
  note: Claim;
}

export interface Decision {
  id: string;
  title: string;
  status: DecisionStatus;
  proposer_id: string;
  reason: Claim;
  statement_ids: string[];
  grouped_count: number;
  later_changes: LaterChange[];
}

export interface TimelineEntry {
  date: string;
  pr_number: number;
  text: Claim;
  effect?: LaterEffect;
}

export interface ImportStep {
  key: string;
  label: string;
  count: number | null;
}

export interface ImportSummary {
  steps: ImportStep[];
  prs: number;
  issues: number;
  comments: number;
  commits: number;
  statements_used: number;
  statements_left_out: number;
}

export interface Analysis {
  id: string;
  repo: string;
  question: string;
  range_label: string;
  summary: ImportSummary;
  short_answer: Claim[];
  based_on: string;
  decisions: Decision[];
  timeline: TimelineEntry[];
  confidence: ConfidenceLevel;
  comments: Comment[];
  statements: Statement[];
  left_out: LeftOut[];
  people: Person[];
}

export interface RenameStep {
  path: string;
  kind: "renamed" | "moved";
  date: string;
  commit: string;
  pr_number: number | null;
}

export interface CodeThread {
  id: string;
  line_start: number;
  line_end: number;
  in_short: Claim;
  decision_ids: string[];
  discussed_at_path: string | null;
  left_out: number;
  based_on: number;
}

export interface LaterNote {
  line_start: number;
  line_end: number;
  effect: LaterEffect;
  title: string;
  explanation: Claim;
  pr_numbers: number[];
}

export interface FileView {
  path: string;
  formerly: RenameStep[];
  lines: string[];
  threads: CodeThread[];
  later_notes: LaterNote[];
}

export interface FileListItem {
  path: string;
  decisions_count: number;
  decided_against_count: number;
  has_trail: boolean;
}

export interface EvalPair {
  official_idea: string;
  found_idea: string | null;
  statement_ids: string[];
  kind: "found" | "missed";
}

export interface EvalResult {
  saved_at: string;
  fingerprint: string;
  official: number;
  found: number;
  accuracy_percent: number;
  precision_percent: number;
  pairs: EvalPair[];
  extras: string[];
}

export interface RepoInfo {
  name: string;
  language: string;
  updated_at: string;
}

export interface StartImportParams {
  repo: string;
  question?: string;
  range?: string;
  since?: string;
  until?: string;
}
