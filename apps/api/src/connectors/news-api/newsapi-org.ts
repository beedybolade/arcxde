import type { ConnectorContext } from '@/connectors/base/connector.ts';
import type { NewsProvider } from './provider.js';
import type { RawNewsArticle } from './types.ts';

export class NewsApiOrgProvider implements NewsProvider {
  readonly name = 'newsapi_org';

  async fetch(
    ctx: ConnectorContext,
    query: string,
    pageCursor?: string,
  ): Promise<{ articles: RawNewsArticle[]; nextCursor?: string | undefined }> {
    const apiKey = (ctx.connectorConfig?.apiKey as string) || process.env.NEWSAPI_ORG_KEY;
    if (!apiKey) {
      throw new Error(`[${this.name}] Missing authorization credentials token.`);
    }

    const page = pageCursor ? parseInt(pageCursor, 10) : 1;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=20&page=${page}&apiKey=${apiKey}`;

    const response = await fetch(url, { signal: ctx.signal });
    if (!response.ok) {
      throw new Error(`[${this.name}] HTTP Transport Error: Status ${response.status}`);
    }

    const data = (await response.json()) as { articles?: any[] };
    const rawArticles = data.articles ?? [];

    const articles: RawNewsArticle[] = rawArticles.map((art: any) => ({
      title: art.title ?? 'Untitled Article',
      description: art.description ?? undefined,
      url: art.url ?? '',
      publishedAt: art.publishedAt ?? new Date().toISOString(),
      sourceName: art.source?.name ?? undefined,
    }));

    // If we fetched a full page, suggest the next increment block safely
    const nextCursor = rawArticles.length === 20 ? String(page + 1) : undefined;

    return { articles, nextCursor };
  }
}
