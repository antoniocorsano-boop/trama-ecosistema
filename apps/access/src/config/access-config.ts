export type AccessProviderKind = 'disabled' | 'fake' | 'supabase';
export type AccessStoreKind = 'disabled' | 'memory' | 'supabase';

export interface AccessConfig {
  origin: string;
  providerKind: AccessProviderKind;
  storeKind: AccessStoreKind;
  sessionTtlSeconds: 28800;
  nodeEnv: string;
}

const PROVIDERS = new Set<AccessProviderKind>(['disabled', 'fake', 'supabase']);
const STORES = new Set<AccessStoreKind>(['disabled', 'memory', 'supabase']);

export function loadAccessConfig(env: NodeJS.ProcessEnv): AccessConfig {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const providerKind = (env.ACCESS_PROVIDER_KIND ?? 'disabled') as AccessProviderKind;
  const storeKind = (env.ACCESS_STORE_KIND ?? (providerKind === 'disabled' ? 'disabled' : nodeEnv === 'production' ? 'supabase' : 'memory')) as AccessStoreKind;
  const origin = env.ACCESS_ORIGIN ?? 'http://localhost:3000';
  if (!PROVIDERS.has(providerKind)) throw new Error('Unsupported ACCESS_PROVIDER_KIND');
  if (!STORES.has(storeKind)) throw new Error('Unsupported ACCESS_STORE_KIND');
  const validPair = (providerKind === 'disabled' && storeKind === 'disabled') || (providerKind === 'fake' && storeKind === 'memory') || (providerKind === 'supabase' && storeKind === 'supabase');
  if (!validPair) throw new Error('Incompatible Access provider/store pair');
  if (nodeEnv === 'production' && (providerKind === 'fake' || storeKind === 'memory')) throw new Error('Unsafe production Access adapter');
  if (nodeEnv === 'production' && providerKind === 'supabase' && !origin.startsWith('https://')) throw new Error('Production Access origin must use https');
  return { origin, providerKind, storeKind, sessionTtlSeconds: 28800, nodeEnv };
}
