import type { Connector, ConnectorContext, ConnectorResult } from '@/connectors/base/connector.ts';
import { runConnectorLoop } from '@/connectors/base/run-loop.js';
import {
  resolveConnectorFixturePath,
  fetchFixturePageFromPath,
} from '@/connectors/base/fixture.js';
import { fetchUnifiedNewsPage } from './fetch.js';
import { normalizeNewsArticle } from './normalize.js';
import type { RawNewsArticle } from './types.ts';

export class NewsApiConnector implements Connector {
  readonly name = 'news-api-aggregator';

  async run(ctx: ConnectorContext, cursor?: string): Promise<ConnectorResult> {
    const fixturePath = resolveConnectorFixturePath(ctx.connectorConfig);

    if (fixturePath) {
      return runConnectorLoop<any>({
        connectorName: this.name,
        ctx,
        // Add 'async' here so the function returns a Promise<FetchPage<any>>
        fetchPage: async (_ctx, _cursor) => fetchFixturePageFromPath(fixturePath),
        normalize: (rawFixture) => normalizeNewsArticle(rawFixture, ctx),
        ...(cursor !== undefined ? { cursor } : {}),
      });
    }

    return runConnectorLoop<RawNewsArticle>({
      connectorName: this.name,
      ctx,
      fetchPage: fetchUnifiedNewsPage,
      normalize: (rawArticle) => normalizeNewsArticle(rawArticle, ctx),
      ...(cursor !== undefined ? { cursor } : {}),
    });
  }
}
