import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { CommentPanelProvider } from '../context/CommentPanelContext';
import { SourceButton } from '../components/SourceButton';
import { OriginalCommentPanel } from '../components/OriginalCommentPanel';
import { mockPosts } from '../mock/posts';

describe('(2 & 9) SourceButton and OriginalCommentPanel', () => {
  it('(2) clicking a source button opens the panel and highlights the sentence with matching id, and only that sentence', async () => {
    render(
      <CommentPanelProvider>
        <SourceButton evidenceId="p1.s2" posts={mockPosts} />
        <OriginalCommentPanel />
      </CommentPanelProvider>
    );

    const button = screen.getByRole('button', { name: /Priya, 14 Mar/i });
    expect(button).toBeInTheDocument();

    // Click source button
    fireEvent.click(button);

    // Side panel should be open
    expect(screen.getByRole('dialog', { name: /Original comment/i })).toBeInTheDocument();
    expect(screen.getByText(/You clicked:/i)).toBeInTheDocument();

    // Check sentence highlighting
    const highlightedSpan = document.querySelector('[data-sentence-id="p1.s2"]');
    expect(highlightedSpan).toBeInTheDocument();
    expect(highlightedSpan).toHaveAttribute('data-highlighted', 'true');

    // Other sentences should not be highlighted
    const nonHighlightedSpan = document.querySelector('[data-sentence-id="p1.s1"]');
    expect(nonHighlightedSpan).toBeInTheDocument();
    expect(nonHighlightedSpan).toHaveAttribute('data-highlighted', 'false');
  });

  it('(9) Escape closes the panel and returns focus to the button', async () => {
    const user = userEvent.setup();

    render(
      <CommentPanelProvider>
        <SourceButton evidenceId="p1.s2" posts={mockPosts} />
        <OriginalCommentPanel />
      </CommentPanelProvider>
    );

    const button = screen.getByRole('button', { name: /Priya, 14 Mar/i });
    button.focus();
    expect(button).toHaveFocus();

    // Open panel
    await user.click(button);
    expect(screen.getByRole('dialog', { name: /Original comment/i })).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    // Panel should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Original comment/i })).not.toBeInTheDocument();
    });

    // Focus returns to the button
    expect(button).toHaveFocus();
  });
});
