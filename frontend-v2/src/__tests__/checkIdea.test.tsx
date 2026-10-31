import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { CheckPage } from '../pages/CheckPage';
import { CommentPanelProvider } from '../context/CommentPanelContext';

describe('(7) Check Idea Page', () => {
  it('returns the rejected-library decision for matching text containing "library"', async () => {
    const user = userEvent.setup();

    render(
      <CommentPanelProvider>
        <CheckPage />
      </CommentPanelProvider>
    );

    const textarea = screen.getByLabelText(/Paste your pull request description or idea/i);
    await user.type(textarea, 'We should import a retry library from PyPI');

    const submitBtn = screen.getByRole('button', { name: /Check history/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Something like this came up before.')).toBeInTheDocument();
    });

    expect(screen.getByText('Use an outside retry library')).toBeInTheDocument();
    expect(screen.getByText('Decided against')).toBeInTheDocument();
    expect(screen.getByText(/An outside package adds a dependency/i)).toBeInTheDocument();
  });

  it('returns empty message when no matching idea is found', async () => {
    const user = userEvent.setup();

    render(
      <CommentPanelProvider>
        <CheckPage />
      </CommentPanelProvider>
    );

    const textarea = screen.getByLabelText(/Paste your pull request description or idea/i);
    await user.type(textarea, 'Unrelated topic about frontend color palettes');

    const submitBtn = screen.getByRole('button', { name: /Check history/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Nothing similar was found in the discussions we looked at.')
      ).toBeInTheDocument();
    });
  });
});
