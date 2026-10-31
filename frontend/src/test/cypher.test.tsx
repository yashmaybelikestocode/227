import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { StatusPill } from '../components/StatusPill';
import { SourceChip } from '../components/SourceChip';
import { OriginalCommentPanel } from '../components/OriginalCommentPanel';
import { CommentPanelProvider } from '../context/CommentPanelContext';
import { GroupedStatements } from '../components/GroupedStatements';
import { Sidebar } from '../components/Sidebar';
import { RenameTrail } from '../components/RenameTrail';
import { ThreadNote, LaterNoteBox } from '../components/ThreadNote';

import { StartPage } from '../pages/StartPage';
import { DecisionsPage } from '../pages/DecisionsPage';
import { StatementsPage } from '../pages/StatementsPage';
import { CodePage } from '../pages/CodePage';
import { PeoplePage } from '../pages/PeoplePage';
import { PersonDetailPage } from '../pages/PersonDetailPage';
import { EvaluatePage } from '../pages/EvaluatePage';

import {
  mockComments,
  mockStatements,
  mockLeftOut,
  mockPeople,
  mockDecisions,
  httpcacheAnalysis,
  mockRetryFileView,
} from '../mock/data';
import { generateMadrMarkdown } from '../utils/madr';

describe('Cypher Frontend Requirements Test Suite', () => {
  // Test 1: StatusPill shows the right word and icon for each status
  it('1. StatusPill shows the right word and icon for each status', () => {
    const { unmount } = render(<StatusPill status="accepted" />);
    expect(screen.getByTestId('status-pill-accepted')).toHaveTextContent('Decided');
    expect(screen.getByTestId('status-pill-accepted').querySelector('svg')).toBeInTheDocument();
    unmount();

    render(<StatusPill status="rejected" />);
    expect(screen.getByTestId('status-pill-rejected')).toHaveTextContent('Decided against');
    expect(screen.getByTestId('status-pill-rejected').querySelector('svg')).toBeInTheDocument();

    render(<StatusPill status="deferred" />);
    expect(screen.getByTestId('status-pill-deferred')).toHaveTextContent('Postponed');
    expect(screen.getByTestId('status-pill-deferred').querySelector('svg')).toBeInTheDocument();

    render(<StatusPill status="unresolved" />);
    expect(screen.getByTestId('status-pill-unresolved')).toHaveTextContent('Still open');
    expect(screen.getByTestId('status-pill-unresolved').querySelector('svg')).toBeInTheDocument();
  });

  // Test 2: Clicking a source chip opens the panel and highlights exactly the characters between start and end offsets
  it('2. Clicking a source chip opens the panel and highlights exactly the characters between start and end offsets', async () => {
    const stmt = mockStatements[0];
    const comment = mockComments.find((c) => c.id === stmt.comment_id)!;

    render(
      <CommentPanelProvider>
        <div>
          <SourceChip
            statementId={stmt.id}
            comments={mockComments}
            statements={mockStatements}
            people={mockPeople}
          />
          <OriginalCommentPanel />
        </div>
      </CommentPanelProvider>
    );

    const chip = screen.getByTestId(`source-chip-${stmt.id}`);
    fireEvent.click(chip);

    const panel = await screen.findByTestId('original-comment-panel');
    expect(panel).toBeInTheDocument();

    const highlight = screen.getByTestId('highlighted-quote');
    expect(highlight).toHaveTextContent(stmt.quote);
    expect(highlight).toHaveAttribute('data-start', String(stmt.start));
    expect(highlight).toHaveAttribute('data-end', String(stmt.end));

    const expectedTextSlice = comment.text.slice(stmt.start, stmt.end);
    expect(highlight.textContent).toBe(expectedTextSlice);
  });

  // Test 3: Every mock Statement quote equals its comment text slice, and no Statement exists without a quote
  it('3. Every mock Statement quote equals its comment text slice, and no Statement exists without a quote', () => {
    expect(mockStatements.length).toBeGreaterThanOrEqual(18);

    mockStatements.forEach((stmt) => {
      expect(stmt.quote).toBeDefined();
      expect(stmt.quote.trim().length).toBeGreaterThan(0);

      const comment = mockComments.find((c) => c.id === stmt.comment_id);
      expect(comment).toBeDefined();
      expect(comment!.text.slice(stmt.start, stmt.end)).toBe(stmt.quote);
    });
  });

  // Test 4: The import page summary and the Decisions banner show the same counts, computed from the data
  it('4. The import page summary and the Decisions banner show the same counts, computed from the data', async () => {
    const summary = httpcacheAnalysis.summary;
    expect(summary.statements_used).toBe(mockStatements.length);
    expect(summary.statements_left_out).toBe(mockLeftOut.length);

    render(
      <MemoryRouter initialEntries={['/decisions/demo']}>
        <CommentPanelProvider>
          <Routes>
            <Route path="/decisions/:id" element={<DecisionsPage />} />
          </Routes>
        </CommentPanelProvider>
      </MemoryRouter>
    );

    const summaryBanner = await screen.findByTestId('matching-summary-banner');
    expect(summaryBanner).toBeInTheDocument();

    // Check that counts match exactly
    expect(summaryBanner).toHaveTextContent(String(summary.prs));
    expect(summaryBanner).toHaveTextContent(String(summary.issues));
    expect(summaryBanner).toHaveTextContent(String(summary.comments));
    expect(summaryBanner).toHaveTextContent(String(summary.commits));
    expect(summaryBanner).toHaveTextContent(`${summary.statements_used} statements with an exact quote`);
    expect(summaryBanner).toHaveTextContent(`${summary.statements_left_out} were left out`);
  });

  // Test 5: The "Grouped from 3 similar statements" toggle expands to three items with author, date and quote
  it('5. The "Grouped from 3 similar statements" toggle expands to three items with author, date and quote', () => {
    const groupedDecision = mockDecisions.find((d) => d.grouped_count === 3)!;
    expect(groupedDecision).toBeDefined();

    render(
      <MemoryRouter>
        <CommentPanelProvider>
          <GroupedStatements
            decision={groupedDecision}
            comments={mockComments}
            statements={mockStatements}
            people={mockPeople}
          />
        </CommentPanelProvider>
      </MemoryRouter>
    );

    const toggleBtn = screen.getByTestId('grouped-statements-toggle');
    expect(toggleBtn).toHaveTextContent('Grouped from 3 similar statements');
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Expand
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    const groupedList = screen.getByTestId('grouped-statements-list');
    expect(groupedList).toBeInTheDocument();

    const items = screen.getAllByTestId(/^grouped-item-/);
    expect(items.length).toBe(3);

    // Each item has author, date, and quote
    items.forEach((item) => {
      expect(item.querySelector('.font-bold')).toBeInTheDocument(); // author
      expect(item.textContent).toMatch(/\d{4}/); // year in date
      expect(item.querySelector('blockquote')).toBeInTheDocument(); // quote
    });
  });

  // Test 6: The Statements page "Left out" tab lists only comments that have no statement and the tab counts match the data
  it('6. The Statements page "Left out" tab lists only comments that have no statement and the tab counts match the data', async () => {
    render(
      <MemoryRouter initialEntries={['/statements/demo']}>
        <CommentPanelProvider>
          <Routes>
            <Route path="/statements/:id" element={<StatementsPage />} />
          </Routes>
        </CommentPanelProvider>
      </MemoryRouter>
    );

    // Tab counts match data
    const usedTab = await screen.findByRole('tab', { name: `Used (${mockStatements.length})` });
    const leftOutTab = screen.getByTestId('tab-left-out');
    expect(usedTab).toBeInTheDocument();
    expect(leftOutTab).toHaveTextContent(`Left out (${mockLeftOut.length})`);

    // Switch to Left out tab
    fireEvent.click(leftOutTab);

    // Verify left out comments are listed
    for (const item of mockLeftOut) {
      expect(screen.getAllByText(item.reason).length).toBeGreaterThan(0);
      // Confirm that this comment_id is indeed NOT used in mockStatements
      const foundInUsed = mockStatements.some((s) => s.comment_id === item.comment_id);
      expect(foundInUsed).toBe(false);
    }
  });

  // Test 7: The "Show only lines with a decision" toggle hides plain code blocks
  it('7. The "Show only lines with a decision" toggle hides plain code blocks', async () => {
    render(
      <MemoryRouter initialEntries={['/code/src/retry.py']}>
        <CommentPanelProvider>
          <Routes>
            <Route path="/code/*" element={<CodePage />} />
          </Routes>
        </CommentPanelProvider>
      </MemoryRouter>
    );

    // Line 1 is "import time", a plain line
    const plainLine1 = await screen.findByTestId('code-line-1');
    expect(plainLine1).toBeInTheDocument();
    expect(plainLine1).toHaveTextContent('import time');

    const toggle = screen.getByTestId('toggle-only-decisions');
    fireEvent.click(toggle);

    // Line 1 should now be hidden
    expect(screen.queryByTestId('code-line-1')).not.toBeInTheDocument();

    // But decision line (e.g. line 4) remains visible
    expect(screen.getByTestId('code-line-4')).toBeInTheDocument();
  });

  // Test 8: The rename trail shows both "Formerly at" steps in order and the code thread shows the old-path line
  it('8. The rename trail shows both "Formerly at" steps in order and the code thread shows the old-path line', () => {
    render(
      <RenameTrail
        currentPath={mockRetryFileView.path}
        formerly={mockRetryFileView.formerly}
      />
    );

    const step0 = screen.getByTestId('rename-step-0');
    const step1 = screen.getByTestId('rename-step-1');

    expect(step0).toHaveTextContent('Formerly at');
    expect(step0).toHaveTextContent('src/net/retry.py');
    expect(step0).toHaveTextContent('renamed in PR #240');

    expect(step1).toHaveTextContent('Formerly at');
    expect(step1).toHaveTextContent('src/http_retry.py');
    expect(step1).toHaveTextContent('moved in commit 3fa91c2');

    // Also check thread old-path line
    const thread = mockRetryFileView.threads[0];
    const { unmount } = render(
      <CommentPanelProvider>
        <ThreadNote
          thread={thread}
          decisions={mockDecisions}
          comments={mockComments}
          statements={mockStatements}
          people={mockPeople}
        />
      </CommentPanelProvider>
    );

    const oldPathLine = screen.getByTestId('thread-old-path-line');
    expect(oldPathLine).toHaveTextContent('Discussed when this file was at src/http_retry.py');
    unmount();
  });

  // Test 9: A thread with a reversed later note shows "Undone later"
  it('9. A thread with a reversed later note shows "Undone later"', () => {
    const laterNote = mockRetryFileView.later_notes[0];
    expect(laterNote.effect).toBe('reversed');

    render(
      <CommentPanelProvider>
        <LaterNoteBox
          note={laterNote}
          comments={mockComments}
          statements={mockStatements}
          people={mockPeople}
        />
      </CommentPanelProvider>
    );

    const noteBox = screen.getByTestId('later-note-box');
    expect(noteBox).toBeInTheDocument();
    expect(screen.getByTestId('effect-pill-reversed')).toHaveTextContent('Undone later');
    expect(noteBox).toHaveTextContent('Health checks no longer retry');
  });

  // Test 10: The People page shows exactly one row per person with all three identity kinds, and "Not the same person?" splits and Undo restores
  it('10. The People page shows exactly one row per person with all three identity kinds, and "Not the same person?" splits and Undo restores', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/people']}>
        <CommentPanelProvider>
          <Routes>
            <Route path="/people" element={<PeoplePage />} />
          </Routes>
        </CommentPanelProvider>
      </MemoryRouter>
    );

    await screen.findByTestId('people-table');

    // Exactly one row per person
    mockPeople.forEach((p) => {
      expect(screen.getByTestId(`person-row-${p.id}`)).toBeInTheDocument();
    });

    // Each person has all three identity kinds
    mockPeople.forEach((p) => {
      const kinds = p.identities.map((i) => i.kind);
      expect(kinds).toContain('commit_email');
      expect(kinds).toContain('github_login');
      expect(kinds).toContain('other_handle');
    });

    unmount();

    // Test "Not the same person?" on PersonDetailPage
    const priya = mockPeople[0];
    render(
      <MemoryRouter initialEntries={[`/people/${priya.id}`]}>
        <CommentPanelProvider>
          <Routes>
            <Route path="/people/:id" element={<PersonDetailPage />} />
          </Routes>
        </CommentPanelProvider>
      </MemoryRouter>
    );

    const splitBtn = await screen.findByTestId('btn-not-same-person');
    expect(splitBtn).toHaveTextContent('Not the same person?');

    fireEvent.click(splitBtn);

    const banner = await screen.findByTestId('split-banner');
    expect(banner).toHaveTextContent('Split into 3 people.');

    const undoBtn = screen.getByRole('button', { name: 'Undo' });
    fireEvent.click(undoBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('split-banner')).not.toBeInTheDocument();
    });
  });

  // Test 11: The Blind test shows accuracy 75% only after "Open the maintainers' list" is pressed
  it('11. The Blind test shows accuracy 75% only after "Open the maintainers\' list" is pressed', async () => {
    render(
      <MemoryRouter initialEntries={['/evaluate']}>
        <CommentPanelProvider>
          <Routes>
            <Route path="/evaluate" element={<EvaluatePage />} />
          </Routes>
        </CommentPanelProvider>
      </MemoryRouter>
    );

    const openBtn = await screen.findByTestId('btn-open-maintainers-list');
    expect(openBtn).toBeInTheDocument();

    // Score is hidden before button is pressed
    expect(screen.queryByTestId('accuracy-score')).not.toBeInTheDocument();
    expect(screen.queryByText(/Accuracy 75%/i)).not.toBeInTheDocument();

    // Click button
    fireEvent.click(openBtn);

    // Accuracy 75% is now visible
    const scoreCard = await screen.findByTestId('score-card');
    expect(scoreCard).toBeInTheDocument();
    expect(screen.getByTestId('accuracy-score')).toHaveTextContent('Accuracy 75%');
    expect(screen.getByTestId('precision-score')).toHaveTextContent('Precision 60%');
  });

  // Test 12: The decision record download contains the decided and rejected items with their exact quotes
  it('12. The decision record download contains the decided and rejected items with their exact quotes', () => {
    const markdown = generateMadrMarkdown(httpcacheAnalysis);

    expect(markdown).toContain('# Decision Record: Why do we retry failed requests?');

    // Decided item
    const decided = httpcacheAnalysis.decisions.find((d) => d.status === 'accepted')!;
    expect(markdown).toContain(decided.title);
    expect(markdown).toContain('Decided');
    const decidedStmt = httpcacheAnalysis.statements.find((s) => s.id === decided.reason.statement_ids[0]);
    if (decidedStmt) {
      expect(markdown).toContain(decidedStmt.quote);
    }

    // Decided against item
    const rejected = httpcacheAnalysis.decisions.find((d) => d.status === 'rejected')!;
    expect(markdown).toContain(rejected.title);
    expect(markdown).toContain('Decided against');
    const rejectedStmt = httpcacheAnalysis.statements.find((s) => s.id === rejected.reason.statement_ids[0]);
    if (rejectedStmt) {
      expect(markdown).toContain(rejectedStmt.quote);
    }
  });

  // Test 13: The Start page rejects an invalid GitHub link with a friendly message
  it('13. The Start page rejects an invalid GitHub link with a friendly message', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <CommentPanelProvider>
          <Routes>
            <Route path="/" element={<StartPage />} />
          </Routes>
        </CommentPanelProvider>
      </MemoryRouter>
    );

    const customRadio = await screen.findByDisplayValue('custom');
    await user.click(customRadio);

    const input = screen.getByTestId('custom-repo-input');
    await user.clear(input);
    await user.type(input, 'not-a-valid-github-repo');

    const submitBtn = screen.getByTestId('start-analysis-submit');
    await user.click(submitBtn);

    const errorMsg = await screen.findByTestId('custom-repo-error');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent(/Please enter a valid GitHub repository/i);
  });

  // Test 14: Escape closes the panel and returns focus to the clicked chip
  it('14. Escape closes the panel and returns focus to the clicked chip', async () => {
    const stmt = mockStatements[0];

    render(
      <CommentPanelProvider>
        <div>
          <SourceChip
            statementId={stmt.id}
            comments={mockComments}
            statements={mockStatements}
            people={mockPeople}
          />
          <OriginalCommentPanel />
        </div>
      </CommentPanelProvider>
    );

    const chip = screen.getByTestId(`source-chip-${stmt.id}`);
    chip.focus();
    expect(document.activeElement).toBe(chip);

    fireEvent.click(chip);

    const panel = await screen.findByTestId('original-comment-panel');
    expect(panel).toBeInTheDocument();

    // Fire Escape key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('original-comment-panel')).not.toBeInTheDocument();
    });

    // Focus returns to the clicked chip
    expect(document.activeElement).toBe(chip);
  });

  // Test 15: The sidebar marks the current page with aria-current="page"
  it('15. The sidebar marks the current page with aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/decisions/httpcache-analysis']}>
        <Sidebar isOpen={true} onClose={() => {}} analysisId="httpcache-analysis" />
      </MemoryRouter>
    );

    const decisionsLink = screen.getByRole('link', { name: /Decisions/i });
    expect(decisionsLink).toHaveAttribute('aria-current', 'page');

    const peopleLink = screen.getByRole('link', { name: /People/i });
    expect(peopleLink).not.toHaveAttribute('aria-current');
  });
});
