import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusPill } from '../components/StatusPill';
import { EffectPill } from '../components/EffectPill';

export const HelpPage: React.FC = () => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Help & Concepts" />

      {/* Top logo display */}
      <div className="p-6 bg-white border border-line rounded-card shadow-sm flex items-center gap-4">
        {!logoFailed ? (
          <img
            src="/logo-with-text.png"
            alt="Cypher"
            width={120}
            onError={() => setLogoFailed(true)}
            className="h-auto max-h-12 object-contain"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-mint-deep text-accent font-serif font-black text-xl flex items-center justify-center border border-accent/20">
              C
            </span>
            <span className="font-serif font-black tracking-tight text-xl text-ink">
              CYPHER
            </span>
          </div>
        )}
        <div className="border-l border-line pl-4">
          <p className="text-sm font-serif font-semibold text-ink">
            Documentation & Decision Guide
          </p>
          <p className="text-xs text-muted">
            Learn how Cypher uncovers, verifies, and connects the reasoning behind your codebase.
          </p>
        </div>
      </div>

      {/* Section 1: Label Mapping */}
      <div className="bg-white border border-line rounded-card p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-serif font-bold text-ink border-b border-line pb-2">
          Decision Labels
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          Every decision identified by Cypher is categorized into one of four verified statuses. An icon and clear label are always presented together so meaning is never communicated by color alone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Decided */}
          <div className="p-4 bg-surface border border-line rounded-card space-y-2">
            <div className="flex items-center gap-2">
              <StatusPill status="accepted" />
            </div>
            <p className="text-xs text-ink leading-relaxed">
              <strong>Decided:</strong> The team explicitly agreed to adopt this proposal or approach in code.
            </p>
          </div>

          {/* Decided against */}
          <div className="p-4 bg-surface border border-line rounded-card space-y-2">
            <div className="flex items-center gap-2">
              <StatusPill status="rejected" />
            </div>
            <p className="text-xs text-ink leading-relaxed">
              <strong>Decided against:</strong> The team discussed this option and deliberately chose not to do it, noting why.
            </p>
          </div>

          {/* Postponed */}
          <div className="p-4 bg-surface border border-line rounded-card space-y-2">
            <div className="flex items-center gap-2">
              <StatusPill status="deferred" />
            </div>
            <p className="text-xs text-ink leading-relaxed">
              <strong>Postponed:</strong> The idea has merit, but the team agreed to wait until specific criteria or scale demands it.
            </p>
          </div>

          {/* Still open */}
          <div className="p-4 bg-surface border border-line rounded-card space-y-2">
            <div className="flex items-center gap-2">
              <StatusPill status="unresolved" />
            </div>
            <p className="text-xs text-ink leading-relaxed">
              <strong>Still open:</strong> Discussions remain active without a definitive conclusion or consensus yet.
            </p>
          </div>
        </div>

        {/* Later Changes */}
        <div className="pt-4 border-t border-line space-y-3">
          <h3 className="font-serif font-semibold text-sm text-ink">
            Later-Change Effects
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Software evolves over time. When a subsequent pull request alters an earlier agreement, Cypher flags it with a later-change tag:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 p-3 bg-surface border border-line rounded-btn flex-1 text-xs">
              <EffectPill effect="modified" prNumber={260} />
              <span className="text-muted">Parameters, constraints, or bounds updated in a later PR.</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-surface border border-line rounded-btn flex-1 text-xs">
              <EffectPill effect="reversed" prNumber={231} />
              <span className="text-muted">The earlier decision was reversed or retired in a later PR.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Statements & Quotes */}
      <div className="bg-white border border-line rounded-card p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-serif font-bold text-ink border-b border-line pb-2">
          Statements &amp; Source Chips
        </h2>
        <div className="space-y-3 text-xs text-ink leading-relaxed">
          <p>
            <strong>What is a statement?</strong> A statement is one distinct sentence or idea from a pull request comment, issue discussion, review note, or commit message. Each statement preserves its author, exact date, and GitHub comment ID.
          </p>
          <p>
            <strong>What is a source chip?</strong> Source chips appear alongside decisions and claims (e.g. <span className="inline-flex px-2 py-0.5 font-medium text-accent bg-mint-soft border border-mint-deep rounded text-[11px]">Priya, 14 Mar</span>). Clicking any source chip opens the side panel displaying the complete original comment, highlighting the exact character slice that proves the statement.
          </p>
          <p>
            <strong>Why are some statements left out?</strong> Cypher never invents evidence. If a comment was merely an emoji reaction, could not be quoted verbatim, or was edited after extraction, it is placed in the &ldquo;Left out&rdquo; audit log with a clear reason so nothing is hidden.
          </p>
        </div>
      </div>

      {/* Section 3: File History & People */}
      <div className="bg-white border border-line rounded-card p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-serif font-bold text-ink border-b border-line pb-2">
          Rename Trails &amp; Contributor Merging
        </h2>
        <div className="space-y-4 text-xs text-ink leading-relaxed">
          <div>
            <h3 className="font-serif font-semibold text-sm text-ink mb-1">
              File Rename Trails (&ldquo;Formerly at&rdquo;)
            </h3>
            <p className="text-muted">
              Files are frequently refactored, renamed, or moved across folders. Cypher traces Git commit histories to construct a continuous rename trail. Decisions discussed when a file lived at an old path (such as <code className="font-mono bg-mint-soft px-1 rounded">src/http_retry.py</code>) continue to appear on the modern code file (<code className="font-mono bg-mint-soft px-1 rounded">src/retry.py</code>).
            </p>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-sm text-ink mb-1">
              Identity Merging
            </h3>
            <p className="text-muted">
              Contributors often commit from personal or work emails, comment with GitHub handles, or participate in mailing lists. Cypher combines these three identity facets into a single profile. If any merger is incorrect, maintainers can click &ldquo;Not the same person?&rdquo; to split them instantly with an Undo option.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
