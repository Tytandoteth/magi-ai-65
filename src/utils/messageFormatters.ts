export const formatContent = (content: string): string => {
  if (!content) return ""; 
  
  // Enhanced number formatting with locale and proper grouping
  content = content.replace(
    /\$\d+(?:\.\d{1,2})?(?:k|m|b)?/gi,
    match => {
      const num = parseFloat(match.replace(/[$kmb]/gi, ''));
      let multiplier = 1;
      
      if (match.toLowerCase().includes('k')) multiplier = 1000;
      if (match.toLowerCase().includes('m')) multiplier = 1000000;
      if (match.toLowerCase().includes('b')) multiplier = 1000000000;
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num * multiplier);
    }
  );

  // Format percentages consistently
  content = content.replace(
    /([-+]?\d+\.?\d*)%/g,
    match => {
      const num = parseFloat(match);
      return `${num.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}%`;
    }
  );

  // Handle error messages with proper formatting
  if (content.toLowerCase().includes('error:')) {
    return content.split('\n').map(line => {
      if (line.toLowerCase().startsWith('error:')) {
        return `❌ ${line.slice(6).trim()}`;
      }
      return line;
    }).join('\n');
  }

  return content;
};