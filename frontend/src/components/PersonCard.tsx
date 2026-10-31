import React from "react";
import { PersonSummary } from "../types";

interface PersonCardProps {
  person: PersonSummary;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-line last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-mist border border-line text-navy font-medium text-xs flex items-center justify-center flex-shrink-0">
        {getInitials(person.author)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-midnight truncate">
          {person.author}
        </div>
        <div className="text-xs text-muted truncate">
          {person.role}
        </div>
      </div>
    </div>
  );
};
