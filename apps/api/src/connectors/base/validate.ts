import { ConnectorValidationError } from '@/connectors/base/errors.js';
import type { ConnectorItem } from '@/connectors/base/types.ts';

const MAX_EXTERNAL_ID_LEN = 512;
const MAX_CONTENT_LEN = 500_000;

export function trimContent(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function parsePublishedAt(value: string): string {
  const trimmed = value.trim();
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) {
    throw new ConnectorValidationError('published_at', `invalid iso date: ${value}`);
  }
  return new Date(ms).toISOString();
}

/** validate fields on a normalized item (call after normalize) */
export function assertConnectorItem(item: ConnectorItem): void {
  if (!item.external_id?.trim()) {
    throw new ConnectorValidationError('external_id', 'required');
  }
  if (item.external_id.length > MAX_EXTERNAL_ID_LEN) {
    throw new ConnectorValidationError('external_id', `max length ${MAX_EXTERNAL_ID_LEN}`);
  }

  const text = trimContent(item.content_text);
  if (!text) {
    throw new ConnectorValidationError('content_text', 'required after trim');
  }
  if (text.length > MAX_CONTENT_LEN) {
    throw new ConnectorValidationError('content_text', `max length ${MAX_CONTENT_LEN}`);
  }

  parsePublishedAt(item.published_at);

  if (
    item.raw_payload === null ||
    typeof item.raw_payload !== 'object' ||
    Array.isArray(item.raw_payload)
  ) {
    throw new ConnectorValidationError('raw_payload', 'must be a plain object');
  }

  if (!item.immutable_hash || item.immutable_hash.length !== 64) {
    throw new ConnectorValidationError('immutable_hash', 'required 64-char hex digest');
  }
}
