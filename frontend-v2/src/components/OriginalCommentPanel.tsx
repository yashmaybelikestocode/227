import React, { useEffect, useRef } from 'react';
import { useCommentPanel } from '../context/CommentPanelContext';

export const OriginalCommentPanel: React.FC = () => {
  const { isOpen, activeSentenceId, activePost, sourceLabel, closeComment } = useCommentPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus moves into the panel on open
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeComment();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeComment]);

  if (!isOpen || !activePost) {
    return null;
  }

  const formattedDate = new Date(activePost.timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <>
      {/* Background overlay for mobile */}
      <div
        className="fixed inset-0 bg-ink/20 z-40 lg:hidden"
        onClick={closeComment}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Original comment"
        tabIndex={-1}
        className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-surface border-l border-line shadow-sm z-50 flex flex-col p-6 overflow-y-auto outline-none transition-transform duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
          <h2 className="font-serif text-[20px] font-semibold text-ink">The original comment</h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeComment}
            aria-label="Close original comment panel"
            className="p-2 text-muted hover:text-ink rounded-btn hover:bg-mint-soft text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-sm text-muted">
          You clicked: <span className="font-medium text-ink bg-mint px-2 py-0.5 rounded-pill">{sourceLabel}</span>
        </div>

        <div className="bg-white rounded-card border border-line p-4 mb-5">
          <div className="flex items-center justify-between mb-3 border-b border-line pb-2">
            <span className="font-semibold text-ink text-sm">{activePost.author}</span>
            <span className="text-xs text-muted">{formattedDate}</span>
          </div>

          <div className="text-[15px] leading-relaxed text-ink space-y-2">
            {activePost.sentences.map((sentence) => {
              const isHighlighted = sentence.id === activeSentenceId;
              return (
                <span
                  key={sentence.id}
                  data-sentence-id={sentence.id}
                  data-highlighted={isHighlighted ? 'true' : 'false'}
                  className={
                    isHighlighted
                      ? 'inline-block bg-mint-deep/80 text-ink border-l-[3px] border-accent pl-1.5 py-0.5 rounded-sm my-0.5 font-medium'
                      : 'inline'
                  }
                >
                  {sentence.text}{' '}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <a
            href={activePost.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-ink border-[1.5px] border-ink rounded-btn hover:bg-mint-soft transition-colors"
          >
            Open on GitHub
            <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div className="mt-auto bg-mint-soft border border-mint-deep/50 rounded-card p-3.5 text-xs text-muted leading-relaxed">
          The highlighted sentence is the proof for the statement you clicked. We only show a statement if we can point to the words that support it.
        </div>
      </aside>
    </>
  );
};
