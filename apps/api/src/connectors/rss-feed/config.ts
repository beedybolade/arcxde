/**
 * 🛠️ OPTIMIZED FOR CLASSIFIER BUCKETS:
 * A single generic keyword like 'ai' generates too much noise (stock market articles, marketing fluff).
 * Using specific search operators pulls exact matches for ingestion classifiers.
 */
export const DEFAULT_GOOGLE_NEWS_QUERY =
  '("artificial intelligence" OR "LLM" OR "machine learning") AND ("open source" OR "framework" OR "regulation" OR "compute" OR "GPU")';
export const DEFAULT_FEED_URL = 'https://importai.substack.com/feed';

export function googleNewsFeedUrl(query: string = DEFAULT_GOOGLE_NEWS_QUERY): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

export function resolveRssFeedUrl(
  mode: 'feed' | 'google-news' = 'feed',
  query: string = DEFAULT_GOOGLE_NEWS_QUERY,
): string {
  if (mode === 'google-news') {
    return googleNewsFeedUrl(query);
  }
  return process.env.RSS_FEED_URL ?? DEFAULT_FEED_URL;
}
