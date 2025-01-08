export function formatTokenResponse(data: any) {
  if (!data) return '';
  
  try {
    return Object.entries(data)
      .map(([key, value]) => `  • ${key}: ${JSON.stringify(value)}`)
      .join('\n');
  } catch (error) {
    console.error('Error formatting token data:', error);
    return JSON.stringify(data);
  }
}