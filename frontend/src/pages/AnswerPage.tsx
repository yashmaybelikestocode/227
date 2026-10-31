import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAnswer } from "../api";
import { Answer, DecisionStatus } from "../types";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import { DecisionRow } from "../components/DecisionRow";
import { Timeline } from "../components/Timeline";
import { PersonCard } from "../components/PersonCard";
import { SourceButton } from "../components/SourceButton";
import { downloadDecisionRecord } from "../utils/downloadDecisionRecord";

const STATUS_ORDER: Record<DecisionStatus, number> = {
  accepted: 0,
  rejected: 1,
  deferred: 2,
  unresolved: 3,
};

export const AnswerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [showDropped, setShowDropped] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(null);
    getAnswer(id || "ans_httpcache_retry")
      .then((data) => {
        setAnswer(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load answer");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const sortedDecisions = useMemo(() => {
    if (!answer) return [];
    return [...answer.decisions].sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    );
  }, [answer]);

  const confidenceLabel = useMemo(() => {
    if (!answer) return "";
    switch (answer.confidence) {
      case "high":
        return "Well supported";
      case "medium":
        return "Partly supported";
      case "low":
        return "Weakly supported";
    }
  }, [answer]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="h-6 w-48 bg-blush-soft mb-6 rounded" />
        <div className="h-10 w-3/4 bg-blush-soft mb-8 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-44 w-full" count={3} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-36 w-full" count={2} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !answer) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <ErrorState
          title="Could not find answer"
          message={error || "We could not find the answer you requested."}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Recap chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-mist border border-line text-midnight font-mono">
          {answer.repo}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-mist border border-line text-muted">
          {answer.range_label}
        </span>
        <Link
          to="/"
          className="text-xs font-medium text-navy hover:underline ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy rounded-[4px]"
        >
          Change search
        </Link>
      </div>

      {/* Page Title: User's question */}
      <div className="mb-8">
        <h1 className="font-serif text-[32px] sm:text-[36px] font-semibold text-midnight tracking-tight leading-tight max-w-[70ch]">
          {answer.question}
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Short answer, Decisions, Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* The short answer card */}
          <div className="border border-line rounded-[12px] p-6 bg-white border-l-[5px] border-l-navy">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3 font-mono">
              The short answer
            </div>
            <div className="text-base text-midnight leading-relaxed space-y-2 mb-4">
              {answer.short_answer.map((claim, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <span>{claim.text}</span>
                  <div className="inline-flex items-center gap-1">
                    {claim.evidence_ids.map((id) => (
                      <SourceButton key={id} evidenceId={id} posts={answer.posts} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted pt-3 border-t border-line">
              {answer.based_on}
            </div>
          </div>

          {/* What the team decided card */}
          <div className="border border-line rounded-[12px] p-6 bg-white">
            <h2 className="font-serif text-[20px] font-semibold text-midnight mb-4">
              What the team decided
            </h2>
            <div className="divide-y divide-line">
              {sortedDecisions.map((decision) => (
                <DecisionRow
                  key={decision.id}
                  decision={decision}
                  posts={answer.posts}
                />
              ))}
            </div>
          </div>

          {/* How it changed over time (Timeline) */}
          <Timeline entries={answer.timeline} posts={answer.posts} />
        </div>

        {/* Right Column: People, Confidence, Next steps */}
        <aside className="lg:col-span-4 space-y-6" aria-label="Details and actions">
          {/* Who was involved */}
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h2 className="font-serif text-[18px] font-semibold text-midnight mb-3">
              Who was involved
            </h2>
            <div className="space-y-1">
              {answer.people.map((person, idx) => (
                <PersonCard key={idx} person={person} />
              ))}
            </div>
          </div>

          {/* How sure are we? */}
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h2 className="font-serif text-[18px] font-semibold text-midnight mb-2">
              How sure are we?
            </h2>
            <div className="text-sm font-bold text-navy mb-3">
              {confidenceLabel}
            </div>

            {/* Dropped statements box */}
            {answer.dropped && answer.dropped.length > 0 && (
              <div className="p-3 bg-blush-soft border border-dashed border-blush-deep rounded-[8px] text-xs">
                <button
                  type="button"
                  onClick={() => setShowDropped(!showDropped)}
                  className="text-left font-medium text-midnight hover:text-navy flex items-center justify-between w-full focus-visible:outline-none"
                >
                  <span>
                    {answer.dropped.length} statements were left out because we could not find proof for them.
                  </span>
                  <span className="text-navy underline text-[11px] ml-1 flex-shrink-0">
                    {showDropped ? "Hide" : "See which"}
                  </span>
                </button>

                {showDropped && (
                  <ul className="mt-3 pt-2 border-t border-blush-deep/40 space-y-2 text-muted">
                    {answer.dropped.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        <div className="text-midnight font-medium">"{item.claim}"</div>
                        <div className="text-[11px] mt-0.5">Reason: {item.reason}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* What next? */}
          <div className="border border-line rounded-[12px] p-5 bg-white space-y-3">
            <h2 className="font-serif text-[18px] font-semibold text-midnight mb-3">
              What next?
            </h2>
            <button
              type="button"
              onClick={() => navigate("/code/src/retry.py")}
              className="w-full text-left px-4 py-2.5 bg-transparent border-[1.5px] border-midnight text-midnight text-xs font-medium rounded-[8px] hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 flex items-center justify-between"
            >
              <span>See the code this affects</span>
              <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => downloadDecisionRecord(answer)}
              className="w-full text-left px-4 py-2.5 bg-transparent border-[1.5px] border-midnight text-midnight text-xs font-medium rounded-[8px] hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 flex items-center justify-between"
              data-testid="download-record-btn"
            >
              <span>Download as a decision record</span>
              <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigate("/check")}
              className="w-full text-left px-4 py-2.5 bg-transparent border-[1.5px] border-midnight text-midnight text-xs font-medium rounded-[8px] hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 flex items-center justify-between"
            >
              <span>Check a new idea against this history</span>
              <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
