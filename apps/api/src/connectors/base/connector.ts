import type { ConnectorItem, InsertOutcome } from './types.ts';
import type { ConnectorRunError } from './errors.js';

export interface ConnectorContext {
  sourceId: string;
  runId: string;
  /** per-source connector binding from source_connectors.connector_config */
  connectorConfig?: Record<string, unknown>;
  /** per-source connector binding from source_connectors.connector_cursor */
  connectorCursor?: Record<string, unknown>;
  signal: AbortSignal;
  logger: (msg: string) => void;
  /** provided by ingest pipeline — persist one normalized item */
  insertItem?: (item: ConnectorItem) => Promise<InsertOutcome>;
}

export interface ConnectorResult {
  inserted: number;
  skipped: number;
  errors: ConnectorRunError[];
  /** set when connector supports pagination */
  next_cursor?: string | undefined;
}

export interface Connector {
  readonly name: string;
  run(ctx: ConnectorContext, cursor?: string): Promise<ConnectorResult>;
}
