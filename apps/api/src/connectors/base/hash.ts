import { createHash } from 'crypto';
import type { ConnectorItem } from '@/connectors/base/types.ts';

/** stable dedupe key for raw_observations.immutable_hash */
export function immutableHash(
  sourceId: string,
  item: Pick<ConnectorItem, 'external_id' | 'content_text'>,
): string {
  return createHash('sha256')
    .update(sourceId)
    .update('\0')
    .update(item.external_id)
    .update('\0')
    .update(item.content_text)
    .digest('hex');
}
