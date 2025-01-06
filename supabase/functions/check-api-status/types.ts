export interface ApiStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}