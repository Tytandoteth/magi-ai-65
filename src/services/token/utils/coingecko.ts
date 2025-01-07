export async function fetchFromCoinGecko(symbol: string, apiKey: string) {
  console.log('Fetching CoinGecko data for symbol:', symbol);
  
  try {
    // First try direct symbol match
    const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: { 'x-cg-demo-api-key': apiKey }
    });

    if (!searchResponse.ok) {
      throw new Error(`CoinGecko search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search results:', searchData);

    if (!searchData.coins?.length) {
      console.log('No results found for:', symbol);
      return null;
    }

    // Find exact symbol match (case insensitive)
    const exactMatch = searchData.coins.find(
      (coin: any) => coin.symbol.toLowerCase() === symbol.toLowerCase() ||
                     (symbol.toLowerCase() === 'pengu' && coin.id === 'pudgy-penguins')
    );

    if (!exactMatch) {
      console.log('No exact match found for:', symbol);
      return null;
    }

    console.log('Found exact match:', exactMatch);

    // Fetch detailed data
    const detailUrl = `https://api.coingecko.com/api/v3/coins/${exactMatch.id}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`;
    const detailResponse = await fetch(detailUrl, {
      headers: { 'x-cg-demo-api-key': apiKey }
    });

    if (!detailResponse.ok) {
      throw new Error(`CoinGecko detail API error: ${detailResponse.status}`);
    }

    const tokenData = await detailResponse.json();
    console.log('Fetched token details:', tokenData);

    return tokenData;
  } catch (error) {
    console.error('Error in fetchFromCoinGecko:', error);
    throw error;
  }
}