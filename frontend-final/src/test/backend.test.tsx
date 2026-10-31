import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import {
  ApiError,
  getAnalysis,
  getEvalResult,
  getFileView,
  getImportSummary,
  getPerson,
  listFiles,
  listRecentRepos,
  resetApiState,
  sealFindings,
  splitPerson,
  startImport,
  undoSplit,
} from '../api';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { CommentPanelProvider } from '../context/CommentPanelContext';
import { DecisionsPage } from '../pages/DecisionsPage';
import { EvaluatePage } from '../pages/EvaluatePage';
import { ImportPage } from '../pages/ImportPage';
import { StartPage } from '../pages/StartPage';
import { httpcacheAnalysis, mockFileList, mockEvalResult } from '../mock/data';

type Reply = { status: number; body: unknown };

/** Replaces fetch with a router: each handler gets the path and method and returns a reply. */
function mockBackend(handler: (path: string, method: string) => Reply) {
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const { status, body } = handler(String(url), (init?.method || 'GET').toUpperCase());
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

const calls = (fn: ReturnType<typeof mockBackend>, match: string) =>
  fn.mock.calls.filter(([url]) => String(url).includes(match)).length;

const liveAnalysis = { ...httpcacheAnalysis, id: 'acme-httpcache-abc123' };

function renderAt(path: string, routePath: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CommentPanelProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path={routePath.replace(/^\//, '')} element={element} />
            <Route path="decisions/:id" element={<div>decisions page</div>} />
          </Route>
        </Routes>
      </CommentPanelProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  resetApiState();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Mock mode (default)', () => {
  it('makes no network calls and shows "Sample data"', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await listRecentRepos();
    const id = await startImport({ repo: 'acme/httpcache' });
    await getImportSummary(id);
    await getAnalysis(id);
    await listFiles(id);
    await getFileView(id, 'src/retry.py');
    await getPerson(id, 'person-priya');
    await splitPerson(id, 'person-priya');
    await undoSplit(id, 'person-priya');
    await sealFindings(id);
    await getEvalResult(id);

    renderAt('/import/httpcache-analysis', 'import/:id', <ImportPage />);
    expect(await screen.findByTestId('see-decisions-btn')).toBeInTheDocument();
    expect(screen.getByTestId('data-source-chip')).toHaveTextContent('Sample data');

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('Real mode (VITE_USE_MOCK=false)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_USE_MOCK', 'false');
  });

  it('a 501 falls back to sample data for that one function only', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    mockBackend((path) => {
      if (path.includes('/files')) return { status: 501, body: { error: 'Not built yet' } };
      if (path === `/api/analyses/${liveAnalysis.id}`) return { status: 200, body: liveAnalysis };
      return { status: 404, body: { error: 'The analysis is not ready yet or does not exist.' } };
    });

    expect(await listFiles(liveAnalysis.id)).toEqual(mockFileList);
    await listFiles(liveAnalysis.id);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('using sample data for listFiles');

    // Other functions still use the backend, and a 404 there is an error, not sample data
    expect((await getAnalysis(liveAnalysis.id)).id).toBe(liveAnalysis.id);
    await expect(getAnalysis('missing-id')).rejects.toBeInstanceOf(ApiError);
    await expect(getAnalysis('missing-id')).rejects.toThrow('The analysis is not ready yet or does not exist.');
  });

  it('sends the sample project as a fixture and uses the returned id', async () => {
    const fetchSpy = mockBackend(() => ({ status: 200, body: { analysis_id: 'acme-httpcache-abc123' } }));
    expect(await startImport({ repo: 'acme/httpcache', question: 'Why?', range: 'Last 6 months' })).toBe(
      'acme-httpcache-abc123'
    );
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/imports');
    expect(JSON.parse(String(init?.body))).toEqual({ fixture: 'acme-httpcache', question: 'Why?', range: 'Last 6 months' });
  });

  it('a 500 shows the error state, never sample data', async () => {
    mockBackend(() => ({ status: 500, body: { error: 'Something went wrong: boom' } }));
    render(
      <MemoryRouter initialEntries={['/decisions/acme-httpcache-abc123']}>
        <Routes>
          <Route path="/decisions/:id" element={<DecisionsPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.queryByTestId('matching-summary-banner')).not.toBeInTheDocument();
  });

  it('a network failure on the Import page shows the error state', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    renderAt('/import/acme-httpcache-abc123', 'import/:id', <ImportPage />);
    expect(await screen.findByTestId('error-state')).toHaveTextContent('Cypher could not reach its backend');
  });

  it('the Import page polls until done, then stops and enables "See the decisions"', async () => {
    let summaryCalls = 0;
    const running = {
      ...httpcacheAnalysis.summary,
      steps: httpcacheAnalysis.summary.steps.map((s, i) => ({ ...s, count: i === 0 ? 6 : null, state: i === 0 ? 'done' : i === 1 ? 'working' : 'waiting' })),
      done: false,
      error: null,
    };
    const finished = {
      ...httpcacheAnalysis.summary,
      steps: httpcacheAnalysis.summary.steps.map((s) => ({ ...s, state: 'done' })),
      done: true,
      error: null,
    };
    const fetchSpy = mockBackend((path) => {
      if (path.endsWith('/summary')) {
        summaryCalls += 1;
        return { status: 200, body: summaryCalls === 1 ? running : finished };
      }
      return { status: 200, body: liveAnalysis };
    });

    renderAt('/import/acme-httpcache-abc123', 'import/:id', <ImportPage />);

    // First answer: still running, live counts shown, button not there yet
    expect(await screen.findByTestId('import-page')).toBeInTheDocument();
    expect(screen.getByTestId(`import-step-${running.steps[0].key}`)).toHaveTextContent('6');
    expect(screen.queryByTestId('see-decisions-btn')).not.toBeInTheDocument();

    expect(await screen.findByTestId('see-decisions-btn', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByTestId('data-source-chip')).toHaveTextContent('Live data');

    await new Promise((r) => setTimeout(r, 1300));
    expect(calls(fetchSpy, '/summary')).toBe(2);
    expect(calls(fetchSpy, `/api/analyses/${liveAnalysis.id}`)).toBe(1);

    fireEvent.click(screen.getByTestId('see-decisions-btn'));
    expect(await screen.findByText('decisions page')).toBeInTheDocument();
  });

  it('the Import page stops polling and shows the error text when the import failed', async () => {
    const fetchSpy = mockBackend(() => ({
      status: 200,
      body: { ...httpcacheAnalysis.summary, done: false, error: 'Ollama is not running. Start it with `ollama serve`.' },
    }));

    renderAt('/import/acme-httpcache-abc123', 'import/:id', <ImportPage />);
    const errorState = await screen.findByTestId('error-state');
    expect(errorState).toHaveTextContent('Ollama is not running. Start it with `ollama serve`.');
    expect(screen.getByText('Try again')).toBeInTheDocument();

    await new Promise((r) => setTimeout(r, 1300));
    expect(calls(fetchSpy, '/summary')).toBe(1);
  });

  it('the Blind test seals once on open and reveals only when asked', async () => {
    const fetchSpy = mockBackend((path) => {
      if (path.endsWith('/blind/seal')) return { status: 200, body: { saved_at: '2026-11-01T10:00:00Z', fingerprint: 'sha256:abc' } };
      if (path.endsWith('/blind/reveal')) return { status: 200, body: mockEvalResult };
      return { status: 200, body: liveAnalysis };
    });
    await getAnalysis(liveAnalysis.id); // the page asks for 'demo'; live mode uses the latest analysis

    renderAt('/evaluate', 'evaluate', <EvaluatePage />);
    expect(await screen.findByText('sha256:abc')).toBeInTheDocument();
    expect(screen.getByText('2026-11-01T10:00:00Z')).toBeInTheDocument();
    expect(calls(fetchSpy, '/blind/seal')).toBe(1);
    expect(calls(fetchSpy, '/blind/reveal')).toBe(0);
    expect(fetchSpy.mock.calls.find(([u]) => String(u).endsWith('/blind/seal'))?.[0]).toBe(
      `/api/analyses/${liveAnalysis.id}/blind/seal`
    );

    fireEvent.click(screen.getByTestId('btn-open-maintainers-list'));
    expect(await screen.findByTestId('score-card')).toBeInTheDocument();
    expect(calls(fetchSpy, '/blind/reveal')).toBe(1);
  });

  it('the chip switches between "Live data" and "Sample data"', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    mockBackend((path) => {
      if (path.includes('/files')) return { status: 501, body: { error: 'Not built yet' } };
      return { status: 200, body: liveAnalysis };
    });

    render(
      <MemoryRouter>
        <PageHeader currentProject="acme/httpcache" />
      </MemoryRouter>
    );
    // Nothing has been loaded yet in live mode
    expect(screen.queryByTestId('data-source-chip')).not.toBeInTheDocument();

    await act(() => getAnalysis(liveAnalysis.id));
    expect(screen.getByTestId('data-source-chip')).toHaveTextContent('Live data');
    expect(screen.getByRole('status')).toHaveAccessibleName(/live data/i);

    await act(() => listFiles(liveAnalysis.id));
    expect(screen.getByTestId('data-source-chip')).toHaveTextContent('Sample data');

    await act(() => getAnalysis(liveAnalysis.id));
    await waitFor(() => expect(screen.getByTestId('data-source-chip')).toHaveTextContent('Live data'));
  });

  it('the Start page sample button starts a real import', async () => {
    const fetchSpy = mockBackend(() => ({ status: 200, body: { analysis_id: 'acme-httpcache-xyz' } }));
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/import/:id" element={<div>import page</div>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Try a sample project'));
    expect(await screen.findByText('import page')).toBeInTheDocument();
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body)).fixture).toBe('acme-httpcache');
  });
});
