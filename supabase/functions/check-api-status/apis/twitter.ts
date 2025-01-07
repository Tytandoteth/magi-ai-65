import { ApiStatus } from '../types.ts';

export async function checkTwitterAPI(): Promise<ApiStatus> {
  console.log('Twitter API check disabled - at capacity');
  
  return {
    name: 'Twitter API',
    status: 'degraded',
    lastChecked: new Date(),
    error: 'Twitter API temporarily disabled due to rate limits'
  };
}