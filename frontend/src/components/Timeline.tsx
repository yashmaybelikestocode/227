import React from 'react';
import type { TimelineEntry, Comment, Statement, Person } from '../types';
import { EffectPill } from './EffectPill';
import { SourceChip } from './SourceChip';

interface TimelineProps {
  entries: TimelineEntry[];
  comments: Comment[];
  statements: Statement[];
  people: Person[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  entries,
  comments,
  statements,
  people,
  className = '',
}) => {
  return (
    <div
      className={`relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-mint-deep ${className}`}
    >
      {entries.map((entry, index) => (
        <div key={index} className="relative group">
          {/* Accent dot */}
          <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-surface" />

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold uppercase tracking-wider text-muted">
              <span>{entry.date}</span>
              <span>·</span>
              <span className="font-mono text-ink">PR #{entry.pr_number}</span>
              {entry.effect && <EffectPill effect={entry.effect} />}
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-sm text-ink leading-relaxed font-normal">
                {entry.text.text}
              </p>
              {entry.text.statement_ids.map((sid) => (
                <SourceChip
                  key={sid}
                  statementId={sid}
                  comments={comments}
                  statements={statements}
                  people={people}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
