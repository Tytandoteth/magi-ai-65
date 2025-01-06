import { supabase } from "../supabaseClient.ts";

export async function fetchDefiLlamaData(symbol: string): Promise<any> {
  try {
    console.log('Fetching DeFi Llama data for:', symbol);
    
    const { data: protocolData, error } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching DeFi Llama data:', error);
      return null;
    }

    if (protocolData && protocolData.length > 0) {
      console.log('Found DeFi Llama data:', protocolData[0]);
      return protocolData[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching DeFi Llama data:', error);
    return null;
  }
}