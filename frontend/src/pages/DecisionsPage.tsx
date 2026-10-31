import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAnalysis } from '../api';
import type { Analysis, Decision } from '../types';
import { Skeleton, ErrorState } from '../components/Common';
import { DecisionRow } from '../components/DecisionRow';
import { Timeline } from '../components/Timeline';
import { SourceChip } from '../components/SourceChip';
import { getInitials } from '../components/PersonComponents';
import { downloadDecisionRecord } from '../utils/madr';

export const DecisionsPage: React.FC = () => {
  const { id = 'httpcache-analysis' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAnalysis(id)
      .then((data) => setAnalysis(data))
      .catch(() => setError('Could not load decisions analysis.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Order: Decided, Decided against, Postponed, Still open
  const sortedDecisions = useMemo(() => {
    if (!analysis) return [];
    const orderMap: Record<string, number> = {
      accepted: 1,
      rejected: 2,
      deferred: 3,
      unresolved: 4,
    };
    return [...analysis.decisions].sort((a: Decision, b: Decision) => {
      return (orderMap[a.status] || 5) - (orderMap[b.status] || 5);
    });
  }, [analysis]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton count={1} className="h-8 w-1/3" />
        <Skeleton count={3} className="h-24" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <ErrorState
        message={error || 'Analysis not found.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const { summary } = analysis;
  const summaryLine = `Read ${summary.prs} pull requests, ${summary.issues} issues, ${summary.comments} comments and ${summary.commits} commits. Found ${summary.statements_used} statements with an exact quote. ${summary.statements_left_out} were left out because no exact quote could be found.`;

  const confidenceLabel =
    analysis.confidence === 'high'
      ? 'Well supported'
      : analysis.confidence === 'medium'
      ? 'Partly supported'
      : 'Weakly supported';

  return (
    <div className="space-y-8" data-testid="decisions-page">
      {/* Recap Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-line no-print">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-muted uppercase tracking-wider">Project:</span>
          <span className="px-2.5 py-1 bg-mint text-ink font-mono font-medium rounded-full">
            {analysis.repo}
          </span>
          <span className="px-2.5 py-1 bg-neutral text-muted font-medium rounded-full">
            {analysis.range_label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          Change search
        </button>
      </div>

      {/* Mint Banner with identical summary line */}
      <div
        className="p-4 bg-mint border border-mint-deep rounded-card text-sm text-ink flex flex-col md:flex-row md:items-center justify-between gap-3 leading-relaxed"
        data-testid="matching-summary-banner"
      >
        <span data-testid="decisions-banner-summary">{summaryLine}</span>
        <Link
          to={`/statements/${id}?tab=left-out`}
          className="text-xs font-semibold text-accent underline hover:text-ink shrink-0"
        >
          See which statements were left out →
        </Link>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink leading-tight">
          {analysis.question || 'What this project decided'}
        </h1>
      </div>

      {/* Main Grid: Left (8 cols) & Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* The short answer card */}
          <section
            className="p-6 bg-surface border border-line border-l-[5px] border-l-accent rounded-card space-y-3"
            aria-labelledby="short-answer-heading"
          >
            <span
              id="short-answer-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted block"
            >
              The short answer
            </span>

            <div className="space-y-2">
              {analysis.short_answer.map((claim, idx) => (
                <div key={idx} className="flex items-baseline gap-2 flex-wrap text-base text-ink leading-relaxed">
                  <span>{claim.text}</span>
                  {claim.statement_ids.map((sid) => (
                    <SourceChip
                      key={sid}
                      statementId={sid}
                      comments={analysis.comments}
                      statements={analysis.statements}
                      people={analysis.people}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs text-muted border-t border-line/60">
              {analysis.based_on}
            </div>
          </section>

          {/* What the team decided */}
          <section
            className="p-6 bg-surface border border-line rounded-card space-y-4"
            aria-labelledby="decisions-heading"
          >
            <h2 id="decisions-heading" className="font-serif text-xl font-semibold text-ink">
              What the team decided
            </h2>

            <div>
              {sortedDecisions.map((dec) => (
                <DecisionRow
                  key={dec.id}
                  decision={dec}
                  comments={analysis.comments}
                  statements={analysis.statements}
                  people={analysis.people}
                />
              ))}
            </div>
          </section>

          {/* How it changed over time (Timeline) */}
          <section
            className="p-6 bg-surface border border-line rounded-card space-y-4"
            aria-labelledby="timeline-heading"
          >
            <h2 id="timeline-heading" className="font-serif text-xl font-semibold text-ink">
              How it changed over time
            </h2>

            <Timeline
              entries={analysis.timeline}
              comments={analysis.comments}
              statements={analysis.statements}
              people={analysis.people}
            />
          </section>
        </div>

        {/* Right Column Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Who was involved */}
          <div className="p-5 bg-surface border border-line rounded-card space-y-3">
            <h2 className="font-serif text-base font-semibold text-ink">
              Who was involved
            </h2>
            <div className="space-y-2">
              {analysis.people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-3 p-2 rounded-btn bg-white border border-line/70 hover:border-mint-deep transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-mint-deep text-ink text-xs font-semibold flex items-center justify-center shrink-0">
                    {getInitials(person.display_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/people/${person.id}`}
                      className="text-sm font-semibold text-accent hover:underline block truncate"
                    >
                      {person.display_name}
                    </Link>
                    <p className="text-xs text-muted truncate">
                      {person.commits} commits · {person.comments} comments
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How sure are we? */}
          <div className="p-5 bg-surface border border-line rounded-card space-y-3">
            <h2 className="font-serif text-base font-semibold text-ink">
              How sure are we?
            </h2>
            <p className="text-sm">
              Confidence level:{' '}
              <strong className="text-accent font-bold">{confidenceLabel}</strong>
            </p>

            <Link
              to={`/statements/${id}?tab=left-out`}
              className="block p-3 text-left bg-mint-soft border border-dashed border-mint-deep rounded-btn text-xs text-ink hover:bg-mint/60 transition-colors"
            >
              <span className="font-medium">
                {summary.statements_left_out} statements were left out because we could not find an exact quote.{' '}
                <span className="text-accent underline font-semibold">See which</span>
              </span>
            </Link>
          </div>

          {/* What next? */}
          <div className="p-5 bg-surface border border-line rounded-card space-y-3 no-print">
            <h2 className="font-serif text-base font-semibold text-ink">
              What next?
            </h2>
            <div className="space-y-2">
              <Link
                to={`/statements/${id}`}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-ink bg-transparent border-[1.5px] border-ink rounded-btn hover:bg-mint-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                See all statements
              </Link>
              <Link
                to="/code"
                className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-ink bg-transparent border-[1.5px] border-ink rounded-btn hover:bg-mint-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                See the code this affects
              </Link>
              <button
                type="button"
                onClick={() => downloadDecisionRecord(analysis)}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-ink bg-transparent border-[1.5px] border-ink rounded-btn hover:bg-mint-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                data-testid="download-decision-record-btn"
              >
                Download as a decision record
              </button>
              <Link
                to="/evaluate"
                className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-ink bg-transparent border-[1.5px] border-ink rounded-btn hover:bg-mint-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Take the blind test
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
