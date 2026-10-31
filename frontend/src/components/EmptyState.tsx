import React from "react";

interface EmptyStateProps {
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
}) => {
  return (
    <div className="border border-line rounded-[12px] p-8 text-center bg-white">
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-mist text-muted flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {title && (
        <h3 className="font-serif text-[18px] font-semibold text-midnight mb-1">
          {title}
        </h3>
      )}
      <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      {actionText && onAction && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 border border-midnight rounded-[8px] text-xs font-medium text-midnight hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
