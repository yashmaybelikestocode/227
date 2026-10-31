import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPeople } from '../api';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

interface PersonRow {
  author: string;
  commits: number;
  comments: number;
  first_at: string;
  last_at: string;
  proposed: string[];
}

export const PeoplePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [people, setPeople] = useState<PersonRow[]>([]);

  const fetchPeople = () => {
    setLoading(true);
    setError(false);
    listPeople()
      .then((data) => {
        setPeople(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
          People
        </h1>
        <p className="text-muted text-[15px] mt-1">
          Contributors who proposed decisions, participated in reviews, and shaped the codebase.
        </p>
      </div>

      {loading && <Skeleton className="h-64 w-full" />}
      {error && <ErrorState onRetry={fetchPeople} />}

      {!loading && !error && (
        <div className="bg-surface rounded-card border border-line overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-mint text-ink font-semibold border-b border-line text-xs uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">Name</th>
                  <th scope="col" className="py-3 px-4 font-mono text-right">Commits</th>
                  <th scope="col" className="py-3 px-4 font-mono text-right">Comments</th>
                  <th scope="col" className="py-3 px-4">First activity</th>
                  <th scope="col" className="py-3 px-4">Last activity</th>
                  <th scope="col" className="py-3 px-4">Decisions proposed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {people.map((person) => (
                  <tr
                    key={person.author}
                    onClick={() => navigate(`/people/${encodeURIComponent(person.author)}`)}
                    className="hover:bg-mint-soft/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-ink">
                      {person.author}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-muted">
                      {person.commits}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-muted">
                      {person.comments}
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs">
                      {person.first_at}
                    </td>
                    <td className="py-3.5 px-4 text-muted text-xs">
                      {person.last_at}
                    </td>
                    <td className="py-3.5 px-4 text-ink text-xs">
                      {person.proposed && person.proposed.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {person.proposed.map((p, i) => (
                            <span key={i} className="bg-mint-soft text-accent px-2 py-0.5 rounded text-xs border border-mint-deep">
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted italic">—</span>
                      )}
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
