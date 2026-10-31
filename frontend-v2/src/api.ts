import {
  ActivityItem,
  Answer,
  CheckMatch,
  EvalResult,
  FileView,
  Hotspot,
  KeywordHit,
  PersonProfile,
  PullOverview,
  RepoInfo,
} from './types';
import { mockRepos } from './mock/repos';
import { mockAnswers, mainAnswer } from './mock/answers';
import { mockKeywordHits } from './mock/keywordHits';
import { mockActivityItems, mockProfiles } from './mock/activity';
import { mockHotspots } from './mock/hotspots';
import { mockRetryFileView } from './mock/fileView';
import { mockPull176, mockPullSummaries } from './mock/pulls';
import { runCheckIdea } from './mock/check';
import { mockEvalResult } from './mock/evalResult';

export const USE_MOCK = true;

const isTest = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test';

function simulateDelay(): Promise<void> {
  if (isTest) {
    return Promise.resolve();
  }
  const ms = Math.floor(Math.random() * 200) + 300; // 300 - 500 ms
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listRecentRepos(): Promise<RepoInfo[]> {
  await simulateDelay();
  if (USE_MOCK) {
    return [...mockRepos];
  }
  const res = await fetch('/api/repos');
  if (!res.ok) throw new Error('Failed to load recent projects');
  return res.json();
}

export interface SearchKeywordParams {
  keyword: string;
  repo?: string;
  language?: string;
  kind?: string;
  sort?: string;
  range?: string;
  minComments?: boolean;
}

export async function searchKeyword(params: SearchKeywordParams): Promise<KeywordHit[]> {
  await simulateDelay();
  if (USE_MOCK) {
    let hits = [...mockKeywordHits];
    const kw = params.keyword.trim().toLowerCase();
    if (kw) {
      hits = hits.filter(
        (h) =>
          h.title.toLowerCase().includes(kw) ||
          h.snippet.toLowerCase().includes(kw) ||
          h.repo.toLowerCase().includes(kw)
      );
    }
    if (params.repo) {
      hits = hits.filter((h) => h.repo === params.repo);
    }
    if (params.language && params.language !== 'Any language') {
      hits = hits.filter((h) => h.language.toLowerCase() === params.language?.toLowerCase());
    }
    if (params.kind && params.kind !== 'all') {
      hits = hits.filter((h) => h.kind === params.kind);
    }
    if (params.minComments) {
      hits = hits.filter((h) => h.comments >= 5);
    }
    if (params.sort === 'Most recent') {
      hits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      // Default to Most discussed
      hits.sort((a, b) => b.comments - a.comments);
    }
    return hits;
  }
  const query = new URLSearchParams(params as unknown as Record<string, string>).toString();
  const res = await fetch(`/api/search?${query}`);
  if (!res.ok) throw new Error('Failed to search discussions');
  return res.json();
}

export async function getAnswer(id: string): Promise<Answer> {
  await simulateDelay();
  if (USE_MOCK) {
    const found = mockAnswers[id];
    if (found) return found;
    // Fallback gracefully so any ID renders a valid answer in mock mode
    return {
      ...mainAnswer,
      id,
    };
  }
  const res = await fetch(`/api/answer/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to load answer');
  return res.json();
}

export interface ActivityFilterParams {
  repo?: string;
  person?: string;
  types?: string[];
  range?: string;
}

export async function getActivity(params?: ActivityFilterParams): Promise<ActivityItem[]> {
  await simulateDelay();
  if (USE_MOCK) {
    let list = [...mockActivityItems];
    if (params?.person && params.person !== 'All people') {
      list = list.filter((item) => item.author === params.person);
    }
    if (params?.types && params.types.length > 0) {
      list = list.filter((item) => params.types?.includes(item.kind));
    }
    if (params?.range) {
      const now = new Date('2026-08-31T23:59:59Z').getTime();
      let cutOffDays = 180;
      if (params.range === 'Last 2 weeks') cutOffDays = 14;
      else if (params.range === 'Last month') cutOffDays = 30;
      else if (params.range === 'Last 6 months') cutOffDays = 180;
      const cutOffTime = now - cutOffDays * 24 * 60 * 60 * 1000;
      list = list.filter((item) => new Date(item.timestamp).getTime() >= cutOffTime);
    }
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }
  const query = new URLSearchParams((params || {}) as unknown as Record<string, string>).toString();
  const res = await fetch(`/api/activity?${query}`);
  if (!res.ok) throw new Error('Failed to load activity');
  return res.json();
}

export async function listPeople(): Promise<
  { author: string; commits: number; comments: number; first_at: string; last_at: string; proposed: string[] }[]
> {
  await simulateDelay();
  if (USE_MOCK) {
    return Object.values(mockProfiles).map((p) => ({
      author: p.author,
      commits: p.commits,
      comments: p.comments,
      first_at: p.first_at,
      last_at: p.last_at,
      proposed: p.proposed,
    }));
  }
  const res = await fetch('/api/people');
  if (!res.ok) throw new Error('Failed to load people');
  return res.json();
}

export async function getPerson(name: string): Promise<PersonProfile | null> {
  await simulateDelay();
  if (USE_MOCK) {
    const decoded = decodeURIComponent(name);
    return mockProfiles[decoded] || null;
  }
  const res = await fetch(`/api/people/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to load person profile');
  return res.json();
}

export async function listHotspots(): Promise<Hotspot[]> {
  await simulateDelay();
  if (USE_MOCK) {
    return [...mockHotspots];
  }
  const res = await fetch('/api/hotspots');
  if (!res.ok) throw new Error('Failed to load hot spots');
  return res.json();
}

export async function listFiles(_repo?: string): Promise<{ path: string; discussions: number; decided_against: number }[]> {
  await simulateDelay();
  if (USE_MOCK) {
    return [
      { path: 'src/retry.py', discussions: 5, decided_against: 4 },
      { path: 'src/session.py', discussions: 4, decided_against: 3 },
      { path: 'src/cache.py', discussions: 6, decided_against: 5 },
      { path: 'src/config.py', discussions: 3, decided_against: 1 },
      { path: 'src/errors.py', discussions: 2, decided_against: 2 },
      { path: 'src/pool.py', discussions: 4, decided_against: 3 },
      { path: 'src/headers.py', discussions: 1, decided_against: 1 },
      { path: 'src/utils.py', discussions: 2, decided_against: 0 },
    ];
  }
  const res = await fetch('/api/files');
  if (!res.ok) throw new Error('Failed to load files');
  return res.json();
}

export async function getFileView(path: string): Promise<FileView> {
  await simulateDelay();
  if (USE_MOCK) {
    if (path.includes('retry.py')) {
      return mockRetryFileView;
    }
    // Return a structured fallback file view
    return {
      path,
      lines: ['# ' + path, 'import os', 'import sys', '', 'def init():', '    pass'],
      threads: [],
      later_notes: [],
    };
  }
  const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Failed to load file view');
  return res.json();
}

export async function listPulls(_repo?: string) {
  await simulateDelay();
  if (USE_MOCK) {
    return [...mockPullSummaries];
  }
  const res = await fetch('/api/pulls');
  if (!res.ok) throw new Error('Failed to load pull requests');
  return res.json();
}

export async function getPull(number: number): Promise<PullOverview> {
  await simulateDelay();
  if (USE_MOCK) {
    if (number === 176 || String(number) === '176') {
      return mockPull176;
    }
    return {
      ...mockPull176,
      number,
      title: `Pull request #${number}`,
    };
  }
  const res = await fetch(`/api/pulls/${number}`);
  if (!res.ok) throw new Error('Failed to load pull request');
  return res.json();
}

export async function checkIdea(text: string): Promise<CheckMatch | null> {
  await simulateDelay();
  if (USE_MOCK) {
    return runCheckIdea(text);
  }
  const res = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to check idea');
  return res.json();
}

export async function getEvalResult(): Promise<EvalResult> {
  await simulateDelay();
  if (USE_MOCK) {
    return mockEvalResult;
  }
  const res = await fetch('/api/evaluate');
  if (!res.ok) throw new Error('Failed to run evaluation');
  return res.json();
}
