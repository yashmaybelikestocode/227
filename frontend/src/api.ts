import {
  Answer,
  CheckMatch,
  EvalResult,
  FileView,
  KeywordHit,
  ProjectFileSummary,
  PullOverview,
  PullSummary,
  RepoInfo,
} from "./types";
import {
  MOCK_ANSWER_HTTPCACHE_RETRY,
  MOCK_EVAL_RESULT,
  MOCK_GENERIC_ANSWERS,
  MOCK_KEYWORD_HITS,
  MOCK_POSTS,
  MOCK_PROJECT_FILES,
  MOCK_PULL_OVERVIEW_176,
  MOCK_PULL_SUMMARIES,
  MOCK_REPOS,
  MOCK_RETRY_FILE_VIEW,
} from "./mock/data";

export const USE_MOCK = true;

const simulateDelay = async (min = 300, max = 800) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export interface SearchParams {
  keyword: string;
  repo?: string;
  language?: string;
  kind?: "all" | "pull" | "issue";
  sortBy?: "discussed" | "recent";
  range?: string;
  onlyWithComments?: boolean;
}

export async function listRecentRepos(): Promise<RepoInfo[]> {
  if (USE_MOCK) {
    await simulateDelay(300, 500);
    return [...MOCK_REPOS];
  }
  const res = await fetch("/api/repos");
  if (!res.ok) throw new Error("Failed to load repositories");
  return res.json();
}

export async function searchKeyword(params: SearchParams): Promise<KeywordHit[]> {
  if (USE_MOCK) {
    await simulateDelay(350, 600);
    let hits = [...MOCK_KEYWORD_HITS];

    // Filter by keyword if provided
    if (params.keyword && params.keyword.trim()) {
      const q = params.keyword.toLowerCase();
      // Match against title or snippet or repo
      hits = hits.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.snippet.toLowerCase().includes(q) ||
          h.repo.toLowerCase().includes(q)
      );
      // If mock keyword didn't match anything directly, return hits that match partial words or all hits for realistic demonstration
      if (hits.length === 0 && (q.includes("retry") || q.includes("backoff") || q.includes("rate") || q.includes("cache") || q.includes("async") || q.includes("deprecate"))) {
        hits = MOCK_KEYWORD_HITS.filter(h => h.snippet.toLowerCase().includes("retry") || h.title.toLowerCase().includes("retry"));
      }
    }

    if (params.repo && params.repo !== "all") {
      hits = hits.filter((h) => h.repo === params.repo);
    }

    if (params.language && params.language !== "Any language" && params.language !== "all") {
      hits = hits.filter((h) => h.language.toLowerCase() === params.language?.toLowerCase());
    }

    if (params.kind && params.kind !== "all") {
      hits = hits.filter((h) => h.kind === params.kind);
    }

    if (params.onlyWithComments) {
      hits = hits.filter((h) => h.comments > 0);
    }

    if (params.sortBy === "discussed") {
      hits.sort((a, b) => b.comments - a.comments);
    } else if (params.sortBy === "recent") {
      hits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return hits;
  }

  const query = new URLSearchParams(params as unknown as Record<string, string>).toString();
  const res = await fetch(`/api/search?${query}`);
  if (!res.ok) throw new Error("Failed to search discussions");
  return res.json();
}

export async function getAnswer(id: string): Promise<Answer> {
  if (USE_MOCK) {
    await simulateDelay(350, 600);
    if (id === "ans_httpcache_retry" || id === "sample" || id === "default") {
      return MOCK_ANSWER_HTTPCACHE_RETRY;
    }
    if (MOCK_GENERIC_ANSWERS[id]) {
      return MOCK_GENERIC_ANSWERS[id];
    }
    // Check if ID matches a keyword hit
    const hit = MOCK_KEYWORD_HITS.find((h) => h.id === id || h.answer_id === id);
    if (hit && MOCK_GENERIC_ANSWERS[hit.answer_id]) {
      return MOCK_GENERIC_ANSWERS[hit.answer_id];
    }
    // Fallback to primary complete mock answer
    return {
      ...MOCK_ANSWER_HTTPCACHE_RETRY,
      id,
    };
  }

  const res = await fetch(`/api/answer/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to load answer");
  return res.json();
}

export async function listFiles(repo?: string): Promise<ProjectFileSummary[]> {
  if (USE_MOCK) {
    await simulateDelay(300, 500);
    return [...MOCK_PROJECT_FILES];
  }
  const query = repo ? `?repo=${encodeURIComponent(repo)}` : "";
  const res = await fetch(`/api/files${query}`);
  if (!res.ok) throw new Error("Failed to list files");
  return res.json();
}

export async function getFileView(path: string): Promise<FileView> {
  if (USE_MOCK) {
    await simulateDelay(350, 600);
    // Return retry.py data for any requested path in mock mode, updating path property
    return {
      ...MOCK_RETRY_FILE_VIEW,
      path: path || MOCK_RETRY_FILE_VIEW.path,
    };
  }

  const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error("Failed to load file view");
  return res.json();
}

export async function listPulls(repo?: string): Promise<PullSummary[]> {
  if (USE_MOCK) {
    await simulateDelay(300, 500);
    return [...MOCK_PULL_SUMMARIES];
  }
  const query = repo ? `?repo=${encodeURIComponent(repo)}` : "";
  const res = await fetch(`/api/pulls${query}`);
  if (!res.ok) throw new Error("Failed to list pull requests");
  return res.json();
}

export async function getPull(number: number): Promise<PullOverview> {
  if (USE_MOCK) {
    await simulateDelay(350, 600);
    if (number === 176) {
      return MOCK_PULL_OVERVIEW_176;
    }
    const summary = MOCK_PULL_SUMMARIES.find((p) => p.number === number);
    return {
      number,
      title: summary ? summary.title : `Pull request #${number}`,
      author: "Priya N.",
      merged_at: summary ? summary.date : "14 Mar 2026",
      url: `https://github.com/acme/httpcache/pull/${number}`,
      files: [
        { path: "src/retry.py", additions: 12, deletions: 3 },
        { path: "tests/test_retry.py", additions: 24, deletions: 1 },
      ],
      answer: {
        ...MOCK_ANSWER_HTTPCACHE_RETRY,
        question: summary ? summary.title : `Pull request #${number}`,
      },
    };
  }

  const res = await fetch(`/api/pull/${number}`);
  if (!res.ok) throw new Error("Failed to load pull request");
  return res.json();
}

export async function checkIdea(text: string): Promise<CheckMatch[]> {
  if (USE_MOCK) {
    await simulateDelay(400, 700);
    const normalized = text.toLowerCase();
    if (normalized.includes("library") || normalized.includes("package") || normalized.includes("tenacity")) {
      return [
        {
          decision: MOCK_ANSWER_HTTPCACHE_RETRY.decisions[1], // rejected library decision
          sentence: "I looked into using an outside retry library like tenacity, but pulling in a whole package for twenty lines of loop logic is unnecessary complexity.",
          evidence_ids: ["p176_2.s1"],
          posts: MOCK_POSTS,
        },
      ];
    }
    return [];
  }

  const res = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to check idea");
  return res.json();
}

export async function getEvalResult(): Promise<EvalResult> {
  if (USE_MOCK) {
    await simulateDelay(300, 500);
    return { ...MOCK_EVAL_RESULT };
  }

  const res = await fetch("/api/evaluate");
  if (!res.ok) throw new Error("Failed to get evaluation results");
  return res.json();
}
