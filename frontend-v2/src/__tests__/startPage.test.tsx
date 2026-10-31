import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { StartPage } from '../pages/StartPage';

describe('(8) Start Page Link Validation', () => {
  it('rejects an invalid GitHub link with a friendly message', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <StartPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('github.com/owner/name');
    await user.type(input, 'not-a-valid-github-url');

    const submitBtn = screen.getByRole('button', { name: /Show me the history/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid GitHub repository link like github.com\/owner\/name/i)
      ).toBeInTheDocument();
    });
  });
});
