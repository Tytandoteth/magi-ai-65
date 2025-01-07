import { supabase } from "../supabaseClient.ts";

export async function fetchCoinGeckoData(symbol: string): Promise<any> {
  try {
    console.log('Fetching CoinGecko data for:', symbol);
    const apiKey = Deno.env.get('COINGECKO_API_KEY');
    
    // First check cache
    const { data: cachedData, error: cacheError } = await supabase
      .from('token_metadata')
      .select('*')
      .ilike('symbol', symbol)
      .order('last_updated', { ascending: false })
      .limit(1);

    if (!cacheError && cachedData && cachedData.length > 0) {
      const lastUpdated = new Date(cachedData[0].last_updated);
      const now = new Date();
      // Use cache if less than 5 minutes old
      if ((now.getTime() - lastUpdated.getTime()) < 300000) {
        console.log('Using cached token data for:', symbol);
        return cachedData[0];
      }
    }

    // Search CoinGecko API
    console.log('Fetching fresh data from CoinGecko for:', symbol);
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${symbol}`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey || ''
        }
      }
    );

    if (!searchResponse.ok) {
      console.error('CoinGecko search API error:', searchResponse.status);
      throw new Error(`CoinGecko search API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search results:', searchData);
    
    if (!searchData.coins?.length) {
      console.log('No results found for symbol:', symbol);
      return null;
    }

    // Get the most relevant result
    const relevantCoins = searchData.coins.filter((coin: any) => 
      coin.symbol.toLowerCase() === symbol.toLowerCase()
    );
    const topResult = relevantCoins[0] || searchData.coins[0];

    // Fetch detailed data with retries
    let retries = 3;
    let tokenData = null;
    
    while (retries > 0 && !tokenData) {
      try {
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

        tokenData = await detailResponse.json();
        console.log('Fetched token details:', tokenData);
      } catch (error) {
        console.error(`Attempt ${4 - retries}/3 failed:`, error);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!tokenData) {
      throw new Error('Failed to fetch token details after multiple attempts');
    }

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
        market_data: {
          current_price: tokenData.market_data?.current_price,
          market_cap: tokenData.market_data?.market_cap,
          total_volume: tokenData.market_data?.total_volume,
          price_change_24h: tokenData.market_data?.price_change_24h,
          price_change_percentage_24h: tokenData.market_data?.price_change_percentage_24h
        },
        last_updated: new Date().toISOString(),
        metadata: {
          image: tokenData.image,
          links: tokenData.links,
          last_updated: tokenData.last_updated,
          additional_metrics: {
            market_cap_rank: tokenData.market_cap_rank,
            coingecko_rank: tokenData.coingecko_rank,
            coingecko_score: tokenData.coingecko_score
          }
        }
      });

    if (insertError) {
      console.error('Error storing token data:', insertError);
      // Don't throw here, still return the data even if storage failed
    }

    return tokenData;
  } catch (error) {
    console.error('Error in fetchCoinGeckoData:', error);
    throw error;
  }
}