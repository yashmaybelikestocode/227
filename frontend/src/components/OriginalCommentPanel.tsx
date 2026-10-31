import React, { useEffect, useRef } from "react";
import { useOriginalComment } from "../context/OriginalCommentContext";
import { getSourceMeta } from "../utils/sourceLabel";

export const OriginalCommentPanel: React.FC = () => {
  const { isOpen, activeEvidenceId, activePosts, closePanel } = useOriginalComment();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Move focus into the panel
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closePanel]);

  if (!isOpen) {
    return null;
  }

  const meta = activeEvidenceId ? getSourceMeta(activeEvidenceId, activePosts) : null;
  const post = meta?.post;

  const formatDate = (isoOrDate: string) => {
    try {
      const d = new Date(isoOrDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        });
      }
    } catch {
      // ignore
    }
    return isoOrDate;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
      aria-labelledby="original-comment-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight/20 transition-opacity"
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Slide-in panel (fixed 380px) */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-[380px] max-w-full bg-white h-full shadow-lg border-l border-line flex flex-col z-10 overflow-y-auto"
        data-testid="original-comment-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 id="original-comment-title" className="font-serif text-[20px] font-semibold text-midnight">
              The original comment
            </h2>
            {meta && (
              <p className="text-xs text-muted mt-0.5">
                You clicked: <span className="font-medium text-navy">{meta.label}</span>
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closePanel}
            aria-label="Close comment panel"
            className="p-2 text-muted hover:text-midnight rounded-[8px] hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          {post ? (
            <div className="border border-line rounded-[12px] p-4 bg-white">
              {/* Author and Date */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
                <div className="font-medium text-midnight text-sm">
                  {post.author}
                </div>
                <div className="text-xs text-muted">
                  {formatDate(post.timestamp)}
                </div>
              </div>

              {/* Sentences with exact ID highlighting */}
              <div className="text-sm leading-relaxed text-midnight space-y-2">
                {post.sentences.map((s) => {
                  const isHighlighted = s.id === activeEvidenceId;
                  if (isHighlighted) {
                    return (
                      <span
                        key={s.id}
                        data-testid="highlighted-sentence"
                        className="inline-block my-1 pl-2.5 pr-1.5 py-1 rounded-[2px] bg-[#EDB8C4]/65 text-midnight border-l-[3px] border-navy font-normal"
                      >
                        {s.text}{" "}
                      </span>
                    );
                  }
                  return (
                    <span key={s.id} data-testid={`sentence-${s.id}`}>
                      {s.text}{" "}
                    </span>
                  );
                })}
              </div>

              {/* GitHub Link */}
              <div className="mt-4 pt-3 border-t border-line">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-midnight border border-midnight rounded-[8px] px-3 py-1.5 hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Open on GitHub</span>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No comment details found for this reference.</p>
          )}

          {/* Educational Note */}
          <div className="p-3 bg-blush-soft rounded-[8px] border border-blush-deep/50 text-xs text-muted leading-relaxed">
            The highlighted sentence is the proof for the statement you clicked. We only show a statement if we can point to the words that support it.
          </div>
        </div>
      </div>
    </div>
  );
};
