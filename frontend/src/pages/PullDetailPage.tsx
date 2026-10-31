import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPull } from "../api";
import { PullOverview, DecisionStatus } from "../types";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import { DecisionRow } from "../components/DecisionRow";
import { Timeline } from "../components/Timeline";
import { PersonCard } from "../components/PersonCard";
import { SourceButton } from "../components/SourceButton";

const STATUS_ORDER: Record<DecisionStatus, number> = {
  accepted: 0,
  rejected: 1,
  deferred: 2,
  unresolved: 3,
};

export const PullDetailPage: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const pullNum = parseInt(number || "176", 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pull, setPull] = useState<PullOverview | null>(null);

  useEffect(() => {
    setLoading(true);
    getPull(pullNum)
      .then((data) => {
        setPull(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load pull request");
        setLoading(false);
      });
  }, [pullNum]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-40 w-full mb-6" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !pull) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <ErrorState message={error || "Pull request not found"} />
      </div>
    );
  }

  const sortedDecisions = [...pull.answer.decisions].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-3 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link to="/pulls" className="hover:text-navy hover:underline">
          Pull Requests
        </Link>
        <span>/</span>
        <span className="font-mono text-midnight">#{pull.number}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-navy text-white text-xs font-mono font-medium">
              PR #{pull.number}
            </span>
            <span className="text-xs text-muted">
              Merged on {pull.merged_at} by {pull.author}
            </span>
          </div>
          <a
            href={pull.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-midnight rounded-[8px] text-xs font-medium text-midnight hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>

        <h1 className="font-serif text-[30px] sm:text-[34px] font-semibold text-midnight tracking-tight max-w-[70ch]">
          {pull.title}
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* The short answer */}
          <div className="border border-line rounded-[12px] p-6 bg-white border-l-[5px] border-l-navy">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3 font-mono">
              The short answer
            </div>
            <div className="text-base text-midnight leading-relaxed space-y-2 mb-4">
              {pull.answer.short_answer.map((claim, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <span>{claim.text}</span>
                  <div className="inline-flex items-center gap-1">
                    {claim.evidence_ids.map((id) => (
                      <SourceButton key={id} evidenceId={id} posts={pull.answer.posts} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted pt-3 border-t border-line">
              {pull.answer.based_on}
            </div>
          </div>

          {/* What changed table (added and removed lines, blush header row) */}
          <div className="border border-line rounded-[12px] bg-white overflow-hidden">
            <div className="p-4 bg-blush border-b border-line">
              <h2 className="font-serif text-[18px] font-semibold text-midnight">
                What changed
              </h2>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <tbody className="divide-y divide-line">
                {pull.files.map((f) => (
                  <tr key={f.path} className="hover:bg-mist/40">
                    <td className="py-3 px-5 font-mono text-midnight">
                      <Link to={`/code/${f.path}`} className="text-navy hover:underline">
                        {f.path}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-right font-mono">
                      <span className="text-[#1A7F37] font-medium mr-2">+{f.additions}</span>
                      <span className="text-rose font-medium">-{f.deletions}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* What the team decided */}
          <div className="border border-line rounded-[12px] p-6 bg-white">
            <h2 className="font-serif text-[20px] font-semibold text-midnight mb-4">
              What the team decided
            </h2>
            <div className="divide-y divide-line">
              {sortedDecisions.map((decision) => (
                <DecisionRow
                  key={decision.id}
                  decision={decision}
                  posts={pull.answer.posts}
                />
              ))}
            </div>
          </div>

          {/* Changed later (Timeline) */}
          <Timeline
            entries={pull.answer.timeline}
            posts={pull.answer.posts}
            title="Changed later"
          />
        </div>

        {/* Right Column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h2 className="font-serif text-[18px] font-semibold text-midnight mb-3">
              Who was involved
            </h2>
            <div className="space-y-1">
              {pull.answer.people.map((person, idx) => (
                <PersonCard key={idx} person={person} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
