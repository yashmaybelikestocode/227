import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listPulls } from "../api";
import { PullSummary } from "../types";
import { Skeleton } from "../components/Skeleton";

export const PullsListPage: React.FC = () => {
  const [pulls, setPulls] = useState<PullSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPulls().then((data) => {
      setPulls(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="text-xs font-mono text-muted mb-1">acme/httpcache</div>
        <h1 className="font-serif text-[32px] font-semibold text-midnight tracking-tight">
          Pull Requests
        </h1>
        <p className="text-sm text-muted mt-1">
          Explore decisions made in each pull request.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-20 w-full" count={4} />
      ) : (
        <div className="border border-line rounded-[12px] bg-white divide-y divide-line overflow-hidden">
          {pulls.map((pull) => (
            <div
              key={pull.number}
              className="p-5 hover:bg-mist/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-muted">
                    #{pull.number}
                  </span>
                  <span className="text-xs text-muted">· {pull.date}</span>
                </div>
                <Link
                  to={`/pull/${pull.number}`}
                  className="font-serif text-[18px] font-semibold text-midnight hover:text-navy hover:underline focus-visible:outline-none"
                >
                  {pull.title}
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted mt-2">
                  <span>{pull.comments} comments</span>
                  {pull.decided_against_count > 0 && (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-rose text-white text-[10px] font-medium">
                      {pull.decided_against_count} decided against
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Link
                  to={`/pull/${pull.number}`}
                  className="px-4 py-2 border border-midnight text-midnight text-xs font-medium rounded-[8px] hover:bg-mist transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  View overview
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
