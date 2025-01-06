import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface CryptoNews {
  title: string;
  url: string;
  source: string;
  published_at: string;
  sentiment: number;
  categories: string[];
}

export const CryptoNewsSection = () => {
  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ["cryptoNews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crypto_news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as CryptoNews[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Error loading news</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {newsData?.map((news, index) => (
        <Card key={index} className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {news.title}
                </a>
              </h3>
              <Badge variant={news.sentiment > 0.5 ? "success" : "destructive"}>
                {news.sentiment > 0.5 ? "Positive" : "Negative"}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              {news.categories?.map((category, idx) => (
                <Badge key={idx} variant="secondary">{category}</Badge>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{news.source}</span>
              <span>{new Date(news.published_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};