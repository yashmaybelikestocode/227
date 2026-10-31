import React, { useEffect, useState } from 'react';
import { getEvalResult, getAnalysis, sealFindings } from '../api';
import type { SealedFindings } from '../api';
import type { EvalResult, Analysis } from '../types';
import { PageHeader } from '../components/PageHeader';
import { ScoreCard } from '../components/ScoreCard';
import { SourceChip } from '../components/SourceChip';
import { Skeleton, EmptyState, ErrorState } from '../components/Common';

export const EvaluatePage: React.FC = () => {
  const [sealed, setSealed] = useState<SealedFindings | null>(null);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Whether user has pressed "Open the maintainers' list"
  const [revealed, setRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Seal Cypher's findings first; the maintainers' list is opened only on request
    Promise.all([sealFindings('demo'), getAnalysis('demo')])
      .then(([seal, an]) => {
        if (!mounted) return;
        setSealed(seal);
        setAnalysis(an);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load evaluation benchmark');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const openMaintainersList = () => {
    setRevealing(true);
    setRevealError(null);
    getEvalResult('demo')
      .then((res) => {
        setEvalResult(res);
        setRevealed(true);
      })
      .catch((err) => {
        setRevealError(err?.message || "Could not open the maintainers' list");
      })
      .finally(() => setRevealing(false));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blind test against maintainers' list" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blind test against maintainers' list" />
        <ErrorState
          title="Could not load blind test"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!sealed) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blind test against maintainers' list" />
        <EmptyState
          title="No benchmark found"
          message="No sealed maintainer benchmark list is set up for this repository yet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blind test against maintainers' list"
        projectChipLabel={analysis?.repo || 'acme/httpcache'}
      />

      <p className="text-sm text-muted">
        To prove Cypher finds real decisions without guessing, we compare what it found against a list written by the project maintainers before the run. The maintainers&apos; list was sealed until now.
      </p>

      {/* Step 1: Sealed list */}
      <div className="bg-white border border-line rounded-card p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-mint text-accent text-xs font-bold flex items-center justify-center border border-mint-deep">
            1
          </span>
          <h2 className="font-serif font-bold text-base text-ink">
            Cypher&apos;s sealed findings
          </h2>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Cypher&apos;s findings were saved and cryptographically locked before the maintainers&apos; list was opened.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-surface border border-line rounded-btn">
            <span className="text-muted block text-[10px] uppercase tracking-wider font-semibold">
              Timestamp locked
            </span>
            <span className="font-mono text-ink font-medium">{sealed.saved_at}</span>
          </div>
          <div className="p-3 bg-surface border border-line rounded-btn">
            <span className="text-muted block text-[10px] uppercase tracking-wider font-semibold">
              Cryptographic fingerprint
            </span>
            <span className="font-mono text-ink font-medium break-all" title={sealed.fingerprint}>
              {sealed.fingerprint}
            </span>
          </div>
        </div>
      </div>

      {/* Step 2: Compare & Reveal */}
      <div className="bg-white border border-line rounded-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-mint text-accent text-xs font-bold flex items-center justify-center border border-mint-deep">
            2
          </span>
          <h2 className="font-serif font-bold text-base text-ink">
            Compare results
          </h2>
        </div>

        {revealError ? (
          <ErrorState
            title="Could not open the maintainers' list"
            message={revealError}
            onRetry={openMaintainersList}
          />
        ) : revealing ? (
          <Skeleton className="h-40 w-full" />
        ) : !revealed || !evalResult ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-sm text-muted max-w-md mx-auto">
              Ready to verify Cypher against the maintainers&apos; sealed baseline? Click below to unseal and calculate score.
            </p>
            <button
              type="button"
              data-testid="btn-open-maintainers-list"
              onClick={openMaintainersList}
              className="px-6 py-3 bg-accent text-white font-semibold text-sm rounded-btn shadow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Open the maintainers&apos; list
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Score Card */}
            <ScoreCard
              accuracyPercent={evalResult.accuracy_percent}
              precisionPercent={evalResult.precision_percent}
              officialCount={evalResult.official}
              foundCount={evalResult.found}
            />

            {/* Matched pairs list */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm text-ink">
                Matched pairs
              </h3>

              <div className="space-y-2">
                {evalResult.pairs.map((pair, idx) => {
                  const isFound = pair.kind === 'found';
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-surface border border-line rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                      data-testid={`pair-${pair.kind}-${idx}`}
                    >
                      {/* Maintainers Idea */}
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                          Maintainers&apos; Idea
                        </span>
                        <p className="font-medium text-ink font-sans">
                          {pair.official_idea}
                        </p>
                      </div>

                      {/* Cypher Discovered */}
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                          What Cypher Found
                        </span>
                        {pair.found_idea ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-accent">
                              {pair.found_idea}
                            </span>
                            {pair.statement_ids.length > 0 && analysis && (
                              <SourceChip
                                statementId={pair.statement_ids[0]}
                                comments={analysis.comments}
                                statements={analysis.statements}
                                people={analysis.people}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted italic">Not detected in discussion threads</span>
                        )}
                      </div>

                      {/* Tag */}
                      <div className="shrink-0">
                        {isFound ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-mint-deep text-accent border border-accent/40">
                            ✓ Found
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-brick/15 text-brick border border-brick/40">
                            ✕ Missed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Extras */}
                {evalResult.extras.map((extra, idx) => (
                  <div
                    key={`extra-${idx}`}
                    className="p-4 bg-surface border border-line rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    data-testid={`pair-extra-${idx}`}
                  >
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                        Maintainers&apos; Idea
                      </span>
                      <span className="text-muted italic">Not listed on official baseline</span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                        What Cypher Found
                      </span>
                      <span className="font-medium text-amber">
                        {extra}
                      </span>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-amber/15 text-amber border border-amber/40">
                        + Extra
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
