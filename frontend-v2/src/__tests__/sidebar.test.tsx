import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Sidebar } from '../components/Sidebar';

describe('(14) Sidebar Active Link', () => {
  it('marks the current page with aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/activity']}>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    const activityLink = screen.getByRole('link', { name: /Activity/i });
    expect(activityLink).toHaveAttribute('aria-current', 'page');

    const startLink = screen.getByRole('link', { name: /Start/i });
    expect(startLink).not.toHaveAttribute('aria-current', 'page');
  });
});
