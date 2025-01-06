const BEARER_TOKEN = Deno.env.get("Bearer Token")?.trim();

export async function fetchLatestTweets(query = "defi OR crypto", maxResults = 10) {
  try {
    if (!BEARER_TOKEN) {
      console.error("Missing Twitter Bearer Token");
      return null;
    }

    const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
    const queryParams = new URLSearchParams({
      query,
      "tweet.fields": "created_at,public_metrics",
      "max_results": maxResults.toString(),
    });
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    console.log("Fetching tweets from URL:", url);
    console.log("Using Bearer token:", BEARER_TOKEN.substring(0, 5) + "...");
    
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
    console.log("Successfully fetched tweets:", data);
    return data;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return null;
  }
}