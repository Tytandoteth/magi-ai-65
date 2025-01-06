import { ApiStatus } from '../types.ts';

const CACHE_DURATION = 60000; // 1 minute
const cache = new Map<string, { data: ApiStatus; timestamp: number }>();

export function getCachedData(key: string): ApiStatus | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData(key: string, data: ApiStatus): void {
  cache.set(key, { data, timestamp: Date.now() });
}