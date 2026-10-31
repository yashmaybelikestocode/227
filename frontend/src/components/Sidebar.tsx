import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  analysisId = 'httpcache-analysis',
}) => {
  const location = useLocation();

  const exploreLinks = [
    {
      to: '/',
      label: 'Start',
      exact: true,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: `/decisions/${analysisId}`,
      label: 'Decisions',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: `/statements/${analysisId}`,
      label: 'Statements',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      to: '/code',
      label: 'Code',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      to: '/people',
      label: 'People',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const toolsLinks = [
    {
      to: '/evaluate',
      label: 'Blind test',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  const isLinkActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    // Special matching for decisions & statements with analysis id
    if (to.startsWith('/decisions') && location.pathname.startsWith('/decisions')) return true;
    if (to.startsWith('/statements') && location.pathname.startsWith('/statements')) return true;
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/30 z-40 min-[1100px]:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar"
        role="navigation"
        aria-label="Main Navigation"
        className={`fixed top-0 left-0 bottom-0 w-[248px] bg-mint-soft border-r border-line z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full min-[1100px]:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Wordmark Header */}
          <div className="h-[56px] px-4 flex items-center gap-3 border-b border-line/60">
            <img
              src="/logo.png"
              alt=""
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-serif text-[22px] font-semibold text-ink tracking-tight">
              Cypher
            </span>
            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto min-[1100px]:hidden p-1.5 text-muted hover:text-ink rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="py-4 px-2 space-y-6 overflow-y-auto">
            {/* Explore group */}
            <div>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Explore
              </div>
              <ul className="space-y-0.5 mt-1">
                {exploreLinks.map((item) => {
                  const active = isLinkActive(item.to, item.exact);
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`h-[44px] flex items-center gap-3 px-3 rounded-r-md text-[15px] transition-colors ${
                          active
                            ? 'bg-mint font-semibold text-ink border-l-[3px] border-accent pl-[9px]'
                            : 'text-ink/90 hover:bg-mint/60 hover:text-ink'
                        }`}
                      >
                        <span className={active ? 'text-accent' : 'text-muted'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Tools group */}
            <div>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Tools
              </div>
              <ul className="space-y-0.5 mt-1">
                {toolsLinks.map((item) => {
                  const active = isLinkActive(item.to);
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`h-[44px] flex items-center gap-3 px-3 rounded-r-md text-[15px] transition-colors ${
                          active
                            ? 'bg-mint font-semibold text-ink border-l-[3px] border-accent pl-[9px]'
                            : 'text-ink/90 hover:bg-mint/60 hover:text-ink'
                        }`}
                      >
                        <span className={active ? 'text-accent' : 'text-muted'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-line/60 space-y-2 bg-mint-soft">
          <NavLink
            to="/help"
            onClick={onClose}
            aria-current={isLinkActive('/help') ? 'page' : undefined}
            className={`h-[44px] flex items-center gap-3 px-3 rounded-r-md text-[15px] transition-colors ${
              isLinkActive('/help')
                ? 'bg-mint font-semibold text-ink border-l-[3px] border-accent pl-[9px]'
                : 'text-ink/90 hover:bg-mint/60 hover:text-ink'
            }`}
          >
            <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Help</span>
          </NavLink>
          <p className="px-3 text-xs text-muted leading-relaxed">
            Read-only. Nothing is posted to GitHub.
          </p>
        </div>
      </aside>
    </>
  );
};
