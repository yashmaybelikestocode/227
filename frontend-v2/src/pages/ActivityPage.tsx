import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getActivity, listPeople } from '../api';
import { ActivityItem, ActivityItemKind } from '../types';
import { ActivityRow } from '../components/ActivityRow';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export const ActivityPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [peopleList, setPeopleList] = useState<string[]>([]);

  // Filter state
  const [selectedPerson, setSelectedPerson] = useState<string>('All people');
  const [selectedTypes, setSelectedTypes] = useState<ActivityItemKind[]>([
    'commit',
    'issue_comment',
    'pr_comment',
    'review_comment',
  ]);
  const [dateRange, setDateRange] = useState<string>('Last 6 months');
  const keywordFilter = 'backoff';

  const fetchAllData = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      getActivity({ range: 'Last 6 months' }),
      listPeople(),
    ])
      .then(([acts, people]) => {
        setItems(acts);
        setPeopleList(people.map((p) => p.author));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const toggleType = (t: ActivityItemKind) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((k) => k !== t) : [...prev, t]
    );
  };

  // Filter items
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (selectedPerson !== 'All people') {
      result = result.filter((i) => i.author === selectedPerson);
    }
    result = result.filter((i) => selectedTypes.includes(i.kind));

    // Date range filtering
    const now = new Date('2026-08-31T23:59:59Z').getTime();
    let days = 180;
    if (dateRange === 'Last 2 weeks') days = 14;
    else if (dateRange === 'Last month') days = 30;
    else if (dateRange === 'Last 6 months') days = 180;
    const cutOff = now - days * 24 * 60 * 60 * 1000;
    result = result.filter((i) => new Date(i.timestamp).getTime() >= cutOff);

    return result;
  }, [items, selectedPerson, selectedTypes, dateRange]);

  // Plain-words summary line
  const summaryLine = useMemo(() => {
    if (filteredItems.length === 0) return 'No activity matched.';
    const commitsCount = filteredItems.filter((i) => i.kind === 'commit').length;
    const commentsCount = filteredItems.filter((i) => i.kind !== 'commit').length;
    const distinctPeople = new Set(filteredItems.map((i) => i.author)).size;

    const timestamps = filteredItems.map((i) => new Date(i.timestamp).getTime());
    const minTime = new Date(Math.min(...timestamps));
    const maxTime = new Date(Math.max(...timestamps));

    const minStr = minTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const maxStr = maxTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const commitsLabel = `${commitsCount} ${commitsCount === 1 ? 'commit' : 'commits'}`;
    const commentsLabel = `${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'}`;
    const peopleLabel = `${distinctPeople} ${distinctPeople === 1 ? 'person' : 'people'}`;

    return `${commitsLabel} and ${commentsLabel} from ${peopleLabel} between ${minStr} and ${maxStr}.`;
  }, [filteredItems]);

  // Group by day (newest first)
  const groupedByDay = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};
    filteredItems.forEach((item) => {
      const dayKey = new Date(item.timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  // People ranked by activity
  const rankedPeople = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((i) => {
      counts[i.author] = (counts[i.author] || 0) + 1;
    });
    const maxVal = Math.max(...Object.values(counts), 1);
    return Object.entries(counts)
      .map(([author, count]) => ({ author, count, max: maxVal }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  // Busiest days (top 3)
  const busiestDays = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((i) => {
      const d = new Date(i.timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [items]);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Recap chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-line">
        <span className="px-3 py-1 rounded-pill bg-mint text-ink text-xs font-mono font-medium">
          acme/httpcache
        </span>
        <span className="px-3 py-1 rounded-pill bg-mint-soft text-muted text-xs border border-mint-deep">
          exponential backoff
        </span>
        <span className="px-3 py-1 rounded-pill bg-mint-soft text-muted text-xs border border-mint-deep">
          {dateRange}
        </span>
      </div>

      <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight mb-4">
        Who did what, and when
      </h1>

      {/* Filter bar */}
      <div className="bg-surface rounded-card border border-line p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Person Select */}
          <div>
            <label htmlFor="person-select" className="block text-xs font-medium text-muted mb-1">
              Person
            </label>
            <select
              id="person-select"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-line rounded-btn text-xs text-ink"
            >
              <option value="All people">All people</option>
              {peopleList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Type Checkboxes */}
          <div>
            <span className="block text-xs font-medium text-muted mb-1">Activity type</span>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('commit')}
                  onChange={() => toggleType('commit')}
                  className="accent-accent w-3.5 h-3.5 rounded"
                />
                <span>Commits</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('issue_comment')}
                  onChange={() => toggleType('issue_comment')}
                  className="accent-accent w-3.5 h-3.5 rounded"
                />
                <span>Issue comments</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('pr_comment')}
                  onChange={() => toggleType('pr_comment')}
                  className="accent-accent w-3.5 h-3.5 rounded"
                />
                <span>PR comments</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('review_comment')}
                  onChange={() => toggleType('review_comment')}
                  className="accent-accent w-3.5 h-3.5 rounded"
                />
                <span>Reviews</span>
              </label>
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Date range</label>
            <div className="grid grid-cols-3 gap-1">
              {['Last 2 weeks', 'Last month', 'Last 6 months'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDateRange(r)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-btn border text-center transition-colors ${
                    dateRange === r
                      ? 'border-accent bg-mint text-ink font-semibold'
                      : 'border-line bg-white text-muted hover:bg-mint-soft/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary line in plain words */}
      <div className="bg-mint-soft/60 border border-mint-deep/60 rounded-btn px-4 py-3 mb-6 text-sm font-medium text-ink">
        {summaryLine}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {loading && <Skeleton className="h-20 w-full" lines={4} />}
          {error && <ErrorState onRetry={fetchAllData} />}

          {!loading && !error && filteredItems.length === 0 && (
            <EmptyState
              message="No activity matched. Try a longer time range or fewer filters."
              actionText="Reset filters"
              onAction={() => {
                setSelectedPerson('All people');
                setSelectedTypes(['commit', 'issue_comment', 'pr_comment', 'review_comment']);
                setDateRange('Last 6 months');
              }}
            />
          )}

          {!loading &&
            !error &&
            Object.entries(groupedByDay).map(([dayLabel, dayItems]) => (
              <div key={dayLabel} className="bg-surface rounded-card border border-line p-5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted mb-3 pb-2 border-b border-line flex items-center justify-between">
                  <span>{dayLabel}</span>
                  <span className="font-normal text-[11px]">
                    {dayItems.length} {dayItems.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayItems.map((act) => (
                    <ActivityRow key={act.id} item={act} keywordHighlight={keywordFilter || 'backoff'} />
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Right column cards */}
        <div className="space-y-6">
          {/* Who to ask about this topic */}
          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
              Who to ask about this topic
            </h3>
            <div className="space-y-3">
              {rankedPeople.map((p) => {
                const percentage = Math.round((p.count / p.max) * 100);
                return (
                  <div key={p.author} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        to={`/people/${encodeURIComponent(p.author)}`}
                        className="font-medium text-ink hover:text-accent hover:underline"
                      >
                        {p.author}
                      </Link>
                      <span className="text-muted font-mono">{p.count} events</span>
                    </div>
                    <div className="h-2 bg-mint rounded-pill overflow-hidden">
                      <div className="h-full bg-accent rounded-pill" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Busiest days */}
          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
              Busiest days
            </h3>
            <div className="space-y-2.5 text-xs">
              {busiestDays.map((d, index) => (
                <div key={d.day} className="flex items-center justify-between py-1.5 border-b border-line last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-mint text-accent font-semibold flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span className="font-medium text-ink">{d.day}</span>
                  </div>
                  <span className="font-mono text-muted">{d.count} activities</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
