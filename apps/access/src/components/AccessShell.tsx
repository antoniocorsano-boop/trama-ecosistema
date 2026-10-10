import type { PropsWithChildren } from 'react';

export function AccessShell({ children }: PropsWithChildren) {
  return (
    <main className="access-stage">
      <div className="access-frame">
        <header className="access-header" aria-label="TRAMA Access">
          <span className="access-wordmark">TRAMA</span>
          <span className="access-product-name">Access</span>
        </header>
        <section className="access-panel" aria-labelledby="access-title">
          {children}
        </section>
      </div>
    </main>
  );
}
