import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Statement, Comment, Person, Decision } from '../types';
import { SourceChip } from './SourceChip';

interface GroupedStatementsProps {
  decision?: Decision;
  statementIds?: string[];
  comments: Comment[];
  statements: Statement[];
  people: Person[];
  groupedCount?: number;
}

export const GroupedStatements: React.FC<GroupedStatementsProps> = ({
  decision,
  statementIds,
  comments,
  statements,
  people,
  groupedCount,
}) => {
  const [expanded, setExpanded] = useState(false);

  const effectiveStatementIds = statementIds || decision?.statement_ids || [];
  const effectiveCount = groupedCount ?? decision?.grouped_count ?? effectiveStatementIds.length;

  const matchedStatements = effectiveStatementIds
    .map((id) => statements.find((s) => s.id === id))
    .filter((s): s is Statement => Boolean(s));

  return (
    <div className="pt-2">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        data-testid="grouped-statements-toggle"
      >
        <span>Grouped from {effectiveCount} similar statements</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div
          className="mt-2.5 p-3.5 bg-mint-soft/80 border border-mint-deep/60 rounded-card space-y-3"
          data-testid="grouped-statements-list"
        >
          {matchedStatements.map((stmt) => {
            const comment = comments.find((c) => c.id === stmt.comment_id);
            const person = comment
              ? people.find((p) => p.id === comment.person_id)
              : undefined;
            const authorName = person ? person.display_name : 'Contributor';
            const personId = person ? person.id : 'unknown';

            return (
              <div
                key={stmt.id}
                className="bg-white border border-line rounded-btn p-3 space-y-2 text-xs"
                data-testid={`grouped-item-${stmt.id}`}
              >
                <div className="flex items-center justify-between text-muted flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/people/${personId}`}
                      className="font-bold text-accent hover:underline"
                    >
                      {authorName}
                    </Link>
                    <span>·</span>
                    <span>{comment ? comment.date : 'Unknown date'}</span>
                    <span>·</span>
                    <span className="font-mono text-ink/70">
                      {comment ? comment.where : ''}
                    </span>
                  </div>

                  <SourceChip
                    statementId={stmt.id}
                    comments={comments}
                    statements={statements}
                    people={people}
                  />
                </div>

                <blockquote
                  className="pl-3 border-l-2 border-accent text-ink italic leading-relaxed"
                  data-testid="grouped-quote"
                >
                  "{stmt.quote}"
                </blockquote>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
