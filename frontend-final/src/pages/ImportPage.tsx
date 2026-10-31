import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getImportSummary, getAnalysis, getImportParams, isMockMode, startImport } from '../api';
import type { ImportProgress } from '../api';
import type { Analysis } from '../types';
import { EmptyState, ErrorState } from '../components/Common';

const POLL_MS = 1000;
const WAIT_LIMIT_MS = 10 * 60 * 1000;

export const ImportPage: React.FC = () => {
  const { id = 'httpcache-analysis' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportProgress | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Live mode: the backend reported that the import itself failed (vs. a failed request)
  const [importFailed, setImportFailed] = useState(false);
  const [stillRunning, setStillRunning] = useState(false);
  const [pollRound, setPollRound] = useState(0);
  const live = !isMockMode();

  const isTestEnv =
    typeof globalThis !== 'undefined' &&
    Boolean(
      (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
        ?.NODE_ENV === 'test'
    );

  // Live mode: poll the backend every second until the import is done or fails
  useEffect(() => {
    if (!live) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const sum = await getImportSummary(id);
        if (stopped) return;
        setSummary(sum);
        if (sum.error) {
          setImportFailed(true);
          setError(sum.error);
          setLoading(false);
          return;
        }
        setLoading(false);
        if (sum.done) {
          const ana = await getAnalysis(id);
          if (!stopped) setAnalysis(ana);
          return;
        }
        if (Date.now() - startedAt >= WAIT_LIMIT_MS) {
          setStillRunning(true);
          return;
        }
        timer = setTimeout(poll, POLL_MS);
      } catch (err) {
        if (stopped) return;
        setImportFailed(false);
        setError(err instanceof Error ? err.message : 'Cypher could not load this import. Try again.');
        setLoading(false);
      }
    };

    poll();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, live, pollRound]);

  useEffect(() => {
    if (live) return;
    let timer: ReturnType<typeof setTimeout>;

    const loadData = async () => {
      try {
        const [sum, ana] = await Promise.all([
          getImportSummary(id),
          getAnalysis(id),
        ]);
        setSummary(sum);
        setAnalysis(ana);
        setLoading(false);

        if (isTestEnv) {
          // Immediately finish all steps in tests
          setCurrentStepIndex(sum.steps.length);
        } else {
          // Progressively complete steps
          let step = 0;
          timer = setInterval(() => {
            step++;
            setCurrentStepIndex(step);
            if (step >= sum.steps.length) {
              clearInterval(timer);
            }
          }, 600);
        }
      } catch {
        setError('We could not reach GitHub. Check the link or try again later.');
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id, isTestEnv, live]);

  const retryLive = async () => {
    setError(null);
    setLoading(true);
    if (!importFailed) {
      // The request failed, not the import: ask again
      setPollRound((r) => r + 1);
      return;
    }
    // The import failed: start it again with the same choices, if this tab knows them
    const params = getImportParams(id);
    if (!params) {
      navigate('/');
      return;
    }
    try {
      const newId = await startImport(params);
      setImportFailed(false);
      navigate(`/import/${newId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cypher could not start the import. Try again.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={
          live
            ? retryLive
            : () => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }
        }
      />
    );
  }

  if (loading || !summary || (!live && !analysis)) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 w-48 bg-mint-soft animate-pulse rounded" />
        <div className="h-64 bg-surface border border-line rounded-card animate-pulse" />
      </div>
    );
  }

  const stepsDone = live
    ? summary.steps.filter((s) => s.state === 'done' || s.state === 'skipped').length
    : currentStepIndex;
  const isFinished = live ? summary.done && analysis !== null : currentStepIndex >= summary.steps.length;
  const progressPct = isFinished
    ? 100
    : Math.min(100, Math.round((stepsDone / summary.steps.length) * 100));
  const repoName = analysis?.repo ?? getImportParams(id)?.repo ?? id;

  // Exact summary line computed from data
  const summaryLine = `Read ${summary.prs} pull requests, ${summary.issues} issues, ${summary.comments} comments and ${summary.commits} commits. Found ${summary.statements_used} statements with an exact quote. ${summary.statements_left_out} were left out because no exact quote could be found.`;

  return (
    <div className="space-y-8 max-w-3xl" data-testid="import-page">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">
          Reading {repoName}
        </h1>
        <p className="text-sm text-muted">
          Extracting technical decisions, discussions, and contributor identities.
        </p>
      </div>

      {stillRunning && (
        <EmptyState
          message="The analysis is still running. Gemma runs on this computer and can take a few minutes."
          actionText="Keep waiting"
          onAction={() => {
            setStillRunning(false);
            setPollRound((r) => r + 1);
          }}
        />
      )}

      {/* Progress Card */}
      <div className="bg-surface border border-line rounded-card p-6 space-y-6 shadow-sm">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted">
            <span>Analyzing repository history</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full bg-neutral rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="divide-y divide-line/60">
          {summary.steps.map((step, index) => {
            const isDone = live ? step.state === 'done' : index < currentStepIndex;
            const isWorking = live ? step.state === 'working' : index === currentStepIndex && !isFinished;

            return (
              <div
                key={step.key}
                className="py-3 flex items-center justify-between text-sm transition-colors"
                data-testid={`import-step-${step.key}`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  {isDone ? (
                    <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : isWorking ? (
                    <span className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-line bg-neutral shrink-0" />
                  )}

                  <span
                    className={`font-medium ${
                      isDone
                        ? 'text-ink'
                        : isWorking
                        ? 'text-accent font-semibold'
                        : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Count badge */}
                <span className="font-mono text-xs text-muted">
                  {(isDone || (live && isWorking)) && step.count !== null ? step.count : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Finished State: Summary Line & Actions */}
        {isFinished && (
          <div className="pt-4 border-t border-line space-y-4" data-testid="import-finished-section">
            <div
              className="p-4 bg-mint-soft border border-mint-deep/60 rounded-btn text-sm font-medium text-ink leading-relaxed"
              data-testid="import-summary-line"
            >
              {summaryLine}
            </div>

            <div className="flex items-center gap-4 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => navigate(`/decisions/${id}`)}
                className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-btn text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                data-testid="see-decisions-btn"
              >
                See the decisions
              </button>

              <Link
                to={`/statements/${id}`}
                className="text-sm font-semibold text-accent hover:underline"
              >
                See all statements
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Muted note */}
      <div className="text-xs text-muted">
        Read-only. Nothing was posted to GitHub.
      </div>
    </div>
  );
};
