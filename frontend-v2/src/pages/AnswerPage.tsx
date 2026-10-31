import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnswer } from '../api';
import { Answer, DecisionStatus } from '../types';
import { SourceButton } from '../components/SourceButton';
import { DecisionRow } from '../components/DecisionRow';
import { Timeline } from '../components/Timeline';
import { PersonCard } from '../components/PersonCard';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { isAnswerSaved, saveAnswer, removeSavedAnswer } from '../saved';
import { downloadDecisionRecord } from '../utils/downloadDecisionRecord';

export const AnswerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);

  // Reading switch state remembered in localStorage
  const [detailed, setDetailed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cypher_reading_level') === 'detailed';
    } catch {
      return false;
    }
  });

  const [saved, setSaved] = useState<boolean>(false);
  const [showDropped, setShowDropped] = useState<boolean>(false);

  const fetchAnswer = () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    getAnswer(id)
      .then((data) => {
        setAnswer(data);
        setSaved(isAnswerSaved(data.id));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnswer();
  }, [id]);

  const handleToggleReadingLevel = (level: 'easy' | 'detailed') => {
    const isDet = level === 'detailed';
    setDetailed(isDet);
    try {
      localStorage.setItem('cypher_reading_level', level);
    } catch {
      // Ignore
    }
  };

  const handleToggleSave = () => {
    if (!answer) return;
    if (saved) {
      removeSavedAnswer(answer.id);
      setSaved(false);
    } else {
      saveAnswer(answer);
      setSaved(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !answer) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ErrorState onRetry={fetchAnswer} />
      </div>
    );
  }

  // Order decisions: Decided (accepted), Decided against (rejected), Postponed (deferred), Still open (unresolved)
  const statusOrder: Record<DecisionStatus, number> = {
    accepted: 0,
    rejected: 1,
    deferred: 2,
    unresolved: 3,
  };

  const sortedDecisions = [...answer.decisions].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  const confidenceLabels = {
    high: 'Well supported',
    medium: 'Partly supported',
    low: 'Weakly supported',
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Recap chips & Change search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-line no-print">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-pill bg-mint text-ink text-xs font-mono font-medium">
            {answer.repo}
          </span>
          <span className="px-3 py-1 rounded-pill bg-mint-soft text-muted text-xs border border-mint-deep">
            {answer.range_label}
          </span>
        </div>
        <Link
          to="/"
          className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Change search
        </Link>
      </div>

      {/* Header bar: Question title + Action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-[30px] sm:text-[34px] font-semibold text-ink leading-tight max-w-reading">
          {answer.question}
        </h1>

        <div className="flex items-center gap-3 flex-shrink-0 no-print">
          {/* Easy | Detailed switch */}
          <div className="inline-flex p-0.5 bg-surface border border-line rounded-pill">
            <button
              type="button"
              onClick={() => handleToggleReadingLevel('easy')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-pill transition-colors ${
                !detailed ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Easy
            </button>
            <button
              type="button"
              onClick={() => handleToggleReadingLevel('detailed')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-pill transition-colors ${
                detailed ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Detailed
            </button>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleToggleSave}
            className={`px-4 py-2 text-xs font-medium rounded-btn border transition-colors flex items-center gap-1.5 ${
              saved
                ? 'bg-mint border-accent text-accent font-semibold'
                : 'bg-transparent border-ink text-ink hover:bg-mint-soft'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-medium rounded-btn border-[1.5px] border-ink text-ink hover:bg-mint-soft transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print view</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 2 cols */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. The short answer card */}
          <div className="bg-surface rounded-card border border-line border-l-[5px] border-l-accent p-6 shadow-none">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
              The short answer
            </div>
            <div className="text-[17px] text-ink leading-relaxed space-y-3 mb-4 max-w-reading">
              {answer.short_answer.map((claim, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline gap-2">
                  <span>{claim.text}</span>
                  {claim.evidence_ids.map((eid) => (
                    <SourceButton key={eid} evidenceId={eid} posts={answer.posts} />
                  ))}
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-line text-xs text-muted">
              {answer.based_on}
            </div>
          </div>

          {/* 2. What the team decided */}
          <div className="bg-surface rounded-card border border-line p-6">
            <h2 className="font-serif text-[22px] font-semibold text-ink mb-4">
              What the team decided
            </h2>
            <div className="divide-y divide-line">
              {sortedDecisions.map((decision) => (
                <DecisionRow
                  key={decision.id}
                  decision={decision}
                  detailed={detailed}
                  posts={answer.posts}
                />
              ))}
            </div>
          </div>

          {/* 3. How it changed over time */}
          <div className="bg-surface rounded-card border border-line p-6">
            <h2 className="font-serif text-[22px] font-semibold text-ink mb-4">
              How it changed over time
            </h2>
            <Timeline entries={answer.timeline} posts={answer.posts} />
          </div>
        </div>

        {/* Right column cards */}
        <div className="space-y-6 no-print">
          {/* Who was involved */}
          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
              Who was involved
            </h3>
            <div className="divide-y divide-line">
              {answer.people.map((person) => (
                <PersonCard key={person.author} person={person} />
              ))}
            </div>
          </div>

          {/* How sure are we? */}
          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-2">
              How sure are we?
            </h3>
            <div className="mb-3">
              <span className="font-bold text-accent text-sm">
                {confidenceLabels[answer.confidence]}
              </span>
            </div>

            {answer.dropped && answer.dropped.length > 0 && (
              <div className="p-3 bg-mint-soft border border-dashed border-mint-deep rounded-btn">
                <button
                  type="button"
                  onClick={() => setShowDropped(!showDropped)}
                  className="text-xs text-ink font-medium text-left hover:text-accent flex items-center justify-between w-full"
                >
                  <span>
                    {answer.dropped.length} statements were left out because we could not find proof for them. See which
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transform transition-transform ${showDropped ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropped && (
                  <div className="mt-3 pt-3 border-t border-line/60 space-y-2.5 text-xs">
                    {answer.dropped.map((item, i) => (
                      <div key={i} className="text-ink">
                        <div className="font-medium text-brick line-through">"{item.claim}"</div>
                        <div className="text-muted mt-0.5">{item.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* What next? */}
          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
              What next?
            </h3>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate('/activity')}
                className="w-full px-4 py-2.5 text-xs font-medium text-ink border-[1.5px] border-ink rounded-btn hover:bg-mint-soft text-left transition-colors flex items-center justify-between"
              >
                <span>See who did what</span>
                <span className="text-muted">→</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/code/src/retry.py')}
                className="w-full px-4 py-2.5 text-xs font-medium text-ink border-[1.5px] border-ink rounded-btn hover:bg-mint-soft text-left transition-colors flex items-center justify-between"
              >
                <span>See the code this affects</span>
                <span className="text-muted">→</span>
              </button>
              <button
                type="button"
                onClick={() => downloadDecisionRecord(answer)}
                className="w-full px-4 py-2.5 text-xs font-medium text-ink border-[1.5px] border-ink rounded-btn hover:bg-mint-soft text-left transition-colors flex items-center justify-between"
              >
                <span>Download as a decision record</span>
                <span className="text-muted">↓</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/check')}
                className="w-full px-4 py-2.5 text-xs font-medium text-ink border-[1.5px] border-ink rounded-btn hover:bg-mint-soft text-left transition-colors flex items-center justify-between"
              >
                <span>Check a new idea against this history</span>
                <span className="text-muted">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
