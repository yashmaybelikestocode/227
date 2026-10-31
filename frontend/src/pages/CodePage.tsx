import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { listFiles, getFileView } from "../api";
import { FileView, ProjectFileSummary } from "../types";
import { Skeleton } from "../components/Skeleton";
import { StatusPill } from "../components/StatusPill";
import { EffectPill } from "../components/EffectPill";
import { SourceButton } from "../components/SourceButton";

export const CodePage: React.FC = () => {
  const { "*": splatPath } = useParams<{ "*": string }>();
  const activePath = splatPath ? (splatPath.startsWith("/") ? splatPath.slice(1) : splatPath) : "";

  const [files, setFiles] = useState<ProjectFileSummary[]>([]);
  const [fileSearch, setFileSearch] = useState("");
  const [fileView, setFileView] = useState<FileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnlyDiscussions, setShowOnlyDiscussions] = useState(false);
  const [expandedLaterNotes, setExpandedLaterNotes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    listFiles().then((data) => setFiles(data));
  }, []);

  useEffect(() => {
    if (activePath) {
      setLoading(true);
      getFileView(activePath)
        .then((data) => {
          setFileView(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setFileView(null);
      setLoading(false);
    }
  }, [activePath]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) =>
      f.path.toLowerCase().includes(fileSearch.toLowerCase())
    );
  }, [files, fileSearch]);

  const toggleExpandLaterNote = (lineStart: number) => {
    setExpandedLaterNotes((prev) => ({
      ...prev,
      [lineStart]: !prev[lineStart],
    }));
  };

  // If no file selected, display file list directory
  if (!activePath) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-xs font-mono text-muted mb-1">acme/httpcache</div>
          <h1 className="font-serif text-[32px] font-semibold text-midnight">
            Project Code Files
          </h1>
          <p className="text-sm text-muted mt-1">
            Browse files with decision history. Click any file to see why its code was written that way.
          </p>
        </div>

        {/* Search input */}
        <div className="mb-6 max-w-md">
          <input
            type="text"
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            placeholder="Search files by path..."
            aria-label="Search files"
            className="w-full px-3.5 py-2 border border-line rounded-[8px] text-xs text-midnight focus:border-navy outline-none"
          />
        </div>

        {/* File table list */}
        <div className="border border-line rounded-[12px] bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mist border-b border-line text-xs font-semibold text-midnight">
                <th className="py-3 px-5">File Path</th>
                <th className="py-3 px-5 text-right">Discussions</th>
                <th className="py-3 px-5 text-right">Decided Against</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-xs">
              {filteredFiles.map((f) => (
                <tr key={f.path} className="hover:bg-mist/50 transition-colors">
                  <td className="py-3 px-5 font-mono">
                    <Link
                      to={`/code/${f.path}`}
                      className="text-navy font-medium hover:underline focus-visible:outline-none"
                    >
                      {f.path}
                    </Link>
                  </td>
                  <td className="py-3 px-5 text-right text-muted">
                    {f.discussions_count}
                  </td>
                  <td className="py-3 px-5 text-right">
                    {f.decided_against_count > 0 ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-rose text-white text-[10px] font-medium">
                        {f.decided_against_count} decided against
                      </span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // If loading file
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!fileView) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="text-sm text-rose">File not found: {activePath}</div>
        <Link to="/code" className="text-navy underline text-xs mt-2 inline-block">
          Back to all files
        </Link>
      </div>
    );
  }

  // Group lines into sections
  // Each section is either 'plain' or 'thread' or 'later_note'
  interface Section {
    type: "plain" | "thread" | "later_note";
    start: number; // 1-indexed
    end: number;
    thread?: typeof fileView.threads[0];
    laterNote?: typeof fileView.later_notes[0];
  }

  const sections: Section[] = [];
  let currentLine = 1;
  const totalLines = fileView.lines.length;

  while (currentLine <= totalLines) {
    const thread = fileView.threads.find((t) => t.line_start === currentLine);
    if (thread) {
      sections.push({
        type: "thread",
        start: thread.line_start,
        end: thread.line_end,
        thread,
      });
      currentLine = thread.line_end + 1;
      continue;
    }

    const laterNote = fileView.later_notes.find((n) => n.line_start === currentLine);
    if (laterNote) {
      sections.push({
        type: "later_note",
        start: laterNote.line_start,
        end: laterNote.line_end,
        laterNote,
      });
      currentLine = laterNote.line_end + 1;
      continue;
    }

    // Otherwise plain lines until next thread or later note or end
    let plainEnd = currentLine;
    while (
      plainEnd + 1 <= totalLines &&
      !fileView.threads.some((t) => t.line_start === plainEnd + 1) &&
      !fileView.later_notes.some((n) => n.line_start === plainEnd + 1)
    ) {
      plainEnd++;
    }

    sections.push({
      type: "plain",
      start: currentLine,
      end: plainEnd,
    });
    currentLine = plainEnd + 1;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-3 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link to="/code" className="hover:text-navy hover:underline">
          Files
        </Link>
        <span>/</span>
        <span className="font-mono text-midnight">{fileView.path}</span>
      </nav>

      {/* Heading */}
      <h1 className="font-serif text-[28px] sm:text-[32px] font-semibold text-midnight tracking-tight mb-2">
        {fileView.path.split("/").pop()}
      </h1>

      {/* Hint line */}
      <p className="text-xs text-muted leading-relaxed mb-4">
        Click the boxed note under any code to see why it was written that way. Lines with a tinted background have a discussion attached.
      </p>

      {/* Key row + Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-mist border border-line rounded-[10px] mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-midnight mr-1">Status key:</span>
          <StatusPill status="accepted" />
          <StatusPill status="rejected" />
          <StatusPill status="deferred" />
          <StatusPill status="unresolved" />
        </div>

        <button
          type="button"
          onClick={() => setShowOnlyDiscussions(!showOnlyDiscussions)}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
            showOnlyDiscussions
              ? "bg-navy text-white border-navy"
              : "bg-white text-midnight border-line hover:bg-mist"
          }`}
          data-testid="toggle-discussion-lines-btn"
        >
          {showOnlyDiscussions ? "Showing only discussion lines" : "Show only lines with a discussion"}
        </button>
      </div>

      {/* Code Viewer Container */}
      <div className="border border-line rounded-[12px] bg-white overflow-hidden font-mono text-[14px]">
        {sections.map((section, idx) => {
          if (section.type === "plain") {
            if (showOnlyDiscussions) {
              return (
                <div
                  key={idx}
                  data-testid="plain-code-collapsed"
                  className="py-1 px-4 bg-mist/50 border-y border-line text-xs text-muted font-sans italic"
                >
                  ... {section.end - section.start + 1} plain code lines hidden ...
                </div>
              );
            }

            return (
              <div key={idx} data-testid="plain-code-block">
                {fileView.lines.slice(section.start - 1, section.end).map((line, lineIdx) => {
                  const lineNum = section.start + lineIdx;
                  return (
                    <div key={lineNum} className="flex hover:bg-mist/30">
                      {/* Line Number Gutter */}
                      <span className="w-12 py-0.5 pr-3 text-right select-none text-muted bg-blush-soft text-xs border-r border-line">
                        {lineNum}
                      </span>
                      {/* Code Content */}
                      <span className="py-0.5 px-4 text-midnight whitespace-pre">
                        {line || " "}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }

          if (section.type === "thread" && section.thread) {
            const thread = section.thread;
            return (
              <div key={idx} className="border-y border-line/60 bg-blush-soft/40" data-testid="thread-block">
                {/* Code lines with tinted background */}
                {fileView.lines.slice(section.start - 1, section.end).map((line, lineIdx) => {
                  const lineNum = section.start + lineIdx;
                  return (
                    <div key={lineNum} className="flex bg-blush-soft/60 hover:bg-blush-soft">
                      <span className="w-12 py-0.5 pr-3 text-right select-none text-midnight font-medium bg-blush-soft text-xs border-r border-line">
                        {lineNum}
                      </span>
                      <span className="py-0.5 px-4 text-midnight whitespace-pre font-medium">
                        {line || " "}
                      </span>
                    </div>
                  );
                })}

                {/* Boxed note under the code */}
                <div className="p-4 bg-white border-t border-line">
                  <div className="border-[1.5px] border-blush-deep border-l-[5px] border-l-navy rounded-[10px] p-5 bg-white font-sans">
                    <h2 className="font-serif text-[18px] font-semibold text-midnight mb-3">
                      Why is this code written this way?
                    </h2>

                    {/* "In short" highlighted line (blush background) with source button */}
                    <div className="p-2.5 bg-blush rounded-[6px] text-xs text-midnight font-medium flex flex-wrap items-center gap-2 mb-4">
                      <span>In short: {thread.in_short.text}</span>
                      {thread.in_short.evidence_ids.map((id) => (
                        <SourceButton key={id} evidenceId={id} posts={thread.posts} />
                      ))}
                    </div>

                    {/* "What the team decided" rows */}
                    <div className="space-y-2 mb-4 border-b border-line pb-4">
                      <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        What the team decided
                      </div>
                      {thread.decisions.map((dec) => (
                        <div key={dec.id} className="flex items-start gap-3 text-xs">
                          <StatusPill status={dec.status} />
                          <span className="font-semibold text-midnight">{dec.approach}:</span>
                          <span className="text-muted">{dec.why.text}</span>
                          {dec.why.evidence_ids.map((id) => (
                            <SourceButton key={id} evidenceId={id} posts={thread.posts} />
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* "The story of these lines" small timeline */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        The story of these lines
                      </div>
                      <div className="space-y-2 pl-3 border-l-2 border-blush-deep">
                        {thread.story.map((s, sIdx) => (
                          <div key={sIdx} className="text-xs leading-relaxed flex flex-wrap items-center gap-2">
                            <span className="font-bold text-midnight font-mono">{s.date}</span>
                            <span className="text-muted">PR #{s.pr_number}</span>
                            {sIdx === 1 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-navy text-white font-medium">
                                this version
                              </span>
                            )}
                            {s.effect && <EffectPill effect={s.effect} />}
                            <span className="text-midnight">{s.text.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-xs text-muted pt-2 border-t border-line flex items-center justify-between">
                      <span>Well supported: based on {thread.based_on_comments} comments. {thread.left_out} statements left out.</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (section.type === "later_note" && section.laterNote) {
            const note = section.laterNote;
            const isExpanded = !!expandedLaterNotes[note.line_start];

            return (
              <div key={idx} className="border-y border-line/60" data-testid="later-note-block">
                {/* Code lines */}
                {fileView.lines.slice(section.start - 1, section.end).map((line, lineIdx) => {
                  const lineNum = section.start + lineIdx;
                  return (
                    <div key={lineNum} className="flex bg-blush-soft/40 hover:bg-blush-soft">
                      <span className="w-12 py-0.5 pr-3 text-right select-none text-midnight bg-blush-soft text-xs border-r border-line">
                        {lineNum}
                      </span>
                      <span className="py-0.5 px-4 text-midnight whitespace-pre">
                        {line || " "}
                      </span>
                    </div>
                  );
                })}

                {/* Folded note for reversed/undone later */}
                <div className="p-4 bg-white">
                  {!isExpanded ? (
                    <div
                      className="border border-line rounded-[10px] p-4 bg-blush-soft/50 flex items-center justify-between font-sans text-xs"
                      data-testid="compact-folded-note"
                    >
                      <div className="flex items-center gap-3">
                        <EffectPill effect={note.effect} />
                        <span className="font-semibold text-midnight">{note.title}</span>
                        <span className="text-muted">
                          (discussed in PR #{note.pr_numbers[0]}, undone in PR #{note.pr_numbers[1]})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpandLaterNote(note.line_start)}
                        className="text-navy font-semibold underline hover:text-navy/80 focus-visible:outline-none"
                      >
                        Read more
                      </button>
                    </div>
                  ) : (
                    <div className="border-[1.5px] border-blush-deep border-l-[5px] border-l-rose rounded-[10px] p-5 bg-white font-sans text-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <EffectPill effect={note.effect} />
                          <h2 className="font-serif text-[18px] font-semibold text-midnight">
                            {note.title}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpandLaterNote(note.line_start)}
                          className="text-navy font-semibold underline hover:text-navy/80 focus-visible:outline-none"
                        >
                          Fold
                        </button>
                      </div>

                      <p className="text-midnight leading-relaxed mb-3">
                        {note.explanation.text}
                      </p>

                      <div className="text-muted text-[11px] pt-2 border-t border-line">
                        Related discussions: PR #{note.pr_numbers.join(", PR #")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
