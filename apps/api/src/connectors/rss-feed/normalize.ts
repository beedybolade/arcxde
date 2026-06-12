import type { ConnectorContext } from '@/connectors/base/connector.js';
import type { ConnectorItem } from '@/connectors/base/types.js';
import { immutableHash } from '@/connectors/base/hash.js';
import { assertConnectorItem, trimContent } from '@/connectors/base/validate.js';
import type { RawRssItem } from './fetch.ts';

export function normalizeRssItem(raw: RawRssItem, ctx: ConnectorContext): ConnectorItem {
  // 1. Establish stable fallbacks to guarantee strict identifier and date strings
  const externalId =
    raw.guid ||
    raw.link ||
    `rss_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const cleanContent = trimContent(
    raw.contentSnippet || raw.content || raw.title || 'No content available',
  );

  const publishedAt = raw.isoDate || new Date().toISOString();

  // 2. Map properties to the expected base format template block
  const itemDraft: Omit<ConnectorItem, 'immutable_hash'> = {
    external_id: externalId,
    content_text: cleanContent,
    published_at: publishedAt,
    raw_payload: raw as Record<string, unknown>,
  };

  // 3. Satisfy exactOptionalPropertyTypes by omitting undefined optional keys entirely
  if (raw.link !== undefined) {
    itemDraft.source_url = raw.link;
  }
  if (raw.guid !== undefined) {
    itemDraft.external_content_id = raw.guid;
  }

  // 4. Compute the stable deduplication hash
  const hash = immutableHash(ctx.sourceId, itemDraft);

  const finalizedItem: ConnectorItem = {
    ...itemDraft,
    immutable_hash: hash,
  };

  // 5. Enforce validation schemas before handing it off to the pipeline gateway
  assertConnectorItem(finalizedItem);

  return finalizedItem;
}
