import type { ConnectorContext, ConnectorResult } from '@/connectors/base/connector.ts';
import { ConnectorValidationError, type ConnectorRunError } from '@/connectors/base/errors.js';
import type { ConnectorItem } from '@/connectors/base/types.ts';

export interface FetchPage<TRaw> {
  items: TRaw[];
  next_cursor?: string | undefined;
}

/**
 * standard connector execution loop — copy this pattern for rss / firecrawl:
 * 1. fetch page of raw records
 * 2. normalize each to ConnectorItem
 * 3. insert via ctx.insertItem (or count only when pipeline not wired)
 */
export async function runConnectorLoop<TRaw>(opts: {
  connectorName: string;
  ctx: ConnectorContext;
  cursor?: string;
  fetchPage: (ctx: ConnectorContext, cursor?: string) => Promise<FetchPage<TRaw>>;
  normalize: (raw: TRaw, ctx: ConnectorContext) => ConnectorItem;
}): Promise<ConnectorResult> {
  const { connectorName, ctx, cursor, fetchPage, normalize } = opts;
  const errors: ConnectorRunError[] = [];
  let inserted = 0;
  let skipped = 0;
  let next_cursor: string | undefined;

  ctx.logger(`${connectorName}: run start (source=${ctx.sourceId}, run=${ctx.runId})`);

  let page: FetchPage<TRaw>;
  try {
    page = await fetchPage(ctx, cursor);
    next_cursor = page.next_cursor;
    ctx.logger(`${connectorName}: fetched ${page.items.length} raw item(s)`);
  } catch (e) {
    errors.push({
      code: 'fetch_failed',
      message: (e as Error).message,
    });
    return { inserted: 0, skipped: 0, errors, next_cursor };
  }

  const seenExternalIds = new Set<string>();

  for (const raw of page.items) {
    // 🛠️ FIX 1: Reinstate the AbortSignal gateway to allow safe system cancellations
    if (ctx.signal.aborted) {
      errors.push({ code: 'aborted', message: 'run aborted before batch completed' });
      break;
    }

    let item: ConnectorItem;
    try {
      item = normalize(raw, ctx);
    } catch (e) {
      // 🛠️ FIX 2: Correctly isolate structural validation errors vs layout parse panics
      const isValidationError = e instanceof ConnectorValidationError;
      errors.push({
        code: isValidationError ? 'validation_failed' : 'normalize_failed',
        message: (e as Error).message,
        external_id: externalIdFromRaw(raw),
      });
      continue;
    }

    if (seenExternalIds.has(item.external_id)) {
      errors.push({
        code: 'duplicate_external_id',
        message: `duplicate external_id in batch: ${item.external_id}`,
        external_id: item.external_id,
      });
      continue;
    }
    seenExternalIds.add(item.external_id);

    try {
      if (ctx.insertItem) {
        const outcome = await ctx.insertItem(item);
        if (outcome === 'inserted') inserted++;
        else skipped++;
      } else {
        inserted++;
      }
    } catch (e) {
      errors.push({
        code: 'insert_failed',
        message: (e as Error).message,
        external_id: item.external_id,
      });
    }
  }

  ctx.logger(
    `${connectorName}: done inserted=${inserted} skipped=${skipped} errors=${errors.length}`,
  );

  return { inserted, skipped, errors, next_cursor };
}

function externalIdFromRaw(raw: unknown): string | undefined {
  if (raw && typeof raw === 'object' && 'external_id' in raw) {
    const id = (raw as { external_id: unknown }).external_id;
    return typeof id === 'string' ? id : undefined;
  }
  return undefined;
}
