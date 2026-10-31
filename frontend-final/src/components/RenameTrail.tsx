import React from 'react';
import type { RenameStep } from '../types';

interface RenameTrailProps {
  currentPath: string;
  formerly: RenameStep[];
}

export const RenameTrail: React.FC<RenameTrailProps> = ({ currentPath, formerly }) => {
  if (!formerly || formerly.length === 0) return null;

  return (
    <div className="p-4 bg-surface border border-line rounded-card space-y-3" data-testid="rename-trail">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-semibold text-muted uppercase tracking-wider text-[11px]">
          File history:
        </span>
        <span className="px-2.5 py-1 bg-mint font-mono font-bold text-ink rounded-btn border border-mint-deep">
          {currentPath}
        </span>

        {formerly.map((step, idx) => {
          const detail =
            step.kind === 'renamed'
              ? `renamed in PR #${step.pr_number}, ${step.date}, commit ${step.commit}`
              : `moved in commit ${step.commit}, ${step.date}`;

          return (
            <React.Fragment key={idx}>
              <span className="text-muted font-bold">←</span>
              <div
                className="px-2.5 py-1 bg-white border border-line rounded-btn text-ink flex items-center gap-1.5"
                data-testid={`rename-step-${idx}`}
              >
                <span>Formerly at</span>
                <span className="font-mono font-bold text-accent">{step.path}</span>
                <span className="text-muted">({detail})</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Cypher follows renames and moves, so decisions made at the old paths still appear here.
      </p>
    </div>
  );
};
