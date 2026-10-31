import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listRecentRepos } from "../api";
import { RepoInfo } from "../types";

export const StartPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode: "project" | "keyword"
  const [mode, setMode] = useState<"project" | "keyword">("project");

  // Project mode state
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("acme/httpcache");
  const [customRepoUrl, setCustomRepoUrl] = useState<string>("");
  const [repoUrlError, setRepoUrlError] = useState<string>("");
  const [useCustomRepo, setUseCustomRepo] = useState<boolean>(false);
  const [projectQuestion, setProjectQuestion] = useState<string>("Why do we retry failed requests?");
  const [projectRange, setProjectRange] = useState<string>("Last 6 months");
  const [projectStartDate, setProjectStartDate] = useState<string>("");
  const [projectEndDate, setProjectEndDate] = useState<string>("");

  // Keyword mode state
  const [keyword, setKeyword] = useState<string>("");
  const [onlyWithComments, setOnlyWithComments] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Any language");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("discussed");
  const [keywordRange, setKeywordRange] = useState<string>("Last 6 months");
  const [keywordStartDate, setKeywordStartDate] = useState<string>("");
  const [keywordEndDate, setKeywordEndDate] = useState<string>("");

  useEffect(() => {
    listRecentRepos().then((data) => {
      setRepos(data);
      if (data.length > 0) {
        setSelectedRepo(data[0].name);
      }
    });
  }, []);

  const validateGitHubLink = (url: string): boolean => {
    if (!url.trim()) return false;
    // Must look like github.com/owner/name (with optional https://)
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return pattern.test(url.trim());
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useCustomRepo) {
      if (!validateGitHubLink(customRepoUrl)) {
        setRepoUrlError("Please enter a valid GitHub repository link in the format github.com/owner/name.");
        return;
      }
      setRepoUrlError("");
    }
    // Navigate to answer page
    navigate("/answer/ans_httpcache_retry");
  };

  const handleTrySampleProject = () => {
    setSelectedRepo("acme/httpcache");
    setUseCustomRepo(false);
    setProjectQuestion("Why do we retry failed requests?");
    setProjectRange("Last 6 months");
    navigate("/answer/ans_httpcache_retry");
  };

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = keyword.trim() || "exponential backoff";
    const params = new URLSearchParams({
      q: query,
      lang: selectedLanguage,
      type: selectedType,
      sort: selectedSort,
      range: keywordRange,
    });
    navigate(`/results?${params.toString()}`);
  };

  const handleTrySampleKeyword = () => {
    setKeyword("exponential backoff");
    const params = new URLSearchParams({
      q: "exponential backoff",
      lang: "Any language",
      type: "all",
      sort: "discussed",
      range: "Last 6 months",
    });
    navigate(`/results?${params.toString()}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Hero section */}
      <div className="max-w-[70ch] mb-8">
        <h1 className="font-serif text-[32px] sm:text-[36px] font-semibold text-midnight leading-tight tracking-tight mb-3">
          Find out why your code is the way it is
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Search by project, or just by a keyword. Cypher shows who decided what, when, and why, with a link to the original comment for every answer.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="inline-flex p-1 bg-mist border border-line rounded-[10px] mb-8" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "project"}
          onClick={() => setMode("project")}
          className={`px-5 py-2 text-sm font-medium rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${
            mode === "project"
              ? "bg-midnight text-white shadow-none"
              : "text-muted hover:text-midnight"
          }`}
        >
          I know the project
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "keyword"}
          onClick={() => setMode("keyword")}
          className={`px-5 py-2 text-sm font-medium rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${
            mode === "keyword"
              ? "bg-midnight text-white shadow-none"
              : "text-muted hover:text-midnight"
          }`}
        >
          I only have a keyword
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Form steps */}
        <div className="lg:col-span-8 space-y-6">
          {mode === "project" ? (
            <form onSubmit={handleProjectSubmit} className="space-y-6">
              {/* Step 1: Which project? */}
              <div className="border border-line rounded-[12px] p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-midnight">
                    Which project?
                  </h2>
                </div>

                <div className="space-y-3">
                  {repos.map((r) => (
                    <label
                      key={r.name}
                      className={`flex items-center justify-between p-3.5 border rounded-[8px] cursor-pointer transition-colors ${
                        !useCustomRepo && selectedRepo === r.name
                          ? "border-navy bg-blush-soft/50 ring-1 ring-navy"
                          : "border-line hover:bg-mist"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="repo"
                          checked={!useCustomRepo && selectedRepo === r.name}
                          onChange={() => {
                            setSelectedRepo(r.name);
                            setUseCustomRepo(false);
                            setRepoUrlError("");
                          }}
                          className="w-4 h-4 text-navy focus:ring-navy"
                        />
                        <span className="font-mono text-sm font-medium text-midnight">{r.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-mist border border-line text-muted">
                          {r.language}
                        </span>
                      </div>
                      <span className="text-xs text-muted">{r.updated_at}</span>
                    </label>
                  ))}

                  {/* Paste GitHub URL option */}
                  <div
                    className={`p-3.5 border rounded-[8px] transition-colors ${
                      useCustomRepo
                        ? "border-navy bg-blush-soft/50 ring-1 ring-navy"
                        : "border-line"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input
                        type="radio"
                        name="repo"
                        checked={useCustomRepo}
                        onChange={() => setUseCustomRepo(true)}
                        className="w-4 h-4 text-navy focus:ring-navy"
                      />
                      <span className="text-sm font-medium text-midnight">Paste a GitHub link</span>
                    </label>
                    {useCustomRepo && (
                      <div className="mt-2 pl-7">
                        <input
                          type="text"
                          value={customRepoUrl}
                          onChange={(e) => {
                            setCustomRepoUrl(e.target.value);
                            if (repoUrlError) setRepoUrlError("");
                          }}
                          placeholder="github.com/owner/name"
                          aria-label="GitHub repository link"
                          className="w-full px-3.5 py-2 border border-line rounded-[8px] text-sm text-midnight focus:border-navy focus:ring-2 focus:ring-navy focus:ring-offset-2 outline-none"
                        />
                        {repoUrlError && (
                          <p className="text-xs text-rose mt-2 font-medium" role="alert">
                            {repoUrlError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: What is your keyword or question? */}
              <div className="border border-line rounded-[12px] p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-midnight">
                    What is your keyword or question?
                  </h2>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={projectQuestion}
                    onChange={(e) => setProjectQuestion(e.target.value)}
                    placeholder="e.g. Why do we retry failed requests?"
                    className="w-full px-3.5 py-2.5 border border-line rounded-[8px] text-sm text-midnight focus:border-navy focus:ring-2 focus:ring-navy focus:ring-offset-2 outline-none"
                    aria-label="Your keyword or question"
                  />

                  {/* Example chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-muted">Try:</span>
                    {[
                      "Why was this added?",
                      "What was rejected?",
                      "Who worked on it?",
                      "What changed after launch?",
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setProjectQuestion(chip)}
                        className="px-2.5 py-1 text-xs rounded-full bg-mist hover:bg-blush border border-line text-midnight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: How far back? */}
              <div className="border border-line rounded-[12px] p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-midnight">
                    How far back?
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {["Last 2 weeks", "Last month", "Last 6 months", "Choose dates"].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setProjectRange(range)}
                        className={`px-3.5 py-2 text-xs font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
                          projectRange === range
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-white text-midnight hover:bg-mist"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>

                  {projectRange === "Choose dates" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs text-muted mb-1">Start date</label>
                        <input
                          type="date"
                          value={projectStartDate}
                          onChange={(e) => setProjectStartDate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-line rounded-[8px] text-xs text-midnight focus:border-navy outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">End date</label>
                        <input
                          type="date"
                          value={projectEndDate}
                          onChange={(e) => setProjectEndDate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-line rounded-[8px] text-xs text-midnight focus:border-navy outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-navy text-white text-sm font-medium rounded-[8px] hover:bg-navy/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                >
                  Show me the history
                </button>
                <button
                  type="button"
                  onClick={handleTrySampleProject}
                  className="px-6 py-3 bg-transparent border-[1.5px] border-midnight text-midnight text-sm font-medium rounded-[8px] hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                >
                  Try a sample project
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleKeywordSubmit} className="space-y-6">
              {/* Step 1: What is your keyword? */}
              <div className="border border-line rounded-[12px] p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-midnight">
                    What is your keyword?
                  </h2>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. exponential backoff"
                    aria-label="Keyword search"
                    className="w-full px-4 py-3 border border-line rounded-[8px] text-base text-midnight focus:border-navy focus:ring-2 focus:ring-navy focus:ring-offset-2 outline-none"
                  />

                  {/* Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted">Try:</span>
                    {["retry", "rate limit", "cache invalidation", "async", "deprecate"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setKeyword(chip)}
                        className="px-2.5 py-1 text-xs rounded-full bg-mist hover:bg-blush border border-line text-midnight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={onlyWithComments}
                      onChange={(e) => setOnlyWithComments(e.target.checked)}
                      className="w-4 h-4 text-navy rounded border-line focus:ring-navy"
                    />
                    <span className="text-xs text-muted">
                      Only show discussions that have comments, so there is something to summarize
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 2: Narrow it down (optional) */}
              <div className="border border-line rounded-[12px] p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-midnight">
                    Narrow it down (optional)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-midnight mb-1.5">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-[8px] text-xs text-midnight bg-white focus:border-navy outline-none"
                    >
                      <option>Any language</option>
                      <option>Python</option>
                      <option>Go</option>
                      <option>JavaScript</option>
                      <option>Rust</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-midnight mb-1.5">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-[8px] text-xs text-midnight bg-white focus:border-navy outline-none"
                    >
                      <option value="all">Pull requests and issues</option>
                      <option value="pull">Pull requests</option>
                      <option value="issue">Issues</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-midnight mb-1.5">Sort by</label>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-[8px] text-xs text-midnight bg-white focus:border-navy outline-none"
                    >
                      <option value="discussed">Most discussed</option>
                      <option value="recent">Most recent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: How far back? */}
              <div className="border border-line rounded-[12px] p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-serif text-[20px] font-semibold text-midnight">
                    How far back?
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {["Last month", "Last 6 months", "Last year", "Choose dates"].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setKeywordRange(range)}
                        className={`px-3.5 py-2 text-xs font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
                          keywordRange === range
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-white text-midnight hover:bg-mist"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>

                  {keywordRange === "Choose dates" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs text-muted mb-1">Start date</label>
                        <input
                          type="date"
                          value={keywordStartDate}
                          onChange={(e) => setKeywordStartDate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-line rounded-[8px] text-xs text-midnight focus:border-navy outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">End date</label>
                        <input
                          type="date"
                          value={keywordEndDate}
                          onChange={(e) => setKeywordEndDate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-line rounded-[8px] text-xs text-midnight focus:border-navy outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-navy text-white text-sm font-medium rounded-[8px] hover:bg-navy/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                >
                  Search public projects
                </button>
                <button
                  type="button"
                  onClick={handleTrySampleKeyword}
                  className="px-6 py-3 bg-transparent border-[1.5px] border-midnight text-midnight text-sm font-medium rounded-[8px] hover:bg-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                >
                  Try a sample keyword
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right column: Explanatory info cards */}
        <div className="lg:col-span-4 space-y-5">
          {mode === "keyword" ? (
            <div className="border border-line rounded-[12px] p-5 bg-white">
              <h3 className="font-serif text-[18px] font-semibold text-midnight mb-3">
                How keyword search works
              </h3>
              <ol className="space-y-3 text-xs text-muted leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="font-semibold text-navy">1.</span>
                  <span>We scan discussions across open source repositories for your topic.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-semibold text-navy">2.</span>
                  <span>Discussions are ranked by activity so you see the deepest technical debates first.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-semibold text-navy">3.</span>
                  <span>Choose any discussion and Cypher creates an evidence-backed plain English summary.</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="border border-line rounded-[12px] p-5 bg-white">
              <h3 className="font-serif text-[18px] font-semibold text-midnight mb-3">
                What you will get
              </h3>
              <ul className="space-y-2.5 text-xs text-muted leading-relaxed">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>A short plain-English answer in 2-4 sentences</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>What was decided, what was rejected, and what was postponed</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>A timeline showing if later pull requests changed the decision</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Direct source buttons linking to the exact original comments</span>
                </li>
              </ul>
            </div>
          )}

          {/* Can we trust it? */}
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h3 className="font-serif text-[18px] font-semibold text-midnight mb-2">
              Can we trust it?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Every statement links to the exact original comment. Unproven statements are left out and counted so you always know what is supported.
            </p>
          </div>

          {/* Your data */}
          <div className="border border-line rounded-[12px] p-5 bg-white">
            <h3 className="font-serif text-[18px] font-semibold text-midnight mb-2">
              Your data
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Public information only. Cypher never posts or changes anything on GitHub. The AI model runs on this computer.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <div className="flex items-center gap-3">
          <img
            src="/logo-with-text.png"
            alt=""
            className="w-[120px] max-w-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <span className="font-serif font-semibold text-midnight">Cypher</span>
          <span>· Decision history for open source repositories</span>
        </div>
        <div>
          <span>Read-only · Offline mode</span>
        </div>
      </footer>
    </div>
  );
};
