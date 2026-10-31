import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRecentRepos, startImport } from '../api';
import type { RepoInfo } from '../types';

export const StartPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedRepo, setSelectedRepo] = useState<string>('acme/httpcache');
  const [customRepoUrl, setCustomRepoUrl] = useState<string>('');
  const [repoError, setRepoError] = useState<string>('');
  const [question, setQuestion] = useState<string>('Why do we retry failed requests?');
  const [range, setRange] = useState<string>('Last 6 months');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const questionChips = [
    'Why was this added?',
    'What was rejected?',
    'Who worked on it?',
    'What changed after launch?',
  ];

  const validateGithubUrl = (input: string): boolean => {
    const trimmed = input.trim();
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return pattern.test(trimmed);
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetRepo = selectedRepo;
    if (selectedRepo === 'custom') {
      if (!validateGithubUrl(customRepoUrl)) {
        setRepoError('Please enter a valid GitHub repository link like github.com/owner/name');
        return;
      }
      setRepoError('');
      const clean = customRepoUrl
        .replace(/^(https?:\/\/)?(www\.)?github\.com\//, '')
        .replace(/\/$/, '');
      targetRepo = clean;
    }

    const analysisId = await startImport({
      repo: targetRepo,
      question: question.trim(),
      range,
    });
    navigate(`/import/${analysisId}`);
  };

  const trySampleProject = async () => {
    const analysisId = await startImport({
      repo: 'acme/httpcache',
      question: 'Why do we retry failed requests?',
      range: 'Last 6 months',
    });
    navigate(`/import/${analysisId}`);
  };

  return (
    <div className="space-y-8" data-testid="start-page">
      {/* Header */}
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-ink tracking-tight">
          Find out why your code is the way it is
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Pick one project. Cypher reads its pull requests, issues, comments and commits, and shows who decided what, when, and why, with a link to the original comment for every answer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form (8 cols) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleStart} className="space-y-6" data-testid="start-form">
            {/* Step 1: Which project? */}
            <div className="bg-surface border border-line rounded-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Which project?
                </h2>
              </div>

              <div className="space-y-2">
                {mockRecentRepos.map((repo: RepoInfo) => (
                  <label
                    key={repo.name}
                    className={`flex items-center justify-between p-3 border rounded-btn cursor-pointer transition-colors ${
                      selectedRepo === repo.name
                        ? 'border-accent bg-mint-soft/60'
                        : 'border-line hover:border-mint-deep'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="repo"
                        value={repo.name}
                        checked={selectedRepo === repo.name}
                        onChange={() => {
                          setSelectedRepo(repo.name);
                          setRepoError('');
                        }}
                        className="text-accent focus:ring-accent"
                      />
                      <span className="font-mono text-sm font-semibold text-ink">{repo.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="px-2 py-0.5 rounded bg-neutral">{repo.language}</span>
                      <span>{repo.updated_at}</span>
                    </div>
                  </label>
                ))}

                {/* Custom GitHub Link */}
                <div
                  className={`p-3 border rounded-btn space-y-2 transition-colors ${
                    selectedRepo === 'custom'
                      ? 'border-accent bg-mint-soft/60'
                      : 'border-line hover:border-mint-deep'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="repo"
                      value="custom"
                      checked={selectedRepo === 'custom'}
                      onChange={() => setSelectedRepo('custom')}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-sm font-medium text-ink">Paste another GitHub link</span>
                  </label>
                  {selectedRepo === 'custom' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        data-testid="custom-repo-input"
                        value={customRepoUrl}
                        onChange={(e) => {
                          setCustomRepoUrl(e.target.value);
                          setRepoError('');
                        }}
                        placeholder="e.g. github.com/owner/name"
                        className="w-full px-3 py-2 bg-white border border-line rounded-btn text-sm focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                      {repoError && (
                        <p className="mt-1.5 text-xs text-brick font-medium" data-testid="custom-repo-error">
                          {repoError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: What do you want to know? (optional) */}
            <div className="bg-surface border border-line rounded-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="font-serif text-lg font-semibold text-ink">
                  What do you want to know? <span className="font-normal text-muted text-sm">(optional)</span>
                </h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Leave empty for everything, or type a question..."
                  className="w-full px-3.5 py-2.5 bg-white border border-line rounded-btn text-sm focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted">Examples:</span>
                  {questionChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setQuestion(chip)}
                      className="px-2.5 py-1 text-xs bg-neutral hover:bg-mint text-ink rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: How far back? */}
            <div className="bg-surface border border-line rounded-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="font-serif text-lg font-semibold text-ink">
                  How far back?
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {['Last month', 'Last 6 months', 'Last year', 'Choose dates'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRange(option)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-btn border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      range === option
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-ink border-line hover:border-mint-deep'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {range === 'Choose dates' && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">From</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-line rounded-btn text-xs focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted">To</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-line rounded-btn text-xs focus:border-accent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                data-testid="start-analysis-submit"
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-btn text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Fetch and analyze
              </button>
              <button
                type="button"
                onClick={trySampleProject}
                className="px-5 py-3 bg-transparent text-ink border-[1.5px] border-ink hover:bg-mint-soft font-medium rounded-btn text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Try a sample project
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-surface border border-line rounded-card space-y-3">
            <h3 className="font-serif font-semibold text-base text-ink">
              What you will get
            </h3>
            <ul className="space-y-2 text-sm text-ink">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>A 3-sentence summary of what the team decided and why.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Clear lists of what was decided against and postponed.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>A timeline tracking subsequent changes and reversals.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Source links directly to original team comments.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-surface border border-line rounded-card space-y-2">
            <h3 className="font-serif font-semibold text-base text-ink">
              Can we trust it?
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Every statement links to the exact original comment. Statements with no exact quote are left out and counted so you always see verifiable facts.
            </p>
          </div>

          <div className="p-5 bg-surface border border-line rounded-card space-y-2">
            <h3 className="font-serif font-semibold text-base text-ink">
              Your data
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Public information only, read-only, never posts or changes anything on GitHub. The AI model runs on this computer.
            </p>
          </div>
        </div>
      </div>

      {/* Start page footer with logo-with-text.png */}
      <div className="pt-10 border-t border-line/60 flex flex-col items-center justify-center space-y-2 text-center text-xs text-muted">
        <img
          src="/logo-with-text.png"
          alt=""
          className="w-[120px] h-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <p>Cypher · Traceable open-source code decisions</p>
      </div>
    </div>
  );
};
