import React, { useState } from 'react';
import type { CodeThread, LaterNote, Decision, Comment, Statement, Person } from '../types';
import { StatusPill } from './StatusPill';
import { EffectPill } from './EffectPill';
import { SourceChip } from './SourceChip';

export const LaterNoteBox: React.FC<{
  note: LaterNote;
  comments: Comment[];
  statements: Statement[];
  people: Person[];
}> = ({ note, comments, statements, people }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="my-3 p-3.5 bg-surface border border-line rounded-[10px] space-y-2 text-sm"
      data-testid="later-note-box"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <EffectPill effect={note.effect} />
        <span className="font-bold text-ink">{note.title}</span>
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p className="text-muted text-xs leading-relaxed flex-1">
          {note.explanation.text} (PRs {note.pr_numbers.map((n) => `#${n}`).join(', ')})
        </p>
        {note.explanation.statement_ids.length > 0 && (
          <SourceChip
            statementId={note.explanation.statement_ids[0]}
            comments={comments}
            statements={statements}
            people={people}
          />
        )}
      </div>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          Read more
        </button>
      ) : (
        <div className="pt-2 border-t border-line/60 space-y-2 text-xs">
          <p className="text-ink">
            This change was originally introduced in PR #{note.pr_numbers[0]}, but team reviews later concluded that health check endpoints must fail fast instead of retrying, prompting PR #{note.pr_numbers[1]} to reverse the behavior.
          </p>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs font-semibold text-muted hover:underline"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
};

export const ThreadNote: React.FC<{
  thread: CodeThread;
  decisions: Decision[];
  comments: Comment[];
  statements: Statement[];
  people: Person[];
}> = ({ thread, decisions, comments, statements, people }) => {
  const matchedDecisions = thread.decision_ids
    .map((id) => decisions.find((d) => d.id === id))
    .filter((d): d is Decision => Boolean(d));

  return (
    <div
      className="my-3 p-4 bg-ivory border-[1.5px] border-mint-deep border-l-[5px] border-l-accent rounded-[10px] space-y-4 shadow-sm"
      data-testid={`thread-note-${thread.id}`}
    >
      {/* Title */}
      <h3 className="font-serif font-semibold text-base text-ink">
        Why is this code written this way?
      </h3>

      {/* "In short" line with mint background and source chip */}
      <div className="p-3 bg-mint rounded-btn flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
        <span className="text-ink font-medium leading-relaxed">
          <strong className="font-bold mr-1">In short:</strong>
          {thread.in_short.text}
        </span>
        {thread.in_short.statement_ids.length > 0 && (
          <div className="shrink-0">
            <SourceChip
              statementId={thread.in_short.statement_ids[0]}
              comments={comments}
              statements={statements}
              people={people}
            />
          </div>
        )}
      </div>

      {/* Old path line if discussed when file was at older path */}
      {thread.discussed_at_path && (
        <div
          className="px-2.5 py-1 bg-white border border-line rounded-btn text-xs text-muted font-mono"
          data-testid="thread-old-path-line"
        >
          Discussed when this file was at <strong className="text-ink">{thread.discussed_at_path}</strong>
        </div>
      )}

      {/* What the team decided */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
          What the team decided
        </h4>
        <div className="space-y-2">
          {matchedDecisions.map((dec) => (
            <div
              key={dec.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-surface border border-line rounded-md text-xs"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill status={dec.status} className="text-xs py-0.5 px-2" />
                <span className="font-semibold text-ink">{dec.title}</span>
                {dec.later_changes.map((lc, idx) => (
                  <EffectPill key={idx} effect={lc.effect} prNumber={lc.pr_number} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted">{dec.reason.text}</span>
                {dec.reason.statement_ids.map((sid) => (
                  <SourceChip
                    key={sid}
                    statementId={sid}
                    comments={comments}
                    statements={statements}
                    people={people}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs text-muted">
        <span>
          Well supported: based on {thread.based_on} statements. {thread.left_out} left out.
        </span>
      </div>
    </div>
  );
};
