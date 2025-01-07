import { supabase } from "./supabaseClient.ts";

export async function fetchDefiData() {
  try {
    const { data, error } = await supabase
      .from('defi_market_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching DeFi data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchDefiData:', error);
    return null;
  }
}