import React from 'react';
import { DecisionStatus } from '../types';

interface StatusPillProps {
  status: DecisionStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'accepted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold bg-accent text-white ${className}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Decided</span>
        </span>
      );

    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold bg-brick text-white ${className}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Decided against</span>
        </span>
      );

    case 'deferred':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold bg-amber text-[#5A4310] ${className}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 3" />
          </svg>
          <span>Postponed</span>
        </span>
      );

    case 'unresolved':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold bg-neutral text-muted ${className}`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
          </svg>
          <span>Still open</span>
        </span>
      );
  }
};
