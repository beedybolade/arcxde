import type { ConnectorContext } from '@/connectors/base/connector.ts';
import type { RawNewsArticle } from './types.ts';

export interface NewsProvider {
  readonly name: string;
  fetch(
    ctx: ConnectorContext,
    query: string,
    pageCursor?: string,
  ): Promise<{
    articles: RawNewsArticle[];
    nextCursor?: string | undefined;
  }>;
}
