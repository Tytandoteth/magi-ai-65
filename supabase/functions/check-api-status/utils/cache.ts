export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const cache = new Map<string, { data: any; timestamp: number }>();

export const getCachedData = (key: string) => {
  const cachedData = cache.get(key);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log(`Using cached ${key} API status`);
    return cachedData.data;
  }
  return null;
};

export const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};