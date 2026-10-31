import React from 'react';
import { TimelineEntry, Post } from '../types';
import { EffectPill } from './EffectPill';
import { SourceButton } from './SourceButton';

interface TimelineProps {
  entries: TimelineEntry[];
  posts?: Post[];
}

export const Timeline: React.FC<TimelineProps> = ({ entries, posts }) => {
  return (
    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-mint-deep">
      {entries.map((entry, idx) => (
        <div key={idx} className="relative">
          {/* Accent dot on the line */}
          <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-ivory border-2 border-accent flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
              {entry.date} · PR #{entry.pr_number}
            </span>
            {entry.effect && <EffectPill effect={entry.effect} />}
          </div>

          <div className="text-[15px] text-ink leading-relaxed flex flex-wrap items-center gap-2">
            <span>{entry.text.text}</span>
            {entry.text.evidence_ids.map((eid) => (
              <SourceButton key={eid} evidenceId={eid} posts={posts} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
