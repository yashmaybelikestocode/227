import React from 'react';

interface EmptyStateProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, actionText, onAction }) => {
  return (
    <div className="bg-surface rounded-card border border-line p-8 text-center max-w-xl mx-auto my-6">
      <div className="w-10 h-10 rounded-full bg-mint-soft text-muted mx-auto flex items-center justify-center mb-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-muted text-[15px] leading-relaxed mb-4">{message}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-ink border-[1.5px] border-ink rounded-btn hover:bg-mint-soft transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
