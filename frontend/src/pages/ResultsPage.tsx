import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { searchKeyword } from "../api";
import { KeywordHit } from "../types";
import { Skeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

export const ResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "exponential backoff";
  const range = searchParams.get("range") || "Last 6 months";
  const initialType = searchParams.get("type") || "all";
  const initialLang = searchParams.get("lang") || "Any language";
  const sort = (searchParams.get("sort") as "discussed" | "recent") || "discussed";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allHits, setAllHits] = useState<KeywordHit[]>([]);

  // Client-side filters
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [showAllRepos, setShowAllRepos] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "pull" | "issue">(
    initialType === "pull" || initialType === "issue" ? initialType : "all"
  );
  const [sizeFilter, setSizeFilter] = useState<"any" | "fivePlus">("any");

  const loadData = () => {
    setLoading(true);
    setError(null);
    searchKeyword({
      keyword: query,
      language: initialLang,
      kind: initialType as "all" | "pull" | "issue",
      sortBy: sort,
      range,
    })
      .then((data) => {
        setAllHits(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to search discussions");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [query, range, initialType, initialLang, sort]);

  // Derived filter counts
  const repoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of allHits) {
      counts[h.repo] = (counts[h.repo] || 0) + 1;
    }
    return counts;
  }, [allHits]);

  const uniqueRepos = useMemo(() => Object.keys(repoCounts), [repoCounts]);

  const pullCount = useMemo(
    () => allHits.filter((h) => h.kind === "pull").length,
    [allHits]
  );
  const issueCount = useMemo(
    () => allHits.filter((h) => h.kind === "issue").length,
    [allHits]
  );

  // Filtered hits
  const filteredHits = useMemo(() => {
    return allHits.filter((h) => {
      if (selectedRepos.length > 0 && !selectedRepos.includes(h.repo)) {
        return false;
      }
      if (typeFilter !== "all" && h.kind !== typeFilter) {
        return false;
      }
      if (sizeFilter === "fivePlus" && h.comments < 5) {
        return false;
      }
      return true;
    });
  }, [allHits, selectedRepos, typeFilter, sizeFilter]);

  const projectCount = useMemo(() => {
    const set = new Set(filteredHits.map((h) => h.repo));
    return set.size;
  }, [filteredHits]);

  const handleToggleRepo = (repo: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo]
    );
  };

  const highlightSnippet = (snippet: string, term: string) => {
    if (!term.trim()) return snippet;
    const parts = snippet.split(new RegExp(`(${term})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-blush text-midnight px-1 rounded-[2px]">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Recap Chips Row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-mist border border-line text-midnight">
          "{query}"
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-mist border border-line text-muted">
          {range}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-mist border border-line text-muted capitalize">
          {initialType === "all" ? "Pull requests and issues" : `${initialType}s`}
        </span>
        <Link
          to="/"
          className="text-xs font-medium text-navy hover:underline ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy rounded-[4px]"
        >
          Change search
        </Link>
      </div>

      {/* Title & Sub line */}
      <div className="mb-6">
        <h1
          className="font-serif text-[28px] sm:text-[32px] font-semibold text-midnight tracking-tight"
          data-testid="results-title"
        >
          {filteredHits.length} {filteredHits.length === 1 ? "discussion" : "discussions"} found in {projectCount} {projectCount === 1 ? "project" : "projects"}
        </h1>
        <p className="text-sm text-muted mt-1">
          Sorted by most discussed. Pick one and Cypher will explain what was decided.
        </p>
      </div>

      {/* Tip box */}
      <div className="mb-8 p-4 bg-blush-soft border border-dashed border-blush-deep rounded-[12px] text-xs text-muted leading-relaxed">
        Already know which project you mean? Tick it on the left, or search inside one project to get its full history.
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Filters */}
        <aside className="lg:col-span-4 space-y-5" aria-label="Filters">
          {/* Project filter card */}
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h2 className="font-serif text-[18px] font-semibold text-midnight mb-3">
              Project
            </h2>
            <div className="space-y-2.5">
              {(showAllRepos ? uniqueRepos : uniqueRepos.slice(0, 4)).map((repo) => (
                <label key={repo} className="flex items-center justify-between text-xs cursor-pointer group">
                  <span className="flex items-center gap-2 text-midnight group-hover:text-navy">
                    <input
                      type="checkbox"
                      checked={selectedRepos.includes(repo)}
                      onChange={() => handleToggleRepo(repo)}
                      className="w-4 h-4 rounded border-line text-navy focus:ring-navy"
                      data-testid={`filter-repo-${repo}`}
                    />
                    <span className="font-mono">{repo}</span>
                  </span>
                  <span className="text-muted">({repoCounts[repo]})</span>
                </label>
              ))}

              {uniqueRepos.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllRepos(!showAllRepos)}
                  className="text-xs text-navy font-medium pt-1 hover:underline focus-visible:outline-none"
                >
                  {showAllRepos ? "Show fewer" : `Show ${uniqueRepos.length - 4} more`}
                </button>
              )}
            </div>
          </div>

          {/* Type filter card */}
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h2 className="font-serif text-[18px] font-semibold text-midnight mb-3">
              Type
            </h2>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="flex items-center gap-2 text-midnight">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={typeFilter === "all"}
                    onChange={() => setTypeFilter("all")}
                    className="w-4 h-4 text-navy focus:ring-navy"
                  />
                  <span>All ({allHits.length})</span>
                </span>
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="flex items-center gap-2 text-midnight">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={typeFilter === "pull"}
                    onChange={() => setTypeFilter("pull")}
                    className="w-4 h-4 text-navy focus:ring-navy"
                    data-testid="filter-type-pull"
                  />
                  <span>Pull requests ({pullCount})</span>
                </span>
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="flex items-center gap-2 text-midnight">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={typeFilter === "issue"}
                    onChange={() => setTypeFilter("issue")}
                    className="w-4 h-4 text-navy focus:ring-navy"
                    data-testid="filter-type-issue"
                  />
                  <span>Issues ({issueCount})</span>
                </span>
              </label>
            </div>
          </div>

          {/* Discussion size filter card */}
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h2 className="font-serif text-[18px] font-semibold text-midnight mb-3">
              Discussion size
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-midnight cursor-pointer">
                <input
                  type="radio"
                  name="sizeFilter"
                  checked={sizeFilter === "any"}
                  onChange={() => setSizeFilter("any")}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <span>Any size</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-midnight cursor-pointer">
                <input
                  type="radio"
                  name="sizeFilter"
                  checked={sizeFilter === "fivePlus"}
                  onChange={() => setSizeFilter("fivePlus")}
                  className="w-4 h-4 text-navy focus:ring-navy"
                  data-testid="filter-size-five-plus"
                />
                <span>5 or more comments</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Column: Result Cards */}
        <main className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="space-y-4" data-testid="results-skeleton">
              <Skeleton className="h-32 w-full" count={4} />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : filteredHits.length === 0 ? (
            <EmptyState
              title="No discussions matched"
              message="No discussions matched. Try a shorter keyword or a longer time range."
              actionText="Reset filters"
              onAction={() => {
                setSelectedRepos([]);
                setTypeFilter("all");
                setSizeFilter("any");
              }}
            />
          ) : (
            <>
              <div className="space-y-4" data-testid="results-list">
                {filteredHits.map((hit) => (
                  <div
                    key={hit.id}
                    className="border border-line rounded-[12px] p-5 bg-white hover:border-blush-deep/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    data-testid={`result-card-${hit.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Line 1: owner/name · Pull request #176 */}
                      <div className="text-xs font-bold text-muted font-mono mb-1">
                        {hit.repo} · {hit.kind === "pull" ? "Pull request" : "Issue"} #{hit.number}
                      </div>

                      {/* Line 2: Title in Georgia 18.5px */}
                      <h2 className="font-serif text-[18.5px] font-semibold text-midnight leading-snug mb-2">
                        {hit.title}
                      </h2>

                      {/* Line 3: Snippet with keyword highlighted in blush */}
                      <p className="text-xs text-muted leading-relaxed mb-3">
                        {highlightSnippet(hit.snippet, query)}
                      </p>

                      {/* Line 4: Date, comment count, people count */}
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span>{hit.date}</span>
                        <span>·</span>
                        <span>{hit.comments} comments</span>
                        <span>·</span>
                        <span>{hit.people} people</span>
                      </div>
                    </div>

                    {/* Right side: Explain this button */}
                    <div className="sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/answer/${hit.answer_id}`)}
                        className="px-5 py-2.5 bg-navy text-white text-xs font-medium rounded-[8px] hover:bg-navy/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                        data-testid={`explain-btn-${hit.id}`}
                      >
                        Explain this
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informative text below list */}
              <div className="pt-4 text-center text-xs text-muted">
                Showing titles, dates and comment counts only. The plain-English summary is made when you open a discussion.
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
