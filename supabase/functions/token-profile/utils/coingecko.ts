export async function fetchFromCoinGecko(symbol: string, cgApiKey: string) {
  console.log('Fetching data from CoinGecko for:', symbol);
  
  // Search for the token
  const searchResponse = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${symbol}`,
    {
      headers: {
        'x-cg-demo-api-key': cgApiKey
      }
    }
  );

  if (!searchResponse.ok) {
    throw new Error(`CoinGecko API error: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  console.log('Search results:', searchData);

  if (!searchData.coins?.length) {
    return null;
  }

  // Get the most relevant result
  const relevantCoins = searchData.coins.filter((coin: any) => 
    coin.symbol.toLowerCase() === symbol.toLowerCase()
  );
  const topResult = relevantCoins[0] || searchData.coins[0];

  // Fetch detailed data
  const detailResponse = await fetch(
    `https://api.coingecko.com/api/v3/coins/${topResult.id}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`,
    {
      headers: {
        'x-cg-demo-api-key': cgApiKey
      }
    }
  );

  if (!detailResponse.ok) {
    throw new Error(`CoinGecko detail API error: ${detailResponse.status}`);
  }

  return detailResponse.json();
}