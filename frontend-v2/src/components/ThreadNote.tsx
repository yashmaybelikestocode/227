import React, { useState } from 'react';
import { LineThread, LaterNote } from '../types';
import { StatusPill } from './StatusPill';
import { EffectPill } from './EffectPill';
import { SourceButton } from './SourceButton';

interface ThreadNoteProps {
  thread?: LineThread;
  laterNote?: LaterNote;
}

export const ThreadNote: React.FC<ThreadNoteProps> = ({ thread, laterNote }) => {
  const [isFoldedExpanded, setIsFoldedExpanded] = useState(false);

  // If there's a reversed later note and no main thread, or as folded block
  if (laterNote && laterNote.effect === 'reversed' && !isFoldedExpanded && !thread) {
    return (
      <div className="my-3 p-3.5 bg-ivory border-[1.5px] border-mint-deep border-l-[5px] border-l-brick rounded-[10px]">
        <div className="flex items-center gap-2 mb-1.5">
          <EffectPill effect="reversed" />
          <span className="font-semibold text-ink text-sm">{laterNote.title}</span>
        </div>
        <p className="text-muted text-xs leading-relaxed mb-2">
          {laterNote.explanation.text}{' '}
          <span className="font-mono text-ink">
            ({laterNote.pr_numbers.map((n) => `PR #${n}`).join(', ')})
          </span>
        </p>
        <button
          type="button"
          onClick={() => setIsFoldedExpanded(true)}
          className="text-xs text-accent font-semibold hover:underline"
        >
          Read more
        </button>
      </div>
    );
  }

  if (!thread && !laterNote) return null;

  return (
    <div className="my-4 bg-ivory border-[1.5px] border-mint-deep border-l-[5px] border-l-accent rounded-[10px] p-4 text-ink shadow-none">
      <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
        Why is this code written this way?
      </h3>

      {thread && (
        <>
          {/* In short line */}
          <div className="bg-mint p-2.5 rounded-btn mb-4 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-ink">
              <strong className="text-accent mr-1">In short:</strong> {thread.in_short.text}
            </span>
            {thread.in_short.evidence_ids.map((eid) => (
              <SourceButton key={eid} evidenceId={eid} posts={thread.posts} />
            ))}
          </div>

          {/* What the team decided */}
          <div className="mb-4">
            <div className="text-xs uppercase font-semibold text-muted tracking-wider mb-2">
              What the team decided
            </div>
            <div className="space-y-2">
              {thread.decisions.map((dec) => (
                <div key={dec.id} className="flex items-center gap-3 text-sm">
                  <StatusPill status={dec.status} />
                  <span className="text-ink flex-1">{dec.approach}</span>
                  {dec.why.evidence_ids.map((eid) => (
                    <SourceButton key={eid} evidenceId={eid} posts={thread.posts} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* The story of these lines timeline */}
          <div className="mb-4">
            <div className="text-xs uppercase font-semibold text-muted tracking-wider mb-2">
              The story of these lines
            </div>
            <div className="space-y-2 border-l-2 border-mint-deep pl-3 ml-1 text-xs">
              {thread.story.map((entry, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">
                      {entry.date} (PR #{entry.pr_number})
                    </span>
                    {i === 1 && (
                      <span className="px-1.5 py-0.2 bg-mint text-accent text-[11px] rounded-pill font-semibold">
                        this version
                      </span>
                    )}
                    {entry.effect && <EffectPill effect={entry.effect} />}
                  </div>
                  <div className="text-muted text-[13px] mt-0.5">{entry.text.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer confidence */}
          <div className="pt-2 border-t border-line text-xs text-muted">
            Well supported: based on {thread.based_on_comments} comments. {thread.left_out} statements left out.
          </div>
        </>
      )}

      {laterNote && laterNote.effect === 'reversed' && isFoldedExpanded && (
        <div className="mt-4 pt-4 border-t border-line">
          <div className="flex items-center gap-2 mb-2">
            <EffectPill effect="reversed" />
            <span className="font-semibold text-ink text-sm">{laterNote.title}</span>
          </div>
          <div className="text-muted text-xs leading-relaxed flex items-center gap-2">
            <span>{laterNote.explanation.text}</span>
            {laterNote.explanation.evidence_ids.map((eid) => (
              <SourceButton key={eid} evidenceId={eid} posts={thread?.posts} />
            ))}
          </div>
          <div className="text-xs font-mono text-muted mt-1">
            Reversed in PR #{laterNote.pr_numbers[1]} (introduced in PR #{laterNote.pr_numbers[0]})
          </div>
        </div>
      )}
    </div>
  );
};
