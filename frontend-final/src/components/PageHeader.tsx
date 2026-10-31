import React from 'react';
import { Link } from 'react-router-dom';
import { DataSourceChip } from './DataSourceChip';

interface PageHeaderProps {
  currentProject?: string;
  onOpenMenu?: () => void;
  title?: string;
  repo?: string;
  projectChipLabel?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  currentProject,
  onOpenMenu,
  title,
  projectChipLabel,
}) => {
  const displayProject = projectChipLabel || currentProject || 'acme/httpcache';

  // If title is passed, render a page title section
  if (title) {
    return (
      <div className="space-y-1">
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-ink">
          {title}
        </h1>
      </div>
    );
  }

  return (
    <header className="h-[56px] px-6 bg-ivory border-b border-line flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className="min-[1100px]:hidden p-1.5 text-ink hover:bg-mint rounded-btn border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="sr-only">Menu</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Project chip */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-mint-soft hover:bg-mint border border-mint-deep text-ink text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Chosen project. Click to go to Start"
        >
          <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="font-mono text-xs font-semibold">{displayProject}</span>
        </Link>
        <DataSourceChip />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted">
        <span>
          Signed in as <strong className="font-semibold text-ink">Yash</strong> · read-only
        </span>
      </div>
    </header>
  );
};
