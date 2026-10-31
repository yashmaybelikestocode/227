import React from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We could not load this information right now. Please try again.",
  onRetry,
}) => {
  return (
    <div className="border border-line rounded-[12px] p-8 text-center bg-white" role="alert">
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-blush-soft text-rose flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-serif text-[18px] font-semibold text-midnight mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-md mx-auto mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-navy text-white text-xs font-medium rounded-[8px] hover:bg-navy/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
};
