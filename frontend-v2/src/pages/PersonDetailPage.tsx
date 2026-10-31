import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPerson } from '../api';
import { PersonProfile, DecisionStatus } from '../types';
import { getInitials } from '../components/PersonCard';
import { ActivityRow } from '../components/ActivityRow';
import { StatusPill } from '../components/StatusPill';
import { SourceButton } from '../components/SourceButton';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const PersonDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<PersonProfile | null>(null);

  const fetchProfile = () => {
    if (!name) return;
    setLoading(true);
    setError(false);
    getPerson(name)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, [name]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ErrorState message="Could not find profile for this contributor." onRetry={fetchProfile} />
      </div>
    );
  }

  const initials = getInitials(profile.author);

  const getDecisionStatus = (title: string): DecisionStatus => {
    if (title.toLowerCase().includes('wait longer')) return 'accepted';
    if (title.toLowerCase().includes('library')) return 'rejected';
    if (title.toLowerCase().includes('random delay')) return 'deferred';
    return 'unresolved';
  };

  const firstName = profile.author.split(' ')[0];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/people"
          className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1"
        >
          ← Back to People
        </Link>
      </div>

      {/* Heading with initials avatar and name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-mint text-ink text-xl font-semibold flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
            {profile.author}
          </h1>
          <p className="text-muted text-[15px] mt-0.5">
            {firstName} wrote {profile.commits} {profile.commits === 1 ? 'commit' : 'commits'} and {profile.comments} {profile.comments === 1 ? 'comment' : 'comments'} about retrying between {profile.first_at} and {profile.last_at}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Decisions they proposed */}
        <div className="bg-surface rounded-card border border-line p-5">
          <h2 className="font-serif text-[18px] font-semibold text-ink mb-3">
            Decisions they proposed
          </h2>
          {profile.proposed.length === 0 ? (
            <p className="text-sm text-muted italic">No proposed decisions recorded.</p>
          ) : (
            <div className="space-y-3">
              {profile.proposed.map((title, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-line last:border-b-0">
                  <StatusPill status={getDecisionStatus(title)} />
                  <span className="font-medium text-ink flex-1">{title}</span>
                  <SourceButton evidenceId="p1.s2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ideas they argued against */}
        <div className="bg-surface rounded-card border border-line p-5">
          <h2 className="font-serif text-[18px] font-semibold text-ink mb-3">
            Ideas they argued against
          </h2>
          {profile.argued_against.length === 0 ? (
            <p className="text-sm text-muted italic">None recorded.</p>
          ) : (
            <div className="space-y-3">
              {profile.argued_against.map((claim, i) => (
                <div key={i} className="py-2 border-b border-line last:border-b-0 text-sm">
                  <div className="text-ink mb-1.5">{claim.text}</div>
                  <div className="flex gap-1">
                    {claim.evidence_ids.map((eid) => (
                      <SourceButton key={eid} evidenceId={eid} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Their activity */}
      <div className="mt-8 bg-surface rounded-card border border-line p-6">
        <h2 className="font-serif text-[20px] font-semibold text-ink mb-4">
          Their activity
        </h2>
        {profile.activity.length === 0 ? (
          <p className="text-sm text-muted italic">No activity found for this time range.</p>
        ) : (
          <div className="divide-y divide-line">
            {profile.activity.map((act) => (
              <ActivityRow key={act.id} item={act} keywordHighlight="backoff" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
