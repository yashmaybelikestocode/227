import type {
  Analysis,
  EvalResult,
  FileListItem,
  FileView,
  ImportSummary,
  Person,
  RepoInfo,
  StartImportParams,
} from './types';
import {
  httpcacheAnalysis,
  mockFileList,
  mockRecentRepos,
  mockRetryFileView,
  mockEvalResult,
  createBillingAnalysis,
  mockPeople,
} from './mock/data';

export { mockRecentRepos } from './mock/data';

export const USE_MOCK = true;

const simulatedDelay = (minMs = 300, maxMs = 600): Promise<void> => {
  const isTest =
    typeof globalThis !== 'undefined' &&
    Boolean(
      (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
        ?.NODE_ENV === 'test'
    );
  if (isTest) {
    return Promise.resolve();
  }
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// In-memory split state for people in mock mode
let currentPeople: Person[] = JSON.parse(JSON.stringify(mockPeople));

export async function listRecentRepos(): Promise<RepoInfo[]> {
  if (!USE_MOCK) {
    const res = await fetch('/api/repos/recent');
    return res.json();
  }
  await simulatedDelay();
  return [...mockRecentRepos];
}

export async function startImport(params: StartImportParams): Promise<string> {
  if (!USE_MOCK) {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data.id;
  }
  await simulatedDelay();
  if (params.repo.includes('billing')) {
    return 'billing-analysis';
  }
  return 'httpcache-analysis';
}

export async function getImportSummary(id: string): Promise<ImportSummary> {
  if (!USE_MOCK) {
    const res = await fetch(`/api/import/${encodeURIComponent(id)}/summary`);
    return res.json();
  }
  await simulatedDelay();
  const analysis = await getAnalysis(id);
  return analysis.summary;
}

export async function getAnalysis(id: string): Promise<Analysis> {
  if (!USE_MOCK) {
    const res = await fetch(`/api/analysis/${encodeURIComponent(id)}`);
    return res.json();
  }
  await simulatedDelay();

  if (id.includes('billing')) {
    return createBillingAnalysis();
  }

  return {
    ...httpcacheAnalysis,
    people: currentPeople,
  };
}

export async function listFiles(_analysisId: string): Promise<FileListItem[]> {
  if (!USE_MOCK) {
    const res = await fetch(`/api/analysis/${encodeURIComponent(_analysisId)}/files`);
    return res.json();
  }
  await simulatedDelay();
  return [...mockFileList];
}

export async function getFileView(
  _analysisId: string,
  path: string
): Promise<FileView> {
  if (!USE_MOCK) {
    const res = await fetch(
      `/api/analysis/${encodeURIComponent(_analysisId)}/file?path=${encodeURIComponent(
        path
      )}`
    );
    return res.json();
  }
  await simulatedDelay();
  return {
    ...mockRetryFileView,
    path: path || 'src/retry.py',
  };
}

export async function getPerson(
  _analysisId: string,
  id: string
): Promise<Person | null> {
  if (!USE_MOCK) {
    const res = await fetch(
      `/api/analysis/${encodeURIComponent(_analysisId)}/people/${encodeURIComponent(id)}`
    );
    return res.json();
  }
  await simulatedDelay();
  const person = currentPeople.find((p) => p.id === id);
  return person || null;
}

export async function splitPerson(
  _analysisId: string,
  id: string
): Promise<Person[]> {
  if (!USE_MOCK) {
    const res = await fetch(
      `/api/analysis/${encodeURIComponent(_analysisId)}/people/${encodeURIComponent(
        id
      )}/split`,
      { method: 'POST' }
    );
    return res.json();
  }
  await simulatedDelay();

  const target = currentPeople.find((p) => p.id === id);
  if (!target) return currentPeople;

  // Split target person into multiple Person items, one per identity
  const splitItems: Person[] = target.identities.map((ident, index) => ({
    id: `${target.id}-split-${index}`,
    display_name: `${target.display_name} (${ident.value})`,
    identities: [ident],
    commits: Math.max(1, Math.floor(target.commits / target.identities.length)),
    comments: Math.max(1, Math.floor(target.comments / target.identities.length)),
    first_at: target.first_at,
    last_at: target.last_at,
  }));

  currentPeople = currentPeople
    .filter((p) => p.id !== id)
    .concat(splitItems);

  return [...currentPeople];
}

export async function undoSplit(
  _analysisId: string,
  _id: string
): Promise<Person[]> {
  if (!USE_MOCK) {
    const res = await fetch(
      `/api/analysis/${encodeURIComponent(_analysisId)}/people/undo-split`,
      { method: 'POST' }
    );
    return res.json();
  }
  await simulatedDelay();
  // Restore original mock people
  currentPeople = JSON.parse(JSON.stringify(mockPeople));
  return [...currentPeople];
}

export async function getEvalResult(_analysisId: string): Promise<EvalResult> {
  if (!USE_MOCK) {
    const res = await fetch(
      `/api/analysis/${encodeURIComponent(_analysisId)}/eval`
    );
    return res.json();
  }
  await simulatedDelay();
  return mockEvalResult;
}
