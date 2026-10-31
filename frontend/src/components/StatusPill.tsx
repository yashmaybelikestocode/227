import React from "react";
import { DecisionStatus } from "../types";

interface StatusPillProps {
  status: DecisionStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = "" }) => {
  switch (status) {
    case "accepted":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-navy text-white shadow-none ${className}`}
          data-testid="status-pill-accepted"
        >
          {/* Check mark icon */}
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Decided</span>
        </span>
      );
    case "rejected":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose text-white shadow-none ${className}`}
          data-testid="status-pill-rejected"
        >
          {/* Cross icon */}
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Decided against</span>
        </span>
      );
    case "deferred":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-postponed-bg text-postponed-text shadow-none ${className}`}
          data-testid="status-pill-deferred"
        >
          {/* Clock icon */}
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
          <span>Postponed</span>
        </span>
      );
    case "unresolved":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutralBadge-bg text-neutralBadge-text shadow-none ${className}`}
          data-testid="status-pill-unresolved"
        >
          {/* Question mark icon */}
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
          </svg>
          <span>Still open</span>
        </span>
      );
  }
};
