/**
 * 🛠️ OPTIMIZED FOR YOUR PIPELINE'S CLASSIFIER BUCKETS:
 * Filters out low-signal noise (stock tickers, generalized pop-sci)
 * and focuses on core technical infra, regulation frameworks, and model drops.
 */
export const DEFAULT_NEWS_API_QUERY =
  '("artificial intelligence" OR "LLM" OR "machine learning") AND ("open source" OR "framework" OR "regulation" OR "compute" OR "GPU")';

export const DEFAULT_NEWS_PROVIDER = 'newsapi_org';

export interface NewsOptionsResolution {
  provider: string;
  query: string;
  apiKey?: string | undefined;
}

export function resolveNewsApiOptions(
  configOverride?: Record<string, unknown>,
): NewsOptionsResolution {
  const rawProvider = configOverride?.provider;
  const provider = typeof rawProvider === 'string' ? rawProvider : DEFAULT_NEWS_PROVIDER;
  const rawQuery = configOverride?.query;
  const query = typeof rawQuery === 'string' ? rawQuery : DEFAULT_NEWS_API_QUERY;
  const rawApiKey = configOverride?.apiKey;
  const apiKey = typeof rawApiKey === 'string' ? rawApiKey : undefined;

  return {
    provider,
    query,
    ...(apiKey !== undefined ? { apiKey } : {}),
  };
}
