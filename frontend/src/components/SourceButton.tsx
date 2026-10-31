import React, { useRef } from "react";
import { Post } from "../types";
import { getSourceMeta } from "../utils/sourceLabel";
import { useOriginalComment } from "../context/OriginalCommentContext";

interface SourceButtonProps {
  evidenceId: string;
  posts: Post[];
  className?: string;
}

export const SourceButton: React.FC<SourceButtonProps> = ({ evidenceId, posts, className = "" }) => {
  const { openPanel } = useOriginalComment();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const meta = getSourceMeta(evidenceId, posts);
  const label = meta ? meta.label : "Source";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPanel(evidenceId, posts, buttonRef.current);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={`View cited comment: ${label}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-navy bg-white hover:bg-mist border border-line rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${className}`}
      data-testid={`source-button-${evidenceId}`}
    >
      <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span>{label}</span>
    </button>
  );
};
