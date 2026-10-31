import React from 'react';
import { LaterChangeEffect } from '../types';

interface EffectPillProps {
  effect: LaterChangeEffect;
  className?: string;
}

export const EffectPill: React.FC<EffectPillProps> = ({ effect, className = '' }) => {
  switch (effect) {
    case 'modified':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-medium bg-amber text-[#5A4310] ${className}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Adjusted later</span>
        </span>
      );

    case 'reversed':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-semibold bg-brick text-white ${className}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2m0 0l-4-4m4 4l4-4" />
          </svg>
          <span>Undone later</span>
        </span>
      );

    case 'unrelated':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-medium bg-neutral text-muted ${className}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span>Not related</span>
        </span>
      );

    case 'unclear':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-medium bg-neutral text-muted ${className}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
          </svg>
          <span>Unclear</span>
        </span>
      );
  }
};
