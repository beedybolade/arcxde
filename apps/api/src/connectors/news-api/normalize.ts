import type { ConnectorContext } from '@/connectors/base/connector.ts';
import type { ConnectorItem } from '@/connectors/base/types.ts';
import { immutableHash } from '@/connectors/base/hash.js';
import { assertConnectorItem, trimContent } from '@/connectors/base/validate.js';
import type { RawNewsArticle } from './types.ts';

export function normalizeNewsArticle(raw: RawNewsArticle, ctx: ConnectorContext): ConnectorItem {
  // Generate a distinct internal signature identifier if none exists
  const targetExternalId = raw.id ?? raw.url;
  const combinedContextText = `${raw.title}\n\n${raw.description ?? ''}`;
  const cleanContent = trimContent(combinedContextText ?? 'No text content extracted');

  const itemDraft: Omit<ConnectorItem, 'immutable_hash'> = {
    external_id: targetExternalId,
    content_text: cleanContent,
    published_at: raw.publishedAt,
    raw_payload: raw as unknown as Record<string, unknown>,
  };

  // Guard string properties explicitly to obey exactOptionalPropertyTypes rules
  if (raw.url !== '') {
    itemDraft.source_url = raw.url;
  }
  if (raw.id !== undefined) {
    itemDraft.external_content_id = raw.id;
  }

  const hashKey = immutableHash(ctx.sourceId, itemDraft);

  const finalizedItem: ConnectorItem = {
    ...itemDraft,
    immutable_hash: hashKey,
  };

  // Enforce global data invariants validation rules before processing pipeline insertion
  assertConnectorItem(finalizedItem);

  return finalizedItem;
}
