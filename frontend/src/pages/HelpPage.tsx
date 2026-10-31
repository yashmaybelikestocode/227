import React from "react";
import { StatusPill } from "../components/StatusPill";
import { EffectPill } from "../components/EffectPill";

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-[840px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-[32px] font-semibold text-midnight tracking-tight">
          Help & Guide
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed max-w-[70ch]">
          Cypher helps you understand why code was written the way it was by explaining discussions in pull requests and issues.
        </p>
      </div>

      <div className="space-y-8">
        {/* Status labels */}
        <section className="border border-line rounded-[12px] p-6 bg-white space-y-4">
          <h2 className="font-serif text-[20px] font-semibold text-midnight">
            Decision status labels
          </h2>
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex items-start gap-4">
              <div className="w-[150px] flex-shrink-0">
                <StatusPill status="accepted" />
              </div>
              <p className="text-muted">
                <strong className="text-midnight">Decided:</strong> The team agreed on this approach and implemented it in the repository.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-[150px] flex-shrink-0">
                <StatusPill status="rejected" />
              </div>
              <p className="text-muted">
                <strong className="text-midnight">Decided against:</strong> An approach proposed or considered during discussion that the team explicitly chose not to adopt.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-[150px] flex-shrink-0">
                <StatusPill status="deferred" />
              </div>
              <p className="text-muted">
                <strong className="text-midnight">Postponed:</strong> The idea was considered worthwhile, but shelved until future metrics, traffic, or dependencies warrant it.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-[150px] flex-shrink-0">
                <StatusPill status="unresolved" />
              </div>
              <p className="text-muted">
                <strong className="text-midnight">Still open:</strong> A question or alternative brought up that concluded without a definitive decision.
              </p>
            </div>
          </div>
        </section>

        {/* Later change effects */}
        <section className="border border-line rounded-[12px] p-6 bg-white space-y-4">
          <h2 className="font-serif text-[20px] font-semibold text-midnight">
            Later changes
          </h2>
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex items-start gap-4">
              <div className="w-[150px] flex-shrink-0">
                <EffectPill effect="modified" />
              </div>
              <p className="text-muted">
                <strong className="text-midnight">Adjusted later:</strong> A subsequent pull request modified parameters, thresholds, or details of this decision.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-[150px] flex-shrink-0">
                <EffectPill effect="reversed" />
              </div>
              <p className="text-muted">
                <strong className="text-midnight">Undone later:</strong> A subsequent pull request completely reverted or removed the code or decision.
              </p>
            </div>
          </div>
        </section>

        {/* Evidence & Confidence */}
        <section className="border border-line rounded-[12px] p-6 bg-white space-y-4">
          <h2 className="font-serif text-[20px] font-semibold text-midnight">
            How to read a source button
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Every statement Cypher shows is backed by traceable evidence. Source buttons are labelled with the comment author's first name and date, such as <span className="font-medium text-navy">Priya, 14 Mar</span>.
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Clicking any source button slides open the original comment panel from the right, showing the full comment text with the cited sentence highlighted. Highlighting is driven by exact sentence identifiers in the data, never by fuzzy text search.
          </p>
          <div className="pt-2">
            <div className="font-semibold text-navy text-xs mb-1">Confidence ratings:</div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted">
              <li><strong className="text-midnight">Well supported:</strong> Verified by direct comment quotes from multiple participants or the author.</li>
              <li><strong className="text-midnight">Partly supported:</strong> Mentioned in discussion but with limited context or single comment.</li>
              <li><strong className="text-midnight">Weakly supported:</strong> Inferred with lower direct evidence; check the original source carefully.</li>
            </ul>
          </div>
        </section>

        {/* Footer logo */}
        <div className="pt-4 flex flex-col items-center justify-center gap-2 text-center">
          <img
            src="/logo-with-text.png"
            alt=""
            className="w-[120px] max-w-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <p className="text-xs text-muted">
            Cypher · Explaining open-source decisions in plain English
          </p>
        </div>
      </div>
    </div>
  );
};
