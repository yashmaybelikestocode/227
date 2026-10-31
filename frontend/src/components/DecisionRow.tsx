import React from 'react';
import type { Decision, Comment, Statement, Person } from '../types';
import { StatusPill } from './StatusPill';
import { EffectPill } from './EffectPill';
import { SourceChip } from './SourceChip';
import { GroupedStatements } from './GroupedStatements';

interface DecisionRowProps {
  decision: Decision;
  comments: Comment[];
  statements: Statement[];
  people: Person[];
}

export const DecisionRow: React.FC<DecisionRowProps> = ({
  decision,
  comments,
  statements,
  people,
}) => {
  return (
    <div
      className="py-4 border-b border-line last:border-b-0 space-y-2"
      data-testid={`decision-row-${decision.id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Fixed 150px status pill column */}
        <div className="w-[150px] shrink-0 pt-0.5">
          <StatusPill status={decision.status} />
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-ink leading-snug">
                {decision.title}
              </h3>

              {/* Later change tags */}
              {decision.later_changes.map((lc, idx) => (
                <EffectPill
                  key={idx}
                  effect={lc.effect}
                  prNumber={lc.pr_number}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {decision.reason.statement_ids.map((sid) => (
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

          <p className="text-sm text-muted leading-relaxed">
            {decision.reason.text}
          </p>

          {/* Grouped statements toggle if > 1 */}
          {decision.grouped_count > 1 && (
            <GroupedStatements
              statementIds={decision.statement_ids}
              comments={comments}
              statements={statements}
              people={people}
              groupedCount={decision.grouped_count}
            />
          )}
        </div>
      </div>
    </div>
  );
};
