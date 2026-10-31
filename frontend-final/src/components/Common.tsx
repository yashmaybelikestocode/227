import React from 'react';

export const Skeleton: React.FC<{ className?: string; count?: number }> = ({
  className = 'h-10 w-full',
  count = 1,
}) => {
  return (
    <div className="space-y-3 w-full" data-testid="skeleton-loader">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-mint-soft animate-pulse rounded-card ${className}`}
        />
      ))}
    </div>
  );
};

export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ title, message, actionText, onAction }) => {
  return (
    <div
      className="p-8 text-center bg-surface border border-line rounded-card my-6 space-y-3"
      data-testid="empty-state"
    >
      {title && <h3 className="text-base font-bold text-ink">{title}</h3>}
      {message && <p className="text-muted text-sm">{message}</p>}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-btn hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ title, message = 'Something went wrong while loading data.', onRetry }) => {
  return (
    <div
      className="p-6 bg-surface border border-brick/40 rounded-card my-6 space-y-3 text-center"
      data-testid="error-state"
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brick/10 text-brick mx-auto">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      {title && <h3 className="text-base font-bold text-ink">{title}</h3>}
      <p className="text-ink text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-btn hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Try again
        </button>
      )}
    </div>
  );
};
