import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPerson, getAnalysis, splitPerson, undoSplit } from '../api';
import type { Person, Analysis } from '../types';
import { PageHeader } from '../components/PageHeader';
import { StatusPill } from '../components/StatusPill';
import { SourceChip } from '../components/SourceChip';
import { getInitials } from '../components/PersonComponents';
import { Skeleton, ErrorState } from '../components/Common';

export const PersonDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();

  const [person, setPerson] = useState<Person | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Split state
  const [isSplit, setIsSplit] = useState(false);
  const [splitCount, setSplitCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([getPerson('demo', id), getAnalysis('demo')])
      .then(([p, a]) => {
        if (!mounted) return;
        setPerson(p);
        setAnalysis(a);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load contributor details');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSplit = async () => {
    if (!person) return;
    try {
      const count = person.identities.length;
      await splitPerson('demo', person.id);
      setIsSplit(true);
      setSplitCount(count);
    } catch {
      // ignore
    }
  };

  const handleUndoSplit = async () => {
    if (!person) return;
    try {
      await undoSplit('demo', person.id);
      setIsSplit(false);
      // Reload person
      const refreshed = await getPerson('demo', person.id);
      setPerson(refreshed);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contributor" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !person || !analysis) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contributor" />
        <ErrorState
          title="Could not find person"
          message={error || 'Contributor details could not be found.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Find comments & statements by this person
  const personComments = analysis.comments.filter((c) => c.person_id === person.id);
  const personCommentIds = new Set(personComments.map((c) => c.id));
  const personStatements = analysis.statements.filter((s) => personCommentIds.has(s.comment_id));

  // Decisions they proposed or supported
  const proposedDecisions = analysis.decisions.filter((d) =>
    d.status === 'accepted' || d.status === 'unresolved' || d.reason.statement_ids.some((sid) =>
      personStatements.some((s) => s.id === sid)
    )
  );

  // Decisions they argued against
  const arguedAgainstDecisions = analysis.decisions.filter(
    (d) => d.status === 'rejected'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={person.display_name}
        projectChipLabel={analysis.repo}
      />

      {/* Back Link */}
      <div>
        <Link to="/people" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
          ← Back to all people
        </Link>
      </div>

      {/* Header with avatar and name */}
      <div className="flex items-center gap-4 p-4 bg-white border border-line rounded-card shadow-sm">
        <div className="w-14 h-14 rounded-full bg-mint text-accent text-lg font-bold flex items-center justify-center shrink-0 border border-mint-deep">
          {getInitials(person.display_name)}
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-ink">
            {person.display_name}
          </h2>
          <p className="text-xs text-muted mt-1">
            Merged contributor with {person.commits} commits and {person.comments} comments
          </p>
        </div>
      </div>

      {/* Inline Split Alert */}
      {isSplit && (
        <div
          data-testid="split-banner"
          className="p-4 bg-amber/15 border border-amber/40 rounded-card flex items-center justify-between text-xs text-ink"
        >
          <span>
            Split into {splitCount} people.
          </span>
          <button
            type="button"
            onClick={handleUndoSplit}
            className="font-bold text-accent underline hover:text-ink ml-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            Undo
          </button>
        </div>
      )}

      {/* Card: Names we merged */}
      <div className="bg-white border border-line rounded-card p-5 space-y-4 shadow-sm" data-testid="names-we-merged-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-ink">
              Names we merged
            </h3>
            <p className="text-xs text-muted mt-0.5">
              These {person.identities.length} accounts and handles point to {person.display_name}.
            </p>
          </div>

          {!isSplit && (
            <button
              type="button"
              data-testid="btn-not-same-person"
              onClick={handleSplit}
              className="px-3 py-1.5 text-xs font-semibold text-ink bg-transparent border border-line rounded-btn hover:bg-mint-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent self-start sm:self-auto"
            >
              Not the same person?
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {person.identities.map((ident, idx) => (
            <div
              key={idx}
              className="p-3 bg-surface border border-line rounded-btn flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              data-testid={`identity-kind-${ident.kind}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-white border border-line text-ink">
                  {ident.kind.replace('_', ' ')}
                </span>
                <span className="font-mono font-medium text-ink">{ident.value}</span>
              </div>
              <span className="text-muted italic">{ident.merged_because}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card: Decisions they proposed */}
      <div className="bg-white border border-line rounded-card p-5 space-y-4 shadow-sm">
        <h3 className="font-serif font-bold text-base text-ink border-b border-line pb-3">
          Decisions they proposed
        </h3>

        {proposedDecisions.length === 0 ? (
          <p className="text-xs text-muted">No proposed decisions recorded.</p>
        ) : (
          <div className="space-y-3">
            {proposedDecisions.map((dec) => (
              <div
                key={dec.id}
                className="p-3 bg-surface border border-line rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusPill status={dec.status} size="sm" />
                  <span className="font-semibold text-ink">{dec.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted">{dec.reason.text}</span>
                  {dec.reason.statement_ids.length > 0 && (
                    <SourceChip
                      statementId={dec.reason.statement_ids[0]}
                      comments={analysis.comments}
                      statements={analysis.statements}
                      people={analysis.people}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card: What they argued against */}
      <div className="bg-white border border-line rounded-card p-5 space-y-4 shadow-sm">
        <h3 className="font-serif font-bold text-base text-ink border-b border-line pb-3">
          What they argued against
        </h3>

        {arguedAgainstDecisions.length === 0 ? (
          <p className="text-xs text-muted">No rejected decisions recorded.</p>
        ) : (
          <div className="space-y-3">
            {arguedAgainstDecisions.map((dec) => (
              <div
                key={dec.id}
                className="p-3 bg-surface border border-line rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusPill status={dec.status} size="sm" />
                  <span className="font-semibold text-ink line-through decoration-brick">{dec.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted">{dec.reason.text}</span>
                  {dec.reason.statement_ids.length > 0 && (
                    <SourceChip
                      statementId={dec.reason.statement_ids[0]}
                      comments={analysis.comments}
                      statements={analysis.statements}
                      people={analysis.people}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card: Their statements */}
      <div className="bg-white border border-line rounded-card p-5 space-y-4 shadow-sm">
        <h3 className="font-serif font-bold text-base text-ink border-b border-line pb-3">
          Their statements
        </h3>

        {personStatements.length === 0 ? (
          <p className="text-xs text-muted">No individual statements recorded.</p>
        ) : (
          <div className="space-y-2">
            {personStatements.map((stmt) => {
              const comment = analysis.comments.find((c) => c.id === stmt.comment_id);
              return (
                <div
                  key={stmt.id}
                  className="p-3 bg-surface border border-line rounded-btn flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-muted shrink-0">
                      {comment?.github_id || stmt.comment_id}
                    </span>
                    <span className="text-ink italic">&ldquo;{stmt.quote}&rdquo;</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted">{comment?.date}</span>
                    <SourceChip
                      statementId={stmt.id}
                      comments={analysis.comments}
                      statements={analysis.statements}
                      people={analysis.people}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
