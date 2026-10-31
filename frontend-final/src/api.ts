import type {
  Analysis,
  EvalResult,
  FileListItem,
  FileView,
  ImportStep,
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

/**
 * VITE_USE_MOCK selects the data source. Anything other than "false" (including unset) uses the
 * bundled sample data, so tests and the offline demo never touch the network.
 * Read at call time so tests can switch it with vi.stubEnv.
 */
export function isMockMode(): boolean {
  return String(import.meta.env.VITE_USE_MOCK ?? 'true').trim().toLowerCase() !== 'false';
}

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

// ---------------------------------------------------------------------------------------------
// Data source tracking (drives the "Live data" / "Sample data" chip in the page header)

export type DataSource = 'live' | 'sample';

let lastSource: DataSource | null = null;
const sourceListeners = new Set<() => void>();

function markSource(source: DataSource): void {
  if (lastSource === source) return;
  lastSource = source;
  sourceListeners.forEach((listener) => listener());
}

/** Source of the most recent data call, or null before the first one in live mode. */
export function getDataSource(): DataSource | null {
  return lastSource ?? (isMockMode() ? 'sample' : null);
}

export function subscribeDataSource(listener: () => void): () => void {
  sourceListeners.add(listener);
  return () => {
    sourceListeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------------------------
// Backend calls

/** A backend failure with a message that is safe to show to people. */
export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Live summary as the backend sends it: the frontend type plus progress fields. */
export interface ImportProgress extends ImportSummary {
  steps: (ImportStep & { state?: 'waiting' | 'working' | 'done' | 'skipped' })[];
  done: boolean;
  error?: string | null;
}

export interface SealedFindings {
  saved_at: string;
  fingerprint: string;
}

const UNREACHABLE =
  'Cypher could not reach its backend. Check that it is running (see the README) and try again.';
const UNREADABLE = 'The backend sent an answer Cypher could not read. Try again.';

const loggedFallbacks = new Set<string>();

/** Parts of the backend that are not built yet answer 404 or 501; only those use sample data. */
class NotBuiltError extends Error {}

async function request<T>(
  url: string,
  isValid: (data: unknown) => boolean,
  init?: RequestInit,
  allowFallback = false
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError(UNREACHABLE);
  }
  if (allowFallback && (res.status === 404 || res.status === 501)) {
    throw new NotBuiltError();
  }
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new ApiError(UNREACHABLE, res.status);
    throw new ApiError(UNREADABLE, res.status);
  }
  if (!res.ok) {
    const message = (data as { error?: unknown } | null)?.error;
    throw new ApiError(
      typeof message === 'string' && message ? message : `The backend answered with an error (${res.status}).`,
      res.status
    );
  }
  if (!isValid(data)) {
    throw new ApiError(UNREADABLE, res.status);
  }
  markSource('live');
  return data as T;
}

/** Use the backend; if that endpoint is not built yet, use sample data for this one function. */
async function withFallback<T>(name: string, live: () => Promise<T>, sample: () => Promise<T>): Promise<T> {
  try {
    return await live();
  } catch (err) {
    if (!(err instanceof NotBuiltError)) throw err;
    if (!loggedFallbacks.has(name)) {
      loggedFallbacks.add(name);
      console.info(`using sample data for ${name}`);
    }
    return sample();
  }
}

const isObject = (d: unknown): d is Record<string, unknown> => typeof d === 'object' && d !== null;
const isArray = (d: unknown) => Array.isArray(d);
const isSummary = (d: unknown) => isObject(d) && Array.isArray(d.steps);
const isAnalysis = (d: unknown) =>
  isObject(d) && typeof d.id === 'string' && Array.isArray(d.decisions) && Array.isArray(d.statements);
const isPerson = (d: unknown) => isObject(d) && typeof d.id === 'string' && Array.isArray(d.identities);
const isPeople = (d: unknown) => Array.isArray(d) && d.every(isPerson);
const isSealed = (d: unknown) => isObject(d) && typeof d.saved_at === 'string' && typeof d.fingerprint === 'string';
const isEvalResult = (d: unknown) => isSealed(d) && Array.isArray((d as { pairs?: unknown }).pairs);

const enc = encodeURIComponent;

// ---------------------------------------------------------------------------------------------
// Which analysis the pages mean. Several pages have no id in their URL and ask for a placeholder
// ('demo', 'httpcache-analysis'); in live mode that means the most recent real analysis.

const PLACEHOLDER_IDS = new Set(['', 'demo', 'httpcache-analysis', 'billing-analysis']);
const LAST_ID_KEY = 'cypher.lastAnalysisId';
let lastAnalysisId: string | null = null;
let lastLiveAnalysis: Analysis | null = null;
const importParams = new Map<string, StartImportParams>();
const sealCalls = new Map<string, Promise<SealedFindings>>();

function rememberAnalysisId(id: string): void {
  if (PLACEHOLDER_IDS.has(id)) return;
  lastAnalysisId = id;
  try {
    sessionStorage.setItem(LAST_ID_KEY, id);
  } catch {
    // storage may be unavailable; the in-memory value is enough
  }
}

function resolveId(id: string): string {
  if (!PLACEHOLDER_IDS.has(id)) {
    rememberAnalysisId(id);
    return id;
  }
  if (!lastAnalysisId) {
    try {
      lastAnalysisId = sessionStorage.getItem(LAST_ID_KEY);
    } catch {
      lastAnalysisId = null;
    }
  }
  return lastAnalysisId ?? id;
}

/** The repo and question an import was started with (known only in this browser tab). */
export function getImportParams(id: string): StartImportParams | undefined {
  return importParams.get(id);
}

/** Clears module state between tests. */
export function resetApiState(): void {
  lastSource = null;
  lastAnalysisId = null;
  lastLiveAnalysis = null;
  importParams.clear();
  sealCalls.clear();
  loggedFallbacks.clear();
  currentPeople = JSON.parse(JSON.stringify(mockPeople));
  try {
    sessionStorage.removeItem(LAST_ID_KEY);
  } catch {
    // ignore
  }
  sourceListeners.forEach((listener) => listener());
}

// ---------------------------------------------------------------------------------------------
// Mock implementations

async function mockAnalysis(id: string): Promise<Analysis> {
  await simulatedDelay();
  if (id.includes('billing')) {
    return createBillingAnalysis();
  }
  return {
    ...httpcacheAnalysis,
    people: currentPeople,
  };
}

async function mockPerson(id: string): Promise<Person | null> {
  await simulatedDelay();
  markSource('sample');
  return currentPeople.find((p) => p.id === id) || null;
}

async function mockSplit(id: string): Promise<Person[]> {
  await simulatedDelay();
  markSource('sample');

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

async function mockUndoSplit(): Promise<Person[]> {
  await simulatedDelay();
  markSource('sample');
  // Restore original mock people
  currentPeople = JSON.parse(JSON.stringify(mockPeople));
  return [...currentPeople];
}

// ---------------------------------------------------------------------------------------------
// Public API

export async function listRecentRepos(): Promise<RepoInfo[]> {
  if (!isMockMode()) {
    return request<RepoInfo[]>('/api/repos', isArray);
  }
  await simulatedDelay();
  markSource('sample');
  return [...mockRecentRepos];
}

export async function startImport(params: StartImportParams): Promise<string> {
  if (!isMockMode()) {
    // The bundled sample projects are read from local fixtures, not GitHub.
    const sample = mockRecentRepos.some((r) => r.name === params.repo);
    const body = sample
      ? { fixture: params.repo.replace('/', '-'), question: params.question, range: params.range }
      : { repo: params.repo, question: params.question, range: params.range, since: params.since };
    const data = await request<{ analysis_id: string }>(
      '/api/imports',
      (d) => isObject(d) && typeof d.analysis_id === 'string',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    importParams.set(data.analysis_id, params);
    rememberAnalysisId(data.analysis_id);
    return data.analysis_id;
  }
  await simulatedDelay();
  markSource('sample');
  if (params.repo.includes('billing')) {
    return 'billing-analysis';
  }
  return 'httpcache-analysis';
}

export async function getImportSummary(id: string): Promise<ImportProgress> {
  if (!isMockMode()) {
    return request<ImportProgress>(`/api/imports/${enc(resolveId(id))}/summary`, isSummary);
  }
  await simulatedDelay();
  const analysis = await getAnalysis(id);
  return { ...analysis.summary, done: true, error: null };
}

export async function getAnalysis(id: string): Promise<Analysis> {
  if (!isMockMode()) {
    const analysis = await request<Analysis>(`/api/analyses/${enc(resolveId(id))}`, isAnalysis);
    lastLiveAnalysis = analysis;
    return analysis;
  }
  const analysis = await mockAnalysis(id);
  markSource('sample');
  return analysis;
}

export async function listFiles(analysisId: string): Promise<FileListItem[]> {
  if (!isMockMode()) {
    return withFallback(
      'listFiles',
      () => request<FileListItem[]>(`/api/analyses/${enc(resolveId(analysisId))}/files`, isArray, undefined, true),
      () => listFilesMock()
    );
  }
  return listFilesMock();
}

async function listFilesMock(): Promise<FileListItem[]> {
  await simulatedDelay();
  markSource('sample');
  return [...mockFileList];
}

export async function getFileView(analysisId: string, path: string): Promise<FileView> {
  if (!isMockMode()) {
    return withFallback(
      'getFileView',
      () =>
        request<FileView>(
          `/api/analyses/${enc(resolveId(analysisId))}/files/${path.split('/').map(enc).join('/')}`,
          (d) => isObject(d) && Array.isArray(d.lines),
          undefined,
          true
        ),
      () => getFileViewMock(path)
    );
  }
  return getFileViewMock(path);
}

async function getFileViewMock(path: string): Promise<FileView> {
  await simulatedDelay();
  markSource('sample');
  return {
    ...mockRetryFileView,
    path: path || 'src/retry.py',
  };
}

export async function getPerson(analysisId: string, id: string): Promise<Person | null> {
  if (!isMockMode()) {
    const realId = resolveId(analysisId);
    return withFallback(
      'getPerson',
      () => request<Person>(`/api/analyses/${enc(realId)}/people/${enc(id)}`, isPerson, undefined, true),
      async () => {
        // Until the people endpoint exists, the same record is in the backend's analysis.
        const fromAnalysis =
          lastLiveAnalysis?.id === realId ? lastLiveAnalysis.people.find((p) => p.id === id) : undefined;
        if (fromAnalysis) {
          markSource('live');
          return fromAnalysis;
        }
        return mockPerson(id);
      }
    );
  }
  return mockPerson(id);
}

export async function splitPerson(analysisId: string, id: string): Promise<Person[]> {
  if (!isMockMode()) {
    return withFallback(
      'splitPerson',
      () =>
        request<Person[]>(
          `/api/analyses/${enc(resolveId(analysisId))}/people/${enc(id)}/split`,
          isPeople,
          { method: 'POST' },
          true
        ),
      () => mockSplit(id)
    );
  }
  return mockSplit(id);
}

export async function undoSplit(analysisId: string, id: string): Promise<Person[]> {
  if (!isMockMode()) {
    return withFallback(
      'undoSplit',
      () =>
        request<Person[]>(
          `/api/analyses/${enc(resolveId(analysisId))}/people/${enc(id)}/undo-split`,
          isPeople,
          { method: 'POST' },
          true
        ),
      () => mockUndoSplit()
    );
  }
  return mockUndoSplit();
}

/**
 * Seals Cypher's findings for the blind test (once per analysis) and returns when and with
 * which fingerprint they were sealed. The maintainers' list is not opened here.
 */
export async function sealFindings(analysisId: string): Promise<SealedFindings> {
  if (!isMockMode()) {
    const realId = resolveId(analysisId);
    let call = sealCalls.get(realId);
    if (!call) {
      call = request<SealedFindings>(`/api/analyses/${enc(realId)}/blind/seal`, isSealed, { method: 'POST' });
      sealCalls.set(realId, call);
      call.catch(() => sealCalls.delete(realId)); // allow a retry after a failure
    }
    return call;
  }
  await simulatedDelay();
  markSource('sample');
  return { saved_at: mockEvalResult.saved_at, fingerprint: mockEvalResult.fingerprint };
}

/** Opens the maintainers' list and scores the sealed findings against it. */
export async function getEvalResult(analysisId: string): Promise<EvalResult> {
  if (!isMockMode()) {
    return request<EvalResult>(`/api/analyses/${enc(resolveId(analysisId))}/blind/reveal`, isEvalResult, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  }
  await simulatedDelay();
  markSource('sample');
  return mockEvalResult;
}
