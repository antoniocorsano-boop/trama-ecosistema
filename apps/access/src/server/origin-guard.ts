export function assertSameOrigin(request: Request, configuredOrigin: string): void {
  const origin = request.headers.get('origin');
  if (!origin || origin !== configuredOrigin) throw new Error('ORIGIN_REJECTED');
}
