import type { PropsWithChildren } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function TramaGlassAction({
  href,
  className,
  children,
  size = 'default',
}: PropsWithChildren<{ href: string | null; className?: string; size?: 'default' | 'hero' }>) {
  if (href === null) {
    return (
      <Button
        type="button"
        variant="glass"
        size={size}
        disabled
        aria-disabled="true"
        className={cn('cursor-not-allowed', className)}
      >
        Accesso in preparazione
      </Button>
    );
  }

  return (
    <Button asChild variant="glass" size={size} className={cn('cursor-pointer', className)}>
      <a href={href}>{children}</a>
    </Button>
  );
}
