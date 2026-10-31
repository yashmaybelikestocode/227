import React, { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PageHeader } from './PageHeader';
import { OriginalCommentPanel } from './OriginalCommentPanel';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { id } = useParams<{ id?: string }>();

  return (
    <div className="min-h-screen bg-ivory text-ink flex flex-col font-sans">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        analysisId={id || 'httpcache-analysis'}
      />

      <div className="min-[1100px]:ml-[248px] flex-1 flex flex-col min-w-0">
        <PageHeader
          currentProject="acme/httpcache"
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8 max-w-[1240px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <OriginalCommentPanel />
    </div>
  );
};
