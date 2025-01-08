export function formatTokenResponse(data: any) {
  if (!data) return 'Sorry, I could not find information for that token.';
  
  try {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  } catch (error) {
    console.error('Error formatting token data:', error);
    return 'Sorry, there was an error formatting the token data.';
  }
}