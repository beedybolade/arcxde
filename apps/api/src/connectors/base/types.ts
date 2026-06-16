/**
 * canonical shape passed to the ingest pipeline (one row per publishing).
 * all connectors must produce this after normalization.
 */
export interface ConnectorItem {
  external_id: string;
  content_text: string;
  title?: string;
  /** iso 8601 utc */
  published_at: string;
  raw_payload: Record<string, unknown>;
  source_url?: string;
  external_content_id?: string;
  /** sha256 hex; computed during normalize for dedupe */
  immutable_hash: string;
}

/** wire format for dummy_fixture json fixtures (pre-normalize) */
export interface FixtureItem {
  external_id: string;
  content_text: string;
  published_at: string;
  raw_payload?: Record<string, unknown> | undefined;
  source_url?: string | undefined;
  external_content_id?: string | undefined;
}

export type InsertOutcome = 'inserted' | 'skipped';
