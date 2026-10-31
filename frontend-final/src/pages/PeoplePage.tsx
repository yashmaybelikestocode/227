import React, { useEffect, useState } from 'react';
import { getAnalysis } from '../api';
import type { Person, Analysis } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PersonRow } from '../components/PersonComponents';
import { Skeleton, EmptyState, ErrorState } from '../components/Common';

export const PeoplePage: React.FC = () => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getAnalysis('demo')
      .then((data) => {
        if (mounted) {
          setAnalysis(data);
          setPeople(data.people);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || 'Failed to load people');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="People" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="space-y-6">
        <PageHeader title="People" />
        <ErrorState
          title="Could not load people"
          message={error || 'Unable to retrieve team members.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="People"
        repo={analysis.repo}
        projectChipLabel={analysis.repo}
      />

      <p className="text-sm text-muted">
        Some people use a different email or name in each place. Cypher merges them into one person so their work adds up.
      </p>

      {people.length === 0 ? (
        <EmptyState
          title="No people found"
          message="No contributors were discovered in the repository discussions."
        />
      ) : (
        <div className="bg-white border border-line rounded-card overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs" data-testid="people-table">
            <thead>
              <tr className="bg-mint-soft border-b border-line text-ink font-semibold">
                <th scope="col" className="py-3 px-4">Name</th>
                <th scope="col" className="py-3 px-4">Commit email</th>
                <th scope="col" className="py-3 px-4">GitHub login</th>
                <th scope="col" className="py-3 px-4">Other handle</th>
                <th scope="col" className="py-3 px-4 text-center">Commits</th>
                <th scope="col" className="py-3 px-4 text-center">Comments</th>
                <th scope="col" className="py-3 px-4">Activity</th>
                <th scope="col" className="py-3 px-4">Identities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {people.map((person) => (
                <PersonRow key={person.id} person={person} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
