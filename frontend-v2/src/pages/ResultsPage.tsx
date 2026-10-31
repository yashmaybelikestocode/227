import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchKeyword } from '../api';
import { KeywordHit } from '../types';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export const ResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || 'exponential backoff';
  const initialRange = searchParams.get('range') || 'Last 6 months';
  const initialType = searchParams.get('kind') || 'all';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [allHits, setAllHits] = useState<KeywordHit[]>([]);

  // Filter state
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [minFiveComments, setMinFiveComments] = useState<boolean>(false);
  const [showMoreProjects, setShowMoreProjects] = useState<boolean>(false);

  const fetchResults = () => {
    setLoading(true);
    setError(false);
    searchKeyword({ keyword: query })
      .then((data) => {
        setAllHits(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResults();
  }, [query]);

  // Derive available projects and their counts
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allHits.forEach((h) => {
      counts[h.repo] = (counts[h.repo] || 0) + 1;
    });
    return counts;
  }, [allHits]);

  const uniqueProjects = Object.keys(projectCounts);

  // Type counts
  const prCount = allHits.filter((h) => h.kind === 'pull').length;
  const issueCount = allHits.filter((h) => h.kind === 'issue').length;

  // Filter hits client-side
  const filteredHits = useMemo(() => {
    return allHits.filter((hit) => {
      if (selectedProjects.length > 0 && !selectedProjects.includes(hit.repo)) {
        return false;
      }
      if (selectedType === 'pull' && hit.kind !== 'pull') return false;
      if (selectedType === 'issue' && hit.kind !== 'issue') return false;
      if (minFiveComments && hit.comments < 5) return false;
      return true;
    });
  }, [allHits, selectedProjects, selectedType, minFiveComments]);

  const distinctProjectsCount = useMemo(() => {
    const set = new Set(filteredHits.map((h) => h.repo));
    return set.size;
  }, [filteredHits]);

  const toggleProject = (repo: string) => {
    setSelectedProjects((prev) =>
      prev.includes(repo) ? prev.filter((p) => p !== repo) : [...prev, repo]
    );
  };

  const highlightKeyword = (text: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-mint text-ink font-medium px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const visibleProjects = showMoreProjects ? uniqueProjects : uniqueProjects.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Recap chips & Change search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted font-medium">Search:</span>
          <span className="px-3 py-1 rounded-pill bg-mint text-ink text-xs font-semibold">
            "{query}"
          </span>
          <span className="px-3 py-1 rounded-pill bg-mint-soft text-muted text-xs border border-mint-deep">
            {initialRange}
          </span>
          <span className="px-3 py-1 rounded-pill bg-mint-soft text-muted text-xs border border-mint-deep">
            {initialType === 'all' ? 'PRs & Issues' : initialType === 'pull' ? 'Pull requests' : 'Issues'}
          </span>
        </div>
        <Link
          to="/"
          className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Change search
        </Link>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="font-serif text-[28px] font-semibold text-ink leading-tight">
          {filteredHits.length} discussions found in {distinctProjectsCount} {distinctProjectsCount === 1 ? 'project' : 'projects'}
        </h1>
        <p className="text-muted text-[15px] mt-1">
          Sorted by most discussed. Pick one and Cypher will explain what was decided.
        </p>
      </div>

      {/* Tip box */}
      <div className="mb-8 p-4 bg-mint-soft border border-dashed border-mint-deep rounded-card text-sm text-ink flex items-start gap-3">
        <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Already know which project you mean? Tick it on the left, or search inside one project to get its full history.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Column */}
        <div className="space-y-6">
          {/* Project filter card */}
          <div className="bg-surface rounded-card border border-line p-4">
            <h3 className="font-serif text-[16px] font-semibold text-ink mb-3">Project</h3>
            <div className="space-y-2">
              {visibleProjects.map((repo) => (
                <label key={repo} className="flex items-center justify-between text-xs text-ink cursor-pointer hover:text-accent">
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(repo)}
                      onChange={() => toggleProject(repo)}
                      className="accent-accent w-3.5 h-3.5 rounded"
                    />
                    <span className="font-mono truncate">{repo}</span>
                  </div>
                  <span className="text-muted font-mono ml-2">({projectCounts[repo]})</span>
                </label>
              ))}
            </div>
            {uniqueProjects.length > 4 && (
              <button
                type="button"
                onClick={() => setShowMoreProjects(!showMoreProjects)}
                className="mt-3 text-xs text-accent font-medium hover:underline"
              >
                {showMoreProjects ? 'Show less' : `Show ${uniqueProjects.length - 4} more`}
              </button>
            )}
          </div>

          {/* Type filter card */}
          <div className="bg-surface rounded-card border border-line p-4">
            <h3 className="font-serif text-[16px] font-semibold text-ink mb-3">Type</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-ink cursor-pointer hover:text-accent">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type_filter"
                    checked={selectedType === 'all'}
                    onChange={() => setSelectedType('all')}
                    className="accent-accent w-3.5 h-3.5"
                  />
                  <span>All</span>
                </div>
                <span className="text-muted font-mono">({allHits.length})</span>
              </label>
              <label className="flex items-center justify-between text-xs text-ink cursor-pointer hover:text-accent">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type_filter"
                    checked={selectedType === 'pull'}
                    onChange={() => setSelectedType('pull')}
                    className="accent-accent w-3.5 h-3.5"
                  />
                  <span>Pull requests</span>
                </div>
                <span className="text-muted font-mono">({prCount})</span>
              </label>
              <label className="flex items-center justify-between text-xs text-ink cursor-pointer hover:text-accent">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type_filter"
                    checked={selectedType === 'issue'}
                    onChange={() => setSelectedType('issue')}
                    className="accent-accent w-3.5 h-3.5"
                  />
                  <span>Issues</span>
                </div>
                <span className="text-muted font-mono">({issueCount})</span>
              </label>
            </div>
          </div>

          {/* Discussion size card */}
          <div className="bg-surface rounded-card border border-line p-4">
            <h3 className="font-serif text-[16px] font-semibold text-ink mb-3">Discussion size</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-ink cursor-pointer hover:text-accent">
                <input
                  type="radio"
                  name="size_filter"
                  checked={!minFiveComments}
                  onChange={() => setMinFiveComments(false)}
                  className="accent-accent w-3.5 h-3.5"
                />
                <span>Any number of comments</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-ink cursor-pointer hover:text-accent">
                <input
                  type="radio"
                  name="size_filter"
                  checked={minFiveComments}
                  onChange={() => setMinFiveComments(true)}
                  className="accent-accent w-3.5 h-3.5"
                />
                <span>5 or more comments</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results List (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" lines={3} />
            </div>
          )}

          {error && <ErrorState onRetry={fetchResults} />}

          {!loading && !error && filteredHits.length === 0 && (
            <EmptyState
              message="No discussions matched. Try a shorter keyword or a longer time range."
              actionText="Reset filters"
              onAction={() => {
                setSelectedProjects([]);
                setSelectedType('all');
                setMinFiveComments(false);
              }}
            />
          )}

          {!loading &&
            !error &&
            filteredHits.map((hit) => {
              const kindLabel = hit.kind === 'pull' ? 'Pull request' : 'Issue';
              return (
                <div
                  key={hit.id}
                  className="bg-surface rounded-card border border-line p-5 hover:border-mint-deep transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    {/* Line 1 */}
                    <div className="text-xs font-mono font-bold text-muted mb-1">
                      {hit.repo} · {kindLabel} #{hit.number}
                    </div>

                    {/* Line 2 */}
                    <h2 className="font-serif text-[18.5px] font-semibold text-ink mb-1.5 leading-snug">
                      {hit.title}
                    </h2>

                    {/* Line 3 snippet */}
                    <p className="text-[14px] text-muted leading-relaxed mb-3">
                      {highlightKeyword(hit.snippet)}
                    </p>

                    {/* Line 4 metrics */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                      <span>{hit.date}</span>
                      <span>·</span>
                      <span className="font-medium text-ink">{hit.comments} comments</span>
                      <span>·</span>
                      <span>{hit.people} people</span>
                      <span>·</span>
                      <span className="bg-mint-soft px-2 py-0.5 rounded text-[11px] font-mono text-accent">
                        {hit.language}
                      </span>
                    </div>
                  </div>

                  {/* Explain this button */}
                  <div className="flex-shrink-0 sm:self-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/answer/${hit.answer_id}`)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-accent text-white font-medium text-sm rounded-btn hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      Explain this
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Footer note */}
          {!loading && filteredHits.length > 0 && (
            <div className="pt-4 text-xs text-center text-muted">
              Showing titles, dates and comment counts only. The plain-English summary is made when you open a discussion.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
