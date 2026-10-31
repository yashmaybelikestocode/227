import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listRecentRepos } from '../api';
import { RepoInfo } from '../types';

export const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'project' | 'keyword'>('project');

  // Mode 1: Project
  const [recentRepos, setRecentRepos] = useState<RepoInfo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('acme/httpcache');
  const [customRepo, setCustomRepo] = useState<string>('');
  const [repoError, setRepoError] = useState<string>('');
  const [question, setQuestion] = useState<string>('Why do we retry failed requests?');
  const [timeRange, setTimeRange] = useState<string>('Last 6 months');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Mode 2: Keyword
  const [keyword, setKeyword] = useState<string>('exponential backoff');
  const [onlyWithComments, setOnlyWithComments] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('Any language');
  const [searchType, setSearchType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('Most discussed');
  const [keywordRange, setKeywordRange] = useState<string>('Last 6 months');
  const [kwStartDate, setKwStartDate] = useState<string>('');
  const [kwEndDate, setKwEndDate] = useState<string>('');

  const [logoFailed, setLogoFailed] = useState<boolean>(false);

  useEffect(() => {
    listRecentRepos().then((data) => setRecentRepos(data)).catch(() => {});
  }, []);

  const validateGithubLink = (link: string): boolean => {
    if (!link.trim()) return true;
    const clean = link.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const parts = clean.split('/');
    if (parts.length >= 3 && parts[0].includes('github.com') && parts[1] && parts[2]) {
      return true;
    }
    return false;
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRepoError('');

    if (customRepo.trim()) {
      if (!validateGithubLink(customRepo)) {
        setRepoError('Please enter a valid GitHub repository link like github.com/owner/name');
        return;
      }
    }

    // Navigate to answer
    navigate('/answer/ans-httpcache-retry');
  };

  const handleTrySampleProject = () => {
    setSelectedRepo('acme/httpcache');
    setCustomRepo('');
    setQuestion('Why do we retry failed requests?');
    setTimeRange('Last 6 months');
    navigate('/answer/ans-httpcache-retry');
  };

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      q: keyword,
      minComments: onlyWithComments ? 'true' : 'false',
      language,
      kind: searchType,
      sort: sortBy,
      range: keywordRange,
    });
    navigate(`/results?${params.toString()}`);
  };

  const handleTrySampleKeyword = () => {
    setKeyword('exponential backoff');
    setOnlyWithComments(true);
    setLanguage('Any language');
    setSortBy('Most discussed');
    setKeywordRange('Last 6 months');
    navigate('/results?q=exponential+backoff&minComments=true&sort=Most+discussed&range=Last+6+months');
  };

  const questionChips = [
    'Why was this added?',
    'What was rejected?',
    'Who worked on it?',
    'What changed after launch?',
  ];

  const keywordChips = [
    'retry',
    'rate limit',
    'cache invalidation',
    'async',
    'deprecate',
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero header */}
      <div className="mb-8 max-w-reading">
        <h1 className="font-serif text-[32px] font-semibold text-ink leading-tight mb-3">
          Find out why your code is the way it is
        </h1>
        <p className="text-[17px] text-muted leading-relaxed">
          Search by project, or just by a keyword. Cypher shows who decided what, when, and why, with a link to the original comment for every answer.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="inline-flex p-1 bg-surface border border-line rounded-pill mb-8" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'project'}
          onClick={() => setMode('project')}
          className={`px-5 py-2 text-sm font-medium rounded-pill transition-colors ${
            mode === 'project'
              ? 'bg-ink text-white shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          I know the project
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'keyword'}
          onClick={() => setMode('keyword')}
          className={`px-5 py-2 text-sm font-medium rounded-pill transition-colors ${
            mode === 'keyword'
              ? 'bg-ink text-white shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          I only have a keyword
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Main form */}
        <div className="lg:col-span-2 space-y-6">
          {mode === 'project' ? (
            <form onSubmit={handleProjectSubmit} className="space-y-6">
              {/* Step 1 */}
              <div className="bg-surface rounded-card border border-line p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-mint text-accent font-semibold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-ink">Which project?</h2>
                </div>

                <div className="space-y-3">
                  {recentRepos.map((repo) => (
                    <label
                      key={repo.name}
                      className={`flex items-center justify-between p-3.5 border rounded-card cursor-pointer transition-colors ${
                        selectedRepo === repo.name && !customRepo
                          ? 'border-accent bg-mint-soft/40'
                          : 'border-line hover:bg-mint-soft/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="repo_choice"
                          value={repo.name}
                          checked={selectedRepo === repo.name && !customRepo}
                          onChange={() => {
                            setSelectedRepo(repo.name);
                            setCustomRepo('');
                            setRepoError('');
                          }}
                          className="accent-accent w-4 h-4"
                        />
                        <div>
                          <div className="font-mono text-sm font-semibold text-ink">{repo.name}</div>
                          <div className="text-xs text-muted">{repo.language}</div>
                        </div>
                      </div>
                      <span className="text-xs text-muted">Updated {repo.updated_at}</span>
                    </label>
                  ))}

                  {/* Custom link row */}
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      Or paste a GitHub repository link:
                    </label>
                    <input
                      type="text"
                      placeholder="github.com/owner/name"
                      value={customRepo}
                      onChange={(e) => {
                        setCustomRepo(e.target.value);
                        setRepoError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-line rounded-btn text-sm text-ink placeholder:text-muted/60 focus:border-accent"
                    />
                    {repoError && (
                      <p className="mt-1.5 text-xs text-brick font-medium" role="alert">
                        {repoError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface rounded-card border border-line p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-mint text-accent font-semibold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-ink">
                    What is your keyword or question?
                  </h2>
                </div>

                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Why do we retry failed requests?"
                  className="w-full px-3.5 py-2.5 bg-white border border-line rounded-btn text-sm text-ink placeholder:text-muted/60 focus:border-accent mb-3"
                  required
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted">Try:</span>
                  {questionChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setQuestion(chip)}
                      className="text-xs px-2.5 py-1 rounded-pill bg-mint-soft text-accent border border-mint-deep hover:bg-mint transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface rounded-card border border-line p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-mint text-accent font-semibold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-ink">How far back?</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {['Last 2 weeks', 'Last month', 'Last 6 months', 'Choose dates'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTimeRange(r)}
                      className={`py-2 px-3 text-xs font-medium rounded-btn border text-center transition-colors ${
                        timeRange === r
                          ? 'border-accent bg-mint text-ink font-semibold'
                          : 'border-line bg-white text-muted hover:bg-mint-soft/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {timeRange === 'Choose dates' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs text-muted mb-1">Start date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm text-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">End date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm text-ink"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent text-white font-medium text-sm rounded-btn hover:opacity-90 transition-opacity"
                >
                  Show me the history
                </button>
                <button
                  type="button"
                  onClick={handleTrySampleProject}
                  className="px-5 py-3 border-[1.5px] border-ink text-ink font-medium text-sm rounded-btn hover:bg-mint-soft transition-colors"
                >
                  Try a sample project
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleKeywordSubmit} className="space-y-6">
              {/* Step 1 */}
              <div className="bg-surface rounded-card border border-line p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-mint text-accent font-semibold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-ink">What is your keyword?</h2>
                </div>

                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. exponential backoff, rate limit..."
                  className="w-full px-4 py-3 bg-white border border-line rounded-btn text-base text-ink placeholder:text-muted/60 focus:border-accent mb-3"
                  required
                />

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-muted">Suggestions:</span>
                  {keywordChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setKeyword(chip)}
                      className="text-xs px-2.5 py-1 rounded-pill bg-mint-soft text-accent border border-mint-deep hover:bg-mint transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer pt-2 border-t border-line">
                  <input
                    type="checkbox"
                    checked={onlyWithComments}
                    onChange={(e) => setOnlyWithComments(e.target.checked)}
                    className="accent-accent w-4 h-4 rounded"
                  />
                  <span>Only show discussions that have comments, so there is something to summarize</span>
                </label>
              </div>

              {/* Step 2 */}
              <div className="bg-surface rounded-card border border-line p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-mint text-accent font-semibold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-ink">
                    Narrow it down (optional)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm text-ink"
                    >
                      <option>Any language</option>
                      <option>Python</option>
                      <option>Go</option>
                      <option>JavaScript</option>
                      <option>Rust</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Type</label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm text-ink"
                    >
                      <option value="all">Pull requests and issues</option>
                      <option value="pull">Pull requests</option>
                      <option value="issue">Issues</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm text-ink"
                    >
                      <option>Most discussed</option>
                      <option>Most recent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface rounded-card border border-line p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-mint text-accent font-semibold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-ink">How far back?</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {['Last month', 'Last 6 months', 'Last year', 'Choose dates'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setKeywordRange(r)}
                      className={`py-2 px-3 text-xs font-medium rounded-btn border text-center transition-colors ${
                        keywordRange === r
                          ? 'border-accent bg-mint text-ink font-semibold'
                          : 'border-line bg-white text-muted hover:bg-mint-soft/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {keywordRange === 'Choose dates' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs text-muted mb-1">Start date</label>
                      <input
                        type="date"
                        value={kwStartDate}
                        onChange={(e) => setKwStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm text-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">End date</label>
                      <input
                        type="date"
                        value={kwEndDate}
                        onChange={(e) => setKwEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm text-ink"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent text-white font-medium text-sm rounded-btn hover:opacity-90 transition-opacity"
                >
                  Search public projects
                </button>
                <button
                  type="button"
                  onClick={handleTrySampleKeyword}
                  className="px-5 py-3 border-[1.5px] border-ink text-ink font-medium text-sm rounded-btn hover:bg-mint-soft transition-colors"
                >
                  Try a sample keyword
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right column cards */}
        <div className="space-y-6">
          {mode === 'keyword' && (
            <div className="bg-surface rounded-card border border-line p-5">
              <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
                How keyword search works
              </h3>
              <ol className="space-y-3 text-sm text-muted">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-mint text-accent font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Searches across public pull requests and issues for matching discussions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-mint text-accent font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Filters bots, noise, and routine status pings to identify key turning points.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-mint text-accent font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Synthesizes plain-English decisions with traceable proofs when you choose a discussion.</span>
                </li>
              </ol>
            </div>
          )}

          {mode === 'project' && (
            <div className="bg-surface rounded-card border border-line p-5">
              <h3 className="font-serif text-[18px] font-semibold text-ink mb-3">
                What you will get
              </h3>
              <ul className="space-y-2.5 text-sm text-ink">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Clear, plain-English summary of what the team decided</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Exact citation back to the original comment for every answer</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Timeline of later modifications or undone decisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Participants, consensus history and argued alternatives</span>
                </li>
              </ul>
            </div>
          )}

          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-2">
              Can we trust it?
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Every statement links directly to the exact original sentence written by a human contributor. Unproven or speculative assertions are completely left out and counted in the confidence breakdown.
            </p>
          </div>

          <div className="bg-surface rounded-card border border-line p-5">
            <h3 className="font-serif text-[18px] font-semibold text-ink mb-2">
              Your data
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Cypher queries public information only. It is strictly read-only and never posts, stars, or alters anything on GitHub. All analysis models run locally on this computer.
            </p>
          </div>
        </div>
      </div>

      {/* Start page footer logo */}
      <div className="mt-16 pt-8 border-t border-line flex flex-col items-center justify-center text-center">
        {!logoFailed && (
          <img
            src="/logo-with-text.png"
            alt="Cypher"
            className="w-[120px] h-auto mb-3"
            onError={() => setLogoFailed(true)}
          />
        )}
        <p className="text-xs text-muted">
          Cypher · Explain why code is the way it is, and who did what and when.
        </p>
      </div>
    </div>
  );
};
