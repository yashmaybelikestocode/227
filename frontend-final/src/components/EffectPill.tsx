import React from 'react';
import type { LaterEffect } from '../types';

interface EffectPillProps {
  effect: LaterEffect;
  className?: string;
  prNumber?: number;
}

export const EffectPill: React.FC<EffectPillProps> = ({
  effect,
  className = '',
  prNumber,
}) => {
  switch (effect) {
    case 'modified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber text-[#5A4310] ${className}`}
          data-testid="effect-pill-modified"
        >
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Adjusted later{prNumber ? ` · PR #${prNumber}` : ''}</span>
        </span>
      );
    case 'reversed':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brick text-white ${className}`}
          data-testid="effect-pill-reversed"
        >
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>Undone later{prNumber ? ` · PR #${prNumber}` : ''}</span>
        </span>
      );
  }
};
