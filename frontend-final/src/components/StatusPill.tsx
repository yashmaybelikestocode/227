import React from 'react';
import type { DecisionStatus } from '../types';

interface StatusPillProps {
  status: DecisionStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (status) {
    case 'accepted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-accent text-white ${sizeClasses} ${className}`}
          data-testid="status-pill-accepted"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Decided</span>
        </span>
      );
    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-brick text-white ${sizeClasses} ${className}`}
          data-testid="status-pill-rejected"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Decided against</span>
        </span>
      );
    case 'deferred':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber text-[#5A4310] ${sizeClasses} ${className}`}
          data-testid="status-pill-deferred"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
          </svg>
          <span>Postponed</span>
        </span>
      );
    case 'unresolved':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-neutral text-muted ${sizeClasses} ${className}`}
          data-testid="status-pill-unresolved"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
          </svg>
          <span>Still open</span>
        </span>
      );
  }
};
