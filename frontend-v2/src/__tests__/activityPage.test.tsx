import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ActivityPage } from '../pages/ActivityPage';
import { CommentPanelProvider } from '../context/CommentPanelContext';

describe('(10) Activity filters and summary line', () => {
  it('changes the rows and the plain-words summary line when filtered', async () => {
    render(
      <CommentPanelProvider>
        <MemoryRouter>
          <ActivityPage />
        </MemoryRouter>
      </CommentPanelProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/commits and/i)).toBeInTheDocument();
    });

    const initialSummary = screen.getByText(/commits and/i).textContent;
    expect(initialSummary).toContain('people between');

    // Filter by Priya N. only
    const personSelect = screen.getByLabelText(/Person/i);
    fireEvent.change(personSelect, { target: { value: 'Priya N.' } });

    await waitFor(() => {
      const updatedSummary = screen.getByText(/commits and/i).textContent;
      expect(updatedSummary).toContain('1 person');
      expect(updatedSummary).not.toEqual(initialSummary);
    });

    // Toggle off Commits checkbox
    const commitsCheckbox = screen.getByLabelText(/Commits/i);
    fireEvent.click(commitsCheckbox);

    await waitFor(() => {
      const updatedSummary = screen.getByText(/commits and/i).textContent;
      expect(updatedSummary).toContain('0 commits');
    });
  });
});
