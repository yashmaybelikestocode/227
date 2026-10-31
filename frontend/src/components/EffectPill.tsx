import React from "react";
import { TimelineEffect } from "../types";

interface EffectPillProps {
  effect: TimelineEffect;
  className?: string;
}

export const EffectPill: React.FC<EffectPillProps> = ({ effect, className = "" }) => {
  switch (effect) {
    case "modified":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-postponed-bg text-postponed-text shadow-none ${className}`}
          data-testid="effect-pill-modified"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Adjusted later</span>
        </span>
      );
    case "reversed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose text-white shadow-none ${className}`}
          data-testid="effect-pill-reversed"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>Undone later</span>
        </span>
      );
    case "unrelated":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutralBadge-bg text-neutralBadge-text shadow-none ${className}`}
          data-testid="effect-pill-unrelated"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span>Not related</span>
        </span>
      );
    case "unclear":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutralBadge-bg text-neutralBadge-text shadow-none ${className}`}
          data-testid="effect-pill-unclear"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
          </svg>
          <span>Unclear</span>
        </span>
      );
  }
};
