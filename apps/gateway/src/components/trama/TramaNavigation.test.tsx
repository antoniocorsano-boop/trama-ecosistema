import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TramaNavigation } from './TramaNavigation';
import { gatewayConfig } from '../../config/gateway';

describe('TramaNavigation', () => {
  it('keeps the primary access action directly available', () => {
    render(<TramaNavigation />);
    expect(screen.getByRole('link', { name: 'Accedi' })).toHaveAttribute('href', gatewayConfig.entryHref);
  });

  it('uses the approved compact hamburger affordance', () => {
    render(<TramaNavigation />);
    const toggle = screen.getByRole('button', { name: 'Apri navigazione' });
    expect(within(toggle).getByTestId('trama-menu-icon')).toBeInTheDocument();
  });

  it('exposes the secondary navigation through an accessible compact disclosure', () => {
    render(<TramaNavigation />);
    const toggle = screen.getByRole('button', { name: 'Apri navigazione' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const compact = screen.getByRole('navigation', { name: 'Navigazione compatta' });
    expect(within(compact).getByRole('link', { name: 'Ecosistema' })).toBeVisible();
    expect(within(compact).getByRole('link', { name: 'Curricolo' })).toBeVisible();
    expect(within(compact).getByRole('link', { name: 'Guida' })).toBeVisible();
  });
});
