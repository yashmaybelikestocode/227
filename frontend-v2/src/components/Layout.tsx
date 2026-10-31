import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PageHeader } from './PageHeader';
import { OriginalCommentPanel } from './OriginalCommentPanel';
import { CommentPanelProvider } from '../context/CommentPanelContext';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CommentPanelProvider>
      <div className="min-h-screen bg-ivory text-ink flex">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-[248px] flex flex-col min-h-screen min-w-0">
          <PageHeader
            currentProject="acme/httpcache"
            onOpenMenu={() => setSidebarOpen(true)}
          />

          <main className="flex-1 bg-ivory p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        {/* Original Comment Slide-in Panel */}
        <OriginalCommentPanel />
      </div>
    </CommentPanelProvider>
  );
};
