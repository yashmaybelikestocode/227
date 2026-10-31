import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemDef {
  label: string;
  to: string;
  icon: (active: boolean) => React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [logoFailed, setLogoFailed] = useState(false);

  const exploreItems: NavItemDef[] = [
    {
      label: 'Start',
      to: '/',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Activity',
      to: '/activity',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'People',
      to: '/people',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Hot spots',
      to: '/hotspots',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
    },
    {
      label: 'Code',
      to: '/code',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      label: 'Pull requests',
      to: '/pulls',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="3" strokeWidth={2} />
          <circle cx="6" cy="18" r="3" strokeWidth={2} />
          <circle cx="18" cy="9" r="3" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9v6M18 12v3a3 3 0 01-3 3H9" />
        </svg>
      ),
    },
  ];

  const toolItems: NavItemDef[] = [
    {
      label: 'Check an idea',
      to: '/check',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Evaluate',
      to: '/evaluate',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Saved',
      to: '/saved',
      icon: (active) => (
        <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/20 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar-nav"
        className={`fixed top-0 bottom-0 left-0 w-[248px] bg-mint-soft border-r border-line z-40 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Wordmark */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-line">
            {!logoFailed && (
              <img
                src="/logo.png"
                alt=""
                className="h-10 w-auto"
                onError={() => setLogoFailed(true)}
              />
            )}
            <span className="font-serif text-[22px] font-semibold text-ink tracking-tight">Cypher</span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-6" aria-label="Main Navigation">
            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Explore
              </div>
              <ul className="space-y-0.5">
                {exploreItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 h-[44px] px-3 rounded-btn text-[15px] transition-colors ${
                          isActive
                            ? 'bg-mint text-ink font-semibold border-l-[3px] border-accent pl-[9px]'
                            : 'text-ink hover:bg-mint/50 font-normal'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {item.icon(isActive)}
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Tools
              </div>
              <ul className="space-y-0.5">
                {toolItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 h-[44px] px-3 rounded-btn text-[15px] transition-colors ${
                          isActive
                            ? 'bg-mint text-ink font-semibold border-l-[3px] border-accent pl-[9px]'
                            : 'text-ink hover:bg-mint/50 font-normal'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {item.icon(isActive)}
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line space-y-2">
          <NavLink
            to="/help"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 h-[40px] px-3 rounded-btn text-[14px] transition-colors ${
                isActive
                  ? 'bg-mint text-ink font-semibold border-l-[3px] border-accent pl-[9px]'
                  : 'text-muted hover:text-ink hover:bg-mint/50'
              }`
            }
          >
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Help</span>
          </NavLink>
          <div className="px-3 text-[12px] text-muted leading-tight">
            Read-only. Nothing is posted to GitHub.
          </div>
        </div>
      </aside>
    </>
  );
};
