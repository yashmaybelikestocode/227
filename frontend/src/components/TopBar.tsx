import React from "react";
import { NavLink } from "react-router-dom";

export const TopBar: React.FC = () => {
  const navItems = [
    { name: "Start", path: "/" },
    { name: "Code", path: "/code" },
    { name: "Pull requests", path: "/pulls" },
    { name: "Check an idea", path: "/check" },
    { name: "Evaluate", path: "/evaluate" },
    { name: "Help", path: "/help" },
  ];

  return (
    <header className="h-[64px] bg-white border-b border-line px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-8">
        <NavLink to="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-[6px]">
          <img
            src="/logo.png"
            alt=""
            className="h-[38px] w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <span className="font-serif text-[22px] font-semibold text-midnight tracking-tight">
            Cypher
          </span>
        </NavLink>

        {/* Navigation */}
        <nav className="flex items-center space-x-1" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `relative px-3.5 py-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-[4px] ${
                  isActive
                    ? "font-semibold text-midnight after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[3px] after:bg-blush-deep"
                    : "text-muted hover:text-midnight font-normal"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right status */}
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="px-2.5 py-1 bg-mist border border-line rounded-full font-mono text-[11px] text-midnight">
          acme/httpcache
        </span>
        <span className="hidden sm:inline">
          Signed in as Priya · read-only
        </span>
      </div>
    </header>
  );
};
