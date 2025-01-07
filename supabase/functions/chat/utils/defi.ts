import { supabase } from "./supabaseClient.ts";

export async function fetchDefiData() {
  console.log('Fetching DeFi data...');
  
  try {
    const { data: protocols, error } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .order('tvl', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching DeFi data:', error);
      return null;
    }

    console.log('Fetched DeFi protocols:', protocols);
    return {
      protocols,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in fetchDefiData:', error);
    return null;
  }
}