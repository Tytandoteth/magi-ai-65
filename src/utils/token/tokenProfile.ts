import { supabase } from "@/integrations/supabase/client";

export async function createTokenProfile(symbol: string): Promise<string> {
  try {
    console.log('Fetching token profile for:', symbol);
    
    const { data, error } = await supabase.functions.invoke('token-profile', {
      body: { symbol }
    });

    if (error) {
      console.error('Error fetching token profile:', error);
      return `I encountered an error while fetching data for this token. Please try again later.`;
    }

    if (data.error) {
      return data.error;
    }

    return data.data;
  } catch (error) {
    console.error('Error creating token profile:', error);
    return `I encountered an error while fetching data for this token. Please try again later.`;
  }
}