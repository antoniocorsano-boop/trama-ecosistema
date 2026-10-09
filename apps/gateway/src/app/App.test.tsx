import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { gatewayConfig } from '../config/gateway';
import { gatewayIdentity } from '../lib/identity';

describe('TRAMA gateway', () => {
  it('renders the canonical parent identity and gateway copy', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('TRAMA')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Dove curricolo, conoscenza e progettazione diventano esperienza.',
    );
    expect(
      screen.getByText(
        'Un ecosistema per progettare, organizzare e trasformare il lavoro didattico, mantenendo unite intenzione educativa, materiali, evidenze e documentazione.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Entra in TRAMA' })).toHaveAttribute(
      'href',
      gatewayConfig.entryHref,
    );
  });

  it('adapts canonical parent identity values without inventing local ones', () => {
    expect(gatewayIdentity.colors).toEqual({
      background: '201 100% 13%',
      foreground: '0 0% 100%',
      mutedForeground: '240 4% 66%',
      primary: '0 0% 100%',
      primaryForeground: '0 0% 4%',
      secondary: '0 0% 10%',
      muted: '0 0% 10%',
      accent: '0 0% 10%',
      border: '0 0% 18%',
      input: '0 0% 18%',
    });
    expect(gatewayIdentity.fonts.display).toBe('Instrument Serif');
    expect(gatewayIdentity.fonts.body).toBe('Inter');
  });
});
