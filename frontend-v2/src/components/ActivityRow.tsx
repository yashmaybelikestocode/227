import React from 'react';
import { ActivityItem, DecisionStatus } from '../types';
import { getInitials } from './PersonCard';
import { SourceButton } from './SourceButton';
import { StatusPill } from './StatusPill';

interface ActivityRowProps {
  item: ActivityItem;
  keywordHighlight?: string;
}

export function formatActionText(kind: ActivityItem['kind'], ref: string | null): string {
  switch (kind) {
    case 'commit':
      return 'committed';
    case 'issue_comment':
      return ref ? `commented on issue ${ref}` : 'commented on issue';
    case 'pr_comment':
      return ref ? `commented on pull request ${ref}` : 'commented on pull request';
    case 'review_comment':
      return ref ? `reviewed pull request ${ref}` : 'reviewed pull request';
    default:
      return 'contributed';
  }
}

export const ActivityRow: React.FC<ActivityRowProps> = ({ item, keywordHighlight }) => {
  const initials = getInitials(item.author);
  const action = formatActionText(item.kind, item.ref);

  const timeFormatted = new Date(item.timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const highlightKeyword = (text: string) => {
    if (!keywordHighlight || !keywordHighlight.trim()) return text;
    const parts = text.split(new RegExp(`(${keywordHighlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keywordHighlight.toLowerCase() ? (
        <mark key={i} className="bg-mint text-ink rounded px-0.5 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getDecisionStatus = (decId?: string): DecisionStatus | null => {
    if (decId === 'dec-backoff') return 'accepted';
    if (decId === 'dec-library') return 'rejected';
    if (decId === 'dec-jitter') return 'deferred';
    if (decId === 'dec-custom-tries') return 'unresolved';
    return null;
  };

  const status = getDecisionStatus(item.decision_id);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-line last:border-b-0 hover:bg-mint-soft/30 px-2 rounded-btn transition-colors">
      <div className="w-[28px] h-[28px] rounded-full bg-mint text-ink text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm">
            <span className="font-semibold text-ink">{item.author}</span>{' '}
            <span className="text-muted">{action}</span>
          </div>
          <span className="text-xs text-muted font-mono flex-shrink-0">{timeFormatted}</span>
        </div>

        <div className="text-[14px] text-ink mt-0.5 leading-relaxed">
          {highlightKeyword(item.text)}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {status && <StatusPill status={status} />}
          {item.evidence_ids?.map((eid) => (
            <SourceButton key={eid} evidenceId={eid} />
          ))}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline inline-flex items-center gap-0.5"
          >
            <span>Open on GitHub</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
