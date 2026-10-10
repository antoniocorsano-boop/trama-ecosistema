import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TramaGlassAction } from './TramaGlassAction';

describe('TramaGlassAction', () => {
  it('renders the configured destination as a link', () => {
    render(<TramaGlassAction href="/ecosistema">Accedi</TramaGlassAction>);

    expect(screen.getByRole('link', { name: 'Accedi' })).toHaveAttribute('href', '/ecosistema');
  });

  it('renders unavailable professional entry as a self-explanatory disabled control', () => {
    render(<TramaGlassAction href={null}>Accedi</TramaGlassAction>);

    const control = screen.getByRole('button', { name: 'Accesso in preparazione' });
    expect(control).toBeDisabled();
    expect(control).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('link', { name: 'Accedi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accedi' })).not.toBeInTheDocument();
  });
});
