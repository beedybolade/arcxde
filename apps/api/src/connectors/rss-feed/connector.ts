import type { Connector, ConnectorContext, ConnectorResult } from '@/connectors/base/connector.ts';
import { runConnectorLoop } from '@/connectors/base/run-loop.js';
import {
  resolveConnectorFixturePath,
  fetchFixturePageFromPath,
} from '@/connectors/base/fixture.js';
import { fetchRssPage, type RawRssItem } from './fetch.js';
import { normalizeRssItem } from './normalize.js';

/**
 * implement using the dummy_fixture pattern:
 * rss/fetch.ts      — http feed fetch
 * rss/normalize.ts  — map feed entry → ConnectorItem
 * delegate to runConnectorLoop from base/run-loop.ts
 */
export class RssConnector implements Connector {
  readonly name = 'rss';

  async run(ctx: ConnectorContext, cursor?: string): Promise<ConnectorResult> {
    const fixturePath = resolveConnectorFixturePath(ctx.connectorConfig);

    if (fixturePath) {
      return runConnectorLoop<any>({
        connectorName: this.name,
        ctx,
        // 🛠️ Fix 1: Accept the expected arguments to satisfy function type signature matching
        fetchPage: (_ctx, _cursor) => fetchFixturePageFromPath(fixturePath),
        normalize: (rawFixtureItem) => normalizeRssItem(rawFixtureItem, ctx),
        // 🛠️ Fix 2: Conditional property spread to maintain exactOptionalPropertyTypes rules
        ...(cursor !== undefined ? { cursor } : {}),
      });
    }

    return runConnectorLoop<RawRssItem>({
      connectorName: this.name,
      ctx,
      fetchPage: fetchRssPage,
      normalize: (rawRss) => normalizeRssItem(rawRss, ctx),
      // 🛠️ Fix 2: Conditional property spread here as well
      ...(cursor !== undefined ? { cursor } : {}),
    });
  }
}
