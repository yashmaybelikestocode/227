import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listFiles, getFileView } from '../api';
import { FileView } from '../types';
import { StatusPill } from '../components/StatusPill';
import { ThreadNote } from '../components/ThreadNote';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const CodePage: React.FC = () => {
  const params = useParams();
  const rawPath = params['*'];
  const navigate = useNavigate();

  // If no path provided, show file list
  const [fileList, setFileList] = useState<{ path: string; discussions: number; decided_against: number }[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);

  // If path provided, show file view
  const [fileView, setFileView] = useState<FileView | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [errorView, setErrorView] = useState(false);
  const [onlyDiscussionLines, setOnlyDiscussionLines] = useState(false);

  useEffect(() => {
    if (!rawPath) {
      setLoadingFiles(true);
      listFiles()
        .then((data) => {
          setFileList(data);
          setLoadingFiles(false);
        })
        .catch(() => setLoadingFiles(false));
    } else {
      setLoadingView(true);
      setErrorView(false);
      getFileView(rawPath)
        .then((data) => {
          setFileView(data);
          setLoadingView(false);
        })
        .catch(() => {
          setErrorView(true);
          setLoadingView(false);
        });
    }
  }, [rawPath]);

  // List view
  if (!rawPath) {
    const filtered = fileList.filter((f) =>
      f.path.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return (
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="font-serif text-[30px] font-semibold text-ink leading-tight">
            Code files
          </h1>
          <p className="text-muted text-[15px] mt-1">
            Browse files to see the reasoning, decisions, and discussions behind each line of code.
          </p>
        </div>

        <div className="mb-6 max-w-md">
          <input
            type="text"
            placeholder="Search files by path..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-line rounded-btn text-sm text-ink placeholder:text-muted/60 focus:border-accent"
          />
        </div>

        {loadingFiles && <Skeleton className="h-48 w-full" />}

        {!loadingFiles && (
          <div className="bg-surface rounded-card border border-line overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-mint text-ink font-semibold border-b border-line text-xs uppercase tracking-wider">
                    <th scope="col" className="py-3 px-4">File path</th>
                    <th scope="col" className="py-3 px-4 font-mono text-right">Discussions</th>
                    <th scope="col" className="py-3 px-4 font-mono text-right">Decided against</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((file) => (
                    <tr
                      key={file.path}
                      onClick={() => navigate(`/code/${file.path}`)}
                      className="hover:bg-mint-soft/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-ink">
                        {file.path}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-muted">
                        {file.discussions}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-brick font-semibold">
                        {file.decided_against}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single file view
  if (loadingView) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (errorView || !fileView) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ErrorState message="Could not load file view." onRetry={() => navigate('/code')} />
      </div>
    );
  }

  // Check which lines have threads or notes attached
  const threadMap = new Map<number, (typeof fileView.threads)[0]>();
  fileView.threads.forEach((t) => {
    for (let l = t.line_start; l <= t.line_end; l++) {
      threadMap.set(l, t);
    }
  });

  const laterNoteMap = new Map<number, (typeof fileView.later_notes)[0]>();
  fileView.later_notes.forEach((n) => {
    for (let l = n.line_start; l <= n.line_end; l++) {
      laterNoteMap.set(l, n);
    }
  });

  // Calculate lines to show
  const linesToShow = fileView.lines.map((lineText, idx) => {
    const lineNum = idx + 1;
    const thread = threadMap.get(lineNum);
    const laterNote = laterNoteMap.get(lineNum);
    const hasDiscussion = !!thread || !!laterNote;
    return {
      lineNum,
      text: lineText,
      hasDiscussion,
      thread,
      laterNote,
    };
  });

  const visibleLines = onlyDiscussionLines
    ? linesToShow.filter((l) => l.hasDiscussion)
    : linesToShow;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted mb-3 font-mono" aria-label="Breadcrumb">
        <Link to="/code" className="hover:text-accent hover:underline">
          code
        </Link>
        <span>/</span>
        <span className="text-ink font-semibold">{fileView.path}</span>
      </nav>

      {/* File name heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="font-serif text-[28px] font-semibold text-ink leading-tight font-mono">
          {fileView.path}
        </h1>

        <button
          type="button"
          onClick={() => setOnlyDiscussionLines(!onlyDiscussionLines)}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-btn border transition-colors ${
            onlyDiscussionLines
              ? 'bg-mint border-accent text-accent font-semibold'
              : 'border-ink text-ink hover:bg-mint-soft'
          }`}
        >
          {onlyDiscussionLines ? 'Showing only discussion lines' : 'Show only lines with a discussion'}
        </button>
      </div>

      {/* Hint & key row */}
      <div className="bg-surface rounded-card border border-line p-4 mb-6">
        <p className="text-sm text-muted leading-relaxed mb-3">
          Click the boxed note under any code to see why it was written that way. Lines with a tinted background have a discussion attached.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-line text-xs">
          <span className="text-muted font-medium">Status key:</span>
          <StatusPill status="accepted" />
          <StatusPill status="rejected" />
          <StatusPill status="deferred" />
          <StatusPill status="unresolved" />
        </div>
      </div>

      {/* Code Editor view */}
      <div className="bg-surface rounded-card border border-line overflow-hidden font-mono text-[14px] leading-relaxed shadow-none">
        <div className="divide-y divide-line/40">
          {visibleLines.map((line) => {
            const isThreadEnd = line.thread && line.thread.line_end === line.lineNum;
            const isNoteEnd = line.laterNote && line.laterNote.line_end === line.lineNum;

            return (
              <React.Fragment key={line.lineNum}>
                <div
                  data-line-number={line.lineNum}
                  data-has-discussion={line.hasDiscussion ? 'true' : 'false'}
                  className={`flex items-start ${
                    line.hasDiscussion ? 'bg-mint-soft' : 'hover:bg-mint-soft/30'
                  }`}
                >
                  {/* Mint-soft Gutter */}
                  <div className="w-12 py-1 px-2.5 text-right text-xs text-muted select-none bg-mint-soft/70 border-r border-line flex-shrink-0">
                    {line.lineNum}
                  </div>
                  {/* Code line */}
                  <div className="py-1 px-4 whitespace-pre overflow-x-auto flex-1 text-ink">
                    {line.text || ' '}
                  </div>
                </div>

                {/* Boxed notes rendered under discussion blocks */}
                {isThreadEnd && (
                  <div className="px-6 py-2 bg-ivory/60 border-t border-b border-mint-deep/60">
                    <ThreadNote thread={line.thread} />
                  </div>
                )}

                {isNoteEnd && (
                  <div className="px-6 py-2 bg-ivory/60 border-t border-b border-mint-deep/60">
                    <ThreadNote laterNote={line.laterNote} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
