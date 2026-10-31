import React, { useState } from "react";
import { checkIdea } from "../api";
import { CheckMatch } from "../types";
import { StatusPill } from "../components/StatusPill";
import { SourceButton } from "../components/SourceButton";
import { Skeleton } from "../components/Skeleton";

export const CheckPage: React.FC = () => {
  const [ideaText, setIdeaText] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [matches, setMatches] = useState<CheckMatch[]>([]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;

    setLoading(true);
    setChecked(false);
    try {
      const results = await checkIdea(ideaText);
      setMatches(results);
      setChecked(true);
    } catch {
      setMatches([]);
      setChecked(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTrySampleIdea = () => {
    setIdeaText("We could import an external retry library to handle network timeouts automatically.");
  };

  return (
    <div className="max-w-[840px] mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-[32px] font-semibold text-midnight tracking-tight">
          Check a new idea against the history
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Before writing code or opening a pull request, check whether a similar approach was already discussed, decided, or postponed in past discussions.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCheck} className="space-y-4 mb-8">
        <div>
          <label htmlFor="idea-input" className="block text-xs font-semibold text-midnight mb-2">
            Paste your pull request description or idea
          </label>
          <textarea
            id="idea-input"
            rows={5}
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="e.g. We should use an outside retry library to manage backoff..."
            className="w-full p-4 border border-line rounded-[10px] text-sm text-midnight placeholder:text-muted/60 focus:border-navy focus:ring-2 focus:ring-navy focus:ring-offset-2 outline-none leading-relaxed"
            data-testid="idea-textarea"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || !ideaText.trim()}
            className="px-6 py-3 bg-navy text-white text-sm font-medium rounded-[8px] hover:bg-navy/90 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
            data-testid="check-history-btn"
          >
            {loading ? "Checking history..." : "Check history"}
          </button>
          <button
            type="button"
            onClick={handleTrySampleIdea}
            className="px-4 py-3 bg-transparent border border-line text-xs font-medium text-muted hover:text-midnight rounded-[8px] hover:bg-mist transition-colors focus-visible:outline-none"
          >
            Try sample idea (library)
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3" data-testid="check-loading">
          <Skeleton className="h-28 w-full" count={2} />
        </div>
      )}

      {/* Results */}
      {!loading && checked && (
        <div className="space-y-6 pt-4 border-t border-line">
          {matches.length > 0 ? (
            <div className="space-y-4" data-testid="check-matches-container">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose" />
                <h2 className="font-serif text-[20px] font-semibold text-midnight">
                  Something like this came up before.
                </h2>
              </div>

              {matches.map((m, idx) => (
                <div
                  key={idx}
                  className="border border-line rounded-[12px] p-5 bg-white space-y-3"
                  data-testid="check-match-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-midnight text-sm">
                      {m.decision.approach}
                    </span>
                    <StatusPill status={m.decision.status} />
                  </div>

                  <p className="text-xs text-muted leading-relaxed">
                    {m.decision.why.text}
                  </p>

                  <div className="pt-2 border-t border-line flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-muted italic">
                      Matching citation: "{m.sentence}"
                    </span>
                    <div className="inline-flex items-center gap-1">
                      {m.evidence_ids.map((id) => (
                        <SourceButton key={id} evidenceId={id} posts={m.posts} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="border border-line rounded-[12px] p-6 bg-white text-center"
              data-testid="check-no-match"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-mist text-muted flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-[18px] font-semibold text-midnight mb-1">
                Nothing similar was found in the discussions we looked at.
              </h2>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                This idea does not appear to have been previously rejected or debated in past pull requests.
              </p>
            </div>
          )}

          {/* Educational Note */}
          <div className="p-3 bg-blush-soft border border-dashed border-blush-deep rounded-[8px] text-xs text-muted leading-relaxed">
            This is a text match with a confidence level, not a final judgement. Open the source to be sure.
          </div>
        </div>
      )}
    </div>
  );
};
