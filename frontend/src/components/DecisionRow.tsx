import React from "react";
import { Decision, Post } from "../types";
import { StatusPill } from "./StatusPill";
import { SourceButton } from "./SourceButton";

interface DecisionRowProps {
  decision: Decision;
  posts: Post[];
}

export const DecisionRow: React.FC<DecisionRowProps> = ({ decision, posts }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-3.5 border-b border-line last:border-b-0">
      {/* Fixed 150px column for the status pill */}
      <div className="w-[150px] flex-shrink-0 pt-0.5">
        <StatusPill status={decision.status} />
      </div>

      {/* Decision content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-midnight text-sm">
          {decision.approach}
        </div>
        <div className="text-xs text-muted mt-1 leading-relaxed flex flex-wrap items-center gap-2">
          <span>{decision.why.text}</span>
          <div className="inline-flex items-center gap-1.5 flex-wrap">
            {decision.why.evidence_ids.map((id) => (
              <SourceButton key={id} evidenceId={id} posts={posts} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
