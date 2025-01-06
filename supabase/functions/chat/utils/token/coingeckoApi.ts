import { supabase } from "../supabaseClient.ts";

export async function fetchCoinGeckoData(symbol: string): Promise<any> {
  try {
    console.log('Fetching CoinGecko data for:', symbol);
    const apiKey = Deno.env.get('COINGECKO_API_KEY');
    
    // First try to get from our database
    const { data: storedData, error: dbError } = await supabase
      .from('token_metadata')
      .select('*')
      .ilike('symbol', symbol)
      .order('last_updated', { ascending: false })
      .limit(1);

    if (dbError) {
      console.error('Error fetching from database:', dbError);
    } else if (storedData && storedData.length > 0) {
      const lastUpdated = new Date(storedData[0].last_updated);
      const now = new Date();
      if ((now.getTime() - lastUpdated.getTime()) < 3600000) {
        console.log('Using cached token data');
        return storedData[0];
      }
    }

    // Search CoinGecko API
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${symbol}`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey || ''
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`CoinGecko search API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search results:', searchData);
    
    if (!searchData.coins?.length) {
      console.log('No results found for symbol:', symbol);
      return null;
    }

    // Get the most relevant result by matching symbol
    const relevantCoins = searchData.coins.filter((coin: any) => 
      coin.symbol.toLowerCase() === symbol.toLowerCase()
    );
    const topResult = relevantCoins[0] || searchData.coins[0];

    // Fetch detailed data
    const detailResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${topResult.id}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey || ''
        }
      }
    );

    if (!detailResponse.ok) {
      throw new Error(`CoinGecko detail API error: ${detailResponse.status}`);
    }

    const tokenData = await detailResponse.json();
    console.log('Fetched token details:', tokenData);

    // Store in database
    const { error: insertError } = await supabase
      .from('token_metadata')
      .insert({
        symbol: tokenData.symbol.toUpperCase(),
        name: tokenData.name,
        coingecko_id: tokenData.id,
        description: tokenData.description?.en,
        categories: tokenData.categories,
        platforms: tokenData.platforms,
        market_data: tokenData.market_data,
        last_updated: new Date().toISOString(),
        metadata: tokenData
      });

    if (insertError) {
      console.error('Error storing token data:', insertError);
    }

    return tokenData;
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return null;
  }
}