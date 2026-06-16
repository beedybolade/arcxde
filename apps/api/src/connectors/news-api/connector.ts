import type { Connector, ConnectorContext, ConnectorResult } from '@/connectors/base/connector.ts';
import { runConnectorLoop } from '@/connectors/base/run-loop.js';
import {
  resolveConnectorFixturePath,
  fetchFixturePageFromPath,
} from '@/connectors/base/fixture.js';
import type { FixtureItem } from '@/connectors/base/types.js';
import { fetchUnifiedNewsPage } from './fetch.js';
import { normalizeNewsArticle } from './normalize.js';
import type { RawNewsArticle } from './types.ts';

export class NewsApiConnector implements Connector {
  readonly name = 'news-api-aggregator';

  async run(ctx: ConnectorContext, cursor?: string): Promise<ConnectorResult> {
    const fixturePath = resolveConnectorFixturePath(ctx.connectorConfig);

    if (fixturePath) {
      return runConnectorLoop<FixtureItem>({
        connectorName: this.name,
        ctx,
        fetchPage: (_ctx, _cursor) => Promise.resolve(fetchFixturePageFromPath(fixturePath)),
        normalize: (rawFixture) =>
          normalizeNewsArticle(rawFixture as unknown as RawNewsArticle, ctx),
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
