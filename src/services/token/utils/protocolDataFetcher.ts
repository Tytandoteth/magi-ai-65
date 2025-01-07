import { supabase } from "@/integrations/supabase/client";

export async function fetchProtocolData(symbol: string) {
  console.log('Fetching protocol data for:', symbol);
  
  const { data: protocolData, error: protocolError } = await supabase
    .from('defi_llama_protocols')
    .select('*')
    .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (protocolError) {
    console.error('Error fetching DeFi Llama data:', protocolError);
    return null;
  }

  return protocolData?.[0];
}