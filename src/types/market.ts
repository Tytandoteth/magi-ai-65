import { Json } from '@/integrations/supabase/types/base';

export interface MarketData {
  current_price?: {
    usd?: number;
  };
  market_cap?: {
    usd?: number;
  };
  total_volume?: {
    usd?: number;
  };
  price_change_percentage_24h?: number;
}

export function isMarketData(data: Json): data is MarketData {
  if (!data || typeof data !== 'object') return false;
  
  const marketData = data as MarketData;
  
  // Check if the structure matches our expected MarketData interface
  return (
    (!marketData.current_price || (typeof marketData.current_price === 'object' && typeof marketData.current_price.usd === 'number')) &&
    (!marketData.market_cap || (typeof marketData.market_cap === 'object' && typeof marketData.market_cap.usd === 'number')) &&
    (!marketData.total_volume || (typeof marketData.total_volume === 'object' && typeof marketData.total_volume.usd === 'number')) &&
    (!marketData.price_change_percentage_24h || typeof marketData.price_change_percentage_24h === 'number')
  );
}