import React, { useState, useEffect } from 'react';
import { getEvalResult } from '../api';
import { EvalResult } from '../types';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const EvaluatePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    getEvalResult()
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ErrorState message="Could not load evaluation benchmark." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
          Blind test
        </h1>
        <p className="text-muted text-[15px] mt-1">
          Cypher reads a discussion without the official summary, writes down its findings, then compares them to the official list of rejected ideas.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Findings saved */}
        <div className="bg-surface rounded-card border border-line p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-mint text-accent font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="font-serif text-[18px] font-semibold text-ink">Findings saved</h2>
          </div>
          <div className="text-sm text-muted space-y-1 pl-7">
            <div>
              Generated on: <span className="font-mono text-ink">{result.saved_at}</span>
            </div>
            <div>
              SHA-256 fingerprint: <span className="font-mono text-accent bg-mint-soft px-1.5 py-0.5 rounded">{result.fingerprint}</span>
            </div>
            <div className="text-xs text-muted pt-1">
              Saved before the official list was opened.
            </div>
          </div>
        </div>

        {/* Step 2: Open the official list */}
        <div className="bg-surface rounded-card border border-line p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-mint text-accent font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="font-serif text-[18px] font-semibold text-ink">
              Official rejected ideas comparison
            </h2>
          </div>

          {!isOpened ? (
            <div className="pl-7 py-2">
              <button
                type="button"
                onClick={() => setIsOpened(true)}
                className="px-6 py-2.5 bg-accent text-white font-medium text-sm rounded-btn hover:opacity-90 transition-opacity"
              >
                Open the official list
              </button>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Summary numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-mint-soft/50 p-4 rounded-btn border border-mint-deep/50 text-sm">
                <div>
                  <div className="font-semibold text-ink">
                    Found {result.found} of {result.official} official ideas
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    Covers key options debated across the PR history
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink">
                    Of what Cypher listed, {result.listed_official} were official
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    High precision alignment with maintainer decisions
                  </div>
                </div>
              </div>

              {/* Two columns of matched pairs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: What Cypher found */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold text-muted tracking-wider pb-2 border-b border-line">
                    What Cypher found
                  </h3>
                  <div className="space-y-2.5">
                    {result.pairs
                      .filter((p) => p.found_idea !== null)
                      .map((p, i) => (
                        <div key={i} className="p-3 bg-white border border-line rounded-btn text-xs text-ink flex items-start justify-between gap-2">
                          <span>{p.found_idea}</span>
                          <span className="px-2 py-0.5 bg-accent text-white rounded-pill text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                            Found
                          </span>
                        </div>
                      ))}
                    {result.extras.map((extra, i) => (
                      <div key={i} className="p-3 bg-white border border-amber rounded-btn text-xs text-ink flex items-start justify-between gap-2">
                        <span>{extra}</span>
                        <span className="px-2 py-0.5 bg-amber text-[#5A4310] rounded-pill text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                          Extra
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Official rejected ideas */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold text-muted tracking-wider pb-2 border-b border-line">
                    Official rejected ideas
                  </h3>
                  <div className="space-y-2.5">
                    {result.pairs.map((p, i) => (
                      <div key={i} className="p-3 bg-white border border-line rounded-btn text-xs text-ink flex items-start justify-between gap-2">
                        <span>{p.official_idea}</span>
                        {p.kind === 'found' ? (
                          <span className="px-2 py-0.5 bg-accent text-white rounded-pill text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                            Matched
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-brick text-white rounded-pill text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                            Missed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="text-xs text-muted pt-2 border-t border-line">
                These numbers come from a small test and can change with other discussions.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
