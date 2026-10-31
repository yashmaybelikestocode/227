import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { CodePage } from '../pages/CodePage';
import { CommentPanelProvider } from '../context/CommentPanelContext';

describe('(4 & 5) Code View', () => {
  it('(4) "Show only lines with a discussion" toggle hides plain code blocks', async () => {
    render(
      <CommentPanelProvider>
        <MemoryRouter initialEntries={['/code/src/retry.py']}>
          <Routes>
            <Route path="/code/*" element={<CodePage />} />
          </Routes>
        </MemoryRouter>
      </CommentPanelProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('src/retry.py', { selector: 'h1' })).toBeInTheDocument();
    });

    // Line 1 is "import time", which has no discussion
    expect(screen.getByText('import time')).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /Show only lines with a discussion/i });
    fireEvent.click(toggleButton);

    // After toggling, plain line 1 should be hidden
    expect(screen.queryByText('import time')).not.toBeInTheDocument();

    // But discussion lines (e.g. lines 4-11 or line 14) remain visible
    expect(screen.getByText(/fetch_with_retry/i)).toBeInTheDocument();
  });

  it('(5) a thread with a reversed later note shows "Undone later"', async () => {
    render(
      <CommentPanelProvider>
        <MemoryRouter initialEntries={['/code/src/retry.py']}>
          <Routes>
            <Route path="/code/*" element={<CodePage />} />
          </Routes>
        </MemoryRouter>
      </CommentPanelProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('src/retry.py', { selector: 'h1' })).toBeInTheDocument();
    });

    // Check for "Undone later" badge and title
    expect(screen.getByText('Undone later')).toBeInTheDocument();
    expect(screen.getByText('Health checks no longer retry')).toBeInTheDocument();
  });
});
