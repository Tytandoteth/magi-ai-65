import { createHmac } from "node:crypto";

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY) throw new Error("Missing TWITTER_CONSUMER_KEY");
  if (!API_SECRET) throw new Error("Missing TWITTER_CONSUMER_SECRET");
  if (!ACCESS_TOKEN) throw new Error("Missing TWITTER_ACCESS_TOKEN");
  if (!ACCESS_TOKEN_SECRET) throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET");
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters alphabetically and encode them
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(sortedParams)}`;

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(
    tokenSecret
  )}`;

  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("OAuth Parameters:", params);
  console.log("Signature Base String:", signatureBaseString);
  console.log("Signing Key:", signingKey);
  console.log("Generated Signature:", signature);

  return signature;
}

function generateOAuthHeader(
  method: string,
  url: string,
  queryParams: Record<string, string> = {}
): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  // Combine OAuth params with query params for signature
  const signatureParams = {
    ...oauthParams,
    ...queryParams,
  };

  const signature = generateOAuthSignature(
    method,
    url,
    signatureParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  // Only include OAuth params in the header
  const headerParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(headerParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

export async function fetchLatestTweets(query = "defi OR crypto", maxResults = 10) {
  try {
    validateEnvironmentVariables();
    
    const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
    const queryParams = {
      query,
      "tweet.fields": "created_at,public_metrics",
      "max_results": maxResults.toString(),
    };
    
    const searchParams = new URLSearchParams(queryParams);
    const url = `${baseUrl}?${searchParams.toString()}`;
    
    const oauthHeader = generateOAuthHeader("GET", baseUrl, queryParams);
    
    console.log("Request URL:", url);
    console.log("OAuth Header:", oauthHeader);
    
    const response = await fetch(url, {
      headers: {
        Authorization: oauthHeader,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    console.log("Response Status:", response.status);
    console.log("Response Body:", responseText);

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return null;
  }
}