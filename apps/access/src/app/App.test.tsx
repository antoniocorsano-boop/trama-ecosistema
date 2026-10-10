import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccessView, App, type AccessApi } from './App';
import type { AccessState } from './access-state';

const launcher = [
  {
    application: 'DOCENTE_OS' as const,
    label: 'Docente OS',
    entitlement: 'USE' as const,
    availability: 'FEDERATION_PENDING' as const,
  },
];

const states: AccessState[] = [
  { state: 'SIGNED_OUT' },
  { state: 'MAGIC_LINK_SENT' },
  { state: 'AUTH_CALLBACK_PROCESSING' },
  { state: 'AUTHENTICATED', principalId: '00000000-0000-4000-8000-000000000001' },
  { state: 'NO_ENTITLEMENTS', principalId: '00000000-0000-4000-8000-000000000001', launcher: [] },
  {
    state: 'ENTITLEMENTS_AVAILABLE',
    principalId: '00000000-0000-4000-8000-000000000001',
    launcher,
  },
  { state: 'ACCESS_DENIED' },
  { state: 'PROVIDER_UNAVAILABLE' },
  { state: 'SESSION_EXPIRED' },
];

const forbiddenJargon = /supabase|pkce|issuer|subject|stack|http\s*\d{3}/i;

describe('TRAMA Access canonical states', () => {
  it.each(states.map((state) => [state.state, state] as const))(
    'renders %s with human-facing Italian copy and no provider jargon',
    (_name, state) => {
      render(<AccessView state={state} onRequestLink={vi.fn()} onLogout={vi.fn()} onReset={vi.fn()} />);
      expect(screen.getByText('TRAMA')).toBeVisible();
      expect(document.body.textContent).not.toMatch(forbiddenJargon);
    },
  );

  it('renders signed-out as one email field and one primary professional access action', () => {
    render(
      <AccessView state={{ state: 'SIGNED_OUT' }} onRequestLink={vi.fn()} onLogout={vi.fn()} onReset={vi.fn()} />,
    );
    expect(screen.getByRole('textbox', { name: /email/i })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Accedi' })).toBeVisible();
  });

  it('renders governed launcher items as non-navigation federation-pending controls', () => {
    render(
      <AccessView
        state={{
          state: 'ENTITLEMENTS_AVAILABLE',
          principalId: '00000000-0000-4000-8000-000000000001',
          launcher,
        }}
        onRequestLink={vi.fn()}
        onLogout={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText('Docente OS')).toBeVisible();
    expect(screen.getByText('Disponibile dalla fase di federazione')).toBeVisible();
    expect(screen.queryByRole('link', { name: /Docente OS/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Docente OS/i })).toBeDisabled();
  });

  it('keeps logout visible for authenticated launcher states', () => {
    for (const state of [
      { state: 'AUTHENTICATED', principalId: '00000000-0000-4000-8000-000000000001' } as const,
      { state: 'NO_ENTITLEMENTS', principalId: '00000000-0000-4000-8000-000000000001', launcher: [] } as const,
      {
        state: 'ENTITLEMENTS_AVAILABLE',
        principalId: '00000000-0000-4000-8000-000000000001',
        launcher,
      } as const,
    ]) {
      const { unmount } = render(
        <AccessView state={state} onRequestLink={vi.fn()} onLogout={vi.fn()} onReset={vi.fn()} />,
      );
      expect(screen.getByRole('button', { name: 'Esci' })).toBeVisible();
      unmount();
    }
  });
});

describe('TRAMA Access application lifecycle', () => {
  it('submits email through the API without retaining the address in the rendered success state', async () => {
    const api: AccessApi = {
      getState: vi.fn().mockResolvedValue({ state: 'SIGNED_OUT' }),
      requestMagicLink: vi.fn().mockResolvedValue({ state: 'MAGIC_LINK_SENT' }),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    render(<App api={api} />);
    const input = await screen.findByRole('textbox', { name: /email/i });
    fireEvent.change(input, { target: { value: 'pilot@example.invalid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }));

    await screen.findByText(/Controlla la tua email/i);
    expect(api.requestMagicLink).toHaveBeenCalledWith('pilot@example.invalid');
    expect(document.body.textContent).not.toContain('pilot@example.invalid');
  });

  it('automatically resolves one-time AUTHENTICATED into the current launcher state without a second login', async () => {
    vi.useFakeTimers();
    const api: AccessApi = {
      getState: vi
        .fn()
        .mockResolvedValueOnce({
          state: 'AUTHENTICATED',
          principalId: '00000000-0000-4000-8000-000000000001',
        })
        .mockResolvedValueOnce({
          state: 'NO_ENTITLEMENTS',
          principalId: '00000000-0000-4000-8000-000000000001',
          launcher: [],
        }),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    };

    render(<App api={api} authenticatedSettleMs={250} />);
    await screen.findByText(/Accesso verificato/i);
    await vi.advanceTimersByTimeAsync(250);
    await waitFor(() => expect(screen.getByText(/Nessun ambiente disponibile/i)).toBeVisible());
    expect(api.getState).toHaveBeenCalledTimes(2);
    expect(api.requestMagicLink).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
