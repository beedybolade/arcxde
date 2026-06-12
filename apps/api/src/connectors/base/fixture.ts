import { readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import type { FetchPage } from '@/connectors/base/run-loop.ts';
import type { FixtureItem } from '@/connectors/base/types.ts';

// 🛠️ FIX: Replaced import.meta.dir with __dirname for safe CommonJS builds
const projectRoot = join(__dirname, '../../..');

/** resolve fixture_path from connector_config (relative paths are project-root relative). */
export function resolveConnectorFixturePath(
  connectorConfig?: Record<string, unknown>,
): string | null {
  const raw = connectorConfig?.fixture_path;
  if (typeof raw !== 'string' || !raw.trim()) {
    return null;
  }
  const trimmed = raw.trim();
  return isAbsolute(trimmed) ? trimmed : join(projectRoot, trimmed);
}

export function readFixtureItems(path: string): FixtureItem[] {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (e) {
    throw new Error(`failed to read fixture at ${path}: ${(e as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`invalid json in fixture ${path}: ${(e as Error).message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`fixture ${path} must be a json array`);
  }

  return parsed as FixtureItem[];
}

export async function fetchFixturePageFromPath(path: string): Promise<FetchPage<FixtureItem>> {
  return { items: readFixtureItems(path) };
}
