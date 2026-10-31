import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Person } from '../types';

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export const IdentityList: React.FC<{ identities: Person['identities'] }> = ({ identities }) => {
  return (
    <div className="space-y-2 text-xs" data-testid="identity-list">
      {identities.map((id, index) => (
        <div
          key={index}
          className="p-2.5 bg-mint-soft/80 border border-mint-deep/60 rounded-btn flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          data-testid={`identity-item-${id.kind}`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-neutral text-ink">
              {id.kind.replace('_', ' ')}
            </span>
            <span className="font-mono font-medium text-ink">{id.value}</span>
          </div>
          <span className="text-muted italic">{id.merged_because}</span>
        </div>
      ))}
    </div>
  );
};

export const PersonRow: React.FC<{ person: Person }> = ({ person }) => {
  const [expanded, setExpanded] = useState(false);

  const commitEmail = person.identities.find((i) => i.kind === 'commit_email')?.value || '—';
  const githubLogin = person.identities.find((i) => i.kind === 'github_login')?.value || '—';
  const otherHandle = person.identities.find((i) => i.kind === 'other_handle')?.value || '—';

  return (
    <>
      <tr
        className="hover:bg-mint-soft transition-colors cursor-pointer border-b border-line"
        data-testid={`person-row-${person.id}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-mint-deep text-ink text-xs font-semibold flex items-center justify-center shrink-0">
              {getInitials(person.display_name)}
            </div>
            <Link
              to={`/people/${person.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-accent hover:underline"
            >
              {person.display_name}
            </Link>
          </div>
        </td>
        <td className="py-3 px-4 font-mono text-xs text-ink/80">{commitEmail}</td>
        <td className="py-3 px-4 font-mono text-xs text-ink/80">@{githubLogin}</td>
        <td className="py-3 px-4 font-mono text-xs text-ink/80">{otherHandle}</td>
        <td className="py-3 px-4 text-center font-mono text-xs">{person.commits}</td>
        <td className="py-3 px-4 text-center font-mono text-xs">{person.comments}</td>
        <td className="py-3 px-4 text-xs text-muted">
          {new Date(person.first_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} –{' '}
          {new Date(person.last_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>
        <td className="py-3 px-4">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="px-2.5 py-1 text-[11px] font-semibold bg-mint text-accent rounded-full border border-mint-deep hover:bg-mint-deep/30 transition-colors"
            data-testid={`merged-chip-${person.id}`}
          >
            Merged from {person.identities.length} names
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-mint-soft/50 border-b border-line" data-testid={`identity-expansion-${person.id}`}>
          <td colSpan={8} className="p-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                Identities merged into {person.display_name}
              </span>
              <IdentityList identities={person.identities} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
