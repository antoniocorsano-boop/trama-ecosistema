import type { ReactNode } from 'react';
export function AccessStatus({ children, tone = 'notice' }: { children: ReactNode; tone?: 'notice' | 'error' | 'success' }) {
  return <p className={`access-status access-status--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</p>;
}
