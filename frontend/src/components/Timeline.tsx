import React from "react";
import { Post, TimelineEntry } from "../types";
import { EffectPill } from "./EffectPill";
import { SourceButton } from "./SourceButton";

interface TimelineProps {
  entries: TimelineEntry[];
  posts: Post[];
  title?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ entries, posts, title = "How it changed over time" }) => {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="border border-line rounded-[12px] p-5 bg-white">
      {title && (
        <h3 className="font-serif text-[20px] font-semibold text-midnight mb-4">
          {title}
        </h3>
      )}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blush-deep">
        {entries.map((entry, index) => (
          <div key={index} className="relative">
            {/* Navy dot */}
            <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-navy border-2 border-white" />

            {/* Header: Date + PR number + Effect */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted font-mono">
                {entry.date} · PR #{entry.pr_number}
              </span>
              {entry.effect && <EffectPill effect={entry.effect} />}
            </div>

            {/* Content with source button */}
            <div className="text-sm text-midnight flex flex-wrap items-center gap-2">
              <span>{entry.text.text}</span>
              {entry.text.evidence_ids && entry.text.evidence_ids.length > 0 && (
                <div className="inline-flex items-center gap-1">
                  {entry.text.evidence_ids.map((id) => (
                    <SourceButton key={id} evidenceId={id} posts={posts} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
