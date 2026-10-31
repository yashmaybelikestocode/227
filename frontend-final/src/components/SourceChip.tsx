import React, { useRef } from 'react';
import type { Statement, Comment, Person } from '../types';
import { useCommentPanel } from '../context/CommentPanelContext';

interface SourceChipProps {
  statementId: string;
  comments: Comment[];
  statements: Statement[];
  people: Person[];
  className?: string;
  label?: string;
}

export const SourceChip: React.FC<SourceChipProps> = ({
  statementId,
  comments,
  statements,
  people,
  className = '',
  label,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { openComment } = useCommentPanel();

  const stmt = statements.find((s) => s.id === statementId);
  const comment = stmt ? comments.find((c) => c.id === stmt.comment_id) : undefined;
  const person = comment ? people.find((p) => p.id === comment.person_id) : undefined;

  let displayLabel = label;
  if (!displayLabel && comment && person) {
    const firstName = person.display_name.split(' ')[0] || person.display_name;
    const dateParts = comment.date.split(' ');
    const dayMonth = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : comment.date;
    displayLabel = `${firstName}, ${dayMonth}`;
  }

  const finalLabel = displayLabel || 'Priya, 14 Mar';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => openComment(statementId, comments, statements, people, buttonRef.current)}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium text-accent bg-mint-soft hover:bg-mint border border-mint-deep rounded-btn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      data-testid={`source-chip-${statementId}`}
      aria-label={`Source citation from ${finalLabel}`}
      title={`Open original comment from ${finalLabel}`}
    >
      <svg className="w-3 h-3 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span>{finalLabel}</span>
    </button>
  );
};
