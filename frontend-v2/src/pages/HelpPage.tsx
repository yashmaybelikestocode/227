import React, { useState } from 'react';
import { StatusPill } from '../components/StatusPill';
import { EffectPill } from '../components/EffectPill';

export const HelpPage: React.FC = () => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-10">
      {/* Header & Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
            Help & guide
          </h1>
          <p className="text-muted text-[15px] mt-1">
            Understanding Cypher’s labels, evidence sources, and reading views.
          </p>
        </div>

        {!logoFailed && (
          <img
            src="/logo-with-text.png"
            alt="Cypher"
            className="w-[120px] h-auto flex-shrink-0"
            onError={() => setLogoFailed(true)}
          />
        )}
      </div>

      {/* Decision Status Labels */}
      <section className="bg-surface rounded-card border border-line p-6 space-y-4">
        <h2 className="font-serif text-[20px] font-semibold text-ink">
          Decision statuses
        </h2>
        <div className="space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-[160px] flex-shrink-0">
              <StatusPill status="accepted" />
            </div>
            <p className="text-muted">
              The team approved this approach and merged it into the project.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-[160px] flex-shrink-0">
              <StatusPill status="rejected" />
            </div>
            <p className="text-muted">
              The team considered this proposal and explicitly decided against it, with stated reasons.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-[160px] flex-shrink-0">
              <StatusPill status="deferred" />
            </div>
            <p className="text-muted">
              The team postponed this idea until later, waiting for more data, traffic, or experience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-[160px] flex-shrink-0">
              <StatusPill status="unresolved" />
            </div>
            <p className="text-muted">
              The discussion was left unresolved or remains open without a definitive consensus.
            </p>
          </div>
        </div>
      </section>

      {/* Later-change effects */}
      <section className="bg-surface rounded-card border border-line p-6 space-y-4">
        <h2 className="font-serif text-[20px] font-semibold text-ink">
          Later-change effects
        </h2>
        <div className="space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-[160px] flex-shrink-0">
              <EffectPill effect="modified" />
            </div>
            <p className="text-muted">
              A subsequent pull request adjusted or tuned the original design parameters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-[160px] flex-shrink-0">
              <EffectPill effect="reversed" />
            </div>
            <p className="text-muted">
              A subsequent pull request completely undone or removed the previous implementation.
            </p>
          </div>
        </div>
      </section>

      {/* Confidence Levels */}
      <section className="bg-surface rounded-card border border-line p-6 space-y-4">
        <h2 className="font-serif text-[20px] font-semibold text-ink">
          Confidence levels
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-bold text-accent">Well supported: </span>
            <span className="text-muted">
              Every sentence in the summary is directly backed by cited words written by contributors.
            </span>
          </div>
          <div>
            <span className="font-bold text-accent">Partly supported: </span>
            <span className="text-muted">
              Core points are verified, but some historical background lacked direct comment proof.
            </span>
          </div>
          <div>
            <span className="font-bold text-accent">Weakly supported: </span>
            <span className="text-muted">
              Sparse comment records or incomplete discussion trails.
            </span>
          </div>
        </div>
      </section>

      {/* How to read a source button */}
      <section className="bg-surface rounded-card border border-line p-6 space-y-3">
        <h2 className="font-serif text-[20px] font-semibold text-ink">
          How to read a source button
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Source buttons appear next to statements as small green chips, for example{' '}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium text-accent bg-mint-soft border border-mint-deep rounded-btn">
            Priya, 14 Mar
          </span>
          . The label indicates the first name of the author and the date they posted.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Clicking any source button slides out the <strong>original comment panel</strong> from the right edge, highlighting the exact sentence that proves the statement. Sentence highlighting is driven strictly by underlying data IDs, never fragile text matching.
        </p>
      </section>

      {/* Easy and Detailed switch */}
      <section className="bg-surface rounded-card border border-line p-6 space-y-3">
        <h2 className="font-serif text-[20px] font-semibold text-ink">
          Easy and Detailed switch
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          At the top right of each answer, you can toggle between <strong>Easy</strong> and <strong>Detailed</strong> view.
        </p>
        <ul className="list-disc list-inside text-sm text-muted space-y-1.5 pl-2">
          <li><strong>Easy:</strong> Shows the quick summary, one-line decision reasons, and the evolution timeline.</li>
          <li><strong>Detailed:</strong> Additionally displays individual contributor stances (who supported or opposed each option) and verbatim quote cards for each source.</li>
        </ul>
      </section>
    </div>
  );
};
