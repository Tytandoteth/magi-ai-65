import { fetchCoinGeckoData } from "./token/coingeckoApi.ts";
import { fetchDefiLlamaData } from "./token/defiLlamaApi.ts";
import { fetchSocialMetrics } from "./token/socialMetrics.ts";
import { formatTokenProfile } from "./token/formatters.ts";

interface TokenProfile {
  symbol: string;
  name: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  description?: string;
  defiMetrics?: {
    tvl?: number;
    change24h?: number;
    category?: string;
    chains?: string[];
    apy?: number;
    protocol?: string;
  };
  socialMetrics?: {
    twitterMentions: number;
    sentiment: number;
    recentTweets: {
      text: string;
      engagement: number;
      timestamp: string;
    }[];
  };
}

export async function createTokenProfile(symbol: string): Promise<string> {
  try {
    console.log('Creating token profile for symbol:', symbol);
    
    // Clean up symbol (remove $ if present)
    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    
    // Fetch data from different sources
    const tokenData = await fetchCoinGeckoData(cleanSymbol);
    console.log('CoinGecko data:', tokenData);

    const defiLlamaData = await fetchDefiLlamaData(cleanSymbol);
    console.log('DeFi Llama data:', defiLlamaData);

    const socialMetrics = await fetchSocialMetrics(cleanSymbol);
    console.log('Social metrics:', socialMetrics);

    if (!tokenData) {
      return `I couldn't find reliable data for ${cleanSymbol}. Please verify the token symbol and try again.`;
    }

    const profile: TokenProfile = {
      symbol: cleanSymbol,
      name: tokenData.name,
      price: tokenData.market_data?.current_price?.usd,
      marketCap: tokenData.market_data?.market_cap?.usd,
      volume24h: tokenData.market_data?.total_volume?.usd,
      description: tokenData.description?.en,
      defiMetrics: defiLlamaData ? {
        tvl: defiLlamaData.tvl,
        change24h: defiLlamaData.change_1d,
        category: defiLlamaData.category,
        chains: defiLlamaData.chains,
        apy: defiLlamaData.apy,
        protocol: defiLlamaData.name
      } : undefined,
      socialMetrics
    };

    return formatTokenProfile(profile);
  } catch (error) {
    console.error('Error creating token profile:', error);
    return `I encountered an error while fetching data for this token. Please try again later.`;
  }
}