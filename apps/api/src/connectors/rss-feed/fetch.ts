import Parser from 'rss-parser';
import type { ConnectorContext } from '@/connectors/base/connector.js';
import type { FetchPage } from '@/connectors/base/run-loop.js';
import {
  fetchFixturePageFromPath,
  resolveConnectorFixturePath,
} from '@/connectors/base/fixture.js';
import type { FixtureItem } from '@/connectors/base/types.js';

const parser = new Parser();

export interface RawRssItem {
  title?: string | undefined;
  link?: string | undefined;
  contentSnippet?: string | undefined;
  content?: string | undefined;
  isoDate?: string | undefined;
  guid?: string | undefined;
}

function resolveFeedUrls(ctx: ConnectorContext): string[] {
  const config = ctx.connectorConfig ?? {};

  if (typeof config.feed_url === 'string' && config.feed_url.trim()) {
    return [config.feed_url.trim()];
  }
  if (Array.isArray(config.feed_urls)) {
    return config.feed_urls.filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0,
    );
  }
  if (ctx.sourceId.startsWith('http://') || ctx.sourceId.startsWith('https://')) {
    return [ctx.sourceId];
  }
  throw new Error('rss connector requires connector_config.feed_url or feed_urls');
}

export async function fetchRssPage(
  ctx: ConnectorContext,
  _cursor?: string,
): Promise<FetchPage<RawRssItem>> {
  if (ctx.signal.aborted) {
    throw new Error('Fetch aborted before starting');
  }

  const fixturePath = resolveConnectorFixturePath(ctx.connectorConfig);
  if (fixturePath) {
    const page = await fetchFixturePageFromPath(fixturePath);
    return {
      items: page.items.map(fixtureItemToRawRssItem),
      next_cursor: undefined,
    };
  }

  const feedUrls = resolveFeedUrls(ctx);
  const items: RawRssItem[] = [];

  for (const feedUrl of feedUrls) {
    if (ctx.signal.aborted) {
      throw new Error('Fetch aborted inside target iteration loop');
    }
    ctx.logger(`fetching rss feed from: ${feedUrl}`);
    const feed = await parser.parseURL(feedUrl);
    items.push(...((feed.items ?? []) as RawRssItem[]));
  }

  return {
    items,
    next_cursor: undefined,
  };
}

function fixtureItemToRawRssItem(item: FixtureItem): RawRssItem {
  const payload = item.raw_payload ?? {};
  return {
    guid: item.external_id,
    link: item.source_url,
    contentSnippet: item.content_text,
    isoDate: item.published_at,
    title: typeof payload.title === 'string' ? payload.title : undefined,
  };
}
