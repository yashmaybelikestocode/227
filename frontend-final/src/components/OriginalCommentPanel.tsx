import React, { useEffect, useRef } from 'react';
import { useCommentPanel } from '../context/CommentPanelContext';

export const OriginalCommentPanel: React.FC = () => {
  const {
    isOpen,
    activeStatement,
    activeComment,
    authorLabel,
    authorName,
    closeComment,
  } = useCommentPanel();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen || !activeStatement || !activeComment) return null;

  const before = activeComment.text.slice(0, activeStatement.start);
  const highlighted = activeComment.text.slice(
    activeStatement.start,
    activeStatement.end
  );
  const after = activeComment.text.slice(activeStatement.end);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-ink/20 z-40 lg:hidden"
        onClick={closeComment}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="complementary"
        aria-label="The original comment"
        data-testid="original-comment-panel"
        className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-surface border-l border-line shadow-sm z-50 flex flex-col transition-transform duration-200 ease-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line bg-surface">
          <div>
            <h2 className="text-lg font-semibold text-ink font-serif">
              The original comment
            </h2>
            <p className="text-xs text-muted mt-0.5">
              You clicked:{' '}
              <span className="font-medium text-ink">{authorLabel}</span>
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeComment}
            aria-label="Close comment panel"
            className="p-1.5 rounded-btn text-muted hover:text-ink hover:bg-mint-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white border border-line rounded-card p-4 space-y-3">
            <div className="flex items-baseline justify-between border-b border-line/60 pb-2">
              <span className="font-semibold text-ink text-sm">
                {authorName}
              </span>
              <span className="font-mono text-xs text-muted">
                {activeComment.github_id}
              </span>
            </div>

            <div className="text-xs text-muted flex items-center justify-between">
              <span>{activeComment.date}</span>
              <span>{activeComment.where}</span>
            </div>

            {/* Whole comment text with exact start & end offset highlight */}
            <div
              data-testid="comment-full-text"
              className="text-sm text-ink leading-relaxed space-y-2 pt-1"
            >
              <p>
                {before}
                <mark
                  data-testid="highlighted-quote"
                  data-start={activeStatement.start}
                  data-end={activeStatement.end}
                  className="evidence-highlight bg-mint-deep/80 text-ink border-l-[3px] border-accent font-medium px-1 py-0.5 rounded-sm"
                >
                  {highlighted}
                </mark>
                {after}
              </p>
            </div>

            <div className="pt-2">
              <a
                href={activeComment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-ink bg-transparent border-[1.5px] border-ink rounded-btn hover:bg-mint-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>Open on GitHub</span>
                <svg
                  className="w-4 h-4 ml-1.5 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="p-3.5 bg-mint-soft border border-mint-deep/60 rounded-card text-xs text-muted leading-relaxed">
            <p>
              The highlighted words are the proof for the statement you clicked.
              We only show a statement if we can quote it exactly.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
