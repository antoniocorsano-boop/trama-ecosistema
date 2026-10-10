import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (!root) throw new Error('TRAMA_ACCESS_ROOT_MISSING');

createRoot(root).render(
  <StrictMode>
    <main>
      <h1>TRAMA Access</h1>
      <p>Accesso professionale in preparazione.</p>
    </main>
  </StrictMode>,
);
