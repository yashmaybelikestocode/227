import React from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  currentProject?: string;
  onOpenMenu: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ currentProject = 'acme/httpcache', onOpenMenu }) => {
  return (
    <header className="h-[56px] bg-ivory border-b border-line px-6 flex items-center justify-between sticky top-0 z-30 no-print">
      <div className="flex items-center gap-3">
        {/* Mobile / Tablet Menu Button (visible below 1100px) */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          aria-expanded={false}
          aria-controls="sidebar-nav"
          className="lg:hidden p-2 text-ink hover:bg-mint-soft rounded-btn border border-line"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Project chip */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-mint text-ink text-xs font-mono font-medium hover:bg-mint-deep transition-colors"
          title="Switch or view project details"
        >
          <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>{currentProject}</span>
        </Link>
      </div>

      <div className="text-xs text-muted font-medium">
        Signed in as <span className="text-ink font-semibold">Priya</span> · read-only
      </div>
    </header>
  );
};
