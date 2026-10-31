import React, { useState } from 'react';
import { checkIdea } from '../api';
import { CheckMatch } from '../types';
import { StatusPill } from '../components/StatusPill';
import { SourceButton } from '../components/SourceButton';

export const CheckPage: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [match, setMatch] = useState<CheckMatch | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setHasChecked(false);
    try {
      const result = await checkIdea(text);
      setMatch(result);
      setHasChecked(true);
    } catch {
      setMatch(null);
      setHasChecked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
          Check a new idea against the history
        </h1>
        <p className="text-muted text-[15px] mt-1">
          Before writing code or filing an issue, check if the team previously discussed, accepted, or rejected a similar proposal.
        </p>
      </div>

      <form onSubmit={handleCheck} className="space-y-4 mb-8">
        <div>
          <label htmlFor="idea-text" className="block text-sm font-medium text-ink mb-1.5">
            Paste your pull request description or idea
          </label>
          <textarea
            id="idea-text"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. We should integrate an outside retry library to handle connection timeouts..."
            className="w-full p-3.5 bg-white border border-line rounded-card text-sm text-ink placeholder:text-muted/60 focus:border-accent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="px-6 py-3 bg-accent text-white font-medium text-sm rounded-btn hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Checking history...' : 'Check history'}
        </button>
      </form>

      {hasChecked && (
        <div className="space-y-6">
          {match ? (
            <div className="space-y-3">
              <h2 className="font-serif text-[20px] font-semibold text-ink">
                Something like this came up before.
              </h2>

              <div className="bg-surface rounded-card border border-line p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-ink text-[16px] mb-1">
                      {match.decision.approach}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {match.sentence}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusPill status={match.decision.status} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line text-xs">
                  <span className="text-muted font-medium">Evidence:</span>
                  {match.evidence_ids.map((eid) => (
                    <SourceButton key={eid} evidenceId={eid} posts={match.posts} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-card border border-line p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-mint-soft text-accent mx-auto flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-ink font-medium text-[15px]">
                Nothing similar was found in the discussions we looked at.
              </p>
            </div>
          )}

          {/* Always shown caveat */}
          <div className="p-3.5 bg-mint-soft/50 border border-mint-deep/60 rounded-btn text-xs text-muted leading-relaxed">
            This is a text match with a confidence level, not a final judgement. Open the source to be sure.
          </div>
        </div>
      )}
    </div>
  );
};
