import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketDataSection } from "@/components/MarketDataSection";
import { CryptoNewsSection } from "@/components/CryptoNewsSection";
import { MagAnalyticsSection } from "@/components/MagAnalyticsSection";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("market");

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Crypto Dashboard</h1>
      
      <Tabs defaultValue="market" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="news">Crypto News</TabsTrigger>
          <TabsTrigger value="analytics">MAG Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <MarketDataSection />
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <CryptoNewsSection />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <MagAnalyticsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;