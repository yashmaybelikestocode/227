import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnswerPage } from '../pages/AnswerPage';
import { SavedPage } from '../pages/SavedPage';
import { CommentPanelProvider } from '../context/CommentPanelContext';

describe('(13) Save / Saved Page integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('pressing Save on an answer adds it to /saved and Remove deletes it', async () => {
    // 1. Visit Answer page and click Save
    const { unmount } = render(
      <CommentPanelProvider>
        <MemoryRouter initialEntries={['/answer/ans-httpcache-retry']}>
          <Routes>
            <Route path="/answer/:id" element={<AnswerPage />} />
          </Routes>
        </MemoryRouter>
      </CommentPanelProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Why do we retry failed requests?')).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveBtn);

    // Save button changes label to "Saved"
    expect(screen.getByRole('button', { name: /Saved/i })).toBeInTheDocument();

    unmount();

    // 2. Visit Saved page
    render(
      <MemoryRouter initialEntries={['/saved']}>
        <Routes>
          <Route path="/saved" element={<SavedPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Answer should be listed on /saved
    expect(screen.getByText('Why do we retry failed requests?')).toBeInTheDocument();
    const removeBtn = screen.getByRole('button', { name: /Remove/i });
    expect(removeBtn).toBeInTheDocument();

    // 3. Click Remove
    fireEvent.click(removeBtn);

    // Should now show empty state
    await waitFor(() => {
      expect(
        screen.getByText(/Nothing saved yet\. Press Save on any answer to keep it here\./i)
      ).toBeInTheDocument();
    });
  });
});
