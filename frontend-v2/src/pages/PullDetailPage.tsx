import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPull } from '../api';
import { PullOverview } from '../types';
import { SourceButton } from '../components/SourceButton';
import { DecisionRow } from '../components/DecisionRow';
import { Timeline } from '../components/Timeline';
import { PersonCard } from '../components/PersonCard';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const PullDetailPage: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pull, setPull] = useState<PullOverview | null>(null);

  const fetchPull = () => {
    if (!number) return;
    setLoading(true);
    setError(false);
    getPull(parseInt(number, 10))
      .then((data) => {
        setPull(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPull();
  }, [number]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !pull) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ErrorState message="Could not load pull request overview." onRetry={fetchPull} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/pulls"
          className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1"
        >
          ← Back to Pull requests
        </Link>
      </div>

      {/* PR Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-line">
        <div>
          <div className="text-xs font-mono font-bold text-muted mb-1">
            Pull request #{pull.number}
          </div>
          <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
            {pull.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-2">
            <span>Author: <strong className="text-ink">{pull.author}</strong></span>
            <span>·</span>
            <span>Merged on: {pull.merged_at}</span>
          </div>
        </div>

        <a
          href={pull.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border-[1.5px] border-ink text-ink font-medium text-xs rounded-btn hover:bg-mint-soft transition-colors inline-flex items-center gap-1.5 self-start"
        >
          <span>Open on GitHub</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 1. The short answer */}
          <div className="bg-surface rounded-card border border-line border-l-[5px] border-l-accent p-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
              The short answer
            </div>
            <div className="text-[16px] text-ink leading-relaxed space-y-2.5 mb-3">
              {pull.answer.short_answer.map((claim, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline gap-2">
                  <span>{claim.text}</span>
                  {claim.evidence_ids.map((eid) => (
                    <SourceButton key={eid} evidenceId={eid} posts={pull.answer.posts} />
                  ))}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted pt-2 border-t border-line">
              {pull.answer.based_on}
            </div>
          </div>

          {/* 2. What changed table */}
          <div className="bg-surface rounded-card border border-line overflow-hidden">
            <div className="p-4 border-b border-line">
              <h2 className="font-serif text-[18px] font-semibold text-ink">
                What changed
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-mint text-ink font-semibold border-b border-line uppercase tracking-wider">
                    <th scope="col" className="py-2.5 px-4 font-mono">File</th>
                    <th scope="col" className="py-2.5 px-4 font-mono text-right text-accent">Added</th>
                    <th scope="col" className="py-2.5 px-4 font-mono text-right text-brick">Removed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {pull.files.map((file) => (
                    <tr key={file.path} className="hover:bg-mint-soft/30 font-mono">
                      <td className="py-2.5 px-4 text-ink font-medium">
                        <Link to={`/code/${file.path}`} className="hover:underline hover:text-accent">
                          {file.path}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-right text-accent font-semibold">
                        +{file.additions}
                      </td>
                      <td className="py-2.5 px-4 text-right text-brick font-semibold">
                        -{file.deletions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. What the team decided */}
          <div className="bg-surface rounded-card border border-line p-6">
            <h2 className="font-serif text-[22px] font-semibold text-ink mb-4">
              What the team decided
            </h2>
            <div className="divide-y divide-line">
              {pull.answer.decisions.map((decision) => (
                <DecisionRow key={decision.id} decision={decision} posts={pull.answer.posts} />
              ))}
            </div>
          </div>

          {/* 4. Changed later */}
          <div className="bg-surface rounded-card border border-line p-6">
            <h2 className="font-serif text-[22px] font-semibold text-ink mb-4">
              Changed later
            </h2>
            <Timeline entries={pull.answer.timeline} posts={pull.answer.posts} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
              Who was involved
            </h3>
            <div className="divide-y divide-line">
              {pull.answer.people.map((person) => (
                <PersonCard key={person.author} person={person} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
