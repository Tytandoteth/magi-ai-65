import { supabase } from "@/integrations/supabase/client";

const MAG_CONTRACT_ADDRESS = '0x71da932ccda723ba3ab730c976bc66daaf9c598c';

export async function fetchMagTokenData() {
  console.log('Fetching MAG token data from Etherscan');
  
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'etherscan_api_key')
      .single();

    if (error) {
      console.error('Error fetching Etherscan API key:', error);
      throw new Error('Failed to fetch Etherscan API key');
    }

    if (!data?.value) {
      console.error('No Etherscan API key found');
      throw new Error('No Etherscan API key found');
    }

    const etherscan_api_key = data.value;
    const baseUrl = 'https://api.etherscan.io/api';
    
    // Fetch token info
    const tokenInfoResponse = await fetch(
      `${baseUrl}?module=token&action=tokeninfo&contractaddress=${MAG_CONTRACT_ADDRESS}&apikey=${etherscan_api_key}`
    );
    const tokenInfo = await tokenInfoResponse.json();
    
    // Fetch token supply
    const supplyResponse = await fetch(
      `${baseUrl}?module=stats&action=tokensupply&contractaddress=${MAG_CONTRACT_ADDRESS}&apikey=${etherscan_api_key}`
    );
    const supplyData = await supplyResponse.json();
    
    // Fetch holder count
    const holdersResponse = await fetch(
      `${baseUrl}?module=token&action=tokenholderlist&contractaddress=${MAG_CONTRACT_ADDRESS}&apikey=${etherscan_api_key}`
    );
    const holdersData = await holdersResponse.json();

    console.log('Successfully fetched MAG token data');
    
    return {
      tokenInfo: tokenInfo.result,
      totalSupply: supplyData.result,
      holders: holdersData.result?.length || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching MAG token data:', error);
    throw error;
  }
}