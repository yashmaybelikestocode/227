import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnswerPage } from '../pages/AnswerPage';
import { CommentPanelProvider } from '../context/CommentPanelContext';

describe('(12) Easy/Detailed Switch on Answer Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows stance sentences only in Detailed mode', async () => {
    render(
      <CommentPanelProvider>
        <MemoryRouter initialEntries={['/answer/ans-httpcache-retry']}>
          <Routes>
            <Route path="/answer/:id" element={<AnswerPage />} />
          </Routes>
        </MemoryRouter>
      </CommentPanelProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('What the team decided')).toBeInTheDocument();
    });

    // In default Easy mode, "Who took part:" stance narrative should NOT be visible
    expect(screen.queryByText(/Who took part:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Priya supported it/i)).not.toBeInTheDocument();

    // Click Detailed button
    const detailedBtn = screen.getByRole('button', { name: 'Detailed' });
    fireEvent.click(detailedBtn);

    // Stance narrative should now be visible
    await waitFor(() => {
      expect(screen.getAllByText(/Who took part:/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Priya supported it/i)).toBeInTheDocument();
    });

    // Click Easy button to switch back
    const easyBtn = screen.getByRole('button', { name: 'Easy' });
    fireEvent.click(easyBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Who took part:/i)).not.toBeInTheDocument();
    });
  });
});
