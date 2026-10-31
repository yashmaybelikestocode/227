import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis } from '../api';
import type { Analysis, Statement } from '../types';
import { PageHeader } from '../components/PageHeader';
import { StatusPill } from '../components/StatusPill';
import { SourceChip } from '../components/SourceChip';
import { Skeleton, EmptyState, ErrorState } from '../components/Common';

type SortField = 'date' | 'author';
type SortDirection = 'asc' | 'desc';

export const StatementsPage: React.FC = () => {
  const { id = 'demo' } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'used' | 'left_out'>('used');

  // Filters for Used tab
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [whereFilter, setWhereFilter] = useState<string>('all');
  const [decisionsOnly, setDecisionsOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getAnalysis(id)
      .then((data) => {
        if (mounted) {
          setAnalysis(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || 'Failed to load statements');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  // Handle header sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'date' ? 'desc' : 'asc');
    }
  };

  // Pre-index decisions by id for easy lookup
  const decisionsById = useMemo(() => {
    if (!analysis) return new Map();
    return new Map(analysis.decisions.map((d) => [d.id, d]));
  }, [analysis]);

  // Pre-index people by id for easy lookup
  const peopleById = useMemo(() => {
    if (!analysis) return new Map();
    return new Map(analysis.people.map((p) => [p.id, p]));
  }, [analysis]);

  // Pre-index comments by id for easy lookup
  const commentsById = useMemo(() => {
    if (!analysis) return new Map();
    return new Map(analysis.comments.map((c) => [c.id, c]));
  }, [analysis]);

  // Filtered and sorted used statements
  const filteredStatements = useMemo(() => {
    if (!analysis) return [];

    return analysis.statements.filter((s) => {
      const comment = commentsById.get(s.comment_id);
      const person = comment ? peopleById.get(comment.person_id) : undefined;
      const decision = s.decision_id ? decisionsById.get(s.decision_id) : undefined;

      // Filter by person
      if (personFilter !== 'all' && comment?.person_id !== personFilter) {
        return false;
      }

      // Filter by where
      if (whereFilter !== 'all') {
        const whereText = comment?.where.toLowerCase() || '';
        if (!whereText.includes(whereFilter.toLowerCase())) {
          return false;
        }
      }

      // Filter decisions only
      if (decisionsOnly && !s.decision_id) {
        return false;
      }

      // Filter search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuote = s.quote.toLowerCase().includes(q);
        const matchesAuthor = person?.display_name.toLowerCase().includes(q);
        const matchesDecision = decision?.title.toLowerCase().includes(q);
        const matchesCommentId = comment?.github_id.toLowerCase().includes(q);
        if (!matchesQuote && !matchesAuthor && !matchesDecision && !matchesCommentId) {
          return false;
        }
      }

      return true;
    }).sort((a: Statement, b: Statement) => {
      const commentA = commentsById.get(a.comment_id);
      const commentB = commentsById.get(b.comment_id);
      const personA = commentA ? peopleById.get(commentA.person_id) : null;
      const personB = commentB ? peopleById.get(commentB.person_id) : null;

      if (sortField === 'author') {
        const nameA = personA?.display_name || '';
        const nameB = personB?.display_name || '';
        return sortDir === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }

      // Default date sort
      // Dates format: "14 Mar 2026", "2 Aug 2026", etc.
      const dateA = commentA ? new Date(commentA.date).getTime() : 0;
      const dateB = commentB ? new Date(commentB.date).getTime() : 0;
      return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [analysis, personFilter, whereFilter, decisionsOnly, searchQuery, sortField, sortDir, commentsById, peopleById, decisionsById]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Every statement we found" />
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
        <PageHeader title="Every statement we found" />
        <ErrorState
          title="Could not load statements"
          message={error || 'The analysis data could not be found.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const usedCount = analysis.statements.length;
  const leftOutCount = analysis.left_out.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Every statement we found"
        repo={analysis.repo}
        projectChipLabel={analysis.repo}
      />

      <p className="text-sm text-muted">
        A statement is one sentence or idea from a comment, a pull request or a commit message. Each one keeps its author, date and comment ID.
      </p>

      {/* Tabs */}
      <div className="border-b border-line flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('used')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'used'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          }`}
          aria-selected={activeTab === 'used'}
          role="tab"
        >
          Used ({usedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('left_out')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'left_out'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          }`}
          aria-selected={activeTab === 'left_out'}
          role="tab"
          data-testid="tab-left-out"
        >
          Left out ({leftOutCount})
        </button>
      </div>

      {activeTab === 'used' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-surface border border-line rounded-card p-4 flex flex-wrap items-center gap-3">
            {/* Person select */}
            <div>
              <label htmlFor="filter-person" className="sr-only">Filter by person</label>
              <select
                id="filter-person"
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-line rounded-btn text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="all">All people</option>
                {analysis.people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Where select */}
            <div>
              <label htmlFor="filter-where" className="sr-only">Filter by location</label>
              <select
                id="filter-where"
                value={whereFilter}
                onChange={(e) => setWhereFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-line rounded-btn text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="all">All places</option>
                <option value="pull request">Pull request comment</option>
                <option value="issue">Issue comment</option>
                <option value="review">Review comment</option>
                <option value="commit">Commit message</option>
              </select>
            </div>

            {/* Decisions only checkbox */}
            <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={decisionsOnly}
                onChange={(e) => setDecisionsOnly(e.target.checked)}
                className="rounded border-line text-accent focus:ring-accent"
              />
              <span>Decisions only</span>
            </label>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search-statements" className="sr-only">Search statements</label>
              <input
                id="search-statements"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search statements or authors..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-line rounded-btn text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>

            {(personFilter !== 'all' || whereFilter !== 'all' || decisionsOnly || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setPersonFilter('all');
                  setWhereFilter('all');
                  setDecisionsOnly(false);
                  setSearchQuery('');
                }}
                className="text-xs text-muted hover:text-ink underline"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Table */}
          {filteredStatements.length === 0 ? (
            <EmptyState
              title="No statements match these filters."
              message="Try changing or clearing your search filters to see statements."
            />
          ) : (
            <div className="bg-white border border-line rounded-card overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-mint-soft border-b border-line text-ink font-semibold">
                    <th scope="col" className="p-3 font-mono">Comment ID</th>
                    <th scope="col" className="p-3 cursor-pointer hover:bg-mint transition-colors" onClick={() => handleSort('author')}>
                      <div className="flex items-center gap-1">
                        <span>Author</span>
                        {sortField === 'author' && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="p-3 cursor-pointer hover:bg-mint transition-colors" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortField === 'date' && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="p-3">Where</th>
                    <th scope="col" className="p-3 min-w-[280px]">Statement</th>
                    <th scope="col" className="p-3">Type</th>
                    <th scope="col" className="p-3">Group</th>
                    <th scope="col" className="p-3 text-right">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredStatements.map((stmt) => {
                    const comment = commentsById.get(stmt.comment_id);
                    const person = comment ? peopleById.get(comment.person_id) : null;
                    const decision = stmt.decision_id ? decisionsById.get(stmt.decision_id) : null;

                    return (
                      <tr key={stmt.id} className="hover:bg-ivory/60 transition-colors">
                        <td className="p-3 font-mono text-muted whitespace-nowrap">
                          {comment?.github_id || stmt.comment_id}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {person ? (
                            <Link
                              to={`/people/${person.id}`}
                              className="font-medium text-ink hover:text-accent underline transition-colors"
                            >
                              {person.display_name}
                            </Link>
                          ) : (
                            <span className="text-muted">Unknown</span>
                          )}
                        </td>
                        <td className="p-3 text-muted whitespace-nowrap">
                          {comment?.date || '—'}
                        </td>
                        <td className="p-3 text-muted whitespace-nowrap">
                          {comment?.where || '—'}
                        </td>
                        <td className="p-3 text-ink leading-relaxed font-sans">
                          &ldquo;{stmt.quote}&rdquo;
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {decision ? (
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-muted font-medium block">
                                Decision
                              </span>
                              <StatusPill status={decision.status} size="sm" />
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral text-muted border border-line">
                              Not a decision
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {decision ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-ink truncate max-w-[150px]" title={decision.title}>
                                {decision.title}
                              </span>
                              {decision.grouped_count > 1 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-mint-soft text-accent border border-mint-deep">
                                  Grouped
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <SourceChip
                            statementId={stmt.id}
                            comments={analysis.comments}
                            statements={analysis.statements}
                            people={analysis.people}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Left Out Tab */
        <div className="space-y-4">
          <div className="p-4 bg-mint-soft border border-mint-deep/60 rounded-card text-xs text-ink leading-relaxed">
            <p className="font-medium text-accent">
              We only use statements we can quote exactly. These were left out and counted so nothing is hidden.
            </p>
          </div>

          <div className="bg-white border border-line rounded-card overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-mint-soft border-b border-line text-ink font-semibold">
                  <th scope="col" className="p-3 font-mono">Comment ID</th>
                  <th scope="col" className="p-3">Author</th>
                  <th scope="col" className="p-3">Date</th>
                  <th scope="col" className="p-3">Where</th>
                  <th scope="col" className="p-3">Why it was left out</th>
                  <th scope="col" className="p-3 text-right">GitHub Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {analysis.left_out.map((item) => {
                  const comment = commentsById.get(item.comment_id);
                  const person = comment ? peopleById.get(comment.person_id) : null;
                  return (
                    <tr key={item.comment_id} className="hover:bg-ivory/60 transition-colors">
                      <td className="p-3 font-mono text-muted whitespace-nowrap">
                        {comment?.github_id || item.comment_id}
                      </td>
                      <td className="p-3 font-medium text-ink whitespace-nowrap">
                        {person?.display_name || 'Contributor'}
                      </td>
                      <td className="p-3 text-muted whitespace-nowrap">
                        {comment?.date || '—'}
                      </td>
                      <td className="p-3 text-muted whitespace-nowrap">
                        {comment?.where || '—'}
                      </td>
                      <td className="p-3 text-ink">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber/15 text-amber border border-amber/30">
                          {item.reason}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <a
                          href={comment?.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                        >
                          <span>Open on GitHub</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
