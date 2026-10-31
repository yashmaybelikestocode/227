import React from 'react';

interface ScoreCardProps {
  accuracyPercent: number;
  precisionPercent: number;
  officialCount: number;
  foundCount: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  accuracyPercent,
  precisionPercent,
  officialCount,
  foundCount,
}) => {
  return (
    <div
      className="p-6 bg-surface border-2 border-mint-deep rounded-card shadow-sm space-y-4"
      data-testid="score-card"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accuracy */}
        <div className="p-4 bg-white border border-line rounded-card space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-muted font-bold">
              Accuracy
            </span>
            <span className="text-xs text-accent font-semibold">
              {foundCount} of {officialCount} found
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-accent" data-testid="accuracy-score">
            Accuracy {accuracyPercent}%
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Measures how many decisions from the maintainers&apos; ground truth list were successfully identified by Cypher.
          </p>
        </div>

        {/* Precision */}
        <div className="p-4 bg-white border border-line rounded-card space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-muted font-bold">
              Precision
            </span>
            <span className="text-xs text-muted font-semibold">
              Relevance rate
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-ink" data-testid="precision-score">
            Precision {precisionPercent}%
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Measures the proportion of Cypher&apos;s discovered decisions that matched maintainer criteria. Other items are often valid decisions maintainers omitted.
          </p>
        </div>
      </div>

      <div className="p-3 bg-mint-soft border border-mint-deep/60 rounded-btn text-xs text-ink leading-relaxed">
        Found {foundCount} of {officialCount} maintainers&apos; ideas with verified source quotes.
      </div>
    </div>
  );
};
