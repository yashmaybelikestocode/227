import React, { useState, useEffect } from "react";
import { getEvalResult } from "../api";
import { EvalResult } from "../types";
import { Skeleton } from "../components/Skeleton";

export const EvaluatePage: React.FC = () => {
  const [evalData, setEvalData] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    getEvalResult().then((data) => {
      setEvalData(data);
      setLoading(false);
    });
  }, []);

  if (loading || !evalData) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-serif text-[32px] font-semibold text-midnight tracking-tight">
          Blind test
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed max-w-[70ch]">
          Cypher reads a discussion without the official summary, writes down its findings, then compares them to the official list of rejected ideas.
        </p>
      </div>

      {/* Step 1: Findings saved */}
      <div className="border border-line rounded-[12px] p-6 bg-white mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
            1
          </span>
          <h2 className="font-serif text-[18px] font-semibold text-midnight">
            Findings saved
          </h2>
        </div>
        <div className="p-3 bg-mist rounded-[8px] font-mono text-xs text-midnight flex flex-wrap items-center justify-between gap-2">
          <span>Snapshot timestamp: {evalData.saved_at}</span>
          <span className="font-bold">Fingerprint: {evalData.fingerprint}</span>
        </div>
        <p className="text-xs text-muted mt-2">
          Saved before the official list was opened.
        </p>
      </div>

      {/* Step 2: Open official list */}
      <div className="border border-line rounded-[12px] p-6 bg-white mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
            2
          </span>
          <h2 className="font-serif text-[18px] font-semibold text-midnight">
            Official benchmark comparison
          </h2>
        </div>

        {!revealed ? (
          <div>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Click below to decrypt the official maintainer-curated list of alternatives and score Cypher's extraction accuracy.
            </p>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="px-6 py-3 bg-navy text-white text-sm font-medium rounded-[8px] hover:bg-navy/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              data-testid="open-official-list-btn"
            >
              Open the official list
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 3 Plain Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-mist rounded-[10px]">
              <div>
                <div className="text-2xl font-serif font-bold text-navy">
                  {evalData.found} of {evalData.official}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Found {evalData.found} of {evalData.official} official ideas
                </div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-midnight">
                  {evalData.listed_official} of {evalData.listed}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Of what Cypher listed, {evalData.listed_official} were official
                </div>
              </div>
            </div>

            {/* Comparison Columns */}
            <div className="border border-line rounded-[10px] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-blush-soft border-b border-line text-midnight font-semibold">
                    <th className="p-3 w-1/2">Official rejected ideas</th>
                    <th className="p-3 w-1/2">What Cypher found</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {evalData.pairs.map((pair, idx) => (
                    <tr key={idx} className="hover:bg-mist/30">
                      <td className="p-3 align-top font-medium text-midnight">
                        {pair.official_idea}
                      </td>
                      <td className="p-3 align-top">
                        {pair.kind === "found" ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-navy text-white">
                              Found
                            </span>
                            <span className="text-midnight">{pair.found_idea}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose text-white">
                              Missed
                            </span>
                            <span className="text-muted italic">Not extracted</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Extras */}
                  {evalData.extras.map((extra, idx) => (
                    <tr key={`extra-${idx}`} className="hover:bg-mist/30 bg-blush-soft/20">
                      <td className="p-3 align-top text-muted italic">
                        (Not on official list)
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-postponed-bg text-postponed-text">
                            Extra
                          </span>
                          <span className="text-midnight">{extra}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note */}
            <div className="p-3 bg-blush-soft border border-dashed border-blush-deep rounded-[8px] text-xs text-muted leading-relaxed">
              These numbers come from a small test and can change with other discussions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
