import { supabase } from "@/integrations/supabase/client";
import { TokenData, ProtocolData } from "@/types/token";

export class TokenRepository {
  static async fetchTokenData(symbol: string): Promise<TokenData | null> {
    console.log('Fetching token data for:', symbol);
    
    const { data: tokenData, error } = await supabase
      .from('token_metadata')
      .select('*')
      .ilike('symbol', symbol)
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }

    return tokenData;
  }

  static async fetchProtocolData(symbol: string): Promise<ProtocolData | null> {
    console.log('Fetching protocol data for:', symbol);
    
    const { data: protocolData, error } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching DeFi Llama data:', error);
      return null;
    }

    return protocolData;
  }

  static async fetchTokenFromAPI(symbol: string): Promise<TokenData | null> {
    console.log('Fetching from API for token:', symbol);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('token-profile', {
        body: { symbol }
      });

      if (error || !response?.data) {
        console.error('Error fetching token profile:', error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('API error:', error);
      return null;
    }
  }
}