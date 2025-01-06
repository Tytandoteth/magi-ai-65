// Utility functions for external API calls
export async function fetchMarketData() {
  try {
    const response = await fetch('https://api.example.com/market-data');
    const data = await response.json();
    console.log('Market API data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

export async function fetchCoinGeckoData() {
  const apiKey = Deno.env.get('COINGECKO_API_KEY');
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
      {
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      }
    );
    const data = await response.json();
    console.log('CoinGecko API data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return null;
  }
}

export async function fetchTokenData(address: string) {
  try {
    const response = await fetch(`https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${address}&apikey=${Deno.env.get('ETHERSCAN_API_KEY')}`);
    const data = await response.json();
    console.log('Etherscan token data:', data);
    
    // Also fetch holder count
    const holdersResponse = await fetch(`https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${address}&apikey=${Deno.env.get('ETHERSCAN_API_KEY')}`);
    const holdersData = await holdersResponse.json();
    console.log('Etherscan holders data:', holdersData);
    
    return {
      tokenInfo: data.result,
      holders: holdersData.result?.length || 0
    };
  } catch (error) {
    console.error('Error fetching Etherscan data:', error);
    return null;
  }
}

import { fetchLatestTweets } from './twitter.ts';

export async function fetchExternalData() {
  const penguAddress = '0x1234...'; // Replace with actual $PENGU contract address
  const [marketData, cryptoData, twitterData, tokenData] = await Promise.all([
    fetchMarketData(),
    fetchCoinGeckoData(),
    fetchLatestTweets(),
    fetchTokenData(penguAddress)
  ]);
  
  return {
    marketData,
    cryptoData,
    twitterData,
    tokenData
  };
}