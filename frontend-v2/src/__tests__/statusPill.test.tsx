import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusPill } from '../components/StatusPill';

describe('(1) StatusPill', () => {
  it('shows the right word and icon for each status', () => {
    const { rerender } = render(<StatusPill status="accepted" />);
    expect(screen.getByText('Decided')).toBeInTheDocument();
    expect(screen.getByText('Decided').parentElement?.querySelector('svg')).toBeInTheDocument();

    rerender(<StatusPill status="rejected" />);
    expect(screen.getByText('Decided against')).toBeInTheDocument();
    expect(screen.getByText('Decided against').parentElement?.querySelector('svg')).toBeInTheDocument();

    rerender(<StatusPill status="deferred" />);
    expect(screen.getByText('Postponed')).toBeInTheDocument();
    expect(screen.getByText('Postponed').parentElement?.querySelector('svg')).toBeInTheDocument();

    rerender(<StatusPill status="unresolved" />);
    expect(screen.getByText('Still open')).toBeInTheDocument();
    expect(screen.getByText('Still open').parentElement?.querySelector('svg')).toBeInTheDocument();
  });
});
