import type { ConnectorContext } from '@/connectors/base/connector.js';
import type { FetchPage } from '@/connectors/base/run-loop.js';
import type { RawNewsArticle } from './types.ts';
import { NewsApiOrgProvider } from './newsapi-org.js';
import type { NewsProvider } from './provider.ts';

export async function fetchUnifiedNewsPage(
  ctx: ConnectorContext,
  cursor?: string,
): Promise<FetchPage<RawNewsArticle>> {
  const providerId = (ctx.connectorConfig?.provider as string) || 'newsapi_org';
  const searchQuery = (ctx.connectorConfig?.query as string) || 'machine learning';

  const registry: Record<string, NewsProvider> = {
    newsapi_org: new NewsApiOrgProvider(),
    // Future expansion points like gnews or thenewsapi register seamlessly here
  };

  const activeProvider = registry[providerId];
  if (!activeProvider) {
    throw new Error(`Targeted unified news provider layout signature not found: ${providerId}`);
  }

  const result = await activeProvider.fetch(ctx, searchQuery, cursor);

  return {
    items: result.articles,
    // Maintain exactOptionalPropertyTypes compliance using conditional fallback spread logic
    ...(result.nextCursor !== undefined ? { next_cursor: result.nextCursor } : {}),
  };
}
