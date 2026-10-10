import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { gatewayConfig } from '../config/gateway';
import { gatewayIdentity } from '../lib/identity';

describe('TRAMA gateway', () => {
  it('renders the canonical parent identity and gateway copy', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: "TRAMA — torna all'inizio" })).toBeVisible();
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

  it('implements the approved v2 hero emphasis and Segno vivo layer', () => {
    render(<App />);
    expect(screen.getByTestId('trama-segno-vivo')).toBeInTheDocument();
    expect(screen.getAllByTestId('trama-copper-curve').length).toBeGreaterThanOrEqual(3);

    const experience = screen.getByTestId('trama-experience-accent');
    expect(experience).toHaveTextContent('esperienza.');
    expect(experience).toHaveClass('trama-copper-text');

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).not.toHaveTextContent('curricolo, conoscenza e progettazione diventano esperienza. esperienza.');
  });

  it('keeps the approved reading zone free from corrective blackout and crossing copper paths', () => {
    render(<App />);
    const stage = screen.getByRole('main').parentElement;
    expect(stage).toHaveClass('trama-gateway-stage');

    const curves = screen.getAllByTestId('trama-copper-curve');
    expect(curves.length).toBeGreaterThanOrEqual(3);
    curves.forEach((curve) => expect(curve).toHaveAttribute('data-zone', 'peripheral'));
  });

  it('does not expose the rejected vector poster through the rendered gateway', () => {
    render(<App />);
    expect(screen.getByTestId('trama-media-poster').getAttribute('src')).not.toMatch(/\.svg$/);
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
