import type { PropsWithChildren } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function TramaGlassAction({
  href,
  className,
  children,
  size = 'default',
}: PropsWithChildren<{ href: string; className?: string; size?: 'default' | 'hero' }>) {
  return (
    <Button asChild variant="glass" size={size} className={cn('cursor-pointer', className)}>
      <a href={href}>{children}</a>
    </Button>
  );
}
