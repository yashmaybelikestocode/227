import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPulls } from '../api';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

interface PullSummaryItem {
  number: number;
  title: string;
  author: string;
  date: string;
  comments: number;
  decided_against_count: number;
}

export const PullsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pulls, setPulls] = useState<PullSummaryItem[]>([]);

  const fetchPulls = () => {
    setLoading(true);
    setError(false);
    listPulls()
      .then((data) => {
        setPulls(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPulls();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
          Pull requests
        </h1>
        <p className="text-muted text-[15px] mt-1">
          Review discussions, turning points, and decided-against proposals across pull requests.
        </p>
      </div>

      {loading && <Skeleton className="h-64 w-full" />}
      {error && <ErrorState onRetry={fetchPulls} />}

      {!loading && !error && (
        <div className="bg-surface rounded-card border border-line overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-mint text-ink font-semibold border-b border-line text-xs uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4 font-mono">PR #</th>
                  <th scope="col" className="py-3 px-4">Title</th>
                  <th scope="col" className="py-3 px-4">Author</th>
                  <th scope="col" className="py-3 px-4">Date</th>
                  <th scope="col" className="py-3 px-4 font-mono text-right">Comments</th>
                  <th scope="col" className="py-3 px-4 font-mono text-right">Decided against</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pulls.map((pr) => (
                  <tr
                    key={pr.number}
                    onClick={() => navigate(`/pull/${pr.number}`)}
                    className="hover:bg-mint-soft/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-accent">
                      #{pr.number}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-medium text-ink">
                      {pr.title}
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs">
                      {pr.author}
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs">
                      {pr.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-muted">
                      {pr.comments}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-brick font-semibold">
                      {pr.decided_against_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
