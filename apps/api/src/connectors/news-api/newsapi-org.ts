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

    const data = (await response.json()) as { articles?: unknown[] };
    const rawArticles = Array.isArray(data.articles) ? data.articles : [];

    const articles: RawNewsArticle[] = rawArticles.map((art: unknown) => {
      const obj = art as Record<string, unknown>;
      return {
        title: typeof obj.title === 'string' ? obj.title : 'Untitled Article',
        description: typeof obj.description === 'string' ? obj.description : undefined,
        url: typeof obj.url === 'string' ? obj.url : '',
        publishedAt:
          typeof obj.publishedAt === 'string' ? obj.publishedAt : new Date().toISOString(),
        sourceName:
          typeof obj.source === 'object' &&
          obj.source !== null &&
          typeof (obj.source as Record<string, unknown>).name === 'string'
            ? ((obj.source as Record<string, unknown>).name as string)
            : undefined,
      };
    });

    // If we fetched a full page, suggest the next increment block safely
    const nextCursor = rawArticles.length === 20 ? String(page + 1) : undefined;

    return { articles, nextCursor };
  }
}
