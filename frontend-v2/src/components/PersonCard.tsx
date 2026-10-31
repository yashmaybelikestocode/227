import React from 'react';
import { Link } from 'react-router-dom';
import { PersonSummary } from '../types';

interface PersonCardProps {
  person: PersonSummary;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const initials = getInitials(person.author);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-line last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-mint text-ink font-semibold text-xs flex items-center justify-center flex-shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          to={`/people/${encodeURIComponent(person.author)}`}
          className="font-medium text-sm text-ink hover:text-accent hover:underline block truncate"
        >
          {person.author}
        </Link>
        <div className="text-xs text-muted truncate">{person.role}</div>
      </div>
    </div>
  );
};
