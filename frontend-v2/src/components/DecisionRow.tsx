import React from 'react';
import { Decision, Post } from '../types';
import { StatusPill } from './StatusPill';
import { SourceButton } from './SourceButton';
import { findPostBySentenceId } from '../utils/sourceHelper';

interface DecisionRowProps {
  decision: Decision;
  detailed?: boolean;
  posts?: Post[];
}

export function formatStanceNarrative(decision: Decision): string {
  if (decision.id === 'dec-library') {
    return 'Marcus asked for a library, then agreed to write it in-house. Priya opposed adding external dependencies.';
  }
  if (decision.id === 'dec-backoff') {
    return 'Priya supported it. Marcus asked for a library, then agreed. Leo approved.';
  }
  if (decision.id === 'dec-jitter') {
    return 'Leo supported waiting for evidence before adding random jitter. Priya remained neutral.';
  }
  if (decision.id === 'dec-custom-tries') {
    return 'Marcus supported keeping custom retry counts open for future evaluation.';
  }
  // Generic fallback from stance history
  const parts = decision.stance_history.map((sh) => {
    const first = sh.author.split(' ')[0];
    if (sh.stance === 'support') return `${first} supported it`;
    if (sh.stance === 'oppose') return `${first} opposed it`;
    if (sh.stance === 'withdraw') return `${first} agreed to withdraw`;
    return `${first} remained neutral`;
  });
  return parts.join('. ') + '.';
}

export const DecisionRow: React.FC<DecisionRowProps> = ({ decision, detailed = false, posts }) => {
  const stanceSentence = formatStanceNarrative(decision);

  return (
    <div className="py-4 border-b border-line last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Fixed 150px status pill column */}
        <div className="sm:w-[150px] flex-shrink-0 pt-0.5">
          <StatusPill status={decision.status} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink text-[16px] mb-1">
            {decision.approach}
          </div>
          <div className="text-muted text-[15px] leading-relaxed flex flex-wrap items-center gap-2">
            <span>{decision.why.text}</span>
            {decision.why.evidence_ids.map((eid) => (
              <SourceButton key={eid} evidenceId={eid} posts={posts} />
            ))}
          </div>

          {/* Detailed view: stance history in plain words and quote cards */}
          {detailed && (
            <div className="mt-3.5 pt-3 border-t border-line/60 bg-mint-soft/40 p-3 rounded-card">
              <div className="text-sm font-medium text-ink mb-2">
                <span className="text-muted">Who took part: </span>
                {stanceSentence}
              </div>

              {/* Quote cards for each source in the decision */}
              <div className="space-y-2 mt-2">
                {decision.why.evidence_ids.map((eid) => {
                  const post = findPostBySentenceId(posts || [], eid);
                  if (!post) return null;
                  const sentence = post.sentences.find((s) => s.id === eid);
                  return (
                    <div
                      key={eid}
                      className="bg-surface border border-line rounded-card p-2.5 text-xs text-ink flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="font-semibold text-accent">{post.author}</span>:{' '}
                        <span className="italic">"{sentence?.text}"</span>
                      </div>
                      <SourceButton evidenceId={eid} posts={posts} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
