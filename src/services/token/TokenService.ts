import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";

export class TokenService {
  private static instance: TokenService;
  private tokenRepository: TokenRepository;
  private tokenFormatter: TokenFormatter;
  private tokenOperations: TokenOperations;

  constructor() {
    this.tokenRepository = new TokenRepository();
    this.tokenFormatter = new TokenFormatter();
    this.tokenOperations = new TokenOperations();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    try {
      // Call the token-profile edge function
      const { data, error } = await supabase.functions.invoke('token-profile', {
        body: { symbol }
      });

      console.log('Token profile response:', data, 'Error:', error);

      if (error || !data) {
        throw new Error(`Failed to fetch token data: ${error?.message || 'No data returned'}`);
      }

      return data.data;

    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      throw error;
    }
  }
}