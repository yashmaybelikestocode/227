import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ResultsPage } from '../pages/ResultsPage';

describe('(3) Keyword results filters', () => {
  it('reduce the list and update the count', async () => {
    render(
      <MemoryRouter initialEntries={['/results?q=exponential+backoff']}>
        <Routes>
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText(/discussions found in/i)).toBeInTheDocument();
    });

    const initialTitle = screen.getByRole('heading', { level: 1 }).textContent;
    expect(initialTitle).toContain('13 discussions found in 6 projects');

    // Filter by Pull requests only
    const prRadio = screen.getByLabelText(/Pull requests/i);
    fireEvent.click(prRadio);

    // Count should be reduced to 7 PRs and title updated
    await waitFor(() => {
      const updatedTitle = screen.getByRole('heading', { level: 1 }).textContent;
      expect(updatedTitle).toContain('7 discussions found in 6 projects');
    });

    // Also filter by specific project (acme/httpcache)
    const acmeCheckbox = screen.getByRole('checkbox', { name: /acme\/httpcache/i });
    fireEvent.click(acmeCheckbox);

    await waitFor(() => {
      const updatedTitle = screen.getByRole('heading', { level: 1 }).textContent;
      expect(updatedTitle).toContain('2 discussions found in 1 project');
    });
  });
});
