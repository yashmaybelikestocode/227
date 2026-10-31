import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { HotspotsPage } from '../pages/HotspotsPage';

describe('(11) Hotspots Table Sorting', () => {
  it('sorts by a clicked column', async () => {
    render(
      <MemoryRouter>
        <HotspotsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('src/retry.py')).toBeInTheDocument();
    });

    // Get all file names before sorting by file name
    const fileHeaders = screen.getByRole('columnheader', { name: /File/i });
    fireEvent.click(fileHeaders);

    // After clicking File once (descending), src/utils.py should be near top
    const rows = screen.getAllByRole('row');
    const firstDataRowCell = rows[1].querySelector('td')?.textContent?.trim();
    expect(firstDataRowCell).toBe('src/utils.py');

    // Click again to toggle ascending sort
    fireEvent.click(fileHeaders);
    const rowsAsc = screen.getAllByRole('row');
    const firstDataRowCellAsc = rowsAsc[1].querySelector('td')?.textContent?.trim();
    expect(firstDataRowCellAsc).toBe('src/cache.py');
  });
});
