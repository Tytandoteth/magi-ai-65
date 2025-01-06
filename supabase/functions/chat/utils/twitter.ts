const BEARER_TOKEN = Deno.env.get("Bearer Token")?.trim();

export async function fetchLatestTweets(query = "", maxResults = 10) {
  try {
    if (!BEARER_TOKEN) {
      console.error("Missing Twitter Bearer Token");
      return null;
    }

    console.log(`Fetching tweets for query: "${query}" with max results: ${maxResults}`);

    const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
    const queryParams = new URLSearchParams({
      query: `${query} -is:retweet`,
      "tweet.fields": "created_at,public_metrics",
      "max_results": maxResults.toString(),
    });
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    console.log("Twitter API URL:", url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twitter API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("Twitter API response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return null;
  }
}