import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong while loading this data.',
  onRetry,
}) => {
  return (
    <div className="bg-surface rounded-card border border-brick/30 p-6 text-center max-w-xl mx-auto my-6">
      <div className="w-10 h-10 rounded-full bg-brick/10 text-brick mx-auto flex items-center justify-center mb-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-ink font-medium text-[15px] mb-2">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-btn hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      )}
    </div>
  );
};
