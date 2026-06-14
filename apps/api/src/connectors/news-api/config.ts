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
  const provider = String(configOverride?.provider ?? DEFAULT_NEWS_PROVIDER);
  const query = String(configOverride?.query ?? DEFAULT_NEWS_API_QUERY);
  const apiKey = configOverride?.apiKey ? String(configOverride.apiKey) : undefined;

  return {
    provider,
    query,
    ...(apiKey !== undefined ? { apiKey } : {}),
  };
}
