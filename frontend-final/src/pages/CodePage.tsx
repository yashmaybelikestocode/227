import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listFiles, getFileView, getAnalysis } from '../api';
import type { FileListItem, FileView, Analysis } from '../types';
import { PageHeader } from '../components/PageHeader';
import { StatusPill } from '../components/StatusPill';
import { RenameTrail } from '../components/RenameTrail';
import { ThreadNote, LaterNoteBox } from '../components/ThreadNote';
import { Skeleton, ErrorState } from '../components/Common';

export const CodePage: React.FC = () => {
  const params = useParams();
  const rawPath = params['*'];
  const navigate = useNavigate();

  const [files, setFiles] = useState<FileListItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileView | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter for file list
  const [search, setSearch] = useState('');

  // Toggle: Show only lines with a decision
  const [onlyDecisions, setOnlyDecisions] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([listFiles('demo'), getAnalysis('demo')])
      .then(([fileList, analysisData]) => {
        if (!mounted) return;
        setFiles(fileList);
        setAnalysis(analysisData);

        // If a path is specified in url or default to retry.py if path was given
        const currentPath = rawPath || (fileList.length > 0 && rawPath !== '' ? fileList[0].path : null);
        if (currentPath) {
          getFileView('demo', currentPath)
            .then((fv) => {
              if (mounted) {
                setSelectedFile(fv);
                setLoading(false);
              }
            })
            .catch((err) => {
              if (mounted) {
                setError(err?.message || 'Failed to load file');
                setLoading(false);
              }
            });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || 'Failed to load code files');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [rawPath]);

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    return files.filter((f) => f.path.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Code & Decisions" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Code & Decisions" />
        <ErrorState
          title="Could not load code view"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // If no path was in the URL and no selectedFile, show the file list view
  const isFileListOnly = !rawPath && !selectedFile;

  return (
    <div className="space-y-6">
      <PageHeader
        title={selectedFile ? selectedFile.path : 'Repository Code'}
        projectChipLabel={analysis?.repo || 'acme/httpcache'}
      />

      {/* Breadcrumb if viewing a file */}
      {selectedFile && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
          <Link
            to="/code"
            onClick={(e) => {
              e.preventDefault();
              setSelectedFile(null);
              navigate('/code');
            }}
            className="hover:text-ink hover:underline"
          >
            All Files
          </Link>
          <span>/</span>
          <span className="font-mono text-ink font-semibold">{selectedFile.path}</span>
        </nav>
      )}

      {/* File List View */}
      {isFileListOnly ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Explore decisions attached to specific lines of code. Select a file to inspect its decision history and rename trail.
          </p>

          <div className="bg-surface border border-line rounded-card p-3 max-w-md">
            <label htmlFor="file-search" className="sr-only">Search files</label>
            <input
              id="file-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files by path..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-line rounded-btn text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div className="bg-white border border-line rounded-card overflow-hidden shadow-sm">
            <div className="p-3 bg-mint-soft border-b border-line text-xs font-semibold text-ink">
              Files with recorded decisions ({filteredFiles.length})
            </div>
            <ul className="divide-y divide-line/60">
              {filteredFiles.map((file) => (
                <li key={file.path}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/code/${file.path}`);
                    }}
                    className="w-full text-left p-4 hover:bg-ivory/60 transition-colors flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-ink">
                        {file.path}
                      </span>
                      {file.has_trail && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber/15 text-amber border border-amber/30">
                          renamed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted">
                        <strong className="text-ink font-semibold">{file.decisions_count}</strong> decisions
                      </span>
                      {file.decided_against_count > 0 && (
                        <span className="text-muted">
                          <strong className="text-brick font-semibold">{file.decided_against_count}</strong> decided against
                        </span>
                      )}
                      <span className="text-accent font-semibold">View →</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : selectedFile && analysis ? (
        /* Single File Code View */
        <div className="space-y-6">
          {/* Formerly at Trail */}
          {selectedFile.formerly && selectedFile.formerly.length > 0 && (
            <RenameTrail currentPath={selectedFile.path} formerly={selectedFile.formerly} />
          )}

          {/* Hint line */}
          <div className="p-3 bg-mint-soft border border-mint-deep/60 rounded-card text-xs text-ink leading-relaxed">
            Click the boxed note under any code to see why it was written that way. Lines with a tinted background have a decision attached.
          </div>

          {/* Controls Bar: Status Pills Key Row + Show only lines with a decision toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-surface border border-line rounded-card">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-medium text-muted mr-1">Status key:</span>
              <StatusPill status="accepted" size="sm" />
              <StatusPill status="rejected" size="sm" />
              <StatusPill status="deferred" size="sm" />
              <StatusPill status="unresolved" size="sm" />
            </div>

            <button
              type="button"
              data-testid="toggle-only-decisions"
              onClick={() => setOnlyDecisions(!onlyDecisions)}
              className={`px-3 py-1.5 text-xs font-medium rounded-btn border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                onlyDecisions
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-white text-ink border-line hover:bg-mint-soft'
              }`}
            >
              {onlyDecisions ? '✓ Showing only lines with a decision' : 'Show only lines with a decision'}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="bg-white border border-line rounded-card overflow-hidden shadow-sm font-mono text-[14px]">
            {/* Split lines into blocks or render per line */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {selectedFile.lines.map((lineText, lineIdx) => {
                    const lineNum = lineIdx + 1;

                    // Check if line is covered by a thread
                    const threadForLine = selectedFile.threads.find(
                      (t) => lineNum >= t.line_start && lineNum <= t.line_end
                    );

                    // Check if line is covered by a later note
                    const laterNoteForLine = selectedFile.later_notes.find(
                      (ln) => lineNum >= ln.line_start && lineNum <= ln.line_end
                    );

                    const hasDecision = Boolean(threadForLine);
                    const hasLater = Boolean(laterNoteForLine);
                    const isAnnotated = hasDecision || hasLater;

                    // If "onlyDecisions" is turned on and this line has neither decision nor later note, hide it
                    if (onlyDecisions && !isAnnotated) {
                      return null;
                    }

                    // Check if this line is the END of a thread block to place the ThreadNote below it
                    const isThreadEnd = threadForLine && lineNum === threadForLine.line_end;

                    // Check if this line is the END of a later note block to place the LaterNoteBox below it
                    const isLaterNoteEnd = laterNoteForLine && lineNum === laterNoteForLine.line_end;

                    const rowBg = hasDecision
                      ? 'bg-mint-soft/80'
                      : hasLater
                      ? 'bg-surface/80'
                      : 'hover:bg-ivory/40';

                    return (
                      <React.Fragment key={lineNum}>
                        <tr
                          data-testid={`code-line-${lineNum}`}
                          className={`transition-colors border-b border-line/30 ${rowBg} ${
                            !isAnnotated ? 'plain-code-block' : ''
                          }`}
                        >
                          {/* Line Number */}
                          <td className="w-12 py-1 px-3 text-right text-xs text-muted select-none border-r border-line/60 bg-mint-soft/40">
                            {lineNum}
                          </td>
                          {/* Code Content */}
                          <td className="py-1 px-4 whitespace-pre text-ink">
                            {lineText || ' '}
                          </td>
                        </tr>

                        {/* Render Thread Note at bottom of the thread block */}
                        {isThreadEnd && threadForLine && (
                          <tr>
                            <td colSpan={2} className="p-3 bg-ivory/50">
                              <ThreadNote
                                thread={threadForLine}
                                decisions={analysis.decisions}
                                comments={analysis.comments}
                                statements={analysis.statements}
                                people={analysis.people}
                              />
                            </td>
                          </tr>
                        )}

                        {/* Render Later Note at bottom of the later note block */}
                        {isLaterNoteEnd && laterNoteForLine && (
                          <tr>
                            <td colSpan={2} className="p-3 bg-surface/50">
                              <LaterNoteBox
                                note={laterNoteForLine}
                                comments={analysis.comments}
                                statements={analysis.statements}
                                people={analysis.people}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
